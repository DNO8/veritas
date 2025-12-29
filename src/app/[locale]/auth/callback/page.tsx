"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import LoadingBee from "@/components/LoadingBee";

export default function AuthCallbackPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) || "es";
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (processing) return;

    const handleCallback = async () => {
      setProcessing(true);

      try {
        const hashParams = new URLSearchParams(
          window.location.hash.substring(1),
        );
        const searchParams = new URLSearchParams(window.location.search);

        const hasAuthParams =
          hashParams.has("access_token") || searchParams.has("code");

        if (!hasAuthParams) {
          const {
            data: { session },
          } = await supabase.auth.getSession();

          if (session) {
            const { data: userData } = await supabase
              .from("users")
              .select("name, role")
              .eq("id", session.user.id)
              .single();

            const user = userData as any;
            if (userData && user.name && user.role) {
              router.replace(`/${locale}/projects`);
            } else {
              router.replace(`/${locale}/complete-profile`);
            }
            return;
          }

          router.replace(`/${locale}/login`);
          return;
        }

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          const { data: userData, error: userError } = await supabase
            .from("users")
            .select("name, role")
            .eq("id", session.user.id)
            .single();

          const user = userData as any;
          if (userError || !userData || !user.name || !user.role) {
            router.replace(`/${locale}/complete-profile`);
            return;
          }

          router.replace(`/${locale}/projects`);
          return;
        }

        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");

        if (accessToken && refreshToken) {
          window.history.replaceState(null, "", window.location.pathname);

          const { data, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (sessionError) {
            setError("Failed to authenticate");
            setTimeout(() => router.replace(`/${locale}/login`), 2000);
            return;
          }

          if (data.user) {
            const { data: userData, error: userError } = await supabase
              .from("users")
              .select("name, role")
              .eq("id", data.user.id)
              .single();

            if (userError || !userData) {
              router.replace(`/${locale}/complete-profile`);
              return;
            }

            const user = userData as any;
            if (!user.name || !user.role) {
              router.replace(`/${locale}/complete-profile`);
              return;
            }

            router.replace(`/${locale}/projects`);
            return;
          }
        }

        setError("No authentication data found");
        setTimeout(() => router.replace(`/${locale}/login`), 2000);
      } catch (err) {
        setError("Authentication failed");
        setTimeout(() => router.replace(`/${locale}/login`), 2000);
      }
    };

    handleCallback();
  }, [router, processing]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white border-4 border-red-500 p-8 shadow-[6px_6px_0px_#ef4444] text-center max-w-md">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-red-600 mb-2">
            Error de Autenticación
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">
            Redirigiendo al login...
          </p>
        </div>
      </div>
    );
  }

  return <LoadingBee text="Completando autenticación..." />;
}
