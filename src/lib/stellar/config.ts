export const STELLAR_CONFIG = {
  TESTNET: {
    network: "TESTNET",
    horizonUrl: "https://horizon-testnet.stellar.org",
    networkPassphrase: "Test SDF Network ; September 2015",
  },
  MAINNET: {
    network: "MAINNET",
    horizonUrl: "https://horizon.stellar.org",
    networkPassphrase: "Public Global Stellar Network ; September 2015",
  },
} as const;

export const SUPPORTED_ASSETS = {
  XLM: "native",
  USDC: {
    code: "USDC",
    issuer: "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN",
  },
} as const;

export type StellarNetwork = "TESTNET" | "MAINNET";
export type SupportedAsset = "XLM" | "USDC";
