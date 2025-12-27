import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/auth/server";
import { supabaseServer } from "@/lib/supabase/server";
import { getProjectById } from "@/lib/services/projects";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const { data, error } = await supabaseServer
      .from("project_media")
      .select("*")
      .eq("project_id", id)
      .order("order_index", { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch media: ${error.message}`);
    }

    return NextResponse.json({ media: data || [] }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch media",
      },
      { status: 500 },
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const project = await getProjectById(id);

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (project.owner_id !== user.id) {
      return NextResponse.json(
        { error: "Forbidden - You can only add media to your own projects" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { url, type = "image" } = body;

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Get current max order_index
    const { data: existingMedia } = await supabaseServer
      .from("project_media")
      .select("order_index")
      .eq("project_id", id)
      .order("order_index", { ascending: false })
      .limit(1);

    const nextOrderIndex =
      existingMedia && existingMedia.length > 0
        ? (existingMedia[0] as any).order_index + 1
        : 0;

    const { data, error } = await supabaseServer
      .from("project_media")
      .insert({
        project_id: id,
        url,
        type,
        order_index: nextOrderIndex,
      } as never)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to add media: ${error.message}`);
    }

    return NextResponse.json({ media: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to add media",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const project = await getProjectById(id);

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (project.owner_id !== user.id) {
      return NextResponse.json(
        {
          error: "Forbidden - You can only delete media from your own projects",
        },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(request.url);
    const mediaId = searchParams.get("mediaId");

    if (!mediaId) {
      return NextResponse.json(
        { error: "Media ID is required" },
        { status: 400 },
      );
    }

    const { error } = await supabaseServer
      .from("project_media")
      .delete()
      .eq("id", mediaId)
      .eq("project_id", id);

    if (error) {
      throw new Error(`Failed to delete media: ${error.message}`);
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to delete media",
      },
      { status: 500 },
    );
  }
}
