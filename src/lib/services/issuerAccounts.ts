import * as StellarSdk from '@stellar/stellar-sdk';
import crypto from 'crypto';
import { supabaseServer } from '@/lib/supabase/server';
import type { Database } from '@/lib/supabase/types';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY!;
const STELLAR_NETWORK = process.env.NEXT_PUBLIC_STELLAR_NETWORK || 'testnet';

interface IssuerAccount {
  id: string;
  project_id: string;
  public_key: string;
  encrypted_secret_key: string;
  network: 'testnet' | 'mainnet';
  is_active: boolean;
  is_funded: boolean;
}

function encrypt(text: string): string {
  const algorithm = 'aes-256-gcm';
  const key = Buffer.from(ENCRYPTION_KEY, 'hex');
  const iv = crypto.randomBytes(16);
  
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

function decrypt(encryptedText: string): string {
  const [ivHex, authTagHex, encrypted] = encryptedText.split(':');
  
  const algorithm = 'aes-256-gcm';
  const key = Buffer.from(ENCRYPTION_KEY, 'hex');
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

export async function createIssuerAccount(projectId: string): Promise<{
  publicKey: string;
  error?: string;
}> {
  try {
    const supabase = supabaseServer;
    
    const issuerKeypair = StellarSdk.Keypair.random();
    const encryptedSecret = encrypt(issuerKeypair.secret());
    
    const { data, error } = await (supabase
      .from('project_issuer_accounts') as any)
      .insert({
        project_id: projectId,
        public_key: issuerKeypair.publicKey(),
        encrypted_secret_key: encryptedSecret,
        network: STELLAR_NETWORK as 'testnet' | 'mainnet',
        is_active: true,
        is_funded: false,
      })
      .select()
      .single();
    
    if (error) {
      
      return { publicKey: '', error: error.message };
    }
    
    await (supabase
      .from('projects') as any)
      .update({ issuer_account: issuerKeypair.publicKey() })
      .eq('id', projectId);
    
    // Fund the account automatically in testnet
    
    const fundResult = await fundIssuerAccount(projectId);
    
    if (!fundResult.success) {
      
      return { 
        publicKey: issuerKeypair.publicKey(), 
        error: `Account created but funding failed: ${fundResult.error}` 
      };
    }
    
    
    
    return { publicKey: issuerKeypair.publicKey() };
  } catch (error) {
    
    return { 
      publicKey: '', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

export async function fundIssuerAccount(projectId: string): Promise<{
  success: boolean;
  txHash?: string;
  error?: string;
}> {
  try {
    const supabase = supabaseServer;
    
    const { data: issuerData, error: fetchError } = await (supabase
      .from('project_issuer_accounts') as any)
      .select('*')
      .eq('project_id', projectId)
      .single();
    
    if (fetchError || !issuerData) {
      return { success: false, error: 'Issuer account not found' };
    }
    
    if (issuerData.is_funded) {
      return { success: true, txHash: 'already_funded' };
    }
    
    const server = new StellarSdk.Horizon.Server(
      STELLAR_NETWORK === 'testnet'
        ? 'https://horizon-testnet.stellar.org'
        : 'https://horizon.stellar.org'
    );
    
    if (STELLAR_NETWORK === 'testnet') {
      await server.friendbot(issuerData.public_key).call();
      
      await (supabase
        .from('project_issuer_accounts') as any)
        .update({ is_funded: true, last_used_at: new Date().toISOString() })
        .eq('id', issuerData.id);
      
      return { success: true, txHash: 'friendbot' };
    } else {
      return { 
        success: false, 
        error: 'Mainnet funding requires manual XLM transfer' 
      };
    }
  } catch (error) {
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

export async function getIssuerKeypair(projectId: string): Promise<{
  keypair?: StellarSdk.Keypair;
  error?: string;
}> {
  try {
    const supabase = supabaseServer;
    
    const { data, error } = await (supabase
      .from('project_issuer_accounts') as any)
      .select('*')
      .eq('project_id', projectId)
      .single();
    
    if (error || !data) {
      return { error: 'Issuer account not found' };
    }
    
    const secretKey = decrypt(data.encrypted_secret_key);
    const keypair = StellarSdk.Keypair.fromSecret(secretKey);
    
    return { keypair };
  } catch (error) {
    
    return { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

export async function getIssuerAccount(projectId: string): Promise<{
  account?: IssuerAccount;
  error?: string;
}> {
  try {
    const supabase = supabaseServer;
    
    const { data, error } = await supabase
      .from('project_issuer_accounts')
      .select('*')
      .eq('project_id', projectId)
      .single();
    
    if (error || !data) {
      return { error: 'Issuer account not found' };
    }
    
    return { account: data as IssuerAccount };
  } catch (error) {
    
    return { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}
