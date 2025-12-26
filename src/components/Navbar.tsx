"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [hasCompleteProfile, setHasCompleteProfile] = useState<boolean>(true);

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      // Si hay usuario, verificar si tiene perfil completo
      if (user) {
        const { data: userData } = await supabase
          .from("users")
          .select("name, role")
          .eq("id", user.id)
          .single();

        const userProfile = userData as any;
        const isComplete = userProfile && userProfile.name && userProfile.role;
        setHasCompleteProfile(isComplete);

        // Si no tiene perfil completo y no está en complete-profile, redirigir
        if (!isComplete && pathname !== "/complete-profile") {
          router.push("/complete-profile");
        }
      }
    };
    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkUser();
      }
    });

    return () => subscription.unsubscribe();
  }, [pathname, router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  // Ocultar navbar en páginas de autenticación y complete-profile
  const hideNavbarPaths = [
    "/login",
    "/signup",
    "/complete-profile",
    "/auth/callback",
  ];
  const shouldHideNavbar = hideNavbarPaths.includes(pathname);

  // Ocultar navbar si el usuario no tiene perfil completo
  if (shouldHideNavbar || (user && !hasCompleteProfile)) {
    return null;
  }

  return (
    <nav
      style={{
        padding: "15px 20px",
        background: "#0070f3",
        color: "white",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
        <Link
          href="/projects"
          style={{ color: "white", textDecoration: "none", fontWeight: "bold" }}
        >
          StellarDonate
        </Link>
        <Link
          href="/projects"
          style={{ color: "white", textDecoration: "none" }}
        >
          Projects
        </Link>
        {user && (
          <>
            <Link
              href="/my-projects"
              style={{ color: "white", textDecoration: "none" }}
            >
              My Projects
            </Link>
            <Link
              href="/projects/new"
              style={{ color: "white", textDecoration: "none" }}
            >
              Create Project
            </Link>
          </>
        )}
      </div>

      <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
        {user ? (
          <>
            <span style={{ fontSize: "14px" }}>{user.email}</span>
            <button
              onClick={handleLogout}
              style={{
                padding: "8px 16px",
                background: "white",
                color: "#0070f3",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              href="/login"
              style={{
                padding: "8px 16px",
                background: "white",
                color: "#0070f3",
                textDecoration: "none",
                borderRadius: "4px",
                fontWeight: "bold",
              }}
            >
              Login
            </Link>
            <Link
              href="/signup"
              style={{
                padding: "8px 16px",
                background: "transparent",
                color: "white",
                textDecoration: "none",
                border: "2px solid white",
                borderRadius: "4px",
                fontWeight: "bold",
              }}
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
