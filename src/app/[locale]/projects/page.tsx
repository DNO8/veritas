import Link from "next/link";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import type { Project } from "@/lib/supabase/types";
import ProjectCard from "./ProjectCard";
import ProjectsClient from "./ProjectsClient";

async function getProjects(): Promise<Project[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const res = await fetch(`${baseUrl}/api/projects`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      return [];
    }

    const data = await res.json();
    return data.projects || [];
  } catch (error) {
    return [];
  }
}

export default async function ProjectsPage() {
  const projects = await getProjects();
  const t = await getTranslations("projects");

  return (
    <div className="min-h-screen hex-pattern">
      {/* Header */}
      <div className="bg-[#FDCB6E] border-b-4 border-black py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold text-black mb-2">
                🐝 {t("projectsFeed")}
              </h1>
              <p className="font-mono text-black/70">
                {t("totalProjects")}:{" "}
                <span className="font-bold">{projects.length}</span>{" "}
                {t("activeProjects") || "proyectos activos"}
              </p>
            </div>
            <Link
              href="/projects/new"
              className="btn-brutal btn-brutal-dark text-lg self-start md:self-auto"
            >
              + {t("createProject")}
            </Link>
          </div>
        </div>
      </div>

      {/* Projects Grid - Masonry Style */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {projects.length === 0 ? (
          <div className="card-brutal p-12 text-center bg-white">
            <div className="text-6xl mb-4">🍯</div>
            <h2 className="text-2xl font-bold mb-2">{t("noProjects")}</h2>
            <p className="text-gray-600 mb-6">
              {t("beFirstToCreate") || "Sé el primero en crear un proyecto"}
            </p>
            <Link
              href="/projects/new"
              className="btn-brutal btn-brutal-primary"
            >
              + {t("createProject")}
            </Link>
          </div>
        ) : (
          <ProjectsClient projects={projects} />
        )}
      </div>
    </div>
  );
}
