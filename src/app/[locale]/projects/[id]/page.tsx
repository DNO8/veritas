"use client";

import { useState, useEffect } from "react";
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
import BenefitSelector from "@/components/project/BenefitSelector";
import BenefitReceivedModal from "@/components/project/BenefitReceivedModal";
import { buildMultipleTrustlinesTransaction, hasTrustline } from "@/lib/stellar/trustline";
import * as StellarSdk from '@stellar/stellar-sdk';

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
  const [benefits, setBenefits] = useState<any[]>([]);
  const [loadingBenefits, setLoadingBenefits] = useState(true);
  const [userHoldings, setUserHoldings] = useState<Set<string>>(new Set());
  const [showBenefitSelector, setShowBenefitSelector] = useState(false);
  const [selectedBenefitIds, setSelectedBenefitIds] = useState<string[]>([]);
  const [showBenefitReceived, setShowBenefitReceived] = useState(false);
  const [receivedBenefits, setReceivedBenefits] = useState<any[]>([]);
  const [donationTxHash, setDonationTxHash] = useState("");
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

  // Load benefits
  useEffect(() => {
    const loadBenefits = async () => {
      if (!params.id) return;
      
      try {
        const response = await fetch(`/api/benefits?projectId=${params.id}`);
        const data = await response.json();
        
        if (data.benefits) {
          setBenefits(data.benefits.filter((b: any) => b.is_active));
        }
      } catch (error) {
        
      } finally {
        setLoadingBenefits(false);
      }
    };

    loadBenefits();
  }, [params.id]);

  // Load user holdings
  useEffect(() => {
    const loadUserHoldings = async () => {
      if (!publicKey || !params.id) return;

      try {
        const response = await fetch(`/api/user/benefits?wallet=${publicKey}&projectId=${params.id}`);
        const data = await response.json();

        if (data.holdings) {
          const benefitIds = new Set<string>(data.holdings.map((h: any) => h.benefit_id as string));
          setUserHoldings(benefitIds);
        }
      } catch (error) {
        
      }
    };

    loadUserHoldings();
  }, [publicKey, params.id]);

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

  const handleDonateClick = () => {
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

    // Show benefit selector first
    setShowBenefitSelector(true);
  };

  const handleBenefitsSelected = (benefitIds: string[]) => {
    setSelectedBenefitIds(benefitIds);
    setShowBenefitSelector(false);
    // Proceed with donation
    processDonation(benefitIds);
  };

  const processDonation = async (benefitIds: string[]) => {
    if (!project || !publicKey) return;
    
    setDonating(true);

    try {
      const networkEnv = process.env.NEXT_PUBLIC_STELLAR_NETWORK || "testnet";
      const stellarNetwork = networkEnv.toUpperCase() as "TESTNET" | "MAINNET";
      const networkPassphrase = networkEnv === "testnet" 
        ? StellarSdk.Networks.TESTNET 
        : StellarSdk.Networks.PUBLIC;

      // Step 1: Check and create trustlines for selected benefits
      if (benefitIds.length > 0) {
        const trustlinesToCreate: Array<{ assetCode: string; issuerPublicKey: string }> = [];
        
        // Get issuer account for the project
        const issuerResponse = await fetch(`/api/projects/${project.id}/issuer`);
        if (!issuerResponse.ok) {
          throw new Error("Failed to get issuer account");
        }
        const { issuerPublicKey } = await issuerResponse.json();
        
        // Check which trustlines are needed
        for (const benefitId of benefitIds) {
          const benefit = benefits.find(b => b.id === benefitId);
          if (!benefit) continue;

          const hasTrust = await hasTrustline(publicKey, benefit.asset_code, issuerPublicKey);
          
          if (!hasTrust) {
            trustlinesToCreate.push({
              assetCode: benefit.asset_code,
              issuerPublicKey: issuerPublicKey,
            });
          }
        }

        // Create trustlines if needed
        if (trustlinesToCreate.length > 0) {
          showNotification(
            `Necesitas autorizar ${trustlinesToCreate.length} trustline${trustlinesToCreate.length > 1 ? 's' : ''} para recibir beneficios. Por favor firma la transacción en tu wallet.`,
            "info"
          );

          try {
            const trustlineTx = await buildMultipleTrustlinesTransaction(
              publicKey,
              trustlinesToCreate
            );

            const trustlineXdr = trustlineTx.toXDR();
            
            const signedTrustlineXdr = await signTransaction(trustlineXdr, networkPassphrase);

            if (!signedTrustlineXdr) {
              throw new Error("Trustline transaction was cancelled or not signed");
            }

            // Submit signed transaction to Stellar
            const StellarSdk = await import('@stellar/stellar-sdk');
            const server = new StellarSdk.Horizon.Server(
              networkEnv === "testnet"
                ? 'https://horizon-testnet.stellar.org'
                : 'https://horizon.stellar.org'
            );
            
            const signedTx = StellarSdk.TransactionBuilder.fromXDR(
              signedTrustlineXdr,
              networkPassphrase
            );
            
            const result = await server.submitTransaction(signedTx);
            showNotification("Trustlines autorizadas exitosamente. Esperando confirmación en la red...", "success");
            
            // Wait for trustline to be confirmed on Stellar network
            await new Promise(resolve => setTimeout(resolve, 5000));
            
            // Verify trustline was created
            let trustlineConfirmed = false;
            for (let i = 0; i < 3; i++) {
              const hasTrust = await hasTrustline(publicKey, trustlinesToCreate[0].assetCode, trustlinesToCreate[0].issuerPublicKey);
              if (hasTrust) {
                trustlineConfirmed = true;
                break;
              }
              await new Promise(resolve => setTimeout(resolve, 2000));
            }
            
            if (!trustlineConfirmed) {
              // Trustline not confirmed yet, but proceeding anyway
            }
            
            showNotification("Trustline confirmada. Ahora procederemos con la donación.", "success");
            await new Promise(resolve => setTimeout(resolve, 1000));
          } catch (trustlineError) {
            
            throw new Error(`No se pudieron crear las trustlines: ${trustlineError instanceof Error ? trustlineError.message : 'Error desconocido'}`);
          }
        }
      }

      // Step 2: Process donation payment
      const result = await sendPayment(
        {
          sourcePublicKey: publicKey,
          destinationPublicKey: project.wallet_address!,
          amount: amount,
          asset: asset,
          memo: `Donate:${project.id.substring(0, 8)}`,
          network: stellarNetwork,
        },
        signTransaction,
      );

      if (!result.success) {
        throw new Error("Transaction failed on Stellar network");
      }

      const response = await fetch("/api/donations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: project.id,
          donorWallet: publicKey,
          amount,
          asset,
          txHash: result.hash,
          network: stellarNetwork,
          selectedBenefitIds: benefitIds,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to record donation");
      }

      const data = await response.json();
      const benefitsIssued = data.donation?.benefitsIssued || 0;

      // If benefits were issued, show the modal
      if (benefitsIssued > 0 && benefitIds.length > 0) {
        const issuedBenefits = benefits.filter(b => benefitIds.includes(b.id));
        setReceivedBenefits(issuedBenefits);
        setDonationTxHash(result.hash);
        setShowBenefitReceived(true);
      } else {
        showNotification(
          `¡Donación exitosa! ${amount} ${asset}`,
          "success",
        );
        
        // Reload after a short delay
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }

      setAmount("");
      setDonating(false);
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
  const currentAmount = parseFloat(String(project.current_amount || "0"));
  const percentage = totalNeeded > 0 ? (currentAmount / totalNeeded) * 100 : 0;

  return (
    <>
      {NotificationContainer}
      
      {/* Benefit Selector Modal */}
      <AnimatePresence>
        {showBenefitSelector && project && (
          <BenefitSelector
            projectId={project.id}
            donationAmount={parseFloat(amount)}
            donationAsset={asset}
            onSelect={handleBenefitsSelected}
            onCancel={() => setShowBenefitSelector(false)}
          />
        )}
      </AnimatePresence>

      {/* Benefit Received Modal */}
      {showBenefitReceived && (
        <BenefitReceivedModal
          benefits={receivedBenefits}
          txHash={donationTxHash}
          onClose={() => {
            setShowBenefitReceived(false);
            showNotification("¡Beneficios recibidos exitosamente!", "success");
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          }}
        />
      )}

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
                  <button
                    onClick={() =>
                      router.push(`/projects/${project.id}/benefits`)
                    }
                    className="btn-brutal bg-[#FDCB6E] border-4 border-black font-bold shadow-brutal hover:bg-[#E67E22]"
                  >
                    🎁 Gestionar Beneficios
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

              {/* Benefits */}
              {benefits.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="card-brutal p-6 bg-white"
                >
                  <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-2">
                    <span>🎁</span> Beneficios Digitales
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {benefits.map((benefit: any, index: number) => (
                      <motion.div
                        key={benefit.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="border-4 border-black bg-white shadow-brutal overflow-hidden"
                      >
                        {/* Imagen Circular POAP */}
                        {benefit.image_url && (
                          <div className="relative flex items-center justify-center p-6 bg-gray-50">
                            <div 
                              className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-black overflow-hidden bg-white"
                              style={{ boxShadow: '6px 6px 0px #000000' }}
                            >
                              <img
                                src={benefit.image_url}
                                alt={benefit.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            {/* Badge de "Ya lo tienes" */}
                            {userHoldings.has(benefit.id) && (
                              <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 border-2 border-black font-bold text-xs">
                                ✓ LO TIENES
                              </div>
                            )}
                          </div>
                        )}

                        {/* Contenido */}
                        <div className="p-4">
                          <h3 className="font-bold text-base sm:text-lg mb-2">
                            {benefit.title}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-700 mb-3 line-clamp-2">
                            {benefit.description}
                          </p>

                          {/* Stats */}
                          <div className="grid grid-cols-2 gap-2 mb-3">
                            <div className="bg-[#FDCB6E] border-2 border-black p-2">
                              <p className="text-xs font-mono text-gray-700">Min. Donación</p>
                              <p className="font-bold font-mono text-sm">{benefit.minimum_donation} {benefit.donation_currency || 'USDC'}</p>
                            </div>
                            <div className="bg-[#E67E22] border-2 border-black p-2 text-white">
                              <p className="text-xs font-mono">Disponibles</p>
                              <p className="font-bold font-mono text-sm">{benefit.total_supply - benefit.issued_supply}</p>
                            </div>
                          </div>

                          {/* Supply Progress */}
                          <div className="mb-2">
                            <div className="flex justify-between text-xs font-mono mb-1">
                              <span>Emitidos</span>
                              <span>{benefit.issued_supply} / {benefit.total_supply}</span>
                            </div>
                            <div className="w-full h-2 border-2 border-black bg-white">
                              <div
                                className="h-full bg-[#FDCB6E] transition-all"
                                style={{
                                  width: `${(benefit.issued_supply / benefit.total_supply) * 100}%`,
                                }}
                              />
                            </div>
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
                      onClick={handleDonateClick}
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
