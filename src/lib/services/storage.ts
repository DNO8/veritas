import { supabaseServer } from "../supabase/server";

const STORAGE_BUCKET = "project-images";

export interface UploadImageResult {
  url: string;
  path: string;
}

export async function uploadProjectImage(
  file: File,
  projectId: string,
): Promise<UploadImageResult> {
  if (!file) {
    throw new Error("File is required");
  }

  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
  ];
  if (!allowedTypes.includes(file.type)) {
    throw new Error(
      "Invalid file type. Only JPEG, PNG, WebP and GIF are allowed",
    );
  }

  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error("File size must be less than 5MB");
  }

  const fileExt = file.name.split(".").pop();
  const fileName = `${projectId}-${Date.now()}.${fileExt}`;
  const filePath = `covers/${fileName}`;

  const { data, error } = await supabaseServer.storage
    .from(STORAGE_BUCKET)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    throw new Error(`Failed to upload image: ${error.message}`);
  }

  const { data: urlData } = supabaseServer.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(data.path);

  return {
    url: urlData.publicUrl,
    path: data.path,
  };
}

export async function uploadProjectMedia(
  file: File,
  projectId: string,
): Promise<UploadImageResult> {
  if (!file) {
    throw new Error("File is required");
  }

  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
    "video/mp4",
    "video/webm",
  ];
  if (!allowedTypes.includes(file.type)) {
    throw new Error("Invalid file type");
  }

  const maxSize = 50 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error("File size must be less than 50MB");
  }

  const fileExt = file.name.split(".").pop();
  const fileName = `${projectId}-media-${Date.now()}.${fileExt}`;
  const filePath = `media/${fileName}`;

  const { data, error } = await supabaseServer.storage
    .from(STORAGE_BUCKET)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    throw new Error(`Failed to upload media: ${error.message}`);
  }

  const { data: urlData } = supabaseServer.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(data.path);

  return {
    url: urlData.publicUrl,
    path: data.path,
  };
}

export async function deleteImage(path: string): Promise<void> {
  const { error } = await supabaseServer.storage
    .from(STORAGE_BUCKET)
    .remove([path]);

  if (error) {
    throw new Error(`Failed to delete image: ${error.message}`);
  }
}
