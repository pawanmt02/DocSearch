"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Command, BookOpen, Sparkles, X, FileText, ArrowRight, ShieldCheck, Flame, User, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { EnhancedNoteItem } from "./NoteCard";

interface CommandIslandProps {
  user?: {
    name: string;
    email: string;
    role: "ADMIN" | "STUDENT";
  } | null;
  searchQuery: string;
  onSearch: (q: string) => void;
  notes: EnhancedNoteItem[];
  onSelectNote: (note: EnhancedNoteItem) => void;
  onOpenIngest?: () => void;
}

export default function CommandIsland({
  user,
  searchQuery,
  onSearch,
  notes,
  onSelectNote,
  onOpenIngest,
}: CommandIslandProps) {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [paletteQuery, setPaletteQuery] = useState("");

  // Handle scroll to shrink/expand Command Island
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 60) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle Ctrl+K / Cmd+K global shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsPaletteOpen((prev) => !prev);
      }
      if (e.key === "Escape" && isPaletteOpen) {
        setIsPaletteOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPaletteOpen]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const filteredPaletteNotes = notes.filter((n) => {
    if (!paletteQuery.trim()) return true;
    const q = paletteQuery.toLowerCase();
    return (
      n.title.toLowerCase().includes(q) ||
      n.subject.toLowerCase().includes(q) ||
      n.tag.toLowerCase().includes(q) ||
      (n.courseCode && n.courseCode.toLowerCase().includes(q))
    );
  });

  return (
    <>
      {/* Central Floating Command Island (PDR Section 4.2) */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
        className="fixed top-4 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-2xl"
      >
        <motion.div
          animate={{
            paddingTop: isScrolled ? "0.5rem" : "0.75rem",
            paddingBottom: isScrolled ? "0.5rem" : "0.75rem",
            scale: isScrolled ? 0.98 : 1,
          }}
          className="relative flex items-center justify-between px-4 sm:px-6 rounded-full bg-slate-900/80 border border-white/10 backdrop-blur-2xl shadow-[0_16px_36px_rgba(0,0,0,0.6)] transition-all"
        >
          {/* Brand Logo & Indicator */}
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20">
              <BookOpen className="w-4 h-4" />
            </div>
            <div className="hidden sm:block">
              <span className="text-sm font-extrabold text-white tracking-tight">
                Doc<span className="text-indigo-400">Search</span>
              </span>
            </div>
          </div>

          {/* Center Interactive Search Trigger Bar */}
          <button
            onClick={() => setIsPaletteOpen(true)}
            className="flex-1 max-w-xs sm:max-w-md mx-3 px-3.5 py-1.5 rounded-full bg-slate-950/70 border border-white/10 text-xs text-slate-400 flex items-center justify-between hover:border-indigo-500/50 hover:text-slate-200 transition-all cursor-pointer"
          >
            <div className="flex items-center space-x-2 truncate">
              <Search className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span className="truncate">{searchQuery || "Search materials, course codes..."}</span>
            </div>
            <div className="hidden sm:flex items-center space-x-1 px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono font-bold text-slate-400 border border-white/10">
              <Command className="w-3 h-3" />
              <span>K</span>
            </div>
          </button>

          {/* Right User Status & Actions */}
          <div className="flex items-center space-x-2">
            {user?.role === "ADMIN" && onOpenIngest && (
              <button
                onClick={onOpenIngest}
                className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg transition-transform active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ingest</span>
              </button>
            )}

            <div className="flex items-center space-x-1 bg-slate-950/80 border border-white/10 rounded-full px-2.5 py-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-bold text-slate-300 capitalize truncate max-w-[70px]">
                {user?.name?.split(" ")[0] || "Guest"}
              </span>
              <button
                onClick={handleLogout}
                className="ml-1 p-1 text-slate-400 hover:text-red-400 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Full-Screen Ctrl+K Command Palette Search Modal (PDR Section 4.2) */}
      <AnimatePresence>
        {isPaletteOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 overflow-hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPaletteOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            />

            {/* Command Palette Card */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: -20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: -20 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="relative z-10 w-full max-w-2xl bg-slate-900 border border-white/15 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[75vh]"
            >
              {/* Palette Input Header */}
              <div className="flex items-center px-5 py-4 border-b border-white/10 bg-slate-950/80">
                <Search className="w-5 h-5 text-indigo-400 shrink-0 mr-3" />
                <input
                  type="text"
                  autoFocus
                  value={paletteQuery}
                  onChange={(e) => {
                    setPaletteQuery(e.target.value);
                    onSearch(e.target.value);
                  }}
                  placeholder="Search by note title, subject, course code (e.g. CS-301), tag..."
                  className="w-full bg-transparent text-white text-base focus:outline-none placeholder-slate-500 font-sans"
                />
                <button
                  onClick={() => setIsPaletteOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Palette Search Results List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {filteredPaletteNotes.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 text-xs">
                    No matching study materials found for "{paletteQuery}"
                  </div>
                ) : (
                  filteredPaletteNotes.map((note) => (
                    <div
                      key={note.id}
                      onClick={() => {
                        onSelectNote(note);
                        setIsPaletteOpen(false);
                      }}
                      className="group p-3.5 rounded-2xl bg-slate-950/60 hover:bg-indigo-950/40 border border-white/5 hover:border-indigo-500/40 transition-all cursor-pointer flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3 overflow-hidden">
                        <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-400 shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="truncate">
                          <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 truncate">
                            {note.title}
                          </h4>
                          <div className="flex items-center space-x-2 text-xs text-slate-400 mt-0.5">
                            <span className="font-mono text-indigo-400 font-semibold">{note.courseCode}</span>
                            <span>•</span>
                            <span>{note.subject}</span>
                            <span>•</span>
                            <span className="text-emerald-400">#{note.tag}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        {note.upvotes && note.upvotes >= 20 && (
                          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold flex items-center space-x-1">
                            <Flame className="w-3 h-3 text-amber-400" />
                            <span>High-Yield</span>
                          </span>
                        )}
                        <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Palette Footer */}
              <div className="px-5 py-3 bg-slate-950 border-t border-white/10 text-xs text-slate-400 flex items-center justify-between">
                <span>Quick Search Palette</span>
                <div className="flex items-center space-x-3">
                  <span>Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">ESC</kbd> to close</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
