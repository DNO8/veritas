"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function CompleteProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    role: "person" as "person" | "startup" | "project" | "pyme",
  });

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      // Verificar si ya tiene perfil completo
      const { data: userData } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      if (userData && (userData as any).name && (userData as any).role) {
        router.push("/forbidden");
        return;
      }

      setUser(user);

      // Pre-llenar nombre si viene de Google
      if (user.user_metadata?.full_name) {
        setFormData((prev) => ({
          ...prev,
          name: user.user_metadata.full_name,
        }));
      }

      setChecking(false);
    };

    checkUser();

    // Prevenir navegación hacia atrás
    const handlePopState = (e: PopStateEvent) => {
      e.preventDefault();
      window.history.pushState(null, "", window.location.pathname);
    };

    window.history.pushState(null, "", window.location.pathname);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      alert("No user found");
      return;
    }

    setLoading(true);

    try {
      // Verificar si el usuario ya existe
      const { data: existingUser } = await supabase
        .from("users")
        .select("id")
        .eq("id", user.id)
        .single();

      if (existingUser) {
        // Actualizar usuario existente
        const { error } = await (supabase as any)
          .from("users")
          .update({
            name: formData.name,
            role: formData.role,
          })
          .eq("id", user.id);

        if (error) throw error;
      } else {
        // Crear nuevo usuario
        const { error } = await (supabase as any).from("users").insert({
          id: user.id,
          email: user.email!,
          name: formData.name,
          role: formData.role,
        });

        if (error) throw error;
      }

      router.push("/projects");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert(
        `Error: ${error instanceof Error ? error.message : "Failed to update profile"}`,
      );
    } finally {
      setLoading(false);
    }
  };

  if (checking || !user) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>Loading...</div>
    );
  }

  return (
    <div style={{ padding: "20px", maxWidth: "500px", margin: "50px auto" }}>
      <div
        style={{
          background: "#fff3cd",
          border: "1px solid #ffc107",
          borderRadius: "4px",
          padding: "15px",
          marginBottom: "30px",
        }}
      >
        <p style={{ margin: 0, color: "#856404", fontSize: "14px" }}>
          ⚠️ <strong>Profile Required:</strong> Please complete your profile to
          continue using the platform.
        </p>
      </div>

      <h1>Complete Your Profile</h1>
      <p style={{ color: "#666", marginBottom: "30px" }}>
        Please provide some additional information to complete your profile.
      </p>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "20px" }}>
          <label
            htmlFor="email"
            style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            value={user.email}
            disabled
            style={{
              width: "100%",
              padding: "10px",
              fontSize: "16px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              background: "#f5f5f5",
              color: "#666",
            }}
          />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label
            htmlFor="name"
            style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}
          >
            Full Name *
          </label>
          <input
            id="name"
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="John Doe"
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
            htmlFor="role"
            style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}
          >
            I am a *
          </label>
          <select
            id="role"
            required
            value={formData.role}
            onChange={(e) =>
              setFormData({
                ...formData,
                role: e.target.value as
                  | "person"
                  | "startup"
                  | "project"
                  | "pyme",
              })
            }
            style={{
              width: "100%",
              padding: "10px",
              fontSize: "16px",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          >
            <option value="person">Individual / Person</option>
            <option value="startup">Startup</option>
            <option value="project">Project</option>
            <option value="pyme">Small Business (PYME)</option>
          </select>
          <p style={{ fontSize: "14px", color: "#666", marginTop: "5px" }}>
            This helps us personalize your experience
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "15px",
            fontSize: "18px",
            background: loading ? "#ccc" : "#0070f3",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: loading ? "not-allowed" : "pointer",
            fontWeight: "bold",
          }}
        >
          {loading ? "Saving..." : "Complete Profile"}
        </button>
      </form>
    </div>
  );
}
