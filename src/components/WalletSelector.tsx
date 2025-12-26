"use client";

import { WalletType, WALLET_INFO } from "@/lib/stellar/wallet-types";

interface WalletSelectorProps {
  availableWallets: WalletType[];
  onSelectWallet: (walletType: WalletType) => void;
  isLoading?: boolean;
}

export default function WalletSelector({
  availableWallets,
  onSelectWallet,
  isLoading = false,
}: WalletSelectorProps) {
  const allWallets = Object.values(WalletType);

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">Select a Wallet</h3>
      <p className="text-sm text-gray-600">
        Choose your preferred wallet to connect
      </p>

      <div className="grid gap-3">
        {allWallets.map((walletType) => {
          const info = WALLET_INFO[walletType];
          const isAvailable = availableWallets.includes(walletType);

          return (
            <button
              key={walletType}
              onClick={() => onSelectWallet(walletType)}
              disabled={isLoading}
              className={`
                flex items-center gap-4 p-4 rounded-lg border-2 transition-all
                ${
                  isAvailable
                    ? "border-blue-500 hover:bg-blue-50 cursor-pointer"
                    : "border-gray-300 bg-gray-50 cursor-not-allowed opacity-60"
                }
                ${isLoading ? "opacity-50 cursor-wait" : ""}
              `}
            >
              <div className="text-3xl">{info.icon}</div>
              <div className="flex-1 text-left">
                <div className="font-semibold">{info.name}</div>
                <div className="text-sm text-gray-600">{info.description}</div>
                {!isAvailable && info.installUrl && (
                  <a
                    href={info.installUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Install {info.name} →
                  </a>
                )}
              </div>
              {isAvailable && (
                <div className="text-green-600 text-sm font-medium">
                  Available ✓
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="text-xs text-gray-500 mt-4">
        <p>
          💡 <strong>Tip:</strong> Albedo works in any browser without
          installation
        </p>
      </div>
    </div>
  );
}
