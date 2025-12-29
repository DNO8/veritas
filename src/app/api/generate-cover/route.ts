import { NextRequest, NextResponse } from "next/server";
import { generateProjectCover } from "@/lib/services/imageGeneration";
import type { ProjectFormData } from "@/lib/services/imageGeneration";
import { createServerSupabaseClient } from "@/lib/auth/server";

/**
 * POST /api/generate-cover
 * Generate a cover image for a project using AI
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
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
    const { title, shortDescription, fullDescription, category } = body;

    if (!title || !shortDescription) {
      return NextResponse.json(
        { error: "Title and short description are required" },
        { status: 400 },
      );
    }

    // Generar imagen
    const formData: ProjectFormData = {
      title,
      shortDescription,
      fullDescription,
      category,
    };

    const imageFile = await generateProjectCover(formData);

    if (!imageFile) {
      return NextResponse.json(
        { error: "Failed to generate image" },
        { status: 500 },
      );
    }

    // Convertir el archivo generado a buffer
    const imageBuffer = Buffer.from(imageFile.uint8Array);

    // Generar nombre único para la imagen
    const fileName = `generated-cover-${Date.now()}.png`;
    const filePath = `covers/${user.id}/${fileName}`;

    // Subir a Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("project-images")
      .upload(filePath, imageBuffer, {
        contentType: "image/png",
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Failed to upload image: ${uploadError.message}`);
    }

    // Obtener URL pública
    const {
      data: { publicUrl },
    } = supabase.storage.from("project-images").getPublicUrl(filePath);

    return NextResponse.json(
      {
        url: publicUrl,
        generated: true,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate cover image",
      },
      { status: 500 },
    );
  }
}
