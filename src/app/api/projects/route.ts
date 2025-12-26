import { NextRequest, NextResponse } from "next/server";
import { getPublishedProjects, createProject } from "@/lib/services/projects";
import { createServerSupabaseClient } from "@/lib/auth/server";
import { z } from "zod";

const createProjectSchema = z.object({
  ownerId: z.string().uuid(),
  title: z.string().min(1),
  shortDescription: z.string().min(1),
  fullDescription: z.string().optional(),
  category: z.string().optional(),
  coverImageUrl: z.string().url(),
  generatedCover: z.boolean().optional(),
  goalAmount: z.string().optional(),
  walletAddress: z.string().optional(),
  galleryUrls: z.array(z.string().url()).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = Number(searchParams.get("limit")) || 50;
    const offset = Number(searchParams.get("offset")) || 0;

    const projects = await getPublishedProjects(limit, offset);

    return NextResponse.json({ projects }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch projects",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const validated = createProjectSchema.parse(body);

    // 🔒 SECURITY: Verificar que el ownerId coincida con el usuario autenticado
    if (validated.ownerId !== user.id) {
      return NextResponse.json(
        { error: "Forbidden - You can only create projects for yourself" },
        { status: 403 },
      );
    }

    // 🔒 SECURITY: Sanitizar inputs
    const sanitizedTitle = validated.title.trim().substring(0, 200);
    const sanitizedShortDesc = validated.shortDescription
      .trim()
      .substring(0, 500);
    const sanitizedFullDesc = validated.fullDescription
      ?.trim()
      .substring(0, 5000);

    const project = await createProject({
      ownerId: user.id, // Usar el ID del usuario autenticado
      title: sanitizedTitle,
      shortDescription: sanitizedShortDesc,
      fullDescription: sanitizedFullDesc,
      category: validated.category,
      coverImageUrl: validated.coverImageUrl,
      generatedCover: validated.generatedCover,
      goalAmount: validated.goalAmount,
      walletAddress: validated.walletAddress,
    });

    if (validated.galleryUrls && validated.galleryUrls.length > 0) {
      // 🔒 SECURITY: Limitar número de imágenes
      const limitedUrls = validated.galleryUrls.slice(0, 10);

      const galleryMedia = limitedUrls.map((url, index) => ({
        project_id: project.id,
        type: "image" as const,
        url,
        order_index: index,
      }));

      await supabase.from("project_media").insert(galleryMedia as any);
    }

    return NextResponse.json({ project }, { status: 201 });
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
          error instanceof Error ? error.message : "Failed to create project",
      },
      { status: 500 },
    );
  }
}
