import Link from "next/link";
import type { Project } from "@/lib/supabase/types";

async function getProjects(): Promise<Project[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const res = await fetch(`${baseUrl}/api/projects`, {
      cache: "no-store",
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

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <h1>Projects Feed</h1>
      <p style={{ color: "#666", fontSize: "14px" }}>
        Total projects: {projects.length}
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
          Create Project
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
          <p>No projects yet. Create the first one!</p>
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
              <img
                src={project.cover_image_url}
                alt={project.title}
                style={{
                  width: "100%",
                  height: "200px",
                  objectFit: "cover",
                  borderRadius: "4px",
                }}
              />
              <h2>{project.title}</h2>
              <p>{project.short_description}</p>
              <p>
                <strong>Raised:</strong> {project.current_amount} XLM
                {project.goal_amount && ` / ${project.goal_amount} XLM`}
              </p>
              <Link
                href={`/projects/${project.id}`}
                style={{ color: "#0070f3" }}
              >
                View Project →
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
