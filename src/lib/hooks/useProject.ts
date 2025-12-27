"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import type { Project } from "@/lib/supabase/types";

interface ProjectMedia {
  id: string;
  url: string;
  type: string;
  order_index: number;
}

interface RoadmapItem {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  estimated_cost: string | null;
  order_index: number;
}

interface Donation {
  id: string;
  donor_wallet: string;
  amount: string;
  asset: string;
  tx_hash: string;
  network: string;
  created_at: string;
}

export function useProject(projectId: string) {
  const [project, setProject] = useState<Project | null>(null);
  const [galleryImages, setGalleryImages] = useState<ProjectMedia[]>([]);
  const [roadmapItems, setRoadmapItems] = useState<RoadmapItem[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch project with cache busting
        const res = await fetch(`/api/projects/${projectId}?t=${Date.now()}`, {
          credentials: "include",
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error("Failed to fetch project");
        }

        // Verificar que la respuesta sea JSON
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Invalid response format");
        }

        const data = await res.json();
        setProject(data.project);

        // Check ownership (solo si hay usuario)
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user && data.project.owner_id === user.id) {
          setIsOwner(true);
        }

        // Fetch gallery images
        const { data: mediaData } = await supabase
          .from("project_media")
          .select("*")
          .eq("project_id", projectId)
          .order("order_index", { ascending: true });

        if (mediaData) {
          setGalleryImages(mediaData as ProjectMedia[]);
        }

        // Fetch roadmap
        const roadmapRes = await fetch(`/api/projects/${projectId}/roadmap`, {
          credentials: "include",
        });

        if (roadmapRes.ok) {
          const roadmapData = await roadmapRes.json();
          setRoadmapItems(roadmapData.items || []);
        }

        // Fetch donations
        const { data: donationsData } = await supabase
          .from("donations")
          .select("*")
          .eq("project_id", projectId)
          .order("created_at", { ascending: false })
          .limit(10);

        if (donationsData) {
          setDonations(donationsData as Donation[]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load project");
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchProjectData();
    }
  }, [projectId]);

  return {
    project,
    galleryImages,
    roadmapItems,
    donations,
    isOwner,
    loading,
    error,
    refetch: () => {
      setLoading(true);
      // Trigger re-fetch by updating a dependency
    },
  };
}
