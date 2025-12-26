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

    setState((prev) => ({ ...prev, isInstalled: installed, isLoading: false }));
    return installed;
  }, []);

  // Connect to Freighter wallet
  const connect = useCallback(async () => {
    // Usar window.freighterApi o window.stellar como fallback
    const freighter = window.freighterApi || (window as any).stellar;

    if (!freighter) {
      setState((prev) => ({
        ...prev,
        error: "Freighter wallet is not installed",
      }));
      return false;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      // Request permission
      const isAllowed = await freighter.isAllowed();

      if (!isAllowed) {
        await freighter.setAllowed();
      }

      // Get public key
      const publicKey = await freighter.getPublicKey();

      // Get network
      const network = await freighter.getNetwork();

      setState({
        isInstalled: true,
        isConnected: true,
        publicKey,
        network,
        isLoading: false,
        error: null,
      });

      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to connect to Freighter";

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

    const checkWithRetry = () => {
      const installed = checkInstalled();

      if (!installed && attempts < maxAttempts) {
        attempts++;
        setTimeout(checkWithRetry, 100);
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
