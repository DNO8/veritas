"use client";

import { motion } from "framer-motion";

export type SortOption = "recent" | "most-funded" | "most-donors";

interface SortFilterProps {
  selectedSort: SortOption;
  onSortChange: (sort: SortOption) => void;
}

const SORT_OPTIONS = [
  { id: "recent" as SortOption, label: "Más Recientes", icon: "🕐" },
  { id: "most-funded" as SortOption, label: "Más Donados", icon: "💰" },
  { id: "most-donors" as SortOption, label: "Más Donadores", icon: "👥" },
];

export default function SortFilter({
  selectedSort,
  onSortChange,
}: SortFilterProps) {
  return (
    <div className="bg-white border-4 border-black shadow-[6px_6px_0px_#000] p-6 mb-8">
      <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
        📊 Ordenar por
      </h2>

      <div className="flex flex-wrap gap-2">
        {SORT_OPTIONS.map((option) => {
          const isSelected = selectedSort === option.id;

          return (
            <motion.button
              key={option.id}
              onClick={() => onSortChange(option.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`
                px-4 py-2 border-2 border-black font-bold text-sm
                transition-all duration-200
                ${
                  isSelected
                    ? "bg-[#E67E22] text-white shadow-[4px_4px_0px_#000]"
                    : "bg-white hover:bg-gray-50 shadow-[2px_2px_0px_#000]"
                }
              `}
            >
              <span className="flex items-center gap-2">
                <span>{option.icon}</span>
                <span>{option.label}</span>
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
