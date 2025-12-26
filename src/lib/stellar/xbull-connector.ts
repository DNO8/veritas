/**
 * xBull Wallet Connector
 * Multi-chain wallet support via Stellar Wallets Kit
 */

import {
  StellarWalletsKit,
  WalletNetwork,
  allowAllModules,
  XBULL_ID,
} from "@creit.tech/stellar-wallets-kit";
import { WalletType, WalletConnection } from "./wallet-types";

let walletKit: StellarWalletsKit | null = null;

/**
 * Initialize wallet kit
 */
function getWalletKit(): StellarWalletsKit {
  if (!walletKit) {
    walletKit = new StellarWalletsKit({
      network: WalletNetwork.TESTNET,
      selectedWalletId: XBULL_ID,
      modules: allowAllModules(),
    });
  }
  return walletKit;
}

/**
 * Check if xBull is available
 */
export async function isXBullAvailable(): Promise<boolean> {
  if (typeof window === "undefined") {
    return false;
  }

  // Check if xBull extension is installed
  return !!(window as any).xBullSDK;
}

/**
 * Connect to xBull wallet
 */
export async function connectXBull(): Promise<WalletConnection> {
  try {
    const kit = getWalletKit();

    // Set wallet to xBull
    await kit.setWallet(XBULL_ID);

    // Get public key
    const { address } = await kit.getAddress();

    if (!address) {
      throw new Error("Failed to get public key from xBull");
    }

    console.log("✅ xBull connected:", address.substring(0, 8) + "...");

    return {
      publicKey: address,
      network: "TESTNET",
      walletType: WalletType.XBULL,
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes("User closed modal")) {
      throw new Error("Connection canceled by user");
    }
    throw error;
  }
}

/**
 * Sign transaction with xBull
 */
export async function signXBullTransaction(
  xdr: string,
  opts?: { network?: string; networkPassphrase?: string },
): Promise<string> {
  try {
    const kit = getWalletKit();

    const { signedTxXdr } = await kit.signTransaction(xdr, {
      networkPassphrase: opts?.networkPassphrase,
    });

    if (!signedTxXdr) {
      throw new Error("Failed to sign transaction");
    }

    return signedTxXdr;
  } catch (error) {
    if (error instanceof Error && error.message.includes("User closed modal")) {
      throw new Error("Transaction signing canceled by user");
    }
    throw error;
  }
}

/**
 * Disconnect xBull
 */
export function disconnectXBull(): void {
  walletKit = null;
}
