"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import WalletConnect from "@/components/WalletConnect";
import { useWallet } from "@/lib/hooks/WalletProvider";
import { sendPayment } from "@/lib/stellar/payment";
import { useProject } from "@/lib/hooks/useProject";
import RecentDonations from "@/components/project/RecentDonations";
import TopDonors from "@/components/project/TopDonors";
import LoadingBee from "@/components/LoadingBee";
import { useNotification } from "@/components/NotificationToast";
import { useTranslations } from "next-intl";

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations("projects");
  const tDonations = useTranslations("donations");
  const [amount, setAmount] = useState("");
  const [asset, setAsset] = useState<"XLM" | "USDC">("XLM");
  const [donating, setDonating] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [publishing, setPublishing] = useState(false);
  const { showNotification, NotificationContainer } = useNotification();

  const { isConnected, publicKey, signTransaction } = useWallet();

  const {
    project,
    galleryImages,
    roadmapItems,
    donations,
    isOwner,
    loading,
    error,
  } = useProject(String(params.id));

  const handlePublish = async () => {
    if (!project) return;

    setPublishing(true);
    try {
      const res = await fetch(`/api/projects/${project.id}/publish`, {
        method: "POST",
        credentials: "include",
      });

      if (res.ok) {
        showNotification("¡Proyecto publicado exitosamente!", "success");
        window.location.reload();
      } else {
        const errorData = await res.json();
        if (errorData.message) {
          showNotification(`${errorData.error}: ${errorData.message}`, "error");
        } else {
          showNotification(
            `Error: ${errorData.error || "Error al publicar proyecto"}`,
            "error",
          );
        }
      }
    } catch (error) {
      showNotification(
        "Error al publicar proyecto. Intenta nuevamente.",
        "error",
      );
    } finally {
      setPublishing(false);
    }
  };

  const handleDonate = async () => {
    if (!amount || Number(amount) <= 0) {
      showNotification("Por favor ingresa un monto válido", "warning");
      return;
    }

    if (!isConnected || !publicKey) {
      showNotification("Por favor conecta tu wallet primero", "warning");
      return;
    }

    if (!project?.wallet_address) {
      showNotification(
        "Este proyecto no tiene una wallet configurada",
        "error",
      );
      return;
    }

    setDonating(true);

    try {
      const result = await sendPayment(
        {
          sourcePublicKey: publicKey,
          destinationPublicKey: project.wallet_address,
          amount: amount,
          asset: asset,
          memo: `Donate:${project.id.substring(0, 8)}`,
          network: "TESTNET",
        },
        signTransaction,
      );

      if (!result.success) {
        throw new Error("Transaction failed on Stellar network");
      }

      await fetch("/api/donations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: project.id,
          donorWallet: publicKey,
          amount: amount,
          asset: asset,
          txHash: result.hash,
          network: "TESTNET",
        }),
      });

      showNotification(
        `¡Donación exitosa! ${amount} ${asset} - Tx: ${result.hash.substring(0, 8)}...${result.hash.substring(result.hash.length - 8)}`,
        "success",
      );

      window.location.reload();
    } catch (error) {
      showNotification(
        `Error en la donación: ${error instanceof Error ? error.message : "Error desconocido"}`,
        "error",
      );
    } finally {
      setDonating(false);
    }
  };

  if (loading) {
    return <LoadingBee text="Cargando proyecto..." />;
  }

  if (error || !project) {
    return (
      <div className="min-h-screen hex-pattern flex items-center justify-center">
        <div className="card-brutal p-8 bg-white text-center">
          <div className="text-6xl mb-4">😢</div>
          <h2 className="text-2xl font-bold mb-2">{t("projectNotFound")}</h2>
          <p className="text-gray-600">{error || t("projectDoesntExist")}</p>
        </div>
      </div>
    );
  }

  const totalNeeded = roadmapItems.reduce((sum, item) => {
    const cost = parseFloat(item.estimated_cost || "0");
    return sum + cost;
  }, 0);
  const currentAmount = parseFloat(project.current_amount || "0");
  const percentage = totalNeeded > 0 ? (currentAmount / totalNeeded) * 100 : 0;

  return (
    <>
      {NotificationContainer}
      <div className="min-h-screen hex-pattern">
        {/* Hero Cover */}
        <div className="relative">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-[250px] sm:h-[300px] md:h-[350px] lg:h-[400px] relative overflow-hidden border-b-4 border-black"
          >
            <img
              src={project.cover_image_url}
              alt={project.title}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent cursor-pointer"
              onClick={() => {
                setLightboxIndex(-1);
                setLightboxOpen(true);
              }}
            />

            {/* Badges */}
            <div className="absolute top-3 left-3 sm:top-4 sm:left-4 flex flex-wrap gap-1.5 sm:gap-2">
              {project.generated_cover && (
                <span className="badge-brutal badge-brutal-secondary text-xs sm:text-sm">
                  ✨ {t("aiGenerated")}
                </span>
              )}
              <span
                className={`badge-brutal text-xs sm:text-sm ${project.status === "published" ? "badge-brutal-primary" : "bg-yellow-400 text-black border-black"}`}
              >
                {project.status === "published"
                  ? `🟢 ${t("live")}`
                  : `📝 ${t("draft")}`}
              </span>
            </div>

            {/* Title Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8">
              <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-1 sm:mb-2 drop-shadow-lg line-clamp-2"
              >
                {project.title}
              </motion.h1>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white/90 max-w-2xl line-clamp-2">
                {project.short_description}
              </p>
            </div>
          </motion.div>
        </div>

        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6 lg:space-y-8 order-2 lg:order-1">
              {/* Owner Actions */}
              {isOwner && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-wrap gap-3"
                >
                  <button
                    onClick={() => router.push(`/projects/${project.id}/edit`)}
                    className="btn-brutal btn-brutal-primary"
                  >
                    ✏️ {t("editProject")}
                  </button>
                  <button
                    onClick={() =>
                      router.push(`/projects/${project.id}/roadmap`)
                    }
                    className="btn-brutal btn-brutal-secondary"
                  >
                    📋 {t("manageRoadmap")}
                  </button>
                </motion.div>
              )}

              {/* Draft Warning */}
              {project.status === "draft" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="card-brutal p-6 bg-[#FDCB6E]"
                >
                  <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">
                    ⚠️ {t("draftProject")}
                  </h3>
                  <p className="text-xs sm:text-sm mb-3 sm:mb-4">
                    {t("completeStepsToPublish")}
                  </p>

                  <div className="space-y-3 mb-4">
                    {/* Wallet Check */}
                    <div
                      className={`flex items-start gap-3 p-3 border-3 border-black ${project.wallet_address ? "bg-green-100" : "bg-white"}`}
                    >
                      <span className="text-2xl">
                        {project.wallet_address ? "✅" : "⚠️"}
                      </span>
                      <div className="flex-1">
                        <p className="font-bold text-sm">
                          {t("walletStellar")}
                        </p>
                        <p className="text-xs text-gray-700">
                          {t("neededForDonations")}
                        </p>
                      </div>
                      {!project.wallet_address && (
                        <button
                          onClick={() =>
                            router.push(
                              `/${params.locale}/projects/${project.id}/edit`,
                            )
                          }
                          className="btn-brutal bg-white text-xs px-3 py-1"
                        >
                          {t("add")} →
                        </button>
                      )}
                    </div>

                    {/* Roadmap Check */}
                    <div
                      className={`flex items-start gap-3 p-3 border-3 border-black ${roadmapItems.length > 0 ? "bg-green-100" : "bg-white"}`}
                    >
                      <span className="text-2xl">
                        {roadmapItems.length > 0 ? "✅" : "⚠️"}
                      </span>
                      <div className="flex-1">
                        <p className="font-bold text-sm">{t("roadmapItem")}</p>
                        <p className="text-xs text-gray-700">
                          {t("atLeastOneMilestone")}
                        </p>
                      </div>
                      {roadmapItems.length === 0 && (
                        <button
                          onClick={() =>
                            router.push(
                              `/${params.locale}/projects/${project.id}/roadmap`,
                            )
                          }
                          className="btn-brutal bg-white text-xs px-3 py-1"
                        >
                          {t("add")} →
                        </button>
                      )}
                    </div>

                    {/* Category Check (Recommended) */}
                    <div
                      className={`flex items-start gap-3 p-3 border-3 border-black ${project.category ? "bg-blue-50" : "bg-gray-50"}`}
                    >
                      <span className="text-2xl">
                        {project.category ? "✅" : "💡"}
                      </span>
                      <div className="flex-1">
                        <p className="font-bold text-sm">
                          {t("category")}{" "}
                          <span className="text-xs font-normal text-gray-600">
                            ({t("recommended")})
                          </span>
                        </p>
                        <p className="text-xs text-gray-700">
                          {t("improvesVisibility")}
                        </p>
                      </div>
                      {!project.category && (
                        <button
                          onClick={() =>
                            router.push(
                              `/${params.locale}/projects/${project.id}/edit`,
                            )
                          }
                          className="btn-brutal bg-white text-xs px-3 py-1"
                        >
                          {t("add")} →
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() =>
                        router.push(
                          `/${params.locale}/projects/${project.id}/prepare`,
                        )
                      }
                      className="flex-1 btn-brutal bg-white"
                    >
                      📋 {t("viewChecklist")}
                    </button>
                    <button
                      onClick={handlePublish}
                      disabled={
                        publishing ||
                        roadmapItems.length === 0 ||
                        !project.wallet_address
                      }
                      className={`flex-1 btn-brutal ${
                        roadmapItems.length === 0 || !project.wallet_address
                          ? "bg-gray-300 cursor-not-allowed"
                          : "btn-brutal-dark"
                      }`}
                    >
                      {publishing ? t("publishing") : `🚀 ${t("publish")}`}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* About */}
              {project.full_description && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="card-brutal p-6 bg-white"
                >
                  <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 flex items-center gap-2">
                    <span>📖</span> {t("about")}
                  </h2>
                  <p className="text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {project.full_description}
                  </p>
                </motion.div>
              )}

              {/* Roadmap */}
              {roadmapItems.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="card-brutal p-6 bg-white"
                >
                  <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-2">
                    <span>🗺️</span> {t("roadmap")}
                  </h2>
                  <div className="space-y-4">
                    {roadmapItems.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex gap-4"
                      >
                        <div className="flex flex-col items-center">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#FDCB6E] border-2 sm:border-3 border-black flex items-center justify-center font-bold text-base sm:text-lg">
                            {index + 1}
                          </div>
                          {index < roadmapItems.length - 1 && (
                            <div className="w-1 flex-1 bg-black mt-2" />
                          )}
                        </div>
                        <div className="flex-1 pb-6">
                          <div className="p-3 sm:p-4 border-2 sm:border-3 border-black bg-gray-50 hover:bg-[#FDCB6E]/20 transition-colors">
                            <h3 className="font-bold text-base sm:text-lg mb-1">
                              {item.title}
                            </h3>
                            {item.description && (
                              <p className="text-gray-600 text-xs sm:text-sm mb-2">
                                {item.description}
                              </p>
                            )}
                            {item.estimated_cost && (
                              <span className=" badge-brutal badge-brutal-secondary text-xs">
                                <p className="text-[#db9513]">
                                  💰 {item.estimated_cost} XLM
                                </p>
                              </span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Gallery */}
              {galleryImages.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="card-brutal p-6 bg-white"
                >
                  <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 flex items-center gap-2">
                    <span>🖼️</span> {t("gallery")}
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
                    {galleryImages.map((image, index) => (
                      <motion.div
                        key={image.id}
                        whileHover={{ scale: 1.02 }}
                        className="relative aspect-square overflow-hidden border-3 border-black cursor-pointer"
                        onClick={() => {
                          setLightboxIndex(index);
                          setLightboxOpen(true);
                        }}
                      >
                        <img
                          src={image.url}
                          alt={`Gallery ${index + 1}`}
                          className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                        />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Donations Lists */}
              <TopDonors donations={donations} limit={5} />
              <RecentDonations donations={donations} />
            </div>

            {/* Sidebar */}
            <div className="space-y-4 sm:space-y-6 order-1 lg:order-2">
              {/* Funding Progress */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="card-brutal p-4 sm:p-6 bg-white lg:sticky lg:top-24"
              >
                <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 flex items-center gap-2">
                  <span>📊</span> {t("fundingProgress")}
                </h2>

                <div className="mb-3 sm:mb-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-2xl sm:text-3xl font-bold text-[#E67E22]">
                      {currentAmount.toFixed(2)} XLM
                    </span>
                  </div>
                  {totalNeeded > 0 && (
                    <>
                      <div className="h-4 bg-gray-200 border-2 border-black overflow-hidden mb-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(percentage, 100)}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className={`h-full ${percentage >= 100 ? "bg-green-500" : "bg-[#FDCB6E]"}`}
                        />
                      </div>
                      <p className="font-mono text-xs sm:text-sm text-gray-600">
                        {percentage.toFixed(1)}% {t("of")}{" "}
                        {totalNeeded.toFixed(2)} XLM {t("goal")}
                      </p>
                    </>
                  )}
                </div>

                <div className="border-t-2 border-black pt-3 sm:pt-4 mt-3 sm:mt-4">
                  <h3 className="font-bold text-sm sm:text-base mb-2 sm:mb-3">
                    🐝 {t("supportThisProject")}
                  </h3>

                  <WalletConnect />

                  <div className="space-y-3 sm:space-y-4 mt-3 sm:mt-4">
                    <div>
                      <label className="block font-mono text-xs sm:text-sm mb-1.5 sm:mb-2">
                        {tDonations("asset")}
                      </label>
                      <select
                        value={asset}
                        onChange={(e) =>
                          setAsset(e.target.value as "XLM" | "USDC")
                        }
                        className="input-brutal"
                      >
                        <option value="XLM">{t("xlmStellarLumens")}</option>
                        <option value="USDC">{t("usdcCoin")}</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-mono text-xs sm:text-sm mb-1.5 sm:mb-2">
                        {tDonations("amount")} ({asset})
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
                      onClick={handleDonate}
                      disabled={!isConnected || donating || !amount}
                      className={`w-full btn-brutal ${
                        !isConnected || donating || !amount
                          ? "bg-gray-300 cursor-not-allowed shadow-none"
                          : "btn-brutal-primary animate-pulse-glow"
                      }`}
                    >
                      {donating
                        ? tDonations("processing")
                        : `🍯 ${tDonations("donate")} ${amount || "0"} ${asset}`}
                    </motion.button>

                    <p className="text-[10px] sm:text-xs text-gray-500 font-mono text-center">
                      💡 {t("directToWallet")}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        <Lightbox
          open={lightboxOpen}
          close={() => setLightboxOpen(false)}
          index={lightboxIndex === -1 ? 0 : lightboxIndex + 1}
          slides={[
            { src: project.cover_image_url },
            ...galleryImages.map((img) => ({ src: img.url })),
          ]}
        />
      </div>
    </>
  );
}
