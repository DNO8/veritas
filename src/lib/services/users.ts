import { supabaseServer } from "../supabase/server";
import type { User } from "../supabase/types";
import { isValidStellarAddress } from "../stellar/validation";

export async function getUserById(userId: string): Promise<User | null> {
  if (!userId) {
    throw new Error("User ID is required");
  }

  const { data, error } = await supabaseServer
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw new Error(`Failed to fetch user: ${error.message}`);
  }

  return data;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  if (!email) {
    throw new Error("Email is required");
  }

  const { data, error } = await supabaseServer
    .from("users")
    .select("*")
    .eq("email", email)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw new Error(`Failed to fetch user: ${error.message}`);
  }

  return data;
}

export async function createUser(
  id: string,
  email: string,
  role: "person" | "startup" | "project" | "pyme",
  name?: string,
  walletAddress?: string,
): Promise<User> {
  if (!id) {
    throw new Error("User ID is required");
  }
  if (!email) {
    throw new Error("Email is required");
  }

  if (walletAddress && !isValidStellarAddress(walletAddress)) {
    throw new Error("Invalid Stellar wallet address");
  }

  const { data, error } = await supabaseServer
    .from("users")
    .insert({
      id,
      email,
      name: name || null,
      role,
      wallet_address: walletAddress || null,
    } as any)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create user: ${error.message}`);
  }

  return data;
}

export async function updateUserWallet(
  userId: string,
  walletAddress: string,
): Promise<User> {
  if (!userId) {
    throw new Error("User ID is required");
  }

  if (!isValidStellarAddress(walletAddress)) {
    throw new Error("Invalid Stellar wallet address");
  }

  const { data, error } = await supabaseServer
    .from("users")
    .update({ wallet_address: walletAddress } as never)
    .eq("id", userId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update wallet: ${error.message}`);
  }

  return data;
}
