"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function NewProjectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string>("");
  const [generatedCoverUrl, setGeneratedCoverUrl] = useState<string>("");
  const [useGeneratedCover, setUseGeneratedCover] = useState(false);
  const [galleryImages, setGalleryImages] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    shortDescription: "",
    fullDescription: "",
    goalAmount: "",
  });

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
      } else {
        setUserId(user.id);
      }
    };
    checkAuth();
  }, [router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImage(file);
      setUseGeneratedCover(false);
      setGeneratedCoverUrl("");
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateCover = async () => {
    if (!formData.title || !formData.shortDescription) {
      alert("Please fill in the title and short description first");
      return;
    }

    setGenerating(true);

    try {
      const response = await fetch("/api/generate-cover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: formData.title,
          shortDescription: formData.shortDescription,
          fullDescription: formData.fullDescription,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate cover");
      }

      const { url } = await response.json();
      setGeneratedCoverUrl(url);
      setCoverImagePreview(url);
      setUseGeneratedCover(true);
      setCoverImage(null);
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Failed to generate cover image",
      );
    } finally {
      setGenerating(false);
    }
  };

  const handleGalleryImagesChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setGalleryImages((prev) => [...prev, ...files]);

      files.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setGalleryPreviews((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeGalleryImage = (index: number) => {
    setGalleryImages((prev) => prev.filter((_, i) => i !== index));
    setGalleryPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId) {
      alert("You must be logged in to create a project");
      router.push("/login");
      return;
    }

    if (!coverImage && !generatedCoverUrl) {
      alert("Please select or generate a cover image");
      return;
    }

    setLoading(true);

    try {
      const tempProjectId = `temp-${Date.now()}`;

      let coverImageUrl: string;

      // Si se usó imagen generada, usar esa URL directamente
      if (useGeneratedCover && generatedCoverUrl) {
        coverImageUrl = generatedCoverUrl;
      } else if (coverImage) {
        // Si se subió una imagen, procesarla
        setUploading(true);
        const uploadFormData = new FormData();
        uploadFormData.append("file", coverImage);
        uploadFormData.append("projectId", tempProjectId);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: uploadFormData,
        });

        if (!uploadRes.ok) {
          const error = await uploadRes.json();
          throw new Error(error.error || "Failed to upload image");
        }

        const uploadData = await uploadRes.json();
        coverImageUrl = uploadData.url;
        setUploading(false);
      } else {
        throw new Error("No cover image available");
      }

      const galleryUrls: string[] = [];
      if (galleryImages.length > 0) {
        for (const galleryImage of galleryImages) {
          const galleryFormData = new FormData();
          galleryFormData.append("file", galleryImage);
          galleryFormData.append("projectId", tempProjectId);

          const galleryUploadRes = await fetch("/api/upload", {
            method: "POST",
            body: galleryFormData,
          });

          if (galleryUploadRes.ok) {
            const { url } = await galleryUploadRes.json();
            galleryUrls.push(url);
          }
        }
      }

      setUploading(false);

      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ownerId: userId,
          title: formData.title,
          shortDescription: formData.shortDescription,
          fullDescription: formData.fullDescription || undefined,
          coverImageUrl,
          goalAmount: formData.goalAmount || undefined,
          generatedCover: useGeneratedCover,
          galleryUrls,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        router.push(`/projects/${data.project.id}`);
      } else {
        const error = await res.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      alert(
        error instanceof Error ? error.message : "Failed to create project",
      );
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <h1>Create New Project</h1>

      <form onSubmit={handleSubmit} style={{ marginTop: "20px" }}>
        <div style={{ marginBottom: "15px" }}>
          <label
            htmlFor="title"
            style={{ display: "block", marginBottom: "5px" }}
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

        <div style={{ marginBottom: "15px" }}>
          <label
            htmlFor="shortDescription"
            style={{ display: "block", marginBottom: "5px" }}
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
            rows={2}
            style={{
              width: "100%",
              padding: "10px",
              fontSize: "16px",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label
            htmlFor="fullDescription"
            style={{ display: "block", marginBottom: "5px" }}
          >
            Full Description
          </label>
          <textarea
            id="fullDescription"
            value={formData.fullDescription}
            onChange={(e) =>
              setFormData({ ...formData, fullDescription: e.target.value })
            }
            rows={5}
            style={{
              width: "100%",
              padding: "10px",
              fontSize: "16px",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label
            htmlFor="coverImage"
            style={{ display: "block", marginBottom: "5px" }}
          >
            Cover Image *
          </label>

          <div style={{ marginBottom: "10px", display: "flex", gap: "10px" }}>
            <button
              type="button"
              onClick={handleGenerateCover}
              disabled={generating || loading || uploading}
              style={{
                flex: 1,
                padding: "10px",
                fontSize: "14px",
                background: generating ? "#ccc" : "#8b5cf6",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: generating ? "not-allowed" : "pointer",
              }}
            >
              {generating ? "🎨 Generating..." : "🎨 Generate with AI"}
            </button>
            <label
              htmlFor="coverImage"
              style={{
                flex: 1,
                padding: "10px",
                fontSize: "14px",
                background: "#0070f3",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                textAlign: "center",
              }}
            >
              📁 Upload Image
            </label>
            <input
              id="coverImage"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleImageChange}
              style={{ display: "none" }}
            />
          </div>

          {coverImagePreview && (
            <div>
              <img
                src={coverImagePreview}
                alt="Preview"
                style={{
                  marginTop: "10px",
                  width: "100%",
                  maxHeight: "300px",
                  objectFit: "cover",
                  borderRadius: "4px",
                }}
              />
              {useGeneratedCover && (
                <p
                  style={{
                    marginTop: "5px",
                    fontSize: "12px",
                    color: "#8b5cf6",
                    fontWeight: "bold",
                  }}
                >
                  ✨ AI Generated Cover
                </p>
              )}
            </div>
          )}
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label
            htmlFor="galleryImages"
            style={{ display: "block", marginBottom: "5px" }}
          >
            Gallery Images (Optional)
          </label>
          <input
            id="galleryImages"
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleGalleryImagesChange}
            style={{
              width: "100%",
              padding: "10px",
              fontSize: "16px",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          />
          {galleryPreviews.length > 0 && (
            <div
              style={{
                marginTop: "10px",
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
                gap: "10px",
              }}
            >
              {galleryPreviews.map((preview, index) => (
                <div key={index} style={{ position: "relative" }}>
                  <img
                    src={preview}
                    alt={`Gallery ${index + 1}`}
                    style={{
                      width: "100%",
                      height: "150px",
                      objectFit: "cover",
                      borderRadius: "4px",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => removeGalleryImage(index)}
                    style={{
                      position: "absolute",
                      top: "5px",
                      right: "5px",
                      background: "red",
                      color: "white",
                      border: "none",
                      borderRadius: "50%",
                      width: "25px",
                      height: "25px",
                      cursor: "pointer",
                      fontSize: "16px",
                      lineHeight: "1",
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label
            htmlFor="goalAmount"
            style={{ display: "block", marginBottom: "5px" }}
          >
            Goal Amount (XLM)
          </label>
          <input
            id="goalAmount"
            type="number"
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

        <button
          type="submit"
          disabled={loading || uploading || generating}
          style={{
            width: "100%",
            padding: "15px",
            fontSize: "18px",
            background: loading || uploading || generating ? "#ccc" : "#0070f3",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor:
              loading || uploading || generating ? "not-allowed" : "pointer",
          }}
        >
          {generating
            ? "Generating cover..."
            : uploading
              ? "Uploading images..."
              : loading
                ? "Creating project..."
                : "Create Project"}
        </button>

        <p style={{ marginTop: "15px", fontSize: "14px", color: "#666" }}>
          Note: This is a demo. In production, you would need to authenticate
          and connect your Stellar wallet.
        </p>
      </form>
    </div>
  );
}
