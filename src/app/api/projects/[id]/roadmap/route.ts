import { NextRequest, NextResponse } from "next/server";
import {
  getRoadmapItemsByProjectId,
  createRoadmapItem,
  updateRoadmapItem,
  deleteRoadmapItem,
} from "@/lib/services/roadmap";
import { getProjectById } from "@/lib/services/projects";
import { createServerSupabaseClient } from "@/lib/auth/server";
import { z } from "zod";

const createRoadmapItemSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  estimatedCost: z.string().optional(),
  orderIndex: z.number().int().min(0),
});

const updateRoadmapItemSchema = z.object({
  itemId: z.string().uuid(),
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  estimatedCost: z.string().optional(),
  orderIndex: z.number().int().min(0).optional(),
});

/**
 * GET /api/projects/[id]/roadmap
 * Obtener roadmap items de un proyecto
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    

    const items = await getRoadmapItemsByProjectId(id);
    

    return NextResponse.json({ items }, { status: 200 });
  } catch (error) {
    
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch roadmap items",
      },
      { status: 500 },
    );
  }
}

/**
 * POST /api/projects/[id]/roadmap
 * Crear un roadmap item
 */
export async function POST(
  request: NextRequest,
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

    const { id: projectId } = await params;

    // 🔒 SECURITY: Verificar ownership del proyecto
    const project = await getProjectById(projectId);

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (project.owner_id !== user.id) {
      return NextResponse.json(
        {
          error:
            "Forbidden - You can only add roadmap items to your own projects",
        },
        { status: 403 },
      );
    }

    const body = await request.json();
    const validated = createRoadmapItemSchema.parse(body);

    const item = await createRoadmapItem({
      projectId,
      title: validated.title,
      description: validated.description,
      estimatedCost: validated.estimatedCost,
      orderIndex: validated.orderIndex,
    });

    return NextResponse.json({ item }, { status: 201 });
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
          error instanceof Error
            ? error.message
            : "Failed to create roadmap item",
      },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/projects/[id]/roadmap
 * Actualizar un roadmap item
 */
export async function PATCH(
  request: NextRequest,
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

    const { id: projectId } = await params;

    // 🔒 SECURITY: Verificar ownership del proyecto
    const project = await getProjectById(projectId);

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (project.owner_id !== user.id) {
      return NextResponse.json(
        {
          error:
            "Forbidden - You can only update roadmap items of your own projects",
        },
        { status: 403 },
      );
    }

    const body = await request.json();
    const validated = updateRoadmapItemSchema.parse(body);

    const item = await updateRoadmapItem(validated.itemId, {
      title: validated.title,
      description: validated.description,
      estimatedCost: validated.estimatedCost,
      orderIndex: validated.orderIndex,
    });

    return NextResponse.json({ item }, { status: 200 });
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
          error instanceof Error
            ? error.message
            : "Failed to update roadmap item",
      },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/projects/[id]/roadmap
 * Eliminar un roadmap item
 */
export async function DELETE(
  request: NextRequest,
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

    const { id: projectId } = await params;

    // 🔒 SECURITY: Verificar ownership del proyecto
    const project = await getProjectById(projectId);

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (project.owner_id !== user.id) {
      return NextResponse.json(
        {
          error:
            "Forbidden - You can only delete roadmap items from your own projects",
        },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get("itemId");

    if (!itemId) {
      return NextResponse.json(
        { error: "Item ID is required" },
        { status: 400 },
      );
    }

    await deleteRoadmapItem(itemId);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete roadmap item",
      },
      { status: 500 },
    );
  }
}
