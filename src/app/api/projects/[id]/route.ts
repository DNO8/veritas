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

// Disable caching for this route to always get fresh data
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    console.log("[API /projects/[id]] Fetching project:", id);

    const project = await getProjectById(id);

    if (!project) {
      console.log("[API /projects/[id]] Project not found:", id);
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    console.log("[API /projects/[id]] Project found:", {
      id: project.id,
      status: project.status,
      owner_id: project.owner_id,
    });

    // Verificar si el proyecto es público o si el usuario es el owner
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    console.log("[API /projects/[id]] User:", user?.id || "anonymous");

    // Permitir acceso si:
    // 1. El proyecto está publicado (público)
    // 2. El usuario es el owner (puede ver sus propios drafts)
    const isOwner = user && project.owner_id === user.id;
    const isPublished = project.status === "published";

    console.log("[API /projects/[id]] Access check:", {
      isOwner,
      isPublished,
      allowed: isPublished || isOwner,
    });

    if (!isPublished && !isOwner) {
      console.log("[API /projects/[id]] Access denied");
      return NextResponse.json(
        { error: "Project not found or not accessible" },
        { status: 404 },
      );
    }

    console.log("[API /projects/[id]] Returning project data");
    return NextResponse.json(
      { project },
      {
        status: 200,
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      },
    );
  } catch (error) {
    console.error("[API /projects/[id]] Error:", error);
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

export async function DELETE(
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
        { error: "Forbidden - You can only delete your own projects" },
        { status: 403 },
      );
    }

    // Eliminar proyecto (las tablas relacionadas se eliminan por CASCADE)
    const { error: deleteError } = await supabase
      .from("projects")
      .delete()
      .eq("id", id);

    if (deleteError) {
      throw new Error(`Failed to delete project: ${deleteError.message}`);
    }

    return NextResponse.json(
      { success: true, message: "Project deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to delete project",
      },
      { status: 500 },
    );
  }
}
