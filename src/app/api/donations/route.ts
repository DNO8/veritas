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
import { createServerSupabaseClient } from "@/lib/auth/server";
import { getUserProfile, isProfileComplete } from "@/lib/auth/routeProtection";

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
    // Verificar autenticación del usuario
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Debes iniciar sesión para realizar una donación" },
        { status: 401 },
      );
    }

    // Verificar que el perfil esté completo
    const profile = await getUserProfile(user.id);
    if (!isProfileComplete(profile)) {
      return NextResponse.json(
        { error: "Debes completar tu perfil antes de realizar una donación" },
        { status: 403 },
      );
    }

    // Verificar que el usuario tenga una wallet asociada
    if (!profile?.wallet_address) {
      return NextResponse.json(
        {
          error:
            "Debes conectar una wallet a tu perfil para realizar donaciones",
        },
        { status: 403 },
      );
    }

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
