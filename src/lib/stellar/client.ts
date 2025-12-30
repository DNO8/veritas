import * as StellarSdk from "@stellar/stellar-sdk";
import { STELLAR_CONFIG, type StellarNetwork } from "./config";
import { isValidStellarAddress, isValidTxHash } from "./validation";

export class StellarClient {
  private server: StellarSdk.Horizon.Server;
  private network: StellarNetwork;

  constructor(network: StellarNetwork = "TESTNET") {
    this.network = network;
    const config = STELLAR_CONFIG[network];
    this.server = new StellarSdk.Horizon.Server(config.horizonUrl);
  }

  async checkAccountExists(address: string): Promise<boolean> {
    if (!isValidStellarAddress(address)) {
      throw new Error("Invalid Stellar address format");
    }

    try {
      await this.server.loadAccount(address);
      return true;
    } catch (error) {
      if (error instanceof Error && "response" in error) {
        const horizonError = error as any;
        if (horizonError.response?.status === 404) {
          return false;
        }
      }
      throw error;
    }
  }

  async getTransaction(
    txHash: string,
  ): Promise<StellarSdk.Horizon.ServerApi.TransactionRecord | null> {
    if (!isValidTxHash(txHash)) {
      throw new Error("Invalid transaction hash format");
    }

    try {
      const tx = await this.server.transactions().transaction(txHash).call();
      return tx;
    } catch (error) {
      if (error instanceof Error && "response" in error) {
        const horizonError = error as any;
        if (horizonError.response?.status === 404) {
          return null;
        }
      }
      throw error;
    }
  }

  async verifyPayment(
    txHash: string,
    expectedDestination: string,
    expectedAmount: string,
    expectedAsset: string,
  ): Promise<{ valid: boolean; error?: string }> {
    if (!isValidTxHash(txHash)) {
      return { valid: false, error: "Invalid transaction hash" };
    }

    if (!isValidStellarAddress(expectedDestination)) {
      return { valid: false, error: "Invalid destination address" };
    }

    try {
      const tx = await this.getTransaction(txHash);

      if (!tx) {
        return { valid: false, error: "Transaction not found" };
      }

      if (!tx.successful) {
        return { valid: false, error: "Transaction failed" };
      }

      const operations = await this.server
        .operations()
        .forTransaction(txHash)
        .call();

      const paymentOps = operations.records.filter(
        (op: any) => op.type === "payment" || op.type === "create_account",
      );

      if (paymentOps.length === 0) {
        return { valid: false, error: "No payment operation found" };
      }

      for (const op of paymentOps) {
        if (op.type === "payment") {
          const paymentOp =
            op as StellarSdk.Horizon.ServerApi.PaymentOperationRecord;

          

          if (paymentOp.to === expectedDestination) {
            const assetMatch =
              expectedAsset === "XLM"
                ? paymentOp.asset_type === "native"
                : paymentOp.asset_type !== "native" &&
                  paymentOp.asset_code === expectedAsset;

            // Use floating point tolerance for amount comparison
            const amountDiff = Math.abs(
              parseFloat(paymentOp.amount) - parseFloat(expectedAmount),
            );
            const amountMatch = amountDiff < 0.0000001;

            

            if (assetMatch && amountMatch) {
              
              return { valid: true };
            } else {
              
            }
          }
        }
      }

      return { valid: false, error: "Payment details do not match" };
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  getNetworkPassphrase(): string {
    return this.network === "TESTNET"
      ? StellarSdk.Networks.TESTNET
      : StellarSdk.Networks.PUBLIC;
  }

  getNetwork(): StellarNetwork {
    return this.network;
  }
}

export const stellarTestnet = new StellarClient("TESTNET");
export const stellarMainnet = new StellarClient("MAINNET");
