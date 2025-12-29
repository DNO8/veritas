"use client";

import { useState } from "react";
import { useWallet } from "@/lib/hooks/WalletProvider";
import WalletSelector from "./WalletSelector";
import WalletDebugger from "./WalletDebugger";
import { WalletType } from "@/lib/stellar/wallet-types";
import { motion, AnimatePresence } from "framer-motion";

export default function WalletConnect() {
  const {
    isConnected,
    publicKey,
    walletType,
    isLoading,
    error,
    availableWallets,
    connect,
    disconnect,
    getWalletInfo,
  } = useWallet();

  const [showSelector, setShowSelector] = useState(false);

  if (isLoading) {
    return (
      <div className="p-4 border-3 border-black bg-[#FDCB6E]/30 mb-4">
        <div className="flex items-center gap-2">
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="text-xl"
          >
            🐝
          </motion.span>
          <span className="font-mono text-sm">Conectando wallet...</span>
        </div>
      </div>
    );
  }

  if (!isConnected && showSelector) {
    return (
      <div className="mb-4">
        <WalletSelector
          availableWallets={availableWallets}
          onSelectWallet={async (type) => {
            const success = await connect(type);
            if (success) {
              setShowSelector(false);
            }
          }}
          isLoading={isLoading}
        />
        <button
          onClick={() => setShowSelector(false)}
          className="mt-3 w-full py-2 border-2 border-black bg-gray-200 font-bold text-sm hover:bg-gray-300 transition-colors"
        >
          Cancelar
        </button>
        {error && (
          <p className="mt-2 text-red-600 text-sm font-mono">{error}</p>
        )}
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="mb-4">
        <WalletDebugger />
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowSelector(true)}
          className="w-full btn-brutal btn-brutal-dark flex items-center justify-center gap-2"
        >
          <span>🔗</span>
          Conectar Wallet
        </motion.button>
        <p className="mt-2 text-center font-mono text-xs text-gray-500">
          Freighter • Albedo • xBull
        </p>
      </div>
    );
  }

  const walletInfo = walletType ? getWalletInfo(walletType) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 border-3 border-black bg-[#FDCB6E] mb-4"
    >
      <div className="flex justify-between items-center">
        <div>
          <p className="font-bold text-sm flex items-center gap-2">
            <span>✅</span> {walletInfo?.name || "Wallet"} conectada
          </p>
          <p className="font-mono text-xs mt-1">
            {publicKey?.substring(0, 8)}...{publicKey?.substring(publicKey.length - 8)}
          </p>
        </div>
        <button
          onClick={disconnect}
          className="px-3 py-1 border-2 border-black bg-white text-sm font-bold hover:bg-black hover:text-white transition-colors"
        >
          Desconectar
        </button>
      </div>
    </motion.div>
  );
}
