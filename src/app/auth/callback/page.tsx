"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    // Evitar procesamiento múltiple
    if (processing) return;

    const handleCallback = async () => {
      setProcessing(true);

      try {
        // Validar que la URL viene de un flujo de autenticación legítimo
        const hashParams = new URLSearchParams(
          window.location.hash.substring(1),
        );
        const searchParams = new URLSearchParams(window.location.search);

        const hasAuthParams =
          hashParams.has("access_token") || searchParams.has("code");

        // Si no hay parámetros de autenticación, es un acceso directo no autorizado
        if (!hasAuthParams) {
          const {
            data: { session },
          } = await supabase.auth.getSession();

          // Si ya tiene sesión, redirigir según estado del perfil
          if (session) {
            const { data: userData } = await supabase
              .from("users")
              .select("name, role")
              .eq("id", session.user.id)
              .single();

            const user = userData as any;
            if (userData && user.name && user.role) {
              router.replace("/projects");
            } else {
              router.replace("/complete-profile");
            }
            return;
          }

          // Sin sesión y sin parámetros de auth = acceso no autorizado
          router.replace("/forbidden");
          return;
        }

        // Primero verificar si ya hay una sesión válida
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          // Ya hay sesión, verificar perfil
          const { data: userData, error: userError } = await supabase
            .from("users")
            .select("name, role")
            .eq("id", session.user.id)
            .single();

          const user = userData as any;
          if (userError || !userData || !user.name || !user.role) {
            router.replace("/complete-profile");
            return;
          }

          router.replace("/projects");
          return;
        }

        // No hay sesión, procesar tokens del hash
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");

        if (accessToken && refreshToken) {
          // Limpiar hash para evitar reprocesamiento
          window.history.replaceState(null, "", window.location.pathname);

          // Establecer la sesión con los tokens del hash
          const { data, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (sessionError) {
            setError("Failed to authenticate");
            setTimeout(() => router.replace("/login"), 2000);
            return;
          }

          if (data.user) {
            // Verificar si el usuario tiene perfil completo
            const { data: userData, error: userError } = await supabase
              .from("users")
              .select("name, role")
              .eq("id", data.user.id)
              .single();

            if (userError || !userData) {
              router.replace("/complete-profile");
              return;
            }

            const user = userData as any;
            if (!user.name || !user.role) {
              router.replace("/complete-profile");
              return;
            }

            router.replace("/projects");
            return;
          }
        }

        setError("No authentication data found");
        setTimeout(() => router.replace("/login"), 2000);
      } catch (err) {
        setError("Authentication failed");
        setTimeout(() => router.replace("/login"), 2000);
      }
    };

    handleCallback();
  }, [router, processing]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: "20px",
      }}
    >
      {error ? (
        <>
          <h2 style={{ color: "#e74c3c", marginBottom: "10px" }}>
            Authentication Error
          </h2>
          <p style={{ color: "#666" }}>{error}</p>
          <p style={{ color: "#666", fontSize: "14px", marginTop: "10px" }}>
            Redirecting to login...
          </p>
        </>
      ) : (
        <>
          <div className="spinner" />
          <p style={{ marginTop: "20px", color: "#666" }}>
            Completing authentication...
          </p>
          <style
            dangerouslySetInnerHTML={{
              __html: `
              .spinner {
                border: 4px solid #f3f3f3;
                border-top: 4px solid #0070f3;
                border-radius: 50%;
                width: 40px;
                height: 40px;
                animation: spin 1s linear infinite;
              }
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `,
            }}
          />
        </>
      )}
    </div>
  );
}
