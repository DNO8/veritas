import { supabaseServer } from "../supabase/server";
import type { Donation } from "../supabase/types";
import { stellarTestnet, stellarMainnet } from "../stellar/client";
import type { StellarNetwork } from "../stellar/config";
import { isValidStellarAddress, isValidTxHash } from "../stellar/validation";
import { incrementProjectAmount, getProjectById } from "./projects";
import { getUserById } from "./users";

export async function getDonationsByProjectId(
  projectId: string,
): Promise<Donation[]> {
  if (!projectId) {
    throw new Error("Project ID is required");
  }

  const { data, error } = await supabaseServer
    .from("donations")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch donations: ${error.message}`);
  }

  return data || [];
}

export async function getDonationByTxHash(
  txHash: string,
): Promise<Donation | null> {
  if (!txHash) {
    throw new Error("Transaction hash is required");
  }

  const { data, error } = await supabaseServer
    .from("donations")
    .select("*")
    .eq("tx_hash", txHash)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw new Error(`Failed to fetch donation: ${error.message}`);
  }

  return data;
}

export interface CreateDonationInput {
  projectId: string;
  donorWallet: string;
  amount: string;
  asset: string;
  txHash: string;
  network: StellarNetwork;
}

export async function createDonation(
  input: CreateDonationInput,
): Promise<Donation> {
  if (!input.projectId) {
    throw new Error("Project ID is required");
  }
  if (!input.donorWallet || !isValidStellarAddress(input.donorWallet)) {
    throw new Error("Invalid donor wallet address");
  }
  if (!input.amount) {
    throw new Error("Amount is required");
  }
  if (!input.asset) {
    throw new Error("Asset is required");
  }
  if (!input.txHash || !isValidTxHash(input.txHash)) {
    throw new Error("Invalid transaction hash");
  }
  if (
    !input.network ||
    (input.network !== "TESTNET" && input.network !== "MAINNET")
  ) {
    throw new Error("Invalid network");
  }

  const existingDonation = await getDonationByTxHash(input.txHash);
  if (existingDonation) {
    throw new Error("Donation with this transaction hash already exists");
  }

  const project = await getProjectById(input.projectId);
  if (!project) {
    throw new Error("Project not found");
  }

  const projectOwner = await getUserById(project.owner_id);
  if (!projectOwner) {
    throw new Error("Project owner not found");
  }

  const destinationWallet =
    project.wallet_address || projectOwner.wallet_address;
  if (!destinationWallet) {
    throw new Error("Project does not have a wallet address configured");
  }

  const stellarClient =
    input.network === "TESTNET" ? stellarTestnet : stellarMainnet;

  const verification = await stellarClient.verifyPayment(
    input.txHash,
    destinationWallet,
    input.amount,
    input.asset,
  );

  if (!verification.valid) {
    throw new Error(`Payment verification failed: ${verification.error}`);
  }

  const { data, error } = await supabaseServer
    .from("donations")
    .insert({
      project_id: input.projectId,
      donor_wallet: input.donorWallet,
      amount: input.amount,
      asset: input.asset,
      tx_hash: input.txHash,
      network: input.network,
    } as any)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create donation: ${error.message}`);
  }

  await incrementProjectAmount(input.projectId, input.amount);

  return data;
}

export async function getTotalDonationsForProject(
  projectId: string,
): Promise<{ total: string; count: number }> {
  if (!projectId) {
    throw new Error("Project ID is required");
  }

  const donations = await getDonationsByProjectId(projectId);

  const total = donations.reduce((sum, donation) => {
    return sum + Number(donation.amount);
  }, 0);

  return {
    total: total.toString(),
    count: donations.length,
  };
}
