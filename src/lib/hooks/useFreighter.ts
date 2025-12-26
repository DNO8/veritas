"use client";

import { useState, useEffect, useCallback } from "react";
import {
  isFreighterAvailable,
  connectFreighter,
  signFreighterTransaction,
} from "../stellar/freighter-connector";

export interface FreighterState {
  isInstalled: boolean;
  isConnected: boolean;
  publicKey: string | null;
  network: string | null;
  isLoading: boolean;
  error: string | null;
}

export function useFreighter() {
  const [state, setState] = useState<FreighterState>({
    isInstalled: false,
    isConnected: false,
    publicKey: null,
    network: null,
    isLoading: true,
    error: null,
  });

  // Check if Freighter is installed using connector
  const checkInstalled = useCallback(async () => {
    if (typeof window === "undefined") {
      return false;
    }

    try {
      const available = await isFreighterAvailable();
      console.log("🔍 Freighter availability check:", available);

      setState((prev) => ({
        ...prev,
        isInstalled: available,
        isLoading: false,
      }));
      return available;
    } catch (error) {
      console.error("Error checking Freighter:", error);
      setState((prev) => ({ ...prev, isInstalled: false, isLoading: false }));
      return false;
    }
  }, []);

  // Connect to Freighter wallet using connector
  const connect = useCallback(async () => {
    console.log("🔗 Connecting to Freighter...");

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const { publicKey, network } = await connectFreighter();

      setState({
        isInstalled: true,
        isConnected: true,
        publicKey,
        network,
        isLoading: false,
        error: null,
      });

      console.log("✅ Wallet connected successfully");
      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to connect to Freighter";

      console.error("❌ Connection error:", errorMessage);

      setState((prev) => ({
        ...prev,
        isConnected: false,
        publicKey: null,
        network: null,
        isLoading: false,
        error: errorMessage,
      }));

      return false;
    }
  }, []);

  // Disconnect wallet
  const disconnect = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isConnected: false,
      publicKey: null,
      network: null,
      error: null,
    }));
  }, []);

  // Sign transaction using connector
  const signTransaction = useCallback(
    async (xdr: string, networkPassphrase?: string) => {
      if (!state.isConnected) {
        throw new Error("Wallet is not connected");
      }

      try {
        const signedXdr = await signFreighterTransaction(xdr, {
          networkPassphrase,
        });
        return signedXdr;
      } catch (error) {
        throw new Error(
          error instanceof Error ? error.message : "Failed to sign transaction",
        );
      }
    },
    [state.isConnected],
  );

  // Check connection on mount with multiple attempts
  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 10;
    let mounted = true;

    console.log("🔄 Starting Freighter detection...");

    const checkWithRetry = async () => {
      if (!mounted) return;

      const installed = await checkInstalled();

      if (!installed && attempts < maxAttempts && mounted) {
        attempts++;
        console.log(`  - Retry ${attempts}/${maxAttempts}...`);
        setTimeout(checkWithRetry, 150);
      } else if (!installed && mounted) {
        console.log("⚠️ Freighter not detected after", maxAttempts, "attempts");
        console.log("   User can click 'Connect' button to trigger connection");
      } else if (mounted) {
        console.log("✅ Freighter detected on page load");
      }
    };

    checkWithRetry();

    return () => {
      mounted = false;
    };
  }, [checkInstalled]);

  return {
    ...state,
    connect,
    disconnect,
    signTransaction,
    checkInstalled,
  };
}
