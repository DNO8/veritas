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
 */
export async function isFreighterAvailable(): Promise<boolean> {
  if (typeof window === "undefined") {
    console.log("🔍 [Freighter] Server-side, not available");
    return false;
  }

  const hasFreighterApi = !!window.freighterApi;
  const hasStellar = !!(window as any).stellar;

  console.log("🔍 [Freighter] Checking availability:");
  console.log("  - window.freighterApi:", hasFreighterApi);
  console.log("  - window.stellar:", hasStellar);

  // Also check for the extension in a different way
  const hasExtension = !!(window as any).freighter;
  console.log("  - window.freighter:", hasExtension);

  if (hasFreighterApi || hasStellar) {
    console.log("✅ [Freighter] Available");
    return true;
  }

  console.log("⚠️ [Freighter] Not immediately available");
  return false;
}

/**
 * Aggressively trigger Freighter injection
 * Called when user clicks Connect button
 */
async function triggerFreighterInjection(): Promise<boolean> {
  console.log("🔄 [Freighter] Dispatching injection events...");

  // Dispatch multiple events to wake up Freighter
  window.dispatchEvent(new CustomEvent("freighter-request"));
  window.dispatchEvent(new CustomEvent("stellar-request"));
  window.postMessage({ type: "FREIGHTER_API_REQUEST" }, "*");

  console.log("⏳ [Freighter] Waiting for injection (up to 5 seconds)...");

  // Wait up to 5 seconds with checks every 200ms
  for (let i = 0; i < 25; i++) {
    await new Promise((resolve) => setTimeout(resolve, 200));

    const hasFreighterApi = !!window.freighterApi;
    const hasStellar = !!(window as any).stellar;

    if (i % 5 === 0) {
      console.log(
        `⏳ [Freighter] Check ${i + 1}/25 - freighterApi: ${hasFreighterApi}, stellar: ${hasStellar}`,
      );
    }

    if (hasFreighterApi || hasStellar) {
      console.log(
        `✅ [Freighter] Injection successful after ${(i + 1) * 200}ms`,
      );
      return true;
    }
  }

  console.error(
    "❌ [Freighter] Injection timeout - extension may not be installed",
  );
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
  console.log("🔗 [Freighter] Starting connection...");

  // Step 1: Check if available, if not try to trigger injection
  let available = await isFreighterAvailable();
  console.log("🔍 [Freighter] Initial availability:", available);

  if (!available) {
    console.log("🔄 [Freighter] Triggering injection...");
    available = await triggerFreighterInjection();
    console.log("🔍 [Freighter] Availability after injection:", available);
  }

  if (!available) {
    console.error("❌ [Freighter] Not available after all attempts");
    throw new Error(
      "Freighter wallet is not responding. Please ensure the extension is installed and enabled, then try again.",
    );
  }

  console.log("✅ [Freighter] Detected");

  // Step 2: Request access
  console.log("🔐 [Freighter] Requesting access...");
  await requestFreighterAccess();
  console.log("✅ [Freighter] Access granted");

  // Step 3: Get public key
  console.log("🔑 [Freighter] Getting public key...");
  const publicKey = await getFreighterPublicKey();
  console.log("✅ [Freighter] Public key:", publicKey.substring(0, 8) + "...");

  // Step 4: Get network
  console.log("🌐 [Freighter] Getting network...");
  const network = await getFreighterNetwork();
  console.log("✅ [Freighter] Network:", network);

  console.log("✅ [Freighter] Connection complete");

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
