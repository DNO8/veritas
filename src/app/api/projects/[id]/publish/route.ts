import { NextResponse } from "next/server";
import { updateProjectStatus, getProjectById } from "@/lib/services/projects";
import { projectHasRoadmap } from "@/lib/services/roadmap";
import { createServerSupabaseClient } from "@/lib/auth/server";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // 🔒 SECURITY: Verificar autenticación
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized - Authentication required" },
        { status: 401 },
      );
    }

    const { id } = await params;

    // 🔒 SECURITY: Verificar ownership del proyecto
    const existingProject = await getProjectById(id);

    if (!existingProject) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (existingProject.owner_id !== user.id) {
      return NextResponse.json(
        { error: "Forbidden - You can only publish your own projects" },
        { status: 403 },
      );
    }

    // ✅ VALIDATION: Verificar que el proyecto tenga roadmap
    const hasRoadmap = await projectHasRoadmap(id);

    if (!hasRoadmap) {
      return NextResponse.json(
        {
          error: "Cannot publish project without roadmap",
          message:
            "Please add at least one roadmap item before publishing. This helps build trust with potential donors.",
        },
        { status: 400 },
      );
    }

    // ✅ VALIDATION: Verificar que el proyecto tenga wallet_address
    if (!existingProject.wallet_address) {
      return NextResponse.json(
        {
          error: "Cannot publish project without wallet address",
          message:
            "Please add a Stellar wallet address to receive donations before publishing.",
        },
        { status: 400 },
      );
    }

    const project = await updateProjectStatus(id, "published");

    return NextResponse.json({ project }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to publish project",
      },
      { status: 500 },
    );
  }
}
