"use client";

import { useState } from "react";
import { useWallet } from "./WalletProvider";
import { sendPayment } from "@/lib/stellar/payment";

export function useDonation() {
  const { isConnected, publicKey, signTransaction } = useWallet();
  const [donating, setDonating] = useState(false);
  const [amount, setAmount] = useState("");
  const [asset, setAsset] = useState<"XLM" | "USDC">("XLM");

  const donate = async (
    projectId: string,
    projectTitle: string,
    destinationWallet: string,
  ) => {
    if (!amount || Number(amount) <= 0) {
      throw new Error("Please enter a valid amount");
    }

    if (!isConnected || !publicKey) {
      throw new Error("Please connect your wallet first");
    }

    if (!destinationWallet) {
      throw new Error("This project doesn't have a wallet address configured");
    }

    setDonating(true);

    try {
      // Execute Stellar payment
      const result = await sendPayment(
        {
          sourcePublicKey: publicKey,
          destinationPublicKey: destinationWallet,
          amount: amount,
          asset: asset,
          memo: `Donation to ${projectTitle}`,
          network: "TESTNET",
        },
        signTransaction,
      );

      if (!result.success) {
        throw new Error("Transaction failed on Stellar network");
      }

      // Record donation in database
      await fetch("/api/donations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          donorWallet: publicKey,
          amount: amount,
          asset: asset,
          txHash: result.hash,
          network: "TESTNET",
        }),
      });

      return {
        success: true,
        hash: result.hash,
        amount,
        asset,
      };
    } finally {
      setDonating(false);
    }
  };

  const reset = () => {
    setAmount("");
    setAsset("XLM");
  };

  return {
    amount,
    setAmount,
    asset,
    setAsset,
    donating,
    donate,
    reset,
    canDonate: isConnected && !!publicKey && !!amount && Number(amount) > 0,
  };
}
