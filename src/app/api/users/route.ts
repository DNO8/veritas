import { NextRequest, NextResponse } from "next/server";
import { createUser, updateUserWallet } from "@/lib/services/users";
import { z } from "zod";
import { walletAddressSchema } from "@/lib/stellar/validation";

const createUserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  role: z.enum(["person", "startup", "project", "pyme"]),
  name: z.string().optional(),
  walletAddress: walletAddressSchema.optional(),
});

const updateWalletSchema = z.object({
  userId: z.string().uuid(),
  walletAddress: walletAddressSchema,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createUserSchema.parse(body);

    const user = await createUser(
      validated.id,
      validated.email,
      validated.role,
      validated.name,
      validated.walletAddress,
    );

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 },
      );
    }
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to create user",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = updateWalletSchema.parse(body);

    const user = await updateUserWallet(
      validated.userId,
      validated.walletAddress,
    );

    return NextResponse.json({ user }, { status: 200 });
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
          error instanceof Error ? error.message : "Failed to update wallet",
      },
      { status: 500 },
    );
  }
}
