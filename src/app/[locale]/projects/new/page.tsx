"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import Link from "next/link";
import { useNotification } from "@/components/NotificationToast";

export default function NewProjectPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
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
  const { showNotification, NotificationContainer } = useNotification();
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
        router.push(`/${locale}/login`);
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
      showNotification("Por favor completa el título y descripción corta primero", "warning");
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
      showNotification("¡Portada generada exitosamente!", "success");
    } catch (error) {
      showNotification(
        error instanceof Error
          ? error.message
          : "Error al generar portada",
        "error"
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
      showNotification("Debes iniciar sesión para crear un proyecto", "warning");
      router.push(`/${locale}/login`);
      return;
    }

    if (!coverImage && !generatedCoverUrl) {
      showNotification("Por favor selecciona o genera una imagen de portada", "warning");
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
        showNotification("¡Proyecto creado exitosamente!", "success");
        router.push(`/${locale}/projects/${data.project.id}/prepare`);
      } else {
        const error = await res.json();
        showNotification(`Error: ${error.error}`, "error");
      }
    } catch (error) {
      showNotification(
        error instanceof Error ? error.message : "Error al crear proyecto",
        "error"
      );
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  return (
    <>
      {NotificationContainer}
      <div className="min-h-screen hex-pattern py-8">
      {/* Header */}
      <div className="bg-[#FDCB6E] border-b-4 border-black py-8 mb-8">
        <div className="max-w-3xl mx-auto px-4">
          <Link href={`/${locale}/projects`} className="inline-flex items-center gap-2 font-mono text-sm mb-4 hover:underline">
            ← Volver a proyectos
          </Link>
          <h1 className="text-4xl font-bold">🐝 Crear Nuevo Proyecto</h1>
          <p className="text-black/70 mt-2">Comparte tu idea con la colmena</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4">
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* Basic Info Card */}
          <div className="card-brutal p-6 bg-white">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span>📝</span> Información Básica
            </h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block font-bold mb-2">
                  Título del proyecto *
                </label>
                <input
                  id="title"
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input-brutal"
                  placeholder="Ej: Huerto Comunitario Solar"
                />
              </div>

              <div>
                <label htmlFor="shortDescription" className="block font-bold mb-2">
                  Descripción corta *
                </label>
                <textarea
                  id="shortDescription"
                  required
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  rows={2}
                  className="input-brutal resize-none"
                  placeholder="Una frase que capture la esencia de tu proyecto"
                />
                <p className="mt-1 font-mono text-xs text-gray-500">
                  {formData.shortDescription.length}/150 caracteres recomendados
                </p>
              </div>

              <div>
                <label htmlFor="fullDescription" className="block font-bold mb-2">
                  Descripción completa
                </label>
                <textarea
                  id="fullDescription"
                  value={formData.fullDescription}
                  onChange={(e) => setFormData({ ...formData, fullDescription: e.target.value })}
                  rows={5}
                  className="input-brutal resize-none"
                  placeholder="Cuenta la historia de tu proyecto, el problema que resuelve y cómo planeas hacerlo..."
                />
              </div>
            </div>
          </div>

          {/* Cover Image Card */}
          <div className="card-brutal p-6 bg-white">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span>🖼️</span> Imagen de Portada *
            </h2>

            <div className="flex gap-3 mb-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={handleGenerateCover}
                disabled={generating || loading || uploading}
                className={`flex-1 btn-brutal ${generating ? "bg-gray-300 cursor-not-allowed" : "btn-brutal-secondary"}`}
              >
                {generating ? "🎨 Generando..." : "✨ Generar con IA"}
              </motion.button>
              
              <label
                htmlFor="coverImage"
                className="flex-1 btn-brutal btn-brutal-outline text-center cursor-pointer"
              >
                📁 Subir imagen
              </label>
              <input
                id="coverImage"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>

            {coverImagePreview ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative"
              >
                <img
                  src={coverImagePreview}
                  alt="Preview"
                  className="w-full h-64 object-cover border-4 border-black"
                />
                {useGeneratedCover && (
                  <span className="absolute top-3 left-3 badge-brutal badge-brutal-secondary">
                    ✨ Generada con IA
                  </span>
                )}
              </motion.div>
            ) : (
              <div className="h-48 border-4 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                <p className="text-gray-400 font-mono text-sm">
                  Sube o genera una imagen de portada
                </p>
              </div>
            )}
          </div>

          {/* Gallery Card */}
          <div className="card-brutal p-6 bg-white">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span>📸</span> Galería (Opcional)
            </h2>

            <label
              htmlFor="galleryImages"
              className="block w-full p-4 border-3 border-dashed border-gray-300 text-center cursor-pointer hover:border-[#FDCB6E] hover:bg-[#FDCB6E]/10 transition-colors"
            >
              <span className="text-2xl block mb-2">+</span>
              <span className="font-mono text-sm text-gray-600">Agregar imágenes a la galería</span>
            </label>
            <input
              id="galleryImages"
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleGalleryImagesChange}
              className="hidden"
            />

            {galleryPreviews.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mt-4">
                {galleryPreviews.map((preview, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative aspect-square"
                  >
                    <img
                      src={preview}
                      alt={`Gallery ${index + 1}`}
                      className="w-full h-full object-cover border-3 border-black"
                    />
                    <button
                      type="button"
                      onClick={() => removeGalleryImage(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white border-2 border-black font-bold text-sm hover:bg-red-600"
                    >
                      ×
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Goal Card */}
          <div className="card-brutal p-6 bg-white">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span>🎯</span> Meta de Financiamiento
            </h2>

            <div>
              <label htmlFor="goalAmount" className="block font-bold mb-2">
                Meta en XLM (opcional)
              </label>
              <div className="relative">
                <input
                  id="goalAmount"
                  type="number"
                  value={formData.goalAmount}
                  onChange={(e) => setFormData({ ...formData, goalAmount: e.target.value })}
                  placeholder="1000"
                  className="input-brutal pr-16"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 font-mono font-bold text-gray-500">
                  XLM
                </span>
              </div>
              <p className="mt-2 font-mono text-xs text-gray-500">
                💡 Puedes definir metas específicas en el Roadmap después de crear el proyecto
              </p>
            </div>
          </div>

          {/* Submit */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading || uploading || generating}
            className={`w-full btn-brutal text-lg py-4 ${
              loading || uploading || generating
                ? "bg-gray-300 cursor-not-allowed shadow-none"
                : "btn-brutal-primary animate-pulse-glow"
            }`}
          >
            {generating
              ? "🎨 Generando portada..."
              : uploading
                ? "📤 Subiendo imágenes..."
                : loading
                  ? "🐝 Creando proyecto..."
                  : "🍯 Crear Proyecto"}
          </motion.button>

          <p className="text-center font-mono text-xs text-gray-500">
            El proyecto se creará en modo borrador. Podrás editarlo y publicarlo después.
          </p>
        </motion.form>
      </div>
    </div>
    </>
  );
}
