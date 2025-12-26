"use client";

import { useState, useEffect, useCallback } from "react";

// Freighter API types
interface FreighterAPI {
  isConnected: () => Promise<boolean>;
  getPublicKey: () => Promise<string>;
  signTransaction: (
    xdr: string,
    opts?: { network?: string; networkPassphrase?: string },
  ) => Promise<string>;
  getNetwork: () => Promise<string>;
  isAllowed: () => Promise<boolean>;
  setAllowed: () => Promise<void>;
}

declare global {
  interface Window {
    freighterApi?: FreighterAPI;
  }
}

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

  // Check if Freighter is installed
  const checkInstalled = useCallback(() => {
    if (typeof window === "undefined") {
      return false;
    }

    // Freighter puede inyectarse como window.freighterApi o window.stellar
    const installed = !!(window.freighterApi || (window as any).stellar);

    console.log("🔍 Freighter Detection:");
    console.log("  - window.freighterApi:", !!window.freighterApi);
    console.log("  - window.stellar:", !!(window as any).stellar);
    console.log("  - isInstalled:", installed);

    setState((prev) => ({ ...prev, isInstalled: installed, isLoading: false }));
    return installed;
  }, []);

  // Connect to Freighter wallet
  const connect = useCallback(async () => {
    console.log("🔗 Attempting to connect to Freighter...");

    // Usar window.freighterApi o window.stellar como fallback
    const freighter = window.freighterApi || (window as any).stellar;

    console.log("  - freighter object:", !!freighter);

    if (!freighter) {
      console.error("❌ Freighter not found");
      setState((prev) => ({
        ...prev,
        error: "Freighter wallet is not installed",
      }));
      return false;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      // Request permission
      console.log("  - Checking permission...");
      const isAllowed = await freighter.isAllowed();
      console.log("  - isAllowed:", isAllowed);

      if (!isAllowed) {
        console.log("  - Requesting permission...");
        await freighter.setAllowed();
      }

      // Get public key
      console.log("  - Getting public key...");
      const publicKey = await freighter.getPublicKey();
      console.log("  - Public key:", publicKey?.substring(0, 8) + "...");

      // Get network
      console.log("  - Getting network...");
      const network = await freighter.getNetwork();
      console.log("  - Network:", network);

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
      console.error("   Full error:", error);

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

  // Sign transaction
  const signTransaction = useCallback(
    async (xdr: string, networkPassphrase?: string) => {
      const freighter = window.freighterApi || (window as any).stellar;

      if (!freighter) {
        throw new Error("Freighter wallet is not installed");
      }

      if (!state.isConnected) {
        throw new Error("Wallet is not connected");
      }

      try {
        const signedXdr = await freighter.signTransaction(xdr, {
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
    const maxAttempts = 10; // Intentar durante 1 segundo

    console.log("🔄 Starting Freighter detection...");

    const checkWithRetry = () => {
      const installed = checkInstalled();

      if (!installed && attempts < maxAttempts) {
        attempts++;
        console.log(`  - Retry ${attempts}/${maxAttempts}...`);
        setTimeout(checkWithRetry, 100);
      } else if (!installed) {
        console.log("⚠️ Freighter not detected after", maxAttempts, "attempts");
      }
    };

    // Iniciar verificación
    checkWithRetry();
  }, [checkInstalled]);

  return {
    ...state,
    connect,
    disconnect,
    signTransaction,
    checkInstalled,
  };
}
