"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
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

interface WalletContextType {
  isConnected: boolean;
  publicKey: string | null;
  network: string | null;
  walletType: WalletType | null;
  isLoading: boolean;
  error: string | null;
  availableWallets: WalletType[];
  connect: (type: WalletType) => Promise<boolean>;
  disconnect: () => void;
  signTransaction: (xdr: string, networkPassphrase?: string) => Promise<string>;
  checkAvailableWallets: () => Promise<WalletType[]>;
  getWalletInfo: (walletType: WalletType) => (typeof WALLET_INFO)[WalletType];
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [network, setNetwork] = useState<string | null>(null);
  const [walletType, setWalletType] = useState<WalletType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableWallets, setAvailableWallets] = useState<WalletType[]>([]);

  const checkAvailableWallets = useCallback(async () => {
    const available: WalletType[] = [];

    if (await isAlbedoAvailable()) {
      available.push(WalletType.ALBEDO);
    }

    if (await isFreighterAvailable()) {
      available.push(WalletType.FREIGHTER);
    }

    if (await isXBullAvailable()) {
      available.push(WalletType.XBULL);
    }

    setAvailableWallets(available);
    return available;
  }, []);

  const connect = useCallback(async (type: WalletType) => {
    setIsLoading(true);
    setError(null);

    try {
      let connection: WalletConnection;

      switch (type) {
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
          throw new Error(`Unsupported wallet type: ${type}`);
      }

      setIsConnected(true);
      setPublicKey(connection.publicKey);
      setNetwork(connection.network);
      setWalletType(connection.walletType);
      setIsLoading(false);

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
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to connect wallet";

      setIsConnected(false);
      setPublicKey(null);
      setNetwork(null);
      setWalletType(null);
      setIsLoading(false);
      setError(errorMessage);

      return false;
    }
  }, []);

  const disconnect = useCallback(() => {
    if (walletType === WalletType.XBULL) {
      disconnectXBull();
    }

    setIsConnected(false);
    setPublicKey(null);
    setNetwork(null);
    setWalletType(null);
    setIsLoading(false);
    setError(null);
  }, [walletType]);

  const signTransaction = useCallback(
    async (xdr: string, networkPassphrase?: string) => {
      if (!isConnected || !walletType) {
        throw new Error("Wallet is not connected");
      }

      try {
        let signedXdr: string;

        switch (walletType) {
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
            signedXdr = await signXBullTransaction(xdr, {
              networkPassphrase,
            });
            break;
          default:
            throw new Error(`Unsupported wallet type: ${walletType}`);
        }

        return signedXdr;
      } catch (error) {
        throw new Error(
          error instanceof Error ? error.message : "Failed to sign transaction",
        );
      }
    },
    [isConnected, walletType],
  );

  const getWalletInfo = useCallback((walletType: WalletType) => {
    return WALLET_INFO[walletType];
  }, []);

  useEffect(() => {
    checkAvailableWallets();
  }, [checkAvailableWallets]);

  const value = {
    isConnected,
    publicKey,
    network,
    walletType,
    isLoading,
    error,
    availableWallets,
    connect,
    disconnect,
    signTransaction,
    checkAvailableWallets,
    getWalletInfo,
  };

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}
