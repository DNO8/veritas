"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase/client";
import LoadingBee from "@/components/LoadingBee";
import { useConfirmDialog } from "@/components/ConfirmDialog";
import { useNotification } from "@/components/NotificationToast";

const CATEGORIES = [
  { id: "social", label: "Social", icon: "🤝" },
  { id: "tech", label: "Tecnología", icon: "💻" },
  { id: "education", label: "Educación", icon: "📚" },
  { id: "environment", label: "Ambiente", icon: "🌱" },
  { id: "art", label: "Arte", icon: "🎨" },
  { id: "health", label: "Salud", icon: "🏥" },
];

export default function EditProjectPage() {
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [project, setProject] = useState<any>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [galleryImages, setGalleryImages] = useState<any[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const { showConfirm, ConfirmDialogComponent } = useConfirmDialog();
  const { showNotification, NotificationContainer } = useNotification();
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
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.push(`/${locale}/login`);
          return;
        }

        const res = await fetch(`/api/projects/${params.id}`, {
          credentials: "include",
        });
        const data = await res.json();

        if (data.project.owner_id !== user.id) {
          router.push(`/${locale}/projects/${params.id}`);
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
        router.push(`/${locale}/projects`);
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
      showNotification("¡Imagen agregada a la galería!", "success");
    } catch (error) {
      showNotification(
        `Error al subir imagen: ${error instanceof Error ? error.message : "Error desconocido"}`,
        "error"
      );
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDeleteImage = async (mediaId: string) => {
    const confirmed = await showConfirm(
      "Eliminar imagen",
      "¿Estás seguro de que quieres eliminar esta imagen de la galería?",
      { type: "danger", confirmText: "Eliminar", cancelText: "Cancelar" }
    );
    if (!confirmed) return;

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
      showNotification("¡Imagen eliminada!", "success");
    } catch (error) {
      showNotification(
        `Error al eliminar imagen: ${error instanceof Error ? error.message : "Error desconocido"}`,
        "error"
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

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
        setMessage({ type: "success", text: "¡Proyecto actualizado correctamente!" });
        setTimeout(() => {
          router.push(`/${locale}/projects/${params.id}`);
        }, 1500);
      } else {
        const error = await res.json();
        setMessage({ type: "error", text: error.error || "Error al actualizar" });
      }
    } catch (error) {
      console.error("Error updating project:", error);
      setMessage({ type: "error", text: "Error al actualizar el proyecto" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingBee text="Cargando proyecto..." />;
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white border-4 border-black p-8 shadow-[6px_6px_0px_#000] text-center">
          <p className="text-xl font-bold mb-4">Proyecto no encontrado</p>
          <Link href="/projects" className="btn-brutal btn-brutal-primary">
            Ver Proyectos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {ConfirmDialogComponent}
      {NotificationContainer}
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link
            href={`/projects/${params.id}`}
            className="inline-flex items-center gap-2 text-sm font-bold hover:underline mb-4"
          >
            ← VOLVER AL PROYECTO
          </Link>
          <h1 className="text-4xl font-bold">EDITAR PROYECTO</h1>
          <p className="text-gray-500 mt-2">Actualiza la información de tu proyecto</p>
        </motion.div>

        {/* Message */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 mb-6 border-4 border-black ${
              message.type === "success" ? "bg-green-100" : "bg-red-100"
            }`}
          >
            {message.text}
          </motion.div>
        )}

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* Basic Info Card */}
          <div className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_#000]">
            <h2 className="text-xl font-bold mb-6 pb-4 border-b-4 border-black flex items-center gap-2">
              <span className="w-8 h-8 bg-[#FDCB6E] border-2 border-black flex items-center justify-center text-sm font-bold">
                1
              </span>
              INFORMACIÓN BÁSICA
            </h2>

            {/* Title */}
            <div className="mb-6">
              <label className="block font-bold text-sm mb-2 uppercase">
                Título del Proyecto *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 border-4 border-black focus:outline-none focus:ring-2 focus:ring-[#FDCB6E] text-lg"
                placeholder="Nombre de tu proyecto"
              />
            </div>

            {/* Short Description */}
            <div className="mb-6">
              <label className="block font-bold text-sm mb-2 uppercase">
                Descripción Corta *
              </label>
              <textarea
                required
                value={formData.shortDescription}
                onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 border-4 border-black focus:outline-none focus:ring-2 focus:ring-[#FDCB6E] resize-none"
                placeholder="Describe brevemente tu proyecto (máx. 200 caracteres)"
                maxLength={200}
              />
              <p className="text-xs text-gray-500 mt-1 text-right">
                {formData.shortDescription.length}/200
              </p>
            </div>

            {/* Full Description */}
            <div>
              <label className="block font-bold text-sm mb-2 uppercase">
                Descripción Completa
              </label>
              <textarea
                value={formData.fullDescription}
                onChange={(e) => setFormData({ ...formData, fullDescription: e.target.value })}
                rows={6}
                className="w-full px-4 py-3 border-4 border-black focus:outline-none focus:ring-2 focus:ring-[#FDCB6E] resize-none"
                placeholder="Cuenta la historia completa de tu proyecto, objetivos, impacto esperado..."
              />
            </div>
          </div>

          {/* Category Card */}
          <div className={`bg-white border-4 ${!formData.category ? 'border-blue-500' : 'border-black'} p-6 shadow-[6px_6px_0px_#000]`}>
            <h2 className="text-xl font-bold mb-6 pb-4 border-b-4 border-black flex items-center gap-2">
              <span className="w-8 h-8 bg-primary border-2 border-black flex items-center justify-center text-sm font-bold">
                2
              </span>
              CATEGORÍA
              {!formData.category && <span className="text-blue-600 text-sm ml-auto">💡 Recomendado</span>}
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, category: cat.id })}
                  className={`p-4 border-4 border-black font-bold text-sm transition-all flex items-center gap-2 ${
                    formData.category === cat.id
                      ? "bg-[#FDCB6E] shadow-[4px_4px_0px_#000]"
                      : "bg-white hover:bg-gray-100"
                  }`}
                >
                  <span className="text-xl">{cat.icon}</span>
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Funding Card */}
          <div className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_#000]">
            <h2 className="text-xl font-bold mb-6 pb-4 border-b-4 border-black flex items-center gap-2">
              <span className="w-8 h-8 bg-[#FDCB6E] border-2 border-black flex items-center justify-center text-sm font-bold">
                3
              </span>
              FINANCIAMIENTO
            </h2>

            {/* Goal Amount */}
            <div className="mb-6">
              <label className="block font-bold text-sm mb-2 uppercase">
                Meta de Recaudación
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">
                  $
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.goalAmount}
                  onChange={(e) => setFormData({ ...formData, goalAmount: e.target.value })}
                  className="w-full pl-10 pr-20 py-3 border-4 border-black focus:outline-none focus:ring-2 focus:ring-[#FDCB6E] text-lg"
                  placeholder="1000"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-mono text-sm">
                  USDC/XLM
                </span>
              </div>
            </div>

            {/* Wallet Address */}
            <div className={`p-4 border-4 ${!formData.walletAddress ? 'border-red-500 bg-red-50' : 'border-black bg-white'}`}>
              <label className="flex items-center gap-2 font-bold text-sm mb-2 uppercase">
                <span>Wallet Stellar</span>
                {!formData.walletAddress && <span className="text-red-600 text-xs">⚠️ OBLIGATORIO PARA PUBLICAR</span>}
              </label>
              <input
                type="text"
                value={formData.walletAddress}
                onChange={(e) => setFormData({ ...formData, walletAddress: e.target.value })}
                className={`w-full px-4 py-3 border-4 ${!formData.walletAddress ? 'border-red-500' : 'border-black'} focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm`}
                placeholder="GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
              />
              <p className={`text-xs mt-2 ${!formData.walletAddress ? 'text-red-700 font-bold' : 'text-gray-500'}`}>
                {!formData.walletAddress ? '⚠️ Sin wallet no puedes recibir donaciones ni publicar tu proyecto' : '✓ Wallet configurada correctamente'}
              </p>
            </div>
          </div>

          {/* Current Cover Image */}
          {project.cover_image_url && (
            <div className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_#000]">
              <h2 className="text-xl font-bold mb-4 pb-4 border-b-4 border-black">
                IMAGEN DE PORTADA ACTUAL
              </h2>
              <img
                src={project.cover_image_url}
                alt={project.title}
                className="w-full h-48 object-cover border-4 border-black"
              />
              <p className="text-xs text-gray-500 mt-2">
                Para cambiar la imagen de portada, ve a la página de crear proyecto
              </p>
            </div>
          )}

          {/* Gallery Section */}
          <div className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_#000]">
            <h2 className="text-xl font-bold mb-6 pb-4 border-b-4 border-black flex items-center gap-2">
              <span className="w-8 h-8 bg-primary border-2 border-black flex items-center justify-center text-sm font-bold">
                4
              </span>
              GALERÍA DEL PROYECTO
            </h2>

            {/* Upload Button */}
            <div className="mb-6">
              <label className="block font-bold text-sm mb-2 uppercase">
                Agregar Imágenes a la Galería
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploadingImage}
                className="hidden"
                id="gallery-upload"
              />
              <label
                htmlFor="gallery-upload"
                className={`block w-full py-3 px-4 border-4 border-black text-center font-bold cursor-pointer transition-colors ${
                  uploadingImage
                    ? "bg-gray-200 cursor-not-allowed"
                    : "bg-white hover:bg-gray-100"
                }`}
              >
                {uploadingImage ? "📤 Subiendo..." : "📷 Subir Imagen"}
              </label>
              <p className="text-xs text-gray-500 mt-2">
                Las imágenes de la galería ayudan a mostrar tu proyecto en acción
              </p>
            </div>

            {/* Gallery Grid */}
            {galleryImages.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {galleryImages.map((img) => (
                  <div key={img.id} className="relative group">
                    <img
                      src={img.url}
                      alt="Gallery"
                      className="w-full h-32 object-cover border-4 border-black"
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteImage(img.id)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 border-2 border-black opacity-0 group-hover:opacity-100 transition-opacity font-bold text-xs"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 border-4 border-dashed border-gray-300">
                <p className="text-gray-500 text-sm">
                  📸 No hay imágenes en la galería aún
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={saving}
              className="flex-1 py-4 bg-[#FDCB6E] border-4 border-black font-bold text-lg shadow-[6px_6px_0px_#000] hover:shadow-[8px_8px_0px_#000] transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    🐝
                  </motion.span>
                  GUARDANDO...
                </span>
              ) : (
                "💾 GUARDAR CAMBIOS"
              )}
            </motion.button>

            <Link
              href={`/projects/${params.id}`}
              className="flex-1 py-4 bg-white border-4 border-black font-bold text-lg text-center shadow-[6px_6px_0px_#000] hover:bg-gray-100 transition-colors"
            >
              CANCELAR
            </Link>
          </div>

          {/* Danger Zone */}
          <div className="bg-white border-4 border-red-500 p-6 shadow-[6px_6px_0px_#ef4444]">
            <h2 className="text-xl font-bold mb-4 text-red-600">
              ⚠️ ZONA DE PELIGRO
            </h2>
            <p className="text-gray-600 text-sm mb-4">
              Estas acciones son irreversibles. Procede con precaución.
            </p>
            <button
              type="button"
              onClick={async () => {
                const confirmed = await showConfirm(
                  "Eliminar proyecto",
                  "¿Estás seguro de que deseas eliminar este proyecto? Esta acción no se puede deshacer.",
                  { type: "danger", confirmText: "Eliminar", cancelText: "Cancelar" }
                );
                if (confirmed) {
                  showNotification("Funcionalidad no implementada en el MVP", "info");
                }
              }}
              className="px-4 py-2 border-2 border-red-500 text-red-600 font-bold text-sm hover:bg-red-50 transition-colors"
            >
              ELIMINAR PROYECTO
            </button>
          </div>
        </motion.form>
      </div>
    </div>
    </>
  );
}
