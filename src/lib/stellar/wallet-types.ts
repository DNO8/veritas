/**
 * Shared types for multi-wallet support
 */

export enum WalletType {
  FREIGHTER = "freighter",
  ALBEDO = "albedo",
  XBULL = "xbull",
}

export interface WalletInfo {
  type: WalletType;
  name: string;
  icon: string;
  description: string;
  installUrl?: string;
}

export interface WalletConnection {
  publicKey: string;
  network: string;
  walletType: WalletType;
}

export interface WalletConnector {
  type: WalletType;
  isAvailable: () => Promise<boolean>;
  connect: () => Promise<WalletConnection>;
  disconnect: () => void;
  signTransaction: (
    xdr: string,
    opts?: { network?: string; networkPassphrase?: string },
  ) => Promise<string>;
}

export const WALLET_INFO: Record<WalletType, WalletInfo> = {
  [WalletType.FREIGHTER]: {
    type: WalletType.FREIGHTER,
    name: "Freighter",
    icon: "🚀",
    description: "Browser extension wallet",
    installUrl: "https://www.freighter.app/",
  },
  [WalletType.ALBEDO]: {
    type: WalletType.ALBEDO,
    name: "Albedo",
    icon: "⭐",
    description: "Web-based wallet (no installation required)",
  },
  [WalletType.XBULL]: {
    type: WalletType.XBULL,
    name: "xBull",
    icon: "🐂",
    description: "Multi-chain wallet",
    installUrl: "https://xbull.app/",
  },
};
