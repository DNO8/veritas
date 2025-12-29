"use client";

import { motion } from "framer-motion";

interface CategoryFilterProps {
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
  projectCounts: Record<string, number>;
}

const CATEGORIES = [
  { id: null, label: "Todos", icon: "🌟" },
  { id: "technology", label: "Tecnología", icon: "💻" },
  { id: "art", label: "Arte", icon: "🎨" },
  { id: "music", label: "Música", icon: "🎵" },
  { id: "education", label: "Educación", icon: "📚" },
  { id: "health", label: "Salud", icon: "🏥" },
  { id: "environment", label: "Medio Ambiente", icon: "🌱" },
  { id: "social", label: "Social", icon: "🤝" },
  { id: "business", label: "Negocios", icon: "💼" },
  { id: "food", label: "Comida", icon: "🍕" },
  { id: "sports", label: "Deportes", icon: "⚽" },
  { id: "other", label: "Otro", icon: "📦" },
];

export default function CategoryFilter({
  selectedCategory,
  onCategoryChange,
  projectCounts,
}: CategoryFilterProps) {
  return (
    <div className="bg-white border-4 border-black shadow-[6px_6px_0px_#000] p-6 mb-8">
      <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
        🔍 Filtrar por Categoría
      </h2>

      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((category) => {
          const count =
            category.id === null
              ? Object.values(projectCounts).reduce(
                  (sum, count) => sum + count,
                  0,
                )
              : projectCounts[category.id] || 0;

          const isSelected = selectedCategory === category.id;

          return (
            <motion.button
              key={category.id || "all"}
              onClick={() => onCategoryChange(category.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`
                px-4 py-2 border-2 border-black font-bold text-sm
                transition-all duration-200
                ${
                  isSelected
                    ? "bg-[#FDCB6E] shadow-[4px_4px_0px_#000]"
                    : "bg-white hover:bg-gray-50 shadow-[2px_2px_0px_#000]"
                }
              `}
            >
              <span className="flex items-center gap-2">
                <span>{category.icon}</span>
                <span>{category.label}</span>
                {count > 0 && (
                  <span
                    className={`
                    px-2 py-0.5 rounded-full text-xs font-mono
                    ${isSelected ? "bg-black text-white" : "bg-gray-200 text-gray-700"}
                  `}
                  >
                    {count}
                  </span>
                )}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
