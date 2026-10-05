"use client";

import { motion } from "framer-motion";
import { Filter } from "lucide-react";

interface MorphingCategoryPillsProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export default function MorphingCategoryPills({
  categories,
  selectedCategory,
  onSelectCategory,
}: MorphingCategoryPillsProps) {
  return (
    <div className="flex items-center space-x-2 overflow-x-auto scrollbar-none py-2 relative">
      <Filter className="w-4 h-4 text-slate-400 shrink-0 mr-1" />
      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
        Taxonomies:
      </span>

      {categories.map((category) => {
        const isSelected = selectedCategory === category;

        return (
          <button
            key={category}
            onClick={() => onSelectCategory(category)}
            className={`relative px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-colors z-10 focus:outline-none ${
              isSelected ? "text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {/* Morphing Background Capsule (PDR Section 4.2) */}
            {isSelected && (
              <motion.div
                layoutId="activeMorphingCapsule"
                className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl border border-indigo-400/40 shadow-lg shadow-indigo-600/30 -z-10"
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 28,
                }}
              />
            )}
            <span>{category}</span>
          </button>
        );
      })}
    </div>
  );
}
