import { NextRequest, NextResponse } from "next/server";
import { createDonation } from "@/lib/services/donations";
import { z } from "zod";
import {
  walletAddressSchema,
  txHashSchema,
  networkSchema,
  assetSchema,
  amountSchema,
} from "@/lib/stellar/validation";

const createDonationSchema = z.object({
  projectId: z.string().uuid(),
  donorWallet: walletAddressSchema,
  amount: amountSchema,
  asset: assetSchema,
  txHash: txHashSchema,
  network: networkSchema,
});

export async function POST(request: NextRequest) {
  
  try {
    const body = await request.json();
    
    const validated = createDonationSchema.parse(body);

    const donation = await createDonation({
      projectId: validated.projectId,
      donorWallet: validated.donorWallet,
      amount: validated.amount,
      asset: validated.asset,
      txHash: validated.txHash,
      network: validated.network,
    });

    
    return NextResponse.json({ donation }, { status: 201 });
  } catch (error) {
    
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 },
      );
    }
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create donation",
      },
      { status: 500 },
    );
  }
}
