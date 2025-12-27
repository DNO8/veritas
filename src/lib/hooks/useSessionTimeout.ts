"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

const INACTIVITY_TIMEOUT = 2 * 60 * 60 * 1000; // 2 horas en milisegundos
const SESSION_CHECK_INTERVAL = 5 * 60 * 1000; // Verificar cada 5 minutos

export function useSessionTimeout(locale: string = "es") {
  const router = useRouter();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  const resetTimeout = () => {
    lastActivityRef.current = Date.now();

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(async () => {
      await supabase.auth.signOut();
      router.push(`/${locale}/login?reason=timeout`);
    }, INACTIVITY_TIMEOUT);
  };

  const checkSessionValidity = async () => {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error || !session) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
      router.push(`/${locale}/login?reason=expired`);
      return;
    }

    // Verificar si el token está por expirar (menos de 5 minutos)
    const expiresAt = session.expires_at;
    if (expiresAt) {
      const timeUntilExpiry = expiresAt * 1000 - Date.now();
      if (timeUntilExpiry < 5 * 60 * 1000) {
        // Intentar refrescar el token
        const { error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError) {
          await supabase.auth.signOut();
          router.push(`/${locale}/login?reason=expired`);
        }
      }
    }
  };

  useEffect(() => {
    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];

    events.forEach((event) => {
      document.addEventListener(event, resetTimeout);
    });

    resetTimeout();

    checkIntervalRef.current = setInterval(
      checkSessionValidity,
      SESSION_CHECK_INTERVAL,
    );

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_OUT") {
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
        } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
          resetTimeout();
        }
      },
    );

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, resetTimeout);
      });

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }

      authListener.subscription.unsubscribe();
    };
  }, [locale, router]);
}
