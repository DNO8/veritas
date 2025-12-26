import { supabaseServer } from "../supabase/server";
import type { Project, ProjectStatus } from "../supabase/types";

export async function getProjectById(
  projectId: string,
): Promise<Project | null> {
  if (!projectId) {
    throw new Error("Project ID is required");
  }

  const { data, error } = await supabaseServer
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw new Error(`Failed to fetch project: ${error.message}`);
  }

  return data;
}

export async function getPublishedProjects(
  limit = 50,
  offset = 0,
): Promise<Project[]> {
  const { data, error } = await supabaseServer
    .from("projects")
    .select("*")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    throw new Error(`Failed to fetch projects: ${error.message}`);
  }

  return (data as Project[]) || [];
}

export async function getProjectsByOwnerId(
  ownerId: string,
): Promise<Project[]> {
  if (!ownerId) {
    throw new Error("Owner ID is required");
  }

  const { data, error } = await supabaseServer
    .from("projects")
    .select("*")
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch user projects: ${error.message}`);
  }

  return data || [];
}

export interface CreateProjectInput {
  ownerId: string;
  title: string;
  shortDescription: string;
  fullDescription?: string;
  category?: string;
  coverImageUrl: string;
  generatedCover?: boolean;
  goalAmount?: string;
  walletAddress?: string;
}

export async function createProject(
  input: CreateProjectInput,
): Promise<Project> {
  if (!input.ownerId) {
    throw new Error("Owner ID is required");
  }
  if (!input.title || input.title.trim().length === 0) {
    throw new Error("Title is required");
  }
  if (!input.shortDescription || input.shortDescription.trim().length === 0) {
    throw new Error("Short description is required");
  }
  if (!input.coverImageUrl || input.coverImageUrl.trim().length === 0) {
    throw new Error("Cover image URL is required");
  }

  const { data, error } = await supabaseServer
    .from("projects")
    .insert({
      owner_id: input.ownerId,
      title: input.title,
      short_description: input.shortDescription,
      full_description: input.fullDescription || null,
      category: input.category || null,
      cover_image_url: input.coverImageUrl,
      generated_cover: input.generatedCover || false,
      goal_amount: input.goalAmount || null,
      wallet_address: input.walletAddress || null,
      status: "draft",
    } as never)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create project: ${error.message}`);
  }

  return data;
}

export async function updateProjectStatus(
  projectId: string,
  status: ProjectStatus,
): Promise<Project> {
  if (!projectId) {
    throw new Error("Project ID is required");
  }

  const validStatuses: ProjectStatus[] = ["draft", "published", "paused"];
  if (!validStatuses.includes(status)) {
    throw new Error("Invalid project status");
  }

  const { data, error } = await supabaseServer
    .from("projects")
    .update({ status } as never)
    .eq("id", projectId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update project status: ${error.message}`);
  }

  return data;
}

export async function updateProjectAmount(
  projectId: string,
  amount: string,
): Promise<Project> {
  if (!projectId) {
    throw new Error("Project ID is required");
  }

  const numAmount = Number(amount);
  if (Number.isNaN(numAmount) || numAmount < 0) {
    throw new Error("Invalid amount");
  }

  const { data, error } = await supabaseServer
    .from("projects")
    .update({ current_amount: amount } as never)
    .eq("id", projectId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update project amount: ${error.message}`);
  }

  return data;
}

export async function incrementProjectAmount(
  projectId: string,
  incrementAmount: string,
): Promise<Project> {
  if (!projectId) {
    throw new Error("Project ID is required");
  }

  const numIncrement = Number(incrementAmount);
  if (Number.isNaN(numIncrement) || numIncrement <= 0) {
    throw new Error("Invalid increment amount");
  }

  const project = await getProjectById(projectId);
  if (!project) {
    throw new Error("Project not found");
  }

  const currentAmount = Number(project.current_amount);
  const newAmount = (currentAmount + numIncrement).toString();

  return updateProjectAmount(projectId, newAmount);
}
