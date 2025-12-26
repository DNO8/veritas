import Link from "next/link";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import type { Project } from "@/lib/supabase/types";

async function getProjects(): Promise<Project[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const res = await fetch(`${baseUrl}/api/projects`, {
      next: { revalidate: 60 }, // Cache por 60 segundos
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
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <h1>{t("projectsFeed")}</h1>
      <p style={{ color: "#666", fontSize: "14px" }}>
        {t("totalProjects")}: {projects.length}
      </p>

      <div style={{ marginBottom: "20px" }}>
        <Link
          href="/projects/new"
          style={{
            padding: "10px 20px",
            background: "#0070f3",
            color: "white",
            textDecoration: "none",
            borderRadius: "4px",
            display: "inline-block",
          }}
        >
          {t("createProject")}
        </Link>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "20px",
        }}
      >
        {projects.length === 0 ? (
          <p>{t("noProjects")}</p>
        ) : (
          projects.map((project) => (
            <div
              key={project.id}
              style={{
                border: "1px solid #ddd",
                padding: "20px",
                borderRadius: "8px",
              }}
            >
              <Image
                src={project.cover_image_url}
                alt={project.title}
                width={300}
                height={200}
                style={{
                  width: "100%",
                  height: "200px",
                  objectFit: "cover",
                  borderRadius: "4px",
                }}
                loading="lazy"
                placeholder="blur"
                blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2VlZSIvPjwvc3ZnPg=="
              />
              <h2>{project.title}</h2>
              <p>{project.short_description}</p>
              <p>
                <strong>{t("raised")}:</strong> {project.current_amount} XLM
                {project.goal_amount && ` / ${project.goal_amount} XLM`}
              </p>
              <Link
                href={`/projects/${project.id}`}
                style={{ color: "#0070f3" }}
              >
                {t("viewProject")} →
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
