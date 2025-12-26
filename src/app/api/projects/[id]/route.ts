import { NextResponse } from "next/server";
import { getProjectById, updateProjectStatus } from "@/lib/services/projects";
import { createServerSupabaseClient } from "@/lib/auth/server";
import { z } from "zod";

const updateStatusSchema = z.object({
  status: z.enum(["draft", "published", "paused"]),
});

const updateProjectSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  short_description: z.string().min(1).max(500).optional(),
  full_description: z.string().max(5000).optional(),
  category: z.string().max(100).optional(),
  goal_amount: z.number().positive().optional().nullable(),
  wallet_address: z.string().max(100).optional().nullable(),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const project = await getProjectById(id);

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ project }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch project",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
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
        { error: "Forbidden - You can only update your own projects" },
        { status: 403 },
      );
    }

    const body = await request.json();

    // Determinar si es actualización de status o actualización completa
    if (body.status && Object.keys(body).length === 1) {
      // Solo actualizar status
      const validated = updateStatusSchema.parse(body);
      const project = await updateProjectStatus(id, validated.status);
      return NextResponse.json({ project }, { status: 200 });
    } else {
      // Actualización completa del proyecto
      const validated = updateProjectSchema.parse(body);

      // Actualizar proyecto en Supabase
      const updateData: Record<string, any> = {};
      if (validated.title !== undefined) updateData.title = validated.title;
      if (validated.short_description !== undefined)
        updateData.short_description = validated.short_description;
      if (validated.full_description !== undefined)
        updateData.full_description = validated.full_description;
      if (validated.category !== undefined)
        updateData.category = validated.category;
      if (validated.goal_amount !== undefined)
        updateData.goal_amount = validated.goal_amount;
      if (validated.wallet_address !== undefined)
        updateData.wallet_address = validated.wallet_address;

      const { data: project, error: updateError } = await supabase
        .from("projects")
        .update(updateData as never)
        .eq("id", id)
        .select()
        .single();

      if (updateError) {
        throw new Error(`Failed to update project: ${updateError.message}`);
      }

      return NextResponse.json({ project }, { status: 200 });
    }
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
          error instanceof Error ? error.message : "Failed to update project",
      },
      { status: 500 },
    );
  }
}
