import { supabaseServer } from "../supabase/server";

export interface RoadmapItem {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  estimated_cost: string | null;
  order_index: number;
  created_at: string;
}

export interface CreateRoadmapItemInput {
  projectId: string;
  title: string;
  description?: string;
  estimatedCost?: string;
  orderIndex: number;
}

export interface UpdateRoadmapItemInput {
  title?: string;
  description?: string;
  estimatedCost?: string;
  orderIndex?: number;
}

/**
 * Obtener todos los roadmap items de un proyecto
 */
export async function getRoadmapItemsByProjectId(
  projectId: string,
): Promise<RoadmapItem[]> {
  if (!projectId) {
    throw new Error("Project ID is required");
  }

  const { data, error } = await supabaseServer
    .from("project_roadmap_items")
    .select("*")
    .eq("project_id", projectId)
    .order("order_index", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch roadmap items: ${error.message}`);
  }

  return (data as RoadmapItem[]) || [];
}

/**
 * Crear un roadmap item
 */
export async function createRoadmapItem(
  input: CreateRoadmapItemInput,
): Promise<RoadmapItem> {
  // Validaciones
  if (!input.projectId) {
    throw new Error("Project ID is required");
  }

  if (!input.title || input.title.trim().length === 0) {
    throw new Error("Title is required");
  }

  if (input.title.trim().length > 200) {
    throw new Error("Title must be 200 characters or less");
  }

  if (input.description && input.description.trim().length > 1000) {
    throw new Error("Description must be 1000 characters or less");
  }

  if (input.estimatedCost) {
    const cost = Number(input.estimatedCost);
    if (Number.isNaN(cost) || cost < 0) {
      throw new Error("Estimated cost must be a positive number");
    }
  }

  if (input.orderIndex < 0) {
    throw new Error("Order index must be non-negative");
  }

  const { data, error } = await supabaseServer
    .from("project_roadmap_items")
    .insert({
      project_id: input.projectId,
      title: input.title.trim(),
      description: input.description?.trim() || null,
      estimated_cost: input.estimatedCost || null,
      order_index: input.orderIndex,
    } as never)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create roadmap item: ${error.message}`);
  }

  return data as RoadmapItem;
}

/**
 * Actualizar un roadmap item
 */
export async function updateRoadmapItem(
  itemId: string,
  input: UpdateRoadmapItemInput,
): Promise<RoadmapItem> {
  if (!itemId) {
    throw new Error("Roadmap item ID is required");
  }

  // Validaciones
  if (input.title !== undefined) {
    if (input.title.trim().length === 0) {
      throw new Error("Title cannot be empty");
    }
    if (input.title.trim().length > 200) {
      throw new Error("Title must be 200 characters or less");
    }
  }

  if (
    input.description !== undefined &&
    input.description.trim().length > 1000
  ) {
    throw new Error("Description must be 1000 characters or less");
  }

  if (input.estimatedCost !== undefined) {
    const cost = Number(input.estimatedCost);
    if (Number.isNaN(cost) || cost < 0) {
      throw new Error("Estimated cost must be a positive number");
    }
  }

  if (input.orderIndex !== undefined && input.orderIndex < 0) {
    throw new Error("Order index must be non-negative");
  }

  // Construir objeto de actualización
  const updateData: Record<string, any> = {};

  if (input.title !== undefined) {
    updateData.title = input.title.trim();
  }
  if (input.description !== undefined) {
    updateData.description = input.description.trim() || null;
  }
  if (input.estimatedCost !== undefined) {
    updateData.estimated_cost = input.estimatedCost || null;
  }
  if (input.orderIndex !== undefined) {
    updateData.order_index = input.orderIndex;
  }

  const { data, error } = await supabaseServer
    .from("project_roadmap_items")
    .update(updateData as never)
    .eq("id", itemId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update roadmap item: ${error.message}`);
  }

  return data as RoadmapItem;
}

/**
 * Eliminar un roadmap item
 */
export async function deleteRoadmapItem(itemId: string): Promise<void> {
  if (!itemId) {
    throw new Error("Roadmap item ID is required");
  }

  const { error } = await supabaseServer
    .from("project_roadmap_items")
    .delete()
    .eq("id", itemId);

  if (error) {
    throw new Error(`Failed to delete roadmap item: ${error.message}`);
  }
}

/**
 * Crear múltiples roadmap items en batch
 */
export async function createRoadmapItemsBatch(
  projectId: string,
  items: Omit<CreateRoadmapItemInput, "projectId">[],
): Promise<RoadmapItem[]> {
  if (!projectId) {
    throw new Error("Project ID is required");
  }

  if (!items || items.length === 0) {
    return [];
  }

  // Validar todos los items
  items.forEach((item, index) => {
    if (!item.title || item.title.trim().length === 0) {
      throw new Error(`Item ${index + 1}: Title is required`);
    }
    if (item.title.trim().length > 200) {
      throw new Error(
        `Item ${index + 1}: Title must be 200 characters or less`,
      );
    }
  });

  const itemsToInsert = items.map((item) => ({
    project_id: projectId,
    title: item.title.trim(),
    description: item.description?.trim() || null,
    estimated_cost: item.estimatedCost || null,
    order_index: item.orderIndex,
  }));

  const { data, error } = await supabaseServer
    .from("project_roadmap_items")
    .insert(itemsToInsert as never)
    .select();

  if (error) {
    throw new Error(`Failed to create roadmap items: ${error.message}`);
  }

  return (data as RoadmapItem[]) || [];
}

/**
 * Verificar si un proyecto tiene roadmap items
 */
export async function projectHasRoadmap(projectId: string): Promise<boolean> {
  if (!projectId) {
    throw new Error("Project ID is required");
  }

  const { data, error } = await supabaseServer
    .from("project_roadmap_items")
    .select("id")
    .eq("project_id", projectId)
    .limit(1);

  if (error) {
    throw new Error(`Failed to check roadmap: ${error.message}`);
  }

  return data && data.length > 0;
}
