import { NextRequest, NextResponse } from "next/server";
import { getDonationsByProjectId } from "@/lib/services/donations";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");

    const allDonations = await getDonationsByProjectId(id);
    const donations = allDonations.slice(0, limit);

    return NextResponse.json(
      { donations },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch donations",
      },
      { status: 500 },
    );
  }
}
