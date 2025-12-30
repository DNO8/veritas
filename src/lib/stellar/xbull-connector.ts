/**
 * xBull Wallet Connector
 * Multi-chain wallet support via Stellar Wallets Kit
 */

import {
  StellarWalletsKit,
  WalletNetwork,
  allowAllModules,
  XBULL_ID,
  ISupportedWallet,
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

  try {
    // Método 1: Verificar xBullSDK en window
    if ((window as any).xBullSDK) {
      return true;
    }

    // Método 2: Verificar xBullWalletConnect
    if ((window as any).xBullWalletConnect) {
      return true;
    }

    // Método 3: Usar StellarWalletsKit para detectar wallets disponibles
    const kit = new StellarWalletsKit({
      network: WalletNetwork.TESTNET,
      selectedWalletId: XBULL_ID,
      modules: allowAllModules(),
    });

    const supportedWallets = await kit.getSupportedWallets();
    const xBullWallet = supportedWallets.find(
      (wallet) => wallet.id === XBULL_ID,
    );

    return !!xBullWallet;
  } catch (error) {
    
    return false;
  }
}

/**
 * Connect to xBull wallet
 */
export async function connectXBull(): Promise<WalletConnection> {
  try {
    // Verificar si xBull está instalado
    const isAvailable = await isXBullAvailable();
    if (!isAvailable) {
      throw new Error(
        "xBull wallet is not installed. Please install it from https://xbull.app/",
      );
    }

    const kit = new StellarWalletsKit({
      network: WalletNetwork.TESTNET,
      selectedWalletId: XBULL_ID,
      modules: allowAllModules(),
    });

    // Intentar conectar directamente sin modal si xBull está seleccionado
    try {
      kit.setWallet(XBULL_ID);
      const { address } = await kit.getAddress();

      return {
        publicKey: address,
        network: "TESTNET",
        walletType: WalletType.XBULL,
      };
    } catch (directError) {
      // Si falla la conexión directa, abrir modal
      await kit.openModal({
        onWalletSelected: async (option: ISupportedWallet) => {
          kit.setWallet(option.id);
        },
      });

      const { address } = await kit.getAddress();

      return {
        publicKey: address,
        network: "TESTNET",
        walletType: WalletType.XBULL,
      };
    }
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("User closed modal")) {
        throw new Error("Connection canceled by user");
      }
      if (error.message.includes("not installed")) {
        throw error;
      }
    }
    
    throw new Error(
      "Failed to connect to xBull. Make sure the extension is installed and enabled.",
    );
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
      
      throw new Error("Failed to sign transaction - no signed XDR returned");
    }

    
    return signedTxXdr;
  } catch (error) {
    
    
    if (error instanceof Error) {
      if (error.message.includes("User closed modal") || error.message.includes("rejected")) {
        throw new Error("Transaction signing canceled by user");
      }
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
