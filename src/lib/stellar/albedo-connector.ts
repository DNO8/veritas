/**
 * Albedo Wallet Connector
 * Web-based wallet - no extension required
 */

import albedo from "@albedo-link/intent";
import { WalletType, WalletConnection } from "./wallet-types";

/**
 * Check if Albedo is available (always true - it's web-based)
 */
export async function isAlbedoAvailable(): Promise<boolean> {
  return true; // Albedo is always available (web-based)
}

/**
 * Connect to Albedo wallet
 */
export async function connectAlbedo(): Promise<WalletConnection> {
  try {
    // Request public key from Albedo
    const result = await albedo.publicKey({
      require_existing: false,
    });
    console.log(
      "✅ [Albedo] Public key received:",
      result.pubkey.substring(0, 8) + "...",
    );

    if (!result.pubkey) {
      throw new Error("Failed to get public key from Albedo");
    }

    console.log("✅ [Albedo] Connection complete");
    return {
      publicKey: result.pubkey,
      network: "PUBLIC", // Albedo uses mainnet by default
      walletType: WalletType.ALBEDO,
    };
  } catch (error) {
    console.error("❌ [Albedo] Connection error:", error);
    if (error instanceof Error && error.message.includes("canceled")) {
      throw new Error("Connection canceled by user");
    }
    throw error;
  }
}

/**
 * Sign transaction with Albedo
 */
export async function signAlbedoTransaction(
  xdr: string,
  opts?: { network?: string; networkPassphrase?: string },
): Promise<string> {
  try {
    const result = await albedo.tx({
      xdr,
      network: opts?.network || "testnet",
      submit: false, // We'll submit manually
    });

    if (!result.signed_envelope_xdr) {
      throw new Error("Failed to sign transaction");
    }

    return result.signed_envelope_xdr;
  } catch (error) {
    if (error instanceof Error && error.message.includes("canceled")) {
      throw new Error("Transaction signing canceled by user");
    }
    throw error;
  }
}
