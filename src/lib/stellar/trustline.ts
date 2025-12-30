import * as StellarSdk from '@stellar/stellar-sdk';

const STELLAR_NETWORK = process.env.NEXT_PUBLIC_STELLAR_NETWORK || 'testnet';

export interface CreateTrustlineParams {
  holderPublicKey: string;
  assetCode: string;
  issuerPublicKey: string;
}

/**
 * Build a trustline transaction (unsigned)
 * The caller must sign and submit this transaction
 */
export async function buildTrustlineTransaction(
  params: CreateTrustlineParams
): Promise<StellarSdk.Transaction> {
  const { holderPublicKey, assetCode, issuerPublicKey } = params;

  const server = new StellarSdk.Horizon.Server(
    STELLAR_NETWORK === 'testnet'
      ? 'https://horizon-testnet.stellar.org'
      : 'https://horizon.stellar.org'
  );

  const holderAccount = await server.loadAccount(holderPublicKey);
  const asset = new StellarSdk.Asset(assetCode, issuerPublicKey);

  const transaction = new StellarSdk.TransactionBuilder(holderAccount, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase:
      STELLAR_NETWORK === 'testnet'
        ? StellarSdk.Networks.TESTNET
        : StellarSdk.Networks.PUBLIC,
  })
    .addOperation(
      StellarSdk.Operation.changeTrust({
        asset: asset,
      })
    )
    .setTimeout(180)
    .build();

  return transaction;
}

/**
 * Build a transaction with multiple trustlines
 */
export async function buildMultipleTrustlinesTransaction(
  holderPublicKey: string,
  trustlines: Array<{ assetCode: string; issuerPublicKey: string }>
): Promise<StellarSdk.Transaction> {
  const server = new StellarSdk.Horizon.Server(
    STELLAR_NETWORK === 'testnet'
      ? 'https://horizon-testnet.stellar.org'
      : 'https://horizon.stellar.org'
  );

  const holderAccount = await server.loadAccount(holderPublicKey);

  let transactionBuilder = new StellarSdk.TransactionBuilder(holderAccount, {
    fee: String(Number(StellarSdk.BASE_FEE) * trustlines.length),
    networkPassphrase:
      STELLAR_NETWORK === 'testnet'
        ? StellarSdk.Networks.TESTNET
        : StellarSdk.Networks.PUBLIC,
  });

  // Add all trustline operations
  for (const { assetCode, issuerPublicKey } of trustlines) {
    const asset = new StellarSdk.Asset(assetCode, issuerPublicKey);
    transactionBuilder = transactionBuilder.addOperation(
      StellarSdk.Operation.changeTrust({
        asset: asset,
      })
    );
  }

  const transaction = transactionBuilder.setTimeout(180).build();

  return transaction;
}

/**
 * Check if a wallet has a trustline for a specific asset
 */
export async function hasTrustline(
  holderPublicKey: string,
  assetCode: string,
  issuerPublicKey: string
): Promise<boolean> {
  try {
    const server = new StellarSdk.Horizon.Server(
      STELLAR_NETWORK === 'testnet'
        ? 'https://horizon-testnet.stellar.org'
        : 'https://horizon.stellar.org'
    );

    const account = await server.loadAccount(holderPublicKey);

    const hasTrust = account.balances.some(
      (balance: any) => {
        return balance.asset_type !== 'native' &&
          balance.asset_code === assetCode &&
          balance.asset_issuer === issuerPublicKey;
      }
    );

    return hasTrust;
  } catch (error) {
    
    return false;
  }
}
