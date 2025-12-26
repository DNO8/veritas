"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function EditProjectPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [project, setProject] = useState<any>(null);
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
        // Verificar autenticación
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.push("/login");
          return;
        }

        // Obtener proyecto
        const res = await fetch(`/api/projects/${params.id}`, {
          credentials: "include",
        });
        const data = await res.json();

        // Verificar ownership
        if (data.project.owner_id !== user.id) {
          alert("You don't have permission to edit this project");
          router.push(`/projects/${params.id}`);
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
      } catch (error) {
        console.error("Error fetching project:", error);
        alert("Failed to load project");
        router.push("/projects");
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [params.id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

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
        alert("Project updated successfully!");
        router.push(`/projects/${params.id}`);
      } else {
        const error = await res.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error("Error updating project:", error);
      alert("Failed to update project");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ padding: "20px" }}>Loading...</div>;
  }

  if (!project) {
    return <div style={{ padding: "20px" }}>Project not found</div>;
  }

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ marginBottom: "30px" }}>
        <button
          onClick={() => router.push(`/projects/${params.id}`)}
          style={{
            padding: "8px 16px",
            background: "#f0f0f0",
            border: "1px solid #ddd",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          ← Back to Project
        </button>
      </div>

      <h1>Edit Project</h1>
      <p style={{ color: "#666", marginBottom: "30px" }}>
        Update your project information
      </p>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "20px" }}>
          <label
            htmlFor="title"
            style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}
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

        <div style={{ marginBottom: "20px" }}>
          <label
            htmlFor="shortDescription"
            style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}
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
            rows={3}
            style={{
              width: "100%",
              padding: "10px",
              fontSize: "16px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              fontFamily: "inherit",
            }}
          />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label
            htmlFor="fullDescription"
            style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}
          >
            Full Description
          </label>
          <textarea
            id="fullDescription"
            value={formData.fullDescription}
            onChange={(e) =>
              setFormData({ ...formData, fullDescription: e.target.value })
            }
            rows={6}
            style={{
              width: "100%",
              padding: "10px",
              fontSize: "16px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              fontFamily: "inherit",
            }}
          />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label
            htmlFor="category"
            style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}
          >
            Category
          </label>
          <input
            id="category"
            type="text"
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
            placeholder="e.g., Technology, Education, Health"
            style={{
              width: "100%",
              padding: "10px",
              fontSize: "16px",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label
            htmlFor="goalAmount"
            style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}
          >
            Goal Amount (XLM)
          </label>
          <input
            id="goalAmount"
            type="number"
            step="0.01"
            min="0"
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

        <div style={{ marginBottom: "30px" }}>
          <label
            htmlFor="walletAddress"
            style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}
          >
            Stellar Wallet Address
          </label>
          <input
            id="walletAddress"
            type="text"
            value={formData.walletAddress}
            onChange={(e) =>
              setFormData({ ...formData, walletAddress: e.target.value })
            }
            placeholder="GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
            style={{
              width: "100%",
              padding: "10px",
              fontSize: "16px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              fontFamily: "monospace",
            }}
          />
          <p style={{ fontSize: "12px", color: "#666", marginTop: "5px" }}>
            Required to receive donations and publish your project
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            type="submit"
            disabled={saving}
            style={{
              padding: "12px 24px",
              background: saving ? "#ccc" : "#0070f3",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: saving ? "not-allowed" : "pointer",
              fontWeight: "500",
              fontSize: "16px",
            }}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
          <button
            type="button"
            onClick={() => router.push(`/projects/${params.id}`)}
            style={{
              padding: "12px 24px",
              background: "white",
              color: "#666",
              border: "1px solid #ddd",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "500",
              fontSize: "16px",
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
