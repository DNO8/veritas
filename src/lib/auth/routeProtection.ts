import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import type { User } from "@/lib/supabase/types";

export type UserProfile = User;

export async function getCurrentUser() {
  const {
    data: { user },
  } = await supabaseServer.auth.getUser();
  return user;
}

export async function getUserProfile(
  userId: string,
): Promise<UserProfile | null> {
  const { data, error } = await supabaseServer
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (error || !data) {
    return null;
  }

  return data as UserProfile;
}

export function isProfileComplete(profile: UserProfile | null): boolean {
  if (!profile) return false;
  return !!(profile.name && profile.role);
}

export async function requireAuth() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function requireCompleteProfile() {
  const user = await requireAuth();
  const profile = await getUserProfile(user.id);

  if (!isProfileComplete(profile)) {
    redirect("/complete-profile");
  }

  return { user, profile: profile! };
}

export async function preventAccessIfProfileComplete() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await getUserProfile(user.id);

  if (isProfileComplete(profile)) {
    redirect("/projects");
  }

  return { user, profile };
}
