import * as StellarSdk from '@stellar/stellar-sdk';
import { supabaseServer } from '@/lib/supabase/server';
import { getIssuerKeypair } from './issuerAccounts';

const STELLAR_NETWORK = process.env.NEXT_PUBLIC_STELLAR_NETWORK || 'testnet';

interface IssueAssetParams {
  projectId: string;
  benefitId: string;
  recipientPublicKey: string;
  assetCode: string;
  amount: string;
  donationId?: string;
}

interface IssueAssetResult {
  success: boolean;
  txHash?: string;
  error?: string;
}

export async function issueAssetToRecipient(
  params: IssueAssetParams
): Promise<IssueAssetResult> {
  try {
    const { projectId, benefitId, recipientPublicKey, assetCode, amount, donationId } = params;

    
    const { keypair, error: keypairError } = await getIssuerKeypair(projectId);
    
    if (keypairError || !keypair) {
      
      return { success: false, error: keypairError || 'Failed to get issuer keypair' };
    }

    

    const server = new StellarSdk.Horizon.Server(
      STELLAR_NETWORK === 'testnet'
        ? 'https://horizon-testnet.stellar.org'
        : 'https://horizon.stellar.org'
    );

    
    const issuerAccount = await server.loadAccount(keypair.publicKey());
    
    
    const asset = new StellarSdk.Asset(assetCode, keypair.publicKey());

    const transaction = new StellarSdk.TransactionBuilder(issuerAccount, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: STELLAR_NETWORK === 'testnet' 
        ? StellarSdk.Networks.TESTNET 
        : StellarSdk.Networks.PUBLIC
    })
      .addOperation(
        StellarSdk.Operation.payment({
          destination: recipientPublicKey,
          asset: asset,
          amount: amount
        })
      )
      .setTimeout(180)
      .build();

    transaction.sign(keypair);

    
    const result = await server.submitTransaction(transaction);
    

    await (supabaseServer
      .from('stellar_transactions') as any)
      .insert({
        tx_type: 'issue_asset',
        tx_hash: result.hash,
        source_account: keypair.publicKey(),
        destination_account: recipientPublicKey,
        network: STELLAR_NETWORK,
        asset_code: assetCode,
        amount: amount,
        project_id: projectId,
        benefit_id: benefitId,
        donation_id: donationId,
        status: 'success',
        confirmed_at: new Date().toISOString()
      });

    const { data: benefit } = await (supabaseServer
      .from('project_benefits') as any)
      .select('issued_supply')
      .eq('id', benefitId)
      .single();

    if (benefit) {
      await (supabaseServer
        .from('project_benefits') as any)
        .update({ 
          issued_supply: (benefit.issued_supply || 0) + parseInt(amount) 
        })
        .eq('id', benefitId);
    }

    if (donationId) {
      await (supabaseServer
        .from('benefit_holdings') as any)
        .insert({
          benefit_id: benefitId,
          donation_id: donationId,
          holder_wallet: recipientPublicKey,
          quantity: parseInt(amount),
          is_active: true,
          last_verified_at: new Date().toISOString()
        });
    }

    return { success: true, txHash: result.hash };
  } catch (error) {
    
    
    let errorMessage = 'Unknown error';
    
    if (error instanceof Error) {
      errorMessage = error.message;
      
      // Check if it's a trustline error
      if (error.message.includes('400') || error.message.includes('op_no_trust')) {
        errorMessage = `Recipient wallet does not have a trustline for asset ${params.assetCode}. The recipient needs to establish a trustline first.`;
        
      }
    }
    
    await (supabaseServer
      .from('stellar_transactions') as any)
      .insert({
        tx_type: 'issue_asset',
        tx_hash: 'failed',
        source_account: params.recipientPublicKey,
        destination_account: params.recipientPublicKey,
        network: STELLAR_NETWORK,
        asset_code: params.assetCode,
        amount: params.amount,
        project_id: params.projectId,
        benefit_id: params.benefitId,
        donation_id: params.donationId,
        status: 'failed',
        error_message: errorMessage
      });

    return { 
      success: false, 
      error: errorMessage
    };
  }
}

export async function verifyAssetHolding(
  holderPublicKey: string,
  assetCode: string,
  issuerPublicKey: string
): Promise<{ hasAsset: boolean; balance?: string; error?: string }> {
  try {
    const server = new StellarSdk.Horizon.Server(
      STELLAR_NETWORK === 'testnet'
        ? 'https://horizon-testnet.stellar.org'
        : 'https://horizon.stellar.org'
    );

    const account = await server.loadAccount(holderPublicKey);
    
    const balance = account.balances.find(
      (b: any) => 
        b.asset_type !== 'native' &&
        b.asset_code === assetCode &&
        b.asset_issuer === issuerPublicKey
    );

    if (balance) {
      return { hasAsset: true, balance: balance.balance };
    }

    return { hasAsset: false };
  } catch (error) {
    
    return { 
      hasAsset: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Get eligible benefits for a donation amount and asset
 */
export async function getEligibleBenefits(
  projectId: string,
  donationAmount: string,
  donationAsset: string
): Promise<any[]> {
  try {
    

    const { data: benefits, error } = await (supabaseServer
      .from('project_benefits') as any)
      .select('*')
      .eq('project_id', projectId)
      .eq('is_active', true)
      .eq('donation_currency', donationAsset)
      .lte('minimum_donation', parseFloat(donationAmount));

    if (error) {
      
      return [];
    }

    

    // Filter benefits that still have supply available
    const availableBenefits = (benefits || []).filter((benefit: any) => {
      const hasSupply = benefit.issued_supply < benefit.total_supply;
      
      return hasSupply;
    });

    

    return availableBenefits;
  } catch (error) {
    
    return [];
  }
}

export async function createTrustline(
  holderKeypair: StellarSdk.Keypair,
  assetCode: string,
  issuerPublicKey: string
): Promise<{ success: boolean; txHash?: string; error?: string }> {
  try {
    const server = new StellarSdk.Horizon.Server(
      STELLAR_NETWORK === 'testnet'
        ? 'https://horizon-testnet.stellar.org'
        : 'https://horizon.stellar.org'
    );

    const holderAccount = await server.loadAccount(holderKeypair.publicKey());
    
    const asset = new StellarSdk.Asset(assetCode, issuerPublicKey);

    const transaction = new StellarSdk.TransactionBuilder(holderAccount, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: STELLAR_NETWORK === 'testnet' 
        ? StellarSdk.Networks.TESTNET 
        : StellarSdk.Networks.PUBLIC
    })
      .addOperation(
        StellarSdk.Operation.changeTrust({
          asset: asset
        })
      )
      .setTimeout(180)
      .build();

    transaction.sign(holderKeypair);

    const result = await server.submitTransaction(transaction);

    return { success: true, txHash: result.hash };
  } catch (error) {
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}
