"use client";

import { useState, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import type { Project } from "@/lib/supabase/types";
import { useTranslations } from "next-intl";

// Predefined height variations for masonry effect
const HEIGHT_VARIANTS = [220, 280, 320, 380, 260, 340, 200, 300];

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const t = useTranslations("projects");
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const [showOverlay, setShowOverlay] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Generate consistent height based on project ID for varied masonry look
  const baseHeight = useMemo(() => {
    // Use project ID to generate a consistent but varied height
    const hash = project.id
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return HEIGHT_VARIANTS[hash % HEIGHT_VARIANTS.length];
  }, [project.id]);

  const [imageHeight, setImageHeight] = useState(baseHeight);

  const progress = project.goal_amount
    ? Math.min(
        (Number(project.current_amount) / Number(project.goal_amount)) * 100,
        100,
      )
    : 0;

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const naturalRatio = img.naturalHeight / img.naturalWidth;
    const width = 400;

    // Blend natural aspect ratio with base height for more organic variation
    const naturalHeight = Math.round(width * naturalRatio);
    const blendedHeight = Math.round(naturalHeight * 0.6 + baseHeight * 0.4);

    // Clamp between min and max
    setImageHeight(Math.min(Math.max(blendedHeight, 180), 420));
    setImageLoaded(true);
  };

  const handleCardClick = () => {
    router.push(`/${locale}/projects/${project.id}`);
  };

  return (
    <div className="masonry-item">
      <article
        className="pinterest-card group relative cursor-pointer"
        onMouseEnter={() => setShowOverlay(true)}
        onMouseLeave={() => setShowOverlay(false)}
        onClick={handleCardClick}
      >
        {/* Image Container */}
        <div className="block relative">
          <div className="relative overflow-hidden rounded-2xl">
            <Image
              src={project.cover_image_url}
              alt={project.title}
              width={400}
              height={imageHeight}
              className="w-full object-cover"
              style={{ height: `${imageHeight}px` }}
              loading="lazy"
              onLoad={handleImageLoad}
              placeholder="blur"
              blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI0ZEQ0I2RSIvPjwvc3ZnPg=="
            />

            {/* Badges - Always visible */}
            <div className="absolute top-3 left-3 right-3 flex justify-between items-start pointer-events-none z-10">
              {project.generated_cover && (
                <span className="badge-brutal badge-brutal-secondary text-xs">
                  ✨ AI
                </span>
              )}
              <span className="badge-brutal badge-brutal-primary text-xs ml-auto">
                {project.status === "published" ? "🟢 Live" : "📝 Draft"}
              </span>
            </div>

            {/* Overlay - Desktop hover / Mobile tap */}
            <AnimatePresence>
              {showOverlay && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col justify-end p-5 rounded-2xl z-20"
                  onClick={(e) => {
                    // En desktop, permitir navegación al hacer click en el overlay
                    // En mobile, el botón X cierra el overlay
                  }}
                >
                  {/* Close button for mobile */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowOverlay(false);
                    }}
                    className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center font-bold text-black hover:bg-gray-200 transition-colors md:hidden"
                    aria-label="Cerrar"
                  >
                    ✕
                  </button>

                  <motion.div
                    initial={{ y: 20 }}
                    animate={{ y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <h2 className="text-xl font-bold text-white mb-2 line-clamp-2">
                      {project.title}
                    </h2>
                    <p className="text-white/90 text-sm mb-4 line-clamp-3">
                      {project.short_description}
                    </p>

                    {/* Progress Bar */}
                    {project.goal_amount && (
                      <div className="mb-4">
                        <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#FDCB6E] transition-all duration-500"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <div className="flex justify-between mt-2 font-mono text-xs text-white/80">
                          <span className="font-bold text-[#FDCB6E]">
                            {Number(project.current_amount).toLocaleString()}{" "}
                            XLM
                          </span>
                          <span>
                            {Math.round(progress)}% of{" "}
                            {Number(project.goal_amount).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-white/20">
                      <span className="font-mono text-xs text-white/60">
                        {project.category || "General"}
                      </span>
                      <span className="text-sm font-bold text-[#FDCB6E] inline-flex items-center gap-1">
                        {t("viewProject")} →
                      </span>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </article>
    </div>
  );
}
