"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import type { UserProfile } from "@/lib/auth/routeProtection";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setUser(user);

        if (user) {
          const { data: userData } = await supabase
            .from("users")
            .select("*")
            .eq("id", user.id)
            .single();

          setProfile(userData ? (userData as UserProfile) : null);
        } else {
          setProfile(null);
        }
      } catch (error) {
        console.error("Error checking user:", error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkUser();
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const isAuthenticated = !!user;
  const hasCompleteProfile = !!(profile?.name && profile?.role);

  return {
    user,
    profile,
    loading,
    isAuthenticated,
    hasCompleteProfile,
  };
}
