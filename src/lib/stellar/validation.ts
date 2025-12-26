import { StrKey } from "@stellar/stellar-sdk";
import { z } from "zod";

export function isValidStellarAddress(address: string): boolean {
  if (!address || typeof address !== "string") {
    return false;
  }

  try {
    return StrKey.isValidEd25519PublicKey(address);
  } catch {
    return false;
  }
}

export function isValidTxHash(hash: string): boolean {
  if (!hash || typeof hash !== "string") {
    return false;
  }

  return hash.length === 64 && /^[a-f0-9]+$/i.test(hash);
}

export const walletAddressSchema = z.string().refine(isValidStellarAddress, {
  message: "Invalid Stellar wallet address",
});

export const txHashSchema = z.string().refine(isValidTxHash, {
  message: "Invalid transaction hash",
});

export const networkSchema = z.enum(["TESTNET", "MAINNET"]);

export const assetSchema = z.enum(["XLM", "USDC"]);

export const amountSchema = z.string().refine(
  (val) => {
    const num = Number(val);
    return !Number.isNaN(num) && num > 0;
  },
  { message: "Amount must be a positive number" },
);
