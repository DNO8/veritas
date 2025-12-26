/**
 * Freighter Wallet Connector
 *
 * Uses a more robust approach to detect and connect to Freighter wallet
 * Similar to how Stellar Lab implements wallet connections
 */

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
 */
export async function isFreighterAvailable(): Promise<boolean> {
  if (typeof window === "undefined") {
    return false;
  }

  if (window.freighterApi || (window as any).stellar) {
    return true;
  }

  return false;
}

/**
 * Aggressively trigger Freighter injection
 * Called when user clicks Connect button
 */
async function triggerFreighterInjection(): Promise<boolean> {
  // Dispatch multiple events to wake up Freighter
  window.dispatchEvent(new CustomEvent("freighter-request"));
  window.dispatchEvent(new CustomEvent("stellar-request"));
  window.postMessage({ type: "FREIGHTER_API_REQUEST" }, "*");

  // Wait up to 3 seconds with checks every 100ms
  for (let i = 0; i < 30; i++) {
    await new Promise((resolve) => setTimeout(resolve, 100));

    if (window.freighterApi || (window as any).stellar) {
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
}> {
  // Step 1: Check if available, if not try to trigger injection
  let available = await isFreighterAvailable();

  if (!available) {
    console.log("🔄 Triggering Freighter injection...");
    available = await triggerFreighterInjection();
  }

  if (!available) {
    throw new Error(
      "Freighter wallet is not responding. Please ensure the extension is installed and enabled, then try again.",
    );
  }

  console.log("✅ Freighter detected");

  // Step 2: Request access
  await requestFreighterAccess();

  // Step 3: Get public key
  const publicKey = await getFreighterPublicKey();

  // Step 4: Get network
  const network = await getFreighterNetwork();

  console.log("✅ Connected:", publicKey.substring(0, 8) + "...", network);

  return { publicKey, network };
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
