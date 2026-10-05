"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Search, ShieldCheck, Bookmark, User, PlusCircle } from "lucide-react";

interface LiquidNavbarProps {
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  isAdmin?: boolean;
}

export default function LiquidNavbar({ activeTab, onSelectTab, isAdmin = false }: LiquidNavbarProps) {
  const tabs = [
    { id: "all", label: "Library", icon: BookOpen },
    { id: "search", label: "Search", icon: Search },
    ...(isAdmin ? [{ id: "ingest", label: "Ingest", icon: PlusCircle }] : []),
    { id: "saved", label: "Saved", icon: Bookmark },
    { id: "profile", label: "Account", icon: User },
  ];

  const activeIndex = Math.max(
    0,
    tabs.findIndex((t) => t.id === activeTab)
  );

  return (
    <div className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-md">
      {/* Container with Gooey Filter applied (PDR Section 4.2: #gooey-filter) */}
      <div className="relative bg-slate-900/90 backdrop-blur-xl border border-white/15 rounded-full px-3 py-2 shadow-2xl overflow-hidden">
        <div
          className="relative flex items-center justify-around w-full"
          style={{ filter: "url(#gooey-filter)" }}
        >
          {/* Animated Liquid Blob Indicator */}
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 h-10 w-10 bg-indigo-500 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.6)]"
            initial={false}
            animate={{
              x: `${activeIndex * 100}%`,
              left: "calc(0% + 4px)",
            }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 28,
              mass: 0.8,
            }}
          />

          {/* Navigation Items */}
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className="relative z-10 flex flex-col items-center justify-center w-12 h-12 rounded-full focus:outline-none transition-colors"
                title={tab.label}
              >
                <motion.div
                  animate={{
                    scale: isActive ? 1.15 : 1,
                    color: isActive ? "#ffffff" : "#94a3b8",
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <Icon className="w-5 h-5" />
                </motion.div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
