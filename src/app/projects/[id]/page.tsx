"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { Project } from "@/lib/supabase/types";
import { supabase } from "@/lib/supabase/client";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import WalletConnect from "@/components/WalletConnect";
import { useFreighter } from "@/lib/hooks/useFreighter";
import { sendPayment } from "@/lib/stellar/payment";

interface ProjectMedia {
  id: string;
  url: string;
  type: string;
  order_index: number;
}

interface RoadmapItem {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  estimated_cost: string | null;
  order_index: number;
}

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState("");
  const [asset, setAsset] = useState<"XLM" | "USDC">("XLM");
  const [donating, setDonating] = useState(false);
  const [galleryImages, setGalleryImages] = useState<ProjectMedia[]>([]);
  const [roadmapItems, setRoadmapItems] = useState<RoadmapItem[]>([]);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [publishing, setPublishing] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  const { isConnected, publicKey, signTransaction } = useFreighter();

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        const res = await fetch(`/api/projects/${params.id}`, {
          credentials: "include",
        });
        const data = await res.json();
        setProject(data.project);

        // Verificar ownership
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user && data.project.owner_id === user.id) {
          setIsOwner(true);
        }

        const { data: mediaData } = await supabase
          .from("project_media")
          .select("*")
          .eq("project_id", String(params.id))
          .order("order_index", { ascending: true });

        if (mediaData) {
          setGalleryImages(mediaData as ProjectMedia[]);
        }

        // Cargar roadmap items
        const roadmapRes = await fetch(`/api/projects/${params.id}/roadmap`, {
          credentials: "include",
        });
        if (roadmapRes.ok) {
          const roadmapData = await roadmapRes.json();
          setRoadmapItems(roadmapData.items || []);
        }
      } catch (error) {
        console.error("Error fetching project:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [params.id]);

  const handlePublish = async () => {
    if (!project) return;

    setPublishing(true);
    try {
      const res = await fetch(`/api/projects/${project.id}/publish`, {
        method: "POST",
        credentials: "include",
      });

      if (res.ok) {
        alert("✅ Project published successfully!");
        window.location.reload();
      } else {
        const errorData = await res.json();

        // Mostrar mensaje específico del servidor
        if (errorData.message) {
          alert(`❌ ${errorData.error}\n\n${errorData.message}`);
        } else {
          alert(`❌ Error: ${errorData.error || "Failed to publish project"}`);
        }
      }
    } catch (error) {
      alert("❌ Failed to publish project. Please try again.");
    } finally {
      setPublishing(false);
    }
  };

  const handleDonate = async () => {
    if (!amount || Number(amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    if (!isConnected || !publicKey) {
      alert("Please connect your Freighter wallet first");
      return;
    }

    if (!project?.wallet_address) {
      alert("This project doesn't have a wallet address configured");
      return;
    }

    setDonating(true);

    try {
      // 1. Crear y enviar transacción con Stellar
      const result = await sendPayment(
        {
          sourcePublicKey: publicKey,
          destinationPublicKey: project.wallet_address,
          amount: amount,
          asset: asset,
          memo: `Donation to ${project.title}`,
          network: "TESTNET", // Cambiar a MAINNET en producción
        },
        signTransaction,
      );

      if (!result.success) {
        throw new Error("Transaction failed on Stellar network");
      }

      // 2. Registrar donación en la base de datos
      const donationRes = await fetch("/api/donations", {
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

      if (!donationRes.ok) {
        console.error("Failed to record donation in database");
      }

      // 3. Mostrar éxito
      alert(
        `✅ Donation successful!\n\nAmount: ${amount} ${asset}\nTransaction: ${result.hash.substring(0, 8)}...${result.hash.substring(result.hash.length - 8)}\n\nThank you for supporting this project!`,
      );

      // 4. Recargar proyecto para ver el nuevo amount
      window.location.reload();
    } catch (error) {
      console.error("Donation error:", error);
      alert(
        `❌ Donation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      setDonating(false);
    }
  };

  if (loading) {
    return <div style={{ padding: "20px" }}>Loading...</div>;
  }

  if (!project) {
    return <div style={{ padding: "20px" }}>Project not found</div>;
  }

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <img
        src={project.cover_image_url}
        alt={project.title}
        style={{
          width: "100%",
          height: "300px",
          objectFit: "cover",
          borderRadius: "8px",
        }}
      />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginTop: "20px",
        }}
      >
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: "0 0 10px 0" }}>{project.title}</h1>
          <p style={{ margin: "0 0 10px 0", color: "#666" }}>
            {project.short_description}
          </p>
        </div>

        {isOwner && (
          <div style={{ display: "flex", gap: "10px", marginLeft: "20px" }}>
            <button
              onClick={() => router.push(`/projects/${project.id}/edit`)}
              style={{
                padding: "10px 20px",
                background: "#0070f3",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "500",
                fontSize: "14px",
                whiteSpace: "nowrap",
              }}
            >
              ✏️ Edit Project
            </button>
            <button
              onClick={() => router.push(`/projects/${project.id}/roadmap`)}
              style={{
                padding: "10px 20px",
                background: "#28a745",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "500",
                fontSize: "14px",
                whiteSpace: "nowrap",
              }}
            >
              📋 Manage Roadmap
            </button>
          </div>
        )}
      </div>

      {project.status === "draft" && (
        <div
          style={{
            marginTop: "20px",
            padding: "15px",
            background: "#fff3cd",
            border: "1px solid #ffc107",
            borderRadius: "8px",
          }}
        >
          <p style={{ margin: "0 0 10px 0", fontWeight: "bold" }}>
            ⚠️ This project is in DRAFT mode
          </p>

          {roadmapItems.length === 0 && (
            <p
              style={{
                margin: "0 0 10px 0",
                fontSize: "14px",
                color: "#856404",
              }}
            >
              📋 Add at least one roadmap item before publishing to build trust
              with donors.
            </p>
          )}

          {!project.wallet_address && (
            <p
              style={{
                margin: "0 0 10px 0",
                fontSize: "14px",
                color: "#856404",
              }}
            >
              💳 Add a Stellar wallet address to receive donations before
              publishing.
            </p>
          )}

          <button
            onClick={handlePublish}
            disabled={
              publishing || roadmapItems.length === 0 || !project.wallet_address
            }
            style={{
              padding: "10px 20px",
              background:
                roadmapItems.length === 0 || !project.wallet_address
                  ? "#ccc"
                  : "#28a745",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor:
                publishing ||
                roadmapItems.length === 0 ||
                !project.wallet_address
                  ? "not-allowed"
                  : "pointer",
              fontWeight: "bold",
            }}
          >
            {publishing ? "Publishing..." : "Publish Project"}
          </button>
        </div>
      )}

      {project.full_description && (
        <div style={{ marginTop: "20px" }}>
          <h2>About</h2>
          <p>{project.full_description}</p>
        </div>
      )}

      {roadmapItems.length > 0 && (
        <div style={{ marginTop: "30px" }}>
          <h2>Project Roadmap</h2>
          <div style={{ marginTop: "20px" }}>
            {roadmapItems.map((item, index) => (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  gap: "20px",
                  marginBottom: "30px",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    minWidth: "50px",
                  }}
                >
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      background: "#0070f3",
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: "bold",
                      fontSize: "18px",
                      zIndex: 1,
                    }}
                  >
                    {index + 1}
                  </div>
                  {index < roadmapItems.length - 1 && (
                    <div
                      style={{
                        width: "2px",
                        flex: 1,
                        background: "#ddd",
                        minHeight: "40px",
                      }}
                    />
                  )}
                </div>
                <div
                  style={{
                    flex: 1,
                    padding: "15px",
                    background: "#f9f9f9",
                    borderRadius: "8px",
                    border: "1px solid #e0e0e0",
                  }}
                >
                  <h3 style={{ margin: "0 0 10px 0", fontSize: "18px" }}>
                    {item.title}
                  </h3>
                  {item.description && (
                    <p style={{ margin: "0 0 10px 0", color: "#666" }}>
                      {item.description}
                    </p>
                  )}
                  {item.estimated_cost && (
                    <p
                      style={{
                        margin: 0,
                        color: "#28a745",
                        fontWeight: "500",
                      }}
                    >
                      💰 Estimated Cost: {item.estimated_cost} XLM
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {galleryImages.length > 0 && (
        <div style={{ marginTop: "30px" }}>
          <h2>Gallery</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: "15px",
              marginTop: "15px",
            }}
          >
            {galleryImages.map((image, index) => (
              <img
                key={image.id}
                src={image.url}
                alt={`Gallery ${index + 1}`}
                onClick={() => {
                  setLightboxIndex(index);
                  setLightboxOpen(true);
                }}
                style={{
                  width: "100%",
                  height: "200px",
                  objectFit: "cover",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              />
            ))}
          </div>
        </div>
      )}

      <div
        style={{
          marginTop: "30px",
          padding: "20px",
          background: "#f5f5f5",
          borderRadius: "8px",
        }}
      >
        <h2>Funding Progress</h2>
        {(() => {
          const totalNeeded = roadmapItems.reduce((sum, item) => {
            const cost = parseFloat(item.estimated_cost || "0");
            return sum + cost;
          }, 0);
          const currentAmount = parseFloat(project.current_amount || "0");
          const percentage =
            totalNeeded > 0 ? (currentAmount / totalNeeded) * 100 : 0;

          return (
            <>
              <div style={{ marginBottom: "15px" }}>
                <p style={{ margin: "0 0 10px 0" }}>
                  <strong>Raised:</strong> {currentAmount.toFixed(2)} XLM
                  {totalNeeded > 0 &&
                    ` / ${totalNeeded.toFixed(2)} XLM (${percentage.toFixed(1)}%)`}
                </p>
                {totalNeeded > 0 && (
                  <div
                    style={{
                      width: "100%",
                      height: "20px",
                      background: "#e0e0e0",
                      borderRadius: "10px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${Math.min(percentage, 100)}%`,
                        height: "100%",
                        background: percentage >= 100 ? "#28a745" : "#0070f3",
                        transition: "width 0.3s ease",
                      }}
                    />
                  </div>
                )}
              </div>
              {totalNeeded > 0 && (
                <p
                  style={{
                    margin: "10px 0 0 0",
                    fontSize: "14px",
                    color: "#666",
                  }}
                >
                  💡 Total funding needed based on roadmap:{" "}
                  {totalNeeded.toFixed(2)} XLM
                </p>
              )}
              {project.goal_amount &&
                parseFloat(project.goal_amount) !== totalNeeded && (
                  <p
                    style={{
                      margin: "5px 0 0 0",
                      fontSize: "14px",
                      color: "#666",
                    }}
                  >
                    🎯 Project goal:{" "}
                    {parseFloat(project.goal_amount).toFixed(2)} XLM
                  </p>
                )}
            </>
          );
        })()}
      </div>

      <div
        style={{
          marginTop: "30px",
          padding: "20px",
          border: "2px solid #0070f3",
          borderRadius: "8px",
        }}
      >
        <h2>Support This Project</h2>

        <WalletConnect />

        <div style={{ marginBottom: "15px" }}>
          <label
            htmlFor="donationAsset"
            style={{ display: "block", marginBottom: "5px" }}
          >
            Asset
          </label>
          <select
            id="donationAsset"
            value={asset}
            onChange={(e) => setAsset(e.target.value as "XLM" | "USDC")}
            disabled={!isConnected}
            style={{
              width: "100%",
              padding: "10px",
              fontSize: "16px",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          >
            <option value="XLM">XLM (Stellar Lumens)</option>
            <option value="USDC">USDC (USD Coin)</option>
          </select>
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label
            htmlFor="donationAmount"
            style={{ display: "block", marginBottom: "5px" }}
          >
            Amount ({asset})
          </label>
          <input
            id="donationAmount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="10"
            disabled={!isConnected}
            min="0.0000001"
            step="0.1"
            style={{
              width: "100%",
              padding: "10px",
              fontSize: "16px",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          />
        </div>

        <button
          type="button"
          onClick={handleDonate}
          disabled={!isConnected || donating || !amount}
          style={{
            width: "100%",
            padding: "15px",
            fontSize: "18px",
            background:
              !isConnected || donating || !amount ? "#ccc" : "#0070f3",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor:
              !isConnected || donating || !amount ? "not-allowed" : "pointer",
          }}
        >
          {donating ? "Processing..." : `Donate ${amount || "0"} ${asset}`}
        </button>

        <p style={{ marginTop: "10px", fontSize: "14px", color: "#666" }}>
          💡 Donations are sent directly to the project creator's Stellar
          wallet. No platform fees. Network: Testnet
        </p>
      </div>

      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        index={lightboxIndex}
        slides={galleryImages.map((img) => ({ src: img.url }))}
      />
    </div>
  );
}
