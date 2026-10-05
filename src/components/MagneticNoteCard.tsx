"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Eye, Trash2, Calendar, User, Sparkles, Bookmark, Share2, Check, ThumbsUp, MessageSquare, Flame, Search } from "lucide-react";
import { EnhancedNoteItem } from "./NoteCard";

interface MagneticNoteCardProps {
  note: EnhancedNoteItem;
  onPreview: (note: EnhancedNoteItem) => void;
  onDelete?: (id: string) => void;
  isAdmin?: boolean;
  index?: number;
  isBookmarked?: boolean;
  onToggleBookmark?: (note: EnhancedNoteItem) => void;
  onUpvote?: (id: string) => void;
}

export default function MagneticNoteCard({
  note,
  onPreview,
  onDelete,
  isAdmin,
  index = 0,
  isBookmarked = false,
  onToggleBookmark,
  onUpvote,
}: MagneticNoteCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [upvoteCount, setUpvoteCount] = useState(note.upvotes || 0);
  const [hasUpvoted, setHasUpvoted] = useState(false);

  // 3D Magnetic Tilt physics state
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });

  // Dynamic Spotlight "Flashlight" coordinates relative to card surface
  const [spotlightPos, setSpotlightPos] = useState({ x: -200, y: -200, opacity: 0 });

  const formattedDate = new Date(note.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const driveThumbnailUrl = `https://drive.google.com/thumbnail?id=${note.fileId}&sz=w600`;
  const isHighYield = upvoteCount >= 20;

  // 3D Magnetic Tilt and Spotlight calculation handler
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Calculate center offset for 3D tilt (-10deg to +10deg)
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateY = ((x - centerX) / centerX) * 10;
    const rotateX = -((y - centerY) / centerY) * 10;

    setTilt({ rotateX, rotateY });
    setSpotlightPos({ x, y, opacity: 1 });
  };

  const handleMouseLeave = () => {
    setTilt({ rotateX: 0, rotateY: 0 });
    setSpotlightPos((prev) => ({ ...prev, opacity: 0 }));
  };

  const handleUpvoteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasUpvoted) return;
    setUpvoteCount((prev) => prev + 1);
    setHasUpvoted(true);

    try {
      await fetch(`/api/notes/${note.id}/upvote`, { method: "POST" });
      if (onUpvote) onUpvote(note.id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/dashboard?noteId=${note.id}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      ref={cardRef}
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{
        duration: 0.4,
        delay: index * 0.04,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transformStyle: "preserve-3d",
        transform: `perspective(1000px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`,
      }}
      className={`group relative flex flex-col justify-between rounded-3xl p-6 backdrop-blur-2xl transition-all duration-200 shadow-2xl ${
        isHighYield
          ? "col-span-1 md:col-span-2 lg:col-span-2 bg-slate-900/80 border border-amber-500/40 shadow-amber-500/10"
          : "col-span-1 bg-slate-900/60 border border-white/5 hover:border-indigo-500/50"
      } overflow-hidden`}
    >
      {/* Dynamic Spotlight "Flashlight" Effect Layer (PDR Section 4.2) */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{
          opacity: spotlightPos.opacity,
          background: `radial-gradient(400px circle at ${spotlightPos.x}px ${spotlightPos.y}px, rgba(99, 102, 241, 0.22), transparent 80%)`,
        }}
      />

      {/* Ambient Glow */}
      <div className="absolute -top-16 -right-16 w-36 h-36 bg-indigo-500/10 group-hover:bg-indigo-500/20 rounded-full blur-3xl transition-all duration-500 pointer-events-none" />

      {/* Top Badges Header */}
      <div className="relative z-10">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Course Code Badge */}
            <span className="px-2.5 py-1 rounded-lg bg-indigo-500/20 border border-indigo-400/40 text-indigo-200 text-xs font-bold font-mono">
              {note.courseCode || "CS-101"}
            </span>

            {/* Subject Badge */}
            <span className="px-2.5 py-1 rounded-lg bg-slate-800/80 border border-white/10 text-slate-300 text-xs font-semibold">
              {note.subject}
            </span>

            {/* High-Yield Badge */}
            {isHighYield && (
              <span className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center space-x-1.5 animate-pulse">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>High-Yield Priority</span>
              </span>
            )}
          </div>

          <div className="flex items-center space-x-1 shrink-0">
            {/* Upvote Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleUpvoteClick}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border transition-colors ${
                hasUpvoted
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                  : "bg-slate-950/80 hover:bg-slate-800 text-slate-300 border-white/10"
              }`}
              title="Upvote High-Yield Note"
            >
              <ThumbsUp className={`w-3.5 h-3.5 ${hasUpvoted ? "fill-emerald-400" : ""}`} />
              <span>{upvoteCount}</span>
            </motion.button>

            {/* Share Link */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleShare}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Copy share link"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            </motion.button>

            {/* Bookmark Toggle */}
            {onToggleBookmark && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleBookmark(note);
                }}
                className={`p-1.5 rounded-lg transition-colors ${
                  isBookmarked
                    ? "text-amber-400 bg-amber-500/10"
                    : "text-slate-400 hover:text-amber-300 hover:bg-slate-800"
                }`}
                title={isBookmarked ? "Remove Bookmark" : "Save to Favorites"}
              >
                <Bookmark className={`w-4 h-4 ${isBookmarked ? "fill-amber-400" : ""}`} />
              </motion.button>
            )}

            {/* Admin Delete */}
            {isAdmin && onDelete && (
              <motion.button
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm(`Are you sure you want to delete "${note.title}"?`)) {
                    onDelete(note.id);
                  }
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                title="Delete Note"
              >
                <Trash2 className="w-4 h-4" />
              </motion.button>
            )}
          </div>
        </div>

        {/* Note Title */}
        <h3 className={`font-bold text-white group-hover:text-indigo-300 transition-colors mb-2 ${
          isHighYield ? "text-xl sm:text-2xl" : "text-base sm:text-lg"
        }`}>
          {note.title}
        </h3>

        {/* Description */}
        <p className="text-xs sm:text-sm text-slate-400 line-clamp-2 mb-4 leading-relaxed">
          {note.description || "Curated academic resource and study material available for instant zero-download preview."}
        </p>

        {/* OCR Search Highlight Badge */}
        {note.ocrText && (
          <div className="mb-4 px-3 py-1.5 rounded-xl bg-slate-950/90 border border-white/10 text-xs text-slate-400 flex items-center space-x-2 truncate">
            <Search className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="truncate">OCR Index: "{note.ocrText.slice(0, 55)}..."</span>
          </div>
        )}

        {/* Thumbnail Preview Container */}
        <div
          onClick={() => onPreview(note)}
          className={`relative w-full rounded-2xl bg-slate-950/90 border border-white/10 overflow-hidden mb-4 cursor-pointer group/thumb flex items-center justify-center ${
            isHighYield ? "h-44 sm:h-52" : "h-32"
          }`}
        >
          <div className="absolute inset-0 bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:16px_16px] opacity-25" />

          <img
            src={driveThumbnailUrl}
            alt={note.title}
            className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover/thumb:opacity-85 group-hover/thumb:scale-105 transition-all duration-500"
            onError={(e) => {
              (e.target as HTMLElement).style.display = "none";
            }}
          />

          <motion.div
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            className="relative z-10 flex items-center space-x-2 px-4 py-2.5 rounded-full bg-indigo-600/90 hover:bg-indigo-600 text-white font-medium text-xs shadow-2xl backdrop-blur-md border border-indigo-400/40"
          >
            <Eye className="w-4 h-4" />
            <span>Launch Floating Viewer</span>
          </motion.div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="relative z-10 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center space-x-2 truncate max-w-[180px]">
          <User className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <span className="truncate">{note.uploader?.name || "Admin"}</span>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1 text-slate-400" title="Q&A Discussion Comments">
            <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
            <span>{note._count?.comments || 0}</span>
          </div>

          <div className="flex items-center space-x-1 text-slate-400">
            <Calendar className="w-3.5 h-3.5 shrink-0" />
            <span>{formattedDate}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
