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
 * Check if Freighter is available by attempting to access it
 * This triggers the extension to inject if it hasn't already
 */
export async function isFreighterAvailable(): Promise<boolean> {
  if (typeof window === "undefined") {
    return false;
  }

  // Method 1: Check window.freighterApi
  if (window.freighterApi) {
    console.log("✅ Freighter found via window.freighterApi");
    return true;
  }

  // Method 2: Check window.stellar
  if ((window as any).stellar) {
    console.log("✅ Freighter found via window.stellar");
    return true;
  }

  // Method 3: Dispatch custom event to trigger Freighter injection
  // Some extensions only inject when they detect wallet-related activity
  const event = new CustomEvent("freighter-request", {
    detail: { type: "check-availability" },
  });
  window.dispatchEvent(event);

  // Wait a bit for injection
  await new Promise((resolve) => setTimeout(resolve, 300));

  // Check again
  if (window.freighterApi || (window as any).stellar) {
    console.log("✅ Freighter found after event dispatch");
    return true;
  }

  console.log("❌ Freighter not available");
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
      console.log("🔐 Requesting Freighter permission...");
      await freighter.setAllowed();
    }

    return true;
  } catch (error) {
    console.error("Failed to request Freighter access:", error);
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

  try {
    const publicKey = await freighter.getPublicKey();
    return publicKey;
  } catch (error) {
    console.error("Failed to get public key:", error);
    throw error;
  }
}

/**
 * Get the current network from Freighter
 */
export async function getFreighterNetwork(): Promise<string> {
  const freighter = getFreighterApi();

  if (!freighter) {
    throw new Error("Freighter is not available");
  }

  try {
    const network = await freighter.getNetwork();
    return network;
  } catch (error) {
    console.error("Failed to get network:", error);
    throw error;
  }
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

  try {
    const signedXdr = await freighter.signTransaction(xdr, opts);
    return signedXdr;
  } catch (error) {
    console.error("Failed to sign transaction:", error);
    throw error;
  }
}

/**
 * Complete connection flow
 * Returns public key and network if successful
 */
export async function connectFreighter(): Promise<{
  publicKey: string;
  network: string;
}> {
  console.log("🔗 Starting Freighter connection flow...");

  // Step 1: Check if available
  const available = await isFreighterAvailable();
  if (!available) {
    throw new Error(
      "Freighter wallet is not installed. Please install it from https://www.freighter.app/",
    );
  }

  // Step 2: Request access
  await requestFreighterAccess();

  // Step 3: Get public key
  const publicKey = await getFreighterPublicKey();
  console.log("✅ Public key obtained:", publicKey.substring(0, 8) + "...");

  // Step 4: Get network
  const network = await getFreighterNetwork();
  console.log("✅ Network:", network);

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
