"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, LogOut, ShieldCheck, User, PlusCircle, Search, Sparkles } from "lucide-react";

interface NavbarProps {
  user?: {
    name: string;
    email: string;
    role: "ADMIN" | "STUDENT";
  } | null;
  onSearch?: (query: string) => void;
  searchQuery?: string;
  onOpenIngestModal?: () => void;
}

export default function Navbar({ user, onSearch, searchQuery = "", onOpenIngestModal }: NavbarProps) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (e) {
      console.error(e);
      setLoggingOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-slate-950/80 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link href={user?.role === "ADMIN" ? "/admin" : "/dashboard"} className="flex items-center space-x-3 group">
          <div className="relative p-2.5 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <BookOpen className="w-5 h-5" />
            <Sparkles className="w-3 h-3 absolute -top-1 -right-1 text-amber-300 animate-pulse" />
          </div>
          <div>
            <span className="text-lg font-black tracking-tight text-white group-hover:text-indigo-300 transition-colors">
              Doc<span className="text-indigo-400">Search</span>
            </span>
            <span className="hidden sm:block text-[10px] uppercase font-bold tracking-widest text-slate-400 -mt-1">
              Curated Academic Hub
            </span>
          </div>
        </Link>

        {/* Global Search Bar */}
        {onSearch && (
          <div className="flex-1 max-w-md hidden sm:block">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearch(e.target.value)}
                placeholder="Search quantum physics, neural networks, chemistry..."
                className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-900/90 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/60 transition-all"
              />
            </div>
          </div>
        )}

        {/* Right User Actions */}
        <div className="flex items-center space-x-3">
          {user?.role === "ADMIN" && onOpenIngestModal && (
            <button
              onClick={onOpenIngestModal}
              className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium text-xs shadow-lg shadow-indigo-500/20 transition-all border border-indigo-400/30"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden md:inline">Ingest Material</span>
            </button>
          )}

          {user && (
            <div className="flex items-center space-x-3 bg-slate-900/80 border border-white/10 rounded-xl px-3 py-1.5">
              <div className="flex items-center space-x-2">
                <div className="p-1 rounded-lg bg-indigo-500/20 text-indigo-400">
                  {user.role === "ADMIN" ? (
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <User className="w-4 h-4 text-indigo-400" />
                  )}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-semibold text-white leading-none truncate max-w-[120px]">
                    {user.name}
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 tracking-wider mt-0.5 uppercase">
                    {user.role}
                  </p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
