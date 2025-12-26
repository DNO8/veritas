"use client";

import { useState, useCallback, useEffect } from "react";
import {
  WalletType,
  WalletConnection,
  WALLET_INFO,
} from "../stellar/wallet-types";
import {
  connectFreighter,
  isFreighterAvailable,
  signFreighterTransaction,
} from "../stellar/freighter-connector";
import {
  connectAlbedo,
  isAlbedoAvailable,
  signAlbedoTransaction,
} from "../stellar/albedo-connector";
import {
  connectXBull,
  isXBullAvailable,
  signXBullTransaction,
  disconnectXBull,
} from "../stellar/xbull-connector";

export interface WalletState {
  isConnected: boolean;
  publicKey: string | null;
  network: string | null;
  walletType: WalletType | null;
  isLoading: boolean;
  error: string | null;
  availableWallets: WalletType[];
}

export function useWallet() {
  const [state, setState] = useState<WalletState>({
    isConnected: false,
    publicKey: null,
    network: null,
    walletType: null,
    isLoading: false,
    error: null,
    availableWallets: [],
  });

  // Check which wallets are available
  const checkAvailableWallets = useCallback(async () => {
    const available: WalletType[] = [];

    // Albedo is always available (web-based)
    if (await isAlbedoAvailable()) {
      available.push(WalletType.ALBEDO);
    }

    // Check Freighter
    if (await isFreighterAvailable()) {
      available.push(WalletType.FREIGHTER);
    }

    // Check xBull
    if (await isXBullAvailable()) {
      available.push(WalletType.XBULL);
    }

    setState((prev) => ({ ...prev, availableWallets: available }));
    return available;
  }, []);

  // Connect to a specific wallet
  const connect = useCallback(
    async (walletType: WalletType) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        let connection: WalletConnection;

        switch (walletType) {
          case WalletType.FREIGHTER:
            connection = await connectFreighter();
            break;
          case WalletType.ALBEDO:
            connection = await connectAlbedo();
            break;
          case WalletType.XBULL:
            connection = await connectXBull();
            break;
          default:
            throw new Error(`Unsupported wallet type: ${walletType}`);
        }

        setState({
          isConnected: true,
          publicKey: connection.publicKey,
          network: connection.network,
          walletType: connection.walletType,
          isLoading: false,
          error: null,
          availableWallets: state.availableWallets,
        });

        // Save wallet address to user profile
        try {
          const { supabase } = await import("@/lib/supabase/client");
          const {
            data: { user },
          } = await supabase.auth.getUser();

          if (user) {
            await supabase
              .from("users")
              .update({ wallet_address: connection.publicKey } as never)
              .eq("id", user.id);
          }
        } catch (dbError) {
          // Don't fail the connection if DB save fails
        }

        return true;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to connect wallet";

        setState((prev) => ({
          ...prev,
          isConnected: false,
          publicKey: null,
          network: null,
          walletType: null,
          isLoading: false,
          error: errorMessage,
        }));

        return false;
      }
    },
    [state.availableWallets],
  );

  // Disconnect wallet
  const disconnect = useCallback(() => {
    if (state.walletType === WalletType.XBULL) {
      disconnectXBull();
    }

    setState({
      isConnected: false,
      publicKey: null,
      network: null,
      walletType: null,
      isLoading: false,
      error: null,
      availableWallets: state.availableWallets,
    });
  }, [state.walletType, state.availableWallets]);

  // Sign transaction with current wallet
  const signTransaction = useCallback(
    async (xdr: string, networkPassphrase?: string) => {
      if (!state.isConnected || !state.walletType) {
        throw new Error("Wallet is not connected");
      }

      try {
        let signedXdr: string;

        switch (state.walletType) {
          case WalletType.FREIGHTER:
            signedXdr = await signFreighterTransaction(xdr, {
              networkPassphrase,
            });
            break;
          case WalletType.ALBEDO:
            signedXdr = await signAlbedoTransaction(xdr, {
              networkPassphrase,
            });
            break;
          case WalletType.XBULL:
            signedXdr = await signXBullTransaction(xdr, { networkPassphrase });
            break;
          default:
            throw new Error(`Unsupported wallet type: ${state.walletType}`);
        }

        return signedXdr;
      } catch (error) {
        throw new Error(
          error instanceof Error ? error.message : "Failed to sign transaction",
        );
      }
    },
    [state.isConnected, state.walletType],
  );

  // Get wallet info
  const getWalletInfo = useCallback((walletType: WalletType) => {
    return WALLET_INFO[walletType];
  }, []);

  // Check available wallets on mount
  useEffect(() => {
    checkAvailableWallets();
  }, [checkAvailableWallets]);

  return {
    ...state,
    connect,
    disconnect,
    signTransaction,
    checkAvailableWallets,
    getWalletInfo,
  };
}
