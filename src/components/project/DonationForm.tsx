"use client";

import { motion } from "framer-motion";
import { useDonation } from "@/lib/hooks/useDonation";
import { useWallet } from "@/lib/hooks/WalletProvider";
import { useAuth } from "@/lib/hooks/useAuth";
import WalletConnect from "@/components/WalletConnect";
import { useTranslations } from "next-intl";
import Link from "next/link";

interface DonationFormProps {
  projectId: string;
  projectWallet: string | null;
  onSuccess: () => void;
  onError?: (message: string) => void;
}

export default function DonationForm({
  projectId,
  projectWallet,
  onSuccess,
  onError,
}: DonationFormProps) {
  const t = useTranslations("donations");
  const { isConnected } = useWallet();
  const { isAuthenticated, hasCompleteProfile, profile } = useAuth();
  const { amount, setAmount, asset, setAsset, donating, donate, canDonate } =
    useDonation();

  const handleDonate = async () => {
    if (!projectWallet) {
      onError?.("Este proyecto no tiene una wallet configurada");
      return;
    }

    try {
      const result = await donate(projectId, projectId, projectWallet);
      onSuccess();
    } catch (error) {
      onError?.(error instanceof Error ? error.message : "Error desconocido");
    }
  };

  return (
    <div className="border-t-2 border-black pt-4 mt-4">
      <h3 className="font-bold text-sm sm:text-base mb-3">🐝 {t("donate")}</h3>

      {!isAuthenticated && (
        <div className="bg-yellow-100 border-2 border-black p-3 mb-4">
          <p className="font-mono text-xs sm:text-sm mb-2">
            ⚠️ Debes iniciar sesión para realizar donaciones
          </p>
          <Link
            href="/login"
            className="btn-brutal btn-brutal-primary text-xs sm:text-sm py-1.5 px-3 inline-block"
          >
            Iniciar sesión
          </Link>
        </div>
      )}

      {isAuthenticated && !hasCompleteProfile && (
        <div className="bg-yellow-100 border-2 border-black p-3 mb-4">
          <p className="font-mono text-xs sm:text-sm mb-2">
            ⚠️ Debes completar tu perfil para realizar donaciones
          </p>
          <Link
            href="/complete-profile"
            className="btn-brutal btn-brutal-primary text-xs sm:text-sm py-1.5 px-3 inline-block"
          >
            Completar perfil
          </Link>
        </div>
      )}

      {isAuthenticated && hasCompleteProfile && !profile?.wallet_address && (
        <div className="bg-yellow-100 border-2 border-black p-3 mb-4">
          <p className="font-mono text-xs sm:text-sm mb-2">
            ⚠️ Debes conectar una wallet a tu perfil para realizar donaciones
          </p>
          <Link
            href="/profile/settings"
            className="btn-brutal btn-brutal-primary text-xs sm:text-sm py-1.5 px-3 inline-block"
          >
            Configurar wallet
          </Link>
        </div>
      )}

      <WalletConnect />

      <div className="space-y-3 sm:space-y-4 mt-3 sm:mt-4">
        <div>
          <label className="block font-mono text-xs sm:text-sm mb-1.5 sm:mb-2">
            {t("asset")}
          </label>
          <select
            value={asset}
            onChange={(e) => setAsset(e.target.value as "XLM" | "USDC")}
            className="input-brutal"
          >
            <option value="XLM">XLM (Stellar Lumens)</option>
            <option value="USDC">USDC (USD Coin)</option>
          </select>
        </div>

        <div>
          <label className="block font-mono text-xs sm:text-sm mb-1.5 sm:mb-2">
            {t("amount")} ({asset})
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="10"
            min="0.0000001"
            step="0.1"
            className="input-brutal"
          />
        </div>

        {/* Quick amounts */}
        <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
          {[5, 10, 25, 50].map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => setAmount(String(val))}
              className="py-1.5 sm:py-2 border-2 border-black font-mono text-xs sm:text-sm hover:bg-[#FDCB6E] transition-colors"
            >
              {val}
            </button>
          ))}
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={handleDonate}
          disabled={!canDonate || donating}
          className={`w-full btn-brutal ${
            !canDonate || donating
              ? "bg-gray-300 cursor-not-allowed shadow-none"
              : "btn-brutal-primary animate-pulse-glow"
          }`}
        >
          {donating
            ? t("processing")
            : `🍯 ${t("donate")} ${amount || "0"} ${asset}`}
        </motion.button>

        <p className="text-[10px] sm:text-xs text-gray-500 font-mono text-center">
          💡 Directo a la wallet del creador • Sin comisiones • Testnet
        </p>
      </div>
    </div>
  );
}
