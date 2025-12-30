"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import type { Project } from "@/lib/supabase/types";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import LoadingBee from "@/components/LoadingBee";
import { useNotification } from "@/components/NotificationToast";
import { useConfirmDialog } from "@/components/ConfirmDialog";

export default function MyProjectsPage() {
  const t = useTranslations("projects");
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const { showNotification, NotificationContainer } = useNotification();
  const { showConfirm, ConfirmDialogComponent } = useConfirmDialog();

  useEffect(() => {
    const fetchUserProjects = async () => {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setUserId(user.id);

      const { data, error: fetchError } = await supabase
        .from("projects")
        .select("*")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false });

      if (fetchError) {
        
      } else {
        setProjects((data as Project[]) || []);
      }

      setLoading(false);
    };

    fetchUserProjects();
  }, [router]);

  const handlePublish = async (projectId: string) => {
    try {
      const res = await fetch(`/api/projects/${projectId}/publish`, {
        method: "POST",
        credentials: "include",
      });

      if (res.ok) {
        setProjects((prev) =>
          prev.map((p) =>
            p.id === projectId ? { ...p, status: "published" } : p,
          ),
        );
        showNotification(t("publishSuccess"), "success");
      } else {
        const errorData = await res.json();
        if (errorData.message) {
          showNotification(`${errorData.error}: ${errorData.message}`, "error");
        } else {
          showNotification(`Error: ${errorData.error || t("publishError")}`, "error");
        }
      }
    } catch (error) {
      showNotification(t("publishError"), "error");
    }
  };

  const handleUnpublish = async (projectId: string) => {
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: "draft" }),
      });

      if (res.ok) {
        setProjects((prev) =>
          prev.map((p) => (p.id === projectId ? { ...p, status: "draft" } : p)),
        );
        showNotification(t("unpublishSuccess"), "success");
      } else {
        const errorData = await res.json();
        showNotification(`Error: ${errorData.error || t("unpublishError")}`, "error");
      }
    } catch (error) {
      showNotification(t("unpublishError"), "error");
    }
  };

  const handleDelete = async (projectId: string) => {
    const confirmed = await showConfirm(
      "Eliminar proyecto",
      "¿Estás seguro de que quieres eliminar este proyecto? Esta acción no se puede deshacer y se eliminarán todos los datos asociados (galería, roadmap, donaciones).",
      {
        confirmText: "Eliminar",
        cancelText: "Cancelar",
        type: "danger",
      }
    );

    if (!confirmed) {
      return;
    }

    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        setProjects((prev) => prev.filter((p) => p.id !== projectId));
        showNotification("Proyecto eliminado exitosamente", "success");
      } else {
        const errorData = await res.json();
        showNotification(`Error: ${errorData.error || "Error al eliminar proyecto"}`, "error");
      }
    } catch (error) {
      showNotification("Error al eliminar proyecto", "error");
    }
  };

  if (loading) {
    return <LoadingBee text="Cargando proyectos..." />;
  }

  return (
    <>
      {NotificationContainer}
      {ConfirmDialogComponent}
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2">{t("myProjects")}</h1>
          <p className="text-gray-500">{t("manageProjects")}</p>
        </motion.div>

        {/* Create Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Link
            href="/projects/new"
            className="inline-block px-6 py-3 bg-[#FDCB6E] border-4 border-black font-bold shadow-[6px_6px_0px_#000] hover:shadow-[8px_8px_0px_#000] transition-shadow"
          >
            + {t("createNewProject")}
          </Link>
        </motion.div>

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border-4 border-black p-12 shadow-[6px_6px_0px_#000] text-center"
          >
            <div className="text-6xl mb-4">📁</div>
            <h2 className="text-2xl font-bold mb-2">Sin proyectos</h2>
            <p className="text-gray-500 mb-6">{t("noProjectsYet")}</p>
            <Link
              href="/projects/new"
              className="inline-block px-6 py-3 bg-[#FDCB6E] border-4 border-black font-bold"
            >
              Crear mi primer proyecto
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-white border-4 border-black shadow-[6px_6px_0px_#000] overflow-hidden ${
                  project.status === "draft" ? "border-dashed" : ""
                }`}
              >
                {/* Cover Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={project.cover_image_url}
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3">
                    <span
                      className={`px-3 py-1 text-xs font-bold border-2 border-black ${
                        project.status === "published"
                          ? "bg-green-300"
                          : project.status === "draft"
                            ? "bg-[#FDCB6E]"
                            : "bg-red-300"
                      }`}
                    >
                      {project.status === "published"
                        ? "PUBLICADO"
                        : project.status === "draft"
                          ? "BORRADOR"
                          : "PAUSADO"}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h2 className="text-xl font-bold mb-2 line-clamp-1">
                    {project.title}
                  </h2>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {project.short_description}
                  </p>

                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-bold text-[#E67E22]">
                        ${project.current_amount || 0}
                      </span>
                      {project.goal_amount && (
                        <span className="text-gray-500">
                          de ${project.goal_amount}
                        </span>
                      )}
                    </div>
                    {project.goal_amount && (
                      <div className="h-2 bg-gray-200 border-2 border-black">
                        <div
                          className="h-full bg-[#FDCB6E]"
                          style={{
                            width: `${Math.min(
                              ((Number(project.current_amount) || 0) /
                                Number(project.goal_amount)) *
                                100,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 flex-wrap">
                    <Link
                      href={`/projects/${project.id}`}
                      className="flex-1 py-2 px-3 bg-black text-white text-center text-sm font-bold border-2 border-black hover:bg-gray-800"
                    >
                      VER
                    </Link>
                    <Link
                      href={`/projects/${project.id}/edit`}
                      className="py-2 px-3 bg-white text-sm font-bold border-2 border-black hover:bg-gray-100"
                    >
                      ✏️
                    </Link>
                    {project.status === "draft" ? (
                      <button
                        onClick={() => handlePublish(project.id)}
                        className="py-2 px-3 bg-green-400 text-sm font-bold border-2 border-black hover:bg-green-500"
                      >
                        PUBLICAR
                      </button>
                    ) : project.status === "published" ? (
                      <button
                        onClick={() => handleUnpublish(project.id)}
                        className="py-2 px-3 bg-[#FDCB6E] text-sm font-bold border-2 border-black hover:bg-[#E67E22]"
                      >
                        PAUSAR
                      </button>
                    ) : null}
                    <button
                      onClick={() => handleDelete(project.id)}
                      className="py-2 px-3 bg-red-500 text-white text-sm font-bold border-2 border-black hover:bg-red-600"
                      title="Eliminar proyecto"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
    </>
  );
}
