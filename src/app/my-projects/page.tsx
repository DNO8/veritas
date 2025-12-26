"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import type { Project } from "@/lib/supabase/types";
import Link from "next/link";

export default function MyProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

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
        console.error("Error fetching projects:", fetchError);
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
        alert("✅ Project published successfully!");
      } else {
        const errorData = await res.json();

        // Mostrar mensaje específico del servidor
        if (errorData.message) {
          alert(`❌ ${errorData.error}\n\n${errorData.message}`);
        } else {
          alert(`❌ Error: ${errorData.error || "Failed to publish project"}`);
        }
      }
    } catch (error) {
      alert("❌ Failed to publish project. Please try again.");
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
        alert("✅ Project unpublished successfully!");
      } else {
        const errorData = await res.json();
        alert(`❌ Error: ${errorData.error || "Failed to unpublish project"}`);
      }
    } catch (error) {
      alert("❌ Failed to unpublish project. Please try again.");
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>Loading...</div>
    );
  }

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <h1>My Projects</h1>
      <p style={{ color: "#666", marginBottom: "20px" }}>
        Manage your projects and publish them to make them visible in the feed.
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
          Create New Project
        </Link>
      </div>

      {projects.length === 0 ? (
        <p>You haven't created any projects yet.</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
            gap: "20px",
          }}
        >
          {projects.map((project) => (
            <div
              key={project.id}
              style={{
                border: "1px solid #ddd",
                padding: "20px",
                borderRadius: "8px",
                background: project.status === "draft" ? "#fff9e6" : "white",
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
                  marginBottom: "15px",
                }}
              />

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "10px",
                }}
              >
                <h2 style={{ margin: 0, fontSize: "20px" }}>{project.title}</h2>
                <span
                  style={{
                    padding: "4px 12px",
                    borderRadius: "12px",
                    fontSize: "12px",
                    fontWeight: "bold",
                    background:
                      project.status === "published"
                        ? "#d4edda"
                        : project.status === "draft"
                          ? "#fff3cd"
                          : "#f8d7da",
                    color:
                      project.status === "published"
                        ? "#155724"
                        : project.status === "draft"
                          ? "#856404"
                          : "#721c24",
                  }}
                >
                  {project.status.toUpperCase()}
                </span>
              </div>

              <p style={{ color: "#666", marginBottom: "15px" }}>
                {project.short_description}
              </p>

              <p style={{ marginBottom: "15px" }}>
                <strong>Raised:</strong> {project.current_amount} XLM
                {project.goal_amount && ` / ${project.goal_amount} XLM`}
              </p>

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  flexWrap: "wrap",
                }}
              >
                <Link
                  href={`/projects/${project.id}`}
                  style={{
                    padding: "8px 16px",
                    background: "#0070f3",
                    color: "white",
                    textDecoration: "none",
                    borderRadius: "4px",
                    fontSize: "14px",
                  }}
                >
                  View
                </Link>

                {project.status === "draft" ? (
                  <button
                    onClick={() => handlePublish(project.id)}
                    style={{
                      padding: "8px 16px",
                      background: "#28a745",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: "bold",
                    }}
                  >
                    Publish
                  </button>
                ) : project.status === "published" ? (
                  <button
                    onClick={() => handleUnpublish(project.id)}
                    style={{
                      padding: "8px 16px",
                      background: "#ffc107",
                      color: "#000",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: "bold",
                    }}
                  >
                    Unpublish
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
