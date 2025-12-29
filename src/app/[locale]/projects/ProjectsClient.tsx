"use client";

import { useState, useMemo } from "react";
import type { Project } from "@/lib/supabase/types";
import ProjectCard from "./ProjectCard";
import CategoryFilter from "./CategoryFilter";
import SortFilter, { type SortOption } from "./SortFilter";

interface ProjectsClientProps {
  projects: Project[];
}

export default function ProjectsClient({ projects }: ProjectsClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSort, setSelectedSort] = useState<SortOption>("recent");

  // Calculate project counts per category
  const projectCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    projects.forEach((project) => {
      const category = project.category || "other";
      counts[category] = (counts[category] || 0) + 1;
    });
    return counts;
  }, [projects]);

  // Filter and sort projects
  const filteredAndSortedProjects = useMemo(() => {
    // First, filter by category
    let filtered = projects;
    if (selectedCategory) {
      filtered = projects.filter((project) => {
        const projectCategory = project.category || "other";
        return projectCategory === selectedCategory;
      });
    }

    // Then, sort based on selected option
    const sorted = [...filtered].sort((a, b) => {
      switch (selectedSort) {
        case "most-funded":
          // Sort by current_amount (descending)
          return Number(b.current_amount) - Number(a.current_amount);

        case "most-donors":
          // For now, we'll use current_amount as proxy
          // In the future, this should query the donations table
          // to count unique donors per project
          return Number(b.current_amount) - Number(a.current_amount);

        case "recent":
        default:
          // Sort by created_at (most recent first)
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
      }
    });

    return sorted;
  }, [projects, selectedCategory, selectedSort]);

  return (
    <>
      <CategoryFilter
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        projectCounts={projectCounts}
      />

      <SortFilter selectedSort={selectedSort} onSortChange={setSelectedSort} />

      {filteredAndSortedProjects.length === 0 ? (
        <div className="card-brutal p-12 text-center bg-white">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold mb-2">
            No hay proyectos en esta categoría
          </h2>
          <p className="text-gray-600 mb-6">
            Intenta seleccionar otra categoría o explora todos los proyectos
          </p>
          <button
            onClick={() => setSelectedCategory(null)}
            className="btn-brutal btn-brutal-primary"
          >
            Ver todos los proyectos
          </button>
        </div>
      ) : (
        <div className="masonry-grid">
          {filteredAndSortedProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </>
  );
}
