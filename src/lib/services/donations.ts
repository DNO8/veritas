import { supabaseServer } from "../supabase/server";
import type { Donation } from "../supabase/types";
import { stellarTestnet, stellarMainnet } from "../stellar/client";
import type { StellarNetwork } from "../stellar/config";
import { isValidStellarAddress, isValidTxHash } from "../stellar/validation";
import { incrementProjectAmount, getProjectById } from "./projects";
import { getUserById } from "./users";
import { getEligibleBenefits, issueAssetToRecipient } from "./assetIssuance";
import { getIssuerKeypair } from "./issuerAccounts";

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
  selectedBenefitIds?: string[];
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
      network: input.network.toLowerCase(), // Convert to lowercase for DB enum
    } as any)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create donation: ${error.message}`);
  }

  if (!data) {
    throw new Error("Failed to create donation: No data returned");
  }

  const donation = data as Donation;

  
  await incrementProjectAmount(input.projectId, input.amount);
  

  // Check for selected benefits and issue them
  
  
  let benefitsIssuedCount = 0;
  
  try {
    let benefitsToIssue: any[] = [];

    if (input.selectedBenefitIds && input.selectedBenefitIds.length > 0) {
      // User selected specific benefits - fetch them
      
      
      for (const benefitId of input.selectedBenefitIds) {
        const { data: benefit, error } = await (supabaseServer
          .from('project_benefits') as any)
          .select('*')
          .eq('id', benefitId)
          .single();

        if (benefit && !error) {
          benefitsToIssue.push(benefit);
          
        } else {
          
        }
      }
    } else {
      // No benefits selected - use automatic eligibility (backward compatibility)
      
      benefitsToIssue = await getEligibleBenefits(
        input.projectId,
        input.amount,
        input.asset
      );
    }

    

    if (benefitsToIssue.length > 0) {
      for (const benefit of benefitsToIssue) {
        const issueResult = await issueAssetToRecipient({
          projectId: input.projectId,
          benefitId: benefit.id,
          recipientPublicKey: input.donorWallet,
          assetCode: benefit.asset_code,
          amount: '1', // Issue 1 unit of the benefit NFT
          donationId: donation.id,
        });

        if (issueResult.success) {
          
          
          benefitsIssuedCount++;
        } else {
          
          
          // Continue with other benefits even if one fails
        }
      }
    } else {
      
    }
  } catch (benefitError) {
    
    
    // Don't fail the donation if benefit issuance fails
    // The donation is already recorded
  }

  
  
  
  // Return donation with benefits info
  return {
    ...donation,
    benefitsIssued: benefitsIssuedCount
  } as any;
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
