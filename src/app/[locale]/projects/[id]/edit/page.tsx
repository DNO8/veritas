"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function EditProjectPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [project, setProject] = useState<any>(null);
  const [galleryImages, setGalleryImages] = useState<any[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    shortDescription: "",
    fullDescription: "",
    category: "",
    goalAmount: "",
    walletAddress: "",
  });

  useEffect(() => {
    const fetchProject = async () => {
      try {
        // Verificar autenticación
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.push("/login");
          return;
        }

        // Obtener proyecto
        const res = await fetch(`/api/projects/${params.id}`, {
          credentials: "include",
        });
        const data = await res.json();

        // Verificar ownership
        if (data.project.owner_id !== user.id) {
          alert("You don't have permission to edit this project");
          router.push(`/projects/${params.id}`);
          return;
        }

        setProject(data.project);
        setFormData({
          title: data.project.title || "",
          shortDescription: data.project.short_description || "",
          fullDescription: data.project.full_description || "",
          category: data.project.category || "",
          goalAmount: data.project.goal_amount || "",
          walletAddress: data.project.wallet_address || "",
        });

        // Fetch gallery images
        const mediaRes = await fetch(`/api/projects/${params.id}/media`, {
          credentials: "include",
        });
        if (mediaRes.ok) {
          const mediaData = await mediaRes.json();
          setGalleryImages(mediaData.media || []);
        }
      } catch (error) {
        console.error("Error fetching project:", error);
        alert("Failed to load project");
        router.push("/projects");
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [params.id, router]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("projectId", String(params.id));

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        throw new Error("Failed to upload image");
      }

      const { url } = await uploadRes.json();

      const mediaRes = await fetch(`/api/projects/${params.id}/media`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ url, type: "image" }),
      });

      if (!mediaRes.ok) {
        throw new Error("Failed to add image to gallery");
      }

      const { media } = await mediaRes.json();
      setGalleryImages([...galleryImages, media]);
      alert("✅ Image added to gallery!");
    } catch (error) {
      alert(
        `❌ Failed to upload image: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDeleteImage = async (mediaId: string) => {
    if (!confirm("Are you sure you want to delete this image?")) return;

    try {
      const res = await fetch(
        `/api/projects/${params.id}/media?mediaId=${mediaId}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      if (!res.ok) {
        throw new Error("Failed to delete image");
      }

      setGalleryImages(galleryImages.filter((img) => img.id !== mediaId));
      alert("✅ Image deleted!");
    } catch (error) {
      alert(
        `❌ Failed to delete image: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch(`/api/projects/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: formData.title,
          short_description: formData.shortDescription,
          full_description: formData.fullDescription,
          category: formData.category,
          goal_amount: formData.goalAmount
            ? parseFloat(formData.goalAmount)
            : null,
          wallet_address: formData.walletAddress || null,
        }),
      });

      if (res.ok) {
        alert("Project updated successfully!");
        router.push(`/projects/${params.id}`);
      } else {
        const error = await res.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error("Error updating project:", error);
      alert("Failed to update project");
    } finally {
      setSaving(false);
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
      <div style={{ marginBottom: "30px" }}>
        <button
          onClick={() => router.push(`/projects/${params.id}`)}
          style={{
            padding: "8px 16px",
            background: "#f0f0f0",
            border: "1px solid #ddd",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          ← Back to Project
        </button>
      </div>

      <h1>Edit Project</h1>
      <p style={{ color: "#666", marginBottom: "30px" }}>
        Update your project information
      </p>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "20px" }}>
          <label
            htmlFor="title"
            style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}
          >
            Title *
          </label>
          <input
            id="title"
            type="text"
            required
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            style={{
              width: "100%",
              padding: "10px",
              fontSize: "16px",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label
            htmlFor="shortDescription"
            style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}
          >
            Short Description *
          </label>
          <textarea
            id="shortDescription"
            required
            value={formData.shortDescription}
            onChange={(e) =>
              setFormData({ ...formData, shortDescription: e.target.value })
            }
            rows={3}
            style={{
              width: "100%",
              padding: "10px",
              fontSize: "16px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              fontFamily: "inherit",
            }}
          />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label
            htmlFor="fullDescription"
            style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}
          >
            Full Description
          </label>
          <textarea
            id="fullDescription"
            value={formData.fullDescription}
            onChange={(e) =>
              setFormData({ ...formData, fullDescription: e.target.value })
            }
            rows={6}
            style={{
              width: "100%",
              padding: "10px",
              fontSize: "16px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              fontFamily: "inherit",
            }}
          />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label
            htmlFor="category"
            style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}
          >
            Category
          </label>
          <input
            id="category"
            type="text"
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
            placeholder="e.g., Technology, Education, Health"
            style={{
              width: "100%",
              padding: "10px",
              fontSize: "16px",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label
            htmlFor="goalAmount"
            style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}
          >
            Goal Amount (XLM)
          </label>
          <input
            id="goalAmount"
            type="number"
            step="0.01"
            min="0"
            value={formData.goalAmount}
            onChange={(e) =>
              setFormData({ ...formData, goalAmount: e.target.value })
            }
            placeholder="1000"
            style={{
              width: "100%",
              padding: "10px",
              fontSize: "16px",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          />
        </div>

        <div style={{ marginBottom: "30px" }}>
          <label
            htmlFor="walletAddress"
            style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}
          >
            Stellar Wallet Address
          </label>
          <input
            id="walletAddress"
            type="text"
            value={formData.walletAddress}
            onChange={(e) =>
              setFormData({ ...formData, walletAddress: e.target.value })
            }
            placeholder="GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
            style={{
              width: "100%",
              padding: "10px",
              fontSize: "16px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              fontFamily: "monospace",
            }}
          />
          <p style={{ fontSize: "12px", color: "#666", marginTop: "5px" }}>
            Required to receive donations and publish your project
          </p>
        </div>

        <div style={{ marginBottom: "30px" }}>
          <h2 style={{ marginBottom: "15px" }}>Gallery Images</h2>
          <p style={{ fontSize: "14px", color: "#666", marginBottom: "15px" }}>
            Add images to showcase your project. These will appear in the
            gallery section.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
              gap: "15px",
              marginBottom: "15px",
            }}
          >
            {galleryImages.map((image) => (
              <div
                key={image.id}
                style={{
                  position: "relative",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  overflow: "hidden",
                }}
              >
                <img
                  src={image.url}
                  alt="Gallery"
                  style={{
                    width: "100%",
                    height: "150px",
                    objectFit: "cover",
                  }}
                />
                <button
                  type="button"
                  onClick={() => handleDeleteImage(image.id)}
                  style={{
                    position: "absolute",
                    top: "5px",
                    right: "5px",
                    background: "rgba(255, 0, 0, 0.8)",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    padding: "5px 10px",
                    cursor: "pointer",
                    fontSize: "12px",
                    fontWeight: "bold",
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <div>
            <label
              htmlFor="galleryUpload"
              style={{
                display: "inline-block",
                padding: "10px 20px",
                background: uploadingImage ? "#ccc" : "#28a745",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: uploadingImage ? "not-allowed" : "pointer",
                fontWeight: "500",
                fontSize: "14px",
              }}
            >
              {uploadingImage ? "Uploading..." : "📷 Add Image to Gallery"}
            </label>
            <input
              id="galleryUpload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploadingImage}
              style={{ display: "none" }}
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            type="submit"
            disabled={saving}
            style={{
              padding: "12px 24px",
              background: saving ? "#ccc" : "#0070f3",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: saving ? "not-allowed" : "pointer",
              fontWeight: "500",
              fontSize: "16px",
            }}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
          <button
            type="button"
            onClick={() => router.push(`/projects/${params.id}`)}
            style={{
              padding: "12px 24px",
              background: "white",
              color: "#666",
              border: "1px solid #ddd",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "500",
              fontSize: "16px",
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
