/**
 * Freighter Wallet Connector
 *
 * Uses a more robust approach to detect and connect to Freighter wallet
 * Similar to how Stellar Lab implements wallet connections
 */

import { WalletType } from "./wallet-types";

export interface FreighterConnector {
  isAvailable: () => Promise<boolean>;
  getPublicKey: () => Promise<string>;
  signTransaction: (
    xdr: string,
    opts?: { network?: string; networkPassphrase?: string },
  ) => Promise<string>;
  getNetwork: () => Promise<string>;
}

/**
 * Check if Freighter is available
 * Returns false to trigger injection attempt
 */
export async function isFreighterAvailable(): Promise<boolean> {
  if (typeof window === "undefined") {
    return false;
  }

  // Always return false to force injection trigger on connect
  // This works better with Freighter's lazy loading
  return false;
}

/**
 * Trigger Freighter and wait for it to load
 */
async function triggerFreighterInjection(): Promise<boolean> {
  // Try direct access first
  if (window.freighterApi) {
    return true;
  }

  // Try to trigger via user interaction (click event)
  const clickEvent = new MouseEvent("click", {
    view: window,
    bubbles: true,
    cancelable: true,
  });
  document.dispatchEvent(clickEvent);

  // Wait and check multiple times
  for (let i = 0; i < 30; i++) {
    await new Promise((resolve) => setTimeout(resolve, 100));

    if (window.freighterApi) {
      return true;
    }
  }

  return false;
}

/**
 * Get Freighter API object
 */
function getFreighterApi() {
  return window.freighterApi || (window as any).stellar;
}

/**
 * Request access to Freighter wallet
 * This will show the Freighter popup if user hasn't granted permission
 */
export async function requestFreighterAccess(): Promise<boolean> {
  const freighter = getFreighterApi();

  if (!freighter) {
    throw new Error("Freighter is not installed or not available");
  }

  try {
    const isAllowed = await freighter.isAllowed();

    if (!isAllowed) {
      await freighter.setAllowed();
    }

    return true;
  } catch (error) {
    throw error;
  }
}

/**
 * Get the user's public key from Freighter
 */
export async function getFreighterPublicKey(): Promise<string> {
  const freighter = getFreighterApi();

  if (!freighter) {
    throw new Error("Freighter is not available");
  }

  const publicKey = await freighter.getPublicKey();
  return publicKey;
}

/**
 * Get the current network from Freighter
 */
export async function getFreighterNetwork(): Promise<string> {
  const freighter = getFreighterApi();

  if (!freighter) {
    throw new Error("Freighter is not available");
  }

  const network = await freighter.getNetwork();
  return network;
}

/**
 * Sign a transaction with Freighter
 */
export async function signFreighterTransaction(
  xdr: string,
  opts?: { network?: string; networkPassphrase?: string },
): Promise<string> {
  const freighter = getFreighterApi();

  if (!freighter) {
    throw new Error("Freighter is not available");
  }

  const signedXdr = await freighter.signTransaction(xdr, opts);
  return signedXdr;
}

/**
 * Complete connection flow
 * Returns public key and network if successful
 */
export async function connectFreighter(): Promise<{
  publicKey: string;
  network: string;
  walletType: WalletType;
}> {
  // Try to trigger injection
  const available = await triggerFreighterInjection();

  if (!available) {
    throw new Error(
      "Freighter wallet is not installed or not responding. Please install Freighter extension and try again.",
    );
  }

  // Request access
  await requestFreighterAccess();

  // Get public key and network
  const publicKey = await getFreighterPublicKey();
  const network = await getFreighterNetwork();

  return { publicKey, network, walletType: WalletType.FREIGHTER };
}

// Type declarations
declare global {
  interface Window {
    freighterApi?: {
      isAllowed: () => Promise<boolean>;
      setAllowed: () => Promise<void>;
      getPublicKey: () => Promise<string>;
      getNetwork: () => Promise<string>;
      signTransaction: (
        xdr: string,
        opts?: { network?: string; networkPassphrase?: string },
      ) => Promise<string>;
    };
  }
}
