"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase/client";
import { useTranslations } from "next-intl";
import Link from "next/link";
import LoadingBee from "@/components/LoadingBee";

interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  type: "required" | "recommended" | "optional";
  completed: boolean;
  field: string;
}

export default function PreparePublishPage() {
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const t = useTranslations("projects");
  const tCommon = useTranslations("common");
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [project, setProject] = useState<any>(null);
  const [roadmapCount, setRoadmapCount] = useState(0);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);

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
        
        // Fetch roadmap items
        const roadmapRes = await fetch(`/api/projects/${params.id}/roadmap`, {
          credentials: "include",
        });
        let roadmapItemsCount = 0;
        if (roadmapRes.ok) {
          const roadmapData = await roadmapRes.json();
          roadmapItemsCount = roadmapData.roadmap?.length || 0;
          setRoadmapCount(roadmapItemsCount);
        }
        
        buildChecklist(data.project, roadmapItemsCount);
      } catch (error) {
        console.error("Error fetching project:", error);
        router.push(`/${locale}/projects`);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [params.id, router, locale]);

  const buildChecklist = (proj: any, roadmapCount: number) => {
    const items: ChecklistItem[] = [
      {
        id: "title",
        label: "Título del proyecto",
        description: "Un título claro y descriptivo que capture la esencia de tu proyecto",
        type: "required",
        completed: !!proj.title,
        field: "title",
      },
      {
        id: "short_description",
        label: "Descripción corta",
        description: "Resume tu proyecto en una o dos frases impactantes",
        type: "required",
        completed: !!proj.short_description,
        field: "short_description",
      },
      {
        id: "cover_image",
        label: "Imagen de portada",
        description: "Una imagen atractiva que represente visualmente tu proyecto",
        type: "required",
        completed: !!proj.cover_image_url,
        field: "cover_image_url",
      },
      {
        id: "wallet",
        label: "Wallet Stellar",
        description: "Necesaria para recibir donaciones. Sin wallet no puedes publicar.",
        type: "required",
        completed: !!proj.wallet_address,
        field: "wallet_address",
      },
      {
        id: "roadmap",
        label: "Roadmap (al menos 1 hito)",
        description: "Genera confianza mostrando cómo usarás los fondos. Mínimo 1 hito requerido para publicar.",
        type: "required",
        completed: roadmapCount > 0,
        field: "roadmap",
      },
      {
        id: "category",
        label: "Categoría",
        description: "Ayuda a los donantes a encontrar tu proyecto más fácilmente",
        type: "recommended",
        completed: !!proj.category,
        field: "category",
      },
      {
        id: "full_description",
        label: "Descripción completa",
        description: "Cuenta la historia completa: problema, solución, impacto esperado",
        type: "recommended",
        completed: !!proj.full_description && proj.full_description.length > 50,
        field: "full_description",
      },
      {
        id: "goal_amount",
        label: "Meta de recaudación",
        description: "Define cuánto necesitas recaudar para tu proyecto",
        type: "recommended",
        completed: !!proj.goal_amount && parseFloat(proj.goal_amount) > 0,
        field: "goal_amount",
      },
    ];

    setChecklist(items);
  };

  const handlePublish = async () => {
    const requiredItems = checklist.filter((item) => item.type === "required");
    const allRequiredCompleted = requiredItems.every((item) => item.completed);

    if (!allRequiredCompleted) {
      alert(t("completeRequired"));
      return;
    }

    setPublishing(true);

    try {
      const res = await fetch(`/api/projects/${params.id}/publish`, {
        method: "POST",
        credentials: "include",
      });

      if (res.ok) {
        router.push(`/${locale}/projects/${params.id}`);
      } else {
        const error = await res.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to publish project");
    } finally {
      setPublishing(false);
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
          <Link href={`/${locale}/projects`} className="btn-brutal btn-brutal-primary">
            Ver Proyectos
          </Link>
        </div>
      </div>
    );
  }

  const requiredItems = checklist.filter((item) => item.type === "required");
  const recommendedItems = checklist.filter((item) => item.type === "recommended");
  const requiredCompleted = requiredItems.filter((item) => item.completed).length;
  const recommendedCompleted = recommendedItems.filter((item) => item.completed).length;
  const allRequiredDone = requiredCompleted === requiredItems.length;
  const requiredProgress = (requiredCompleted / requiredItems.length) * 100;
  const recommendedProgress = (recommendedCompleted / recommendedItems.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-primary border-4 border-black p-6 shadow-[6px_6px_0px_#000]">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">🐝 {t("prepareToPublish")}</h1>
                <p className="text-black/70">{project.title}</p>
              </div>
              <Link
                href={`/${locale}/projects/${params.id}`}
                className="btn-brutal bg-white text-sm px-4 py-2"
              >
                ← {tCommon("back")}
              </Link>
            </div>

            {/* Status Badge */}
            <div className="inline-flex items-center gap-2 bg-white border-3 border-black px-4 py-2 font-bold">
              {allRequiredDone ? (
                <>
                  <span className="text-green-600">✓</span>
                  <span>{t("readyToPublish")}</span>
                </>
              ) : (
                <>
                  <span className="text-yellow-600">⚠</span>
                  <span>{t("needsAttention")}</span>
                </>
              )}
            </div>
          </div>
        </motion.div>

        {/* Progress Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid md:grid-cols-2 gap-4 mb-8"
        >
          {/* Required Progress */}
          <div className="bg-white border-4 border-black p-6 shadow-[4px_4px_0px_#000]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-lg">{t("required")}</h3>
              <span className="font-mono text-sm">
                {requiredCompleted}/{requiredItems.length}
              </span>
            </div>
            <div className="h-3 bg-gray-200 border-2 border-black">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${requiredProgress}%` }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className={`h-full ${allRequiredDone ? "bg-green-500" : "bg-yellow-500"}`}
              />
            </div>
            <p className="text-xs text-gray-600 mt-2">
              {allRequiredDone ? t("readyToPublish") : t("completeRequired")}
            </p>
          </div>

          {/* Recommended Progress */}
          <div className="bg-white border-4 border-black p-6 shadow-[4px_4px_0px_#000]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-lg">{t("recommended")}</h3>
              <span className="font-mono text-sm">
                {recommendedCompleted}/{recommendedItems.length}
              </span>
            </div>
            <div className="h-3 bg-gray-200 border-2 border-black">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${recommendedProgress}%` }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="h-full bg-blue-500"
              />
            </div>
            <p className="text-xs text-gray-600 mt-2">{t("addRecommended")}</p>
          </div>
        </motion.div>

        {/* Checklist */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4 mb-8"
        >
          {/* Required Items */}
          <div className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_#000]">
            <h2 className="text-xl font-bold mb-4 pb-3 border-b-4 border-black flex items-center gap-2">
              <span className="text-red-600">*</span>
              {t("required")}
            </h2>
            <div className="space-y-3">
              {requiredItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                  className={`p-4 border-3 border-black ${
                    item.completed ? "bg-green-50" : "bg-red-50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-6 h-6 border-2 border-black flex items-center justify-center shrink-0 mt-0.5 ${
                        item.completed ? "bg-green-500" : "bg-white"
                      }`}
                    >
                      {item.completed && <span className="text-white font-bold">✓</span>}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold mb-1">{item.label}</h3>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </div>
                    {!item.completed && (
                      <Link
                        href={
                          item.id === "roadmap"
                            ? `/${locale}/projects/${params.id}/roadmap`
                            : `/${locale}/projects/${params.id}/edit`
                        }
                        className="btn-brutal bg-white text-xs px-3 py-1 shrink-0"
                      >
                        Completar →
                      </Link>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Recommended Items */}
          <div className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_#000]">
            <h2 className="text-xl font-bold mb-4 pb-3 border-b-4 border-black flex items-center gap-2">
              <span className="text-blue-600">💡</span>
              {t("recommended")}
            </h2>
            <div className="space-y-3">
              {recommendedItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                  className={`p-4 border-3 border-black ${
                    item.completed ? "bg-blue-50" : "bg-gray-50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-6 h-6 border-2 border-black flex items-center justify-center shrink-0 mt-0.5 ${
                        item.completed ? "bg-blue-500" : "bg-white"
                      }`}
                    >
                      {item.completed && <span className="text-white font-bold">✓</span>}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold mb-1">{item.label}</h3>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Link
            href={`/${locale}/projects/${params.id}/edit`}
            className="flex-1 btn-brutal bg-white text-center py-4 text-lg"
          >
            ✏️ {t("editProject")}
          </Link>
          <motion.button
            whileHover={allRequiredDone ? { scale: 1.02 } : {}}
            whileTap={allRequiredDone ? { scale: 0.98 } : {}}
            onClick={handlePublish}
            disabled={!allRequiredDone || publishing}
            className={`flex-1 btn-brutal text-lg py-4 ${
              !allRequiredDone || publishing
                ? "bg-gray-300 cursor-not-allowed"
                : "btn-brutal-primary"
            }`}
          >
            {publishing ? "🐝 Publicando..." : `🚀 ${t("publishNow")}`}
          </motion.button>
        </motion.div>

        {!allRequiredDone && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center text-sm text-gray-600 mt-4"
          >
            ⚠️ Completa todos los campos obligatorios para poder publicar tu proyecto
          </motion.p>
        )}
      </div>
    </div>
  );
}
