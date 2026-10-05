"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink, FileText, Maximize2, Minimize2, Shield, User, Eye, Bookmark, Share2, ZoomIn, ZoomOut, Check, Move, RotateCcw, ThumbsUp, MessageSquare, Send, Calendar } from "lucide-react";
import { EnhancedNoteItem } from "./NoteCard";

interface CommentItem {
  id: string;
  text: string;
  createdAt: string;
  user: {
    name: string;
    role: string;
  };
}

interface DocumentModalProps {
  note: EnhancedNoteItem | null;
  onClose: () => void;
  isBookmarked?: boolean;
  onToggleBookmark?: (note: EnhancedNoteItem) => void;
  onUpvote?: (id: string) => void;
}

export default function DocumentModal({
  note,
  onClose,
  isBookmarked = false,
  onToggleBookmark,
  onUpvote,
}: DocumentModalProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState<"DOCUMENT" | "DISCUSSIONS">("DOCUMENT");
  const [zoomLevel, setZoomLevel] = useState(100);
  const [copiedLink, setCopiedLink] = useState(false);
  const [upvotes, setUpvotes] = useState(note?.upvotes || 0);

  // Comments Q&A State
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [newCommentText, setNewCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  // Mouse Drag-to-Pan State
  const [isDragging, setIsDragging] = useState(false);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const initialOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    if (note) {
      setUpvotes(note.upvotes || 0);
      fetchComments(note.id);
    }
  }, [note]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const fetchComments = (noteId: string) => {
    fetch(`/api/notes/${noteId}/comments`)
      .then((res) => res.json())
      .then((data) => setComments(data.comments || []))
      .catch(console.error);
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !note) return;
    setSubmittingComment(true);

    try {
      const res = await fetch(`/api/notes/${note.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: newCommentText }),
      });

      const data = await res.json();
      if (res.ok) {
        setComments([data.comment, ...comments]);
        setNewCommentText("");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleUpvoteModal = async () => {
    if (!note) return;
    setUpvotes((prev) => prev + 1);
    try {
      await fetch(`/api/notes/${note.id}/upvote`, { method: "POST" });
      if (onUpvote) onUpvote(note.id);
    } catch (e) {
      console.error(e);
    }
  };

  if (!note) return null;

  const drivePreviewUrl = `https://drive.google.com/file/d/${note.fileId}/preview`;

  const handleCopyLink = () => {
    const shareUrl = `${window.location.origin}/dashboard?noteId=${note.id}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 25, 75));
  const handleResetPan = () => {
    setPanOffset({ x: 0, y: 0 });
    setZoomLevel(100);
  };

  // Mouse Drag-to-Pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    initialOffsetRef.current = { ...panOffset };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;
    setPanOffset({
      x: initialOffsetRef.current.x + deltaX,
      y: initialOffsetRef.current.y + deltaY,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-hidden">
        {/* Backdrop (PDR 4.3) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Floating Document Container */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 26, stiffness: 320 }}
          className={`relative z-10 flex flex-col w-full bg-slate-900/95 border border-white/15 rounded-2xl shadow-2xl backdrop-blur-2xl overflow-hidden transition-all duration-300 ${
            isFullscreen ? "h-full w-full max-w-none rounded-none" : "max-w-5xl h-[90vh]"
          }`}
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between px-5 py-3.5 bg-slate-950/90 border-b border-white/10 shrink-0 select-none">
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-lg font-bold text-white truncate max-w-md sm:max-w-xl">
                  {note.title}
                </h3>
                <div className="flex items-center space-x-2 text-xs text-slate-400 mt-0.5">
                  <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold font-mono">
                    {note.courseCode || "CS-101"}
                  </span>
                  <span>•</span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold">
                    {note.subject}
                  </span>
                  <span>•</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold">
                    #{note.tag}
                  </span>
                </div>
              </div>
            </div>

            {/* Controls Toolbar */}
            <div className="flex items-center space-x-2 shrink-0">
              {/* Tab Switcher: Document Viewer vs Q&A Discussions */}
              <div className="flex items-center p-1 bg-slate-800 border border-white/10 rounded-xl">
                <button
                  onClick={() => setActiveTab("DOCUMENT")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    activeTab === "DOCUMENT"
                      ? "bg-indigo-600 text-white shadow"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Document View
                </button>
                <button
                  onClick={() => setActiveTab("DISCUSSIONS")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all ${
                    activeTab === "DISCUSSIONS"
                      ? "bg-indigo-600 text-white shadow"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Q&A ({comments.length})</span>
                </button>
              </div>

              {/* Upvote Button */}
              <button
                onClick={handleUpvoteModal}
                className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25 text-xs font-bold transition-colors"
                title="Upvote High-Yield Note"
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>{upvotes}</span>
              </button>

              {/* Bookmark Button */}
              {onToggleBookmark && (
                <button
                  onClick={() => onToggleBookmark(note)}
                  className={`p-2 rounded-lg border transition-all ${
                    isBookmarked
                      ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                      : "bg-slate-800 hover:bg-slate-700 text-slate-300 border-white/10"
                  }`}
                  title={isBookmarked ? "Remove Bookmark" : "Save to Favorites"}
                >
                  <Bookmark className={`w-4 h-4 ${isBookmarked ? "fill-amber-400" : ""}`} />
                </button>
              )}

              {/* Share Link */}
              <button
                onClick={handleCopyLink}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-white/10"
                title="Copy Shareable Link"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
              </button>

              {/* Zoom Controls */}
              {activeTab === "DOCUMENT" && (
                <div className="hidden sm:flex items-center space-x-1 bg-slate-800 border border-white/10 rounded-lg p-1">
                  <button
                    onClick={handleZoomOut}
                    className="p-1 rounded text-slate-300 hover:text-white hover:bg-slate-700"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[11px] font-mono text-slate-300 px-1">{zoomLevel}%</span>
                  <button
                    onClick={handleZoomIn}
                    className="p-1 rounded text-slate-300 hover:text-white hover:bg-slate-700"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Fullscreen */}
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-white/10"
                title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors border border-red-500/30"
                title="Close Viewer (ESC)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Viewport Area */}
          {activeTab === "DOCUMENT" ? (
            /* Document Mouse Drag-to-Pan Viewport */
            <div
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className={`relative flex-1 bg-slate-950 w-full h-full overflow-hidden flex items-center justify-center select-none ${
                isDragging ? "cursor-grabbing" : "cursor-grab"
              }`}
            >
              <div
                className="w-full h-full transition-transform duration-75 relative"
                style={{
                  transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel / 100})`,
                  transformOrigin: "center center",
                }}
              >
                {isDragging && <div className="absolute inset-0 z-20 bg-transparent" />}

                <iframe
                  src={drivePreviewUrl}
                  className="w-full h-full border-0 pointer-events-auto"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                  title={note.title}
                />
              </div>
            </div>
          ) : (
            /* Q&A Discussions & Study Tips Panel */
            <div className="flex-1 bg-slate-950 p-6 overflow-y-auto font-sans">
              <div className="max-w-3xl mx-auto space-y-6">
                {/* Header */}
                <div className="border-b border-white/10 pb-4">
                  <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                    <MessageSquare className="w-5 h-5 text-indigo-400" />
                    <span>Threaded Q&A Discussions & Study Tips</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Ask questions about this note, share study tips, or discuss formulas with fellow students.
                  </p>
                </div>

                {/* Comment Post Form */}
                <form onSubmit={handlePostComment} className="flex gap-3">
                  <input
                    type="text"
                    required
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    placeholder="Ask a question or post a study tip..."
                    className="flex-1 px-4 py-3 rounded-xl bg-slate-900 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500 placeholder:text-slate-500"
                  />
                  <button
                    type="submit"
                    disabled={submittingComment || !newCommentText.trim()}
                    className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg flex items-center space-x-1.5 transition-colors disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>Post</span>
                  </button>
                </form>

                {/* Comments List */}
                <div className="space-y-3 pt-2">
                  {comments.length === 0 ? (
                    <div className="text-center py-10 bg-slate-900/50 rounded-2xl border border-white/5 text-slate-400 text-xs">
                      No discussions yet. Be the first student to post a study tip or question!
                    </div>
                  ) : (
                    comments.map((comment) => (
                      <div
                        key={comment.id}
                        className="p-4 rounded-xl bg-slate-900 border border-white/10 text-xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-indigo-300">{comment.user?.name || "Student"}</span>
                            <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 font-semibold text-[10px]">
                              {comment.user?.role || "STUDENT"}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500">
                            {new Date(comment.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        <p className="text-slate-200 leading-relaxed text-sm">{comment.text}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Footer Metadata Bar */}
          <div className="flex items-center justify-between px-5 py-3 bg-slate-950 border-t border-white/10 text-xs text-slate-400 shrink-0 select-none">
            <div className="flex items-center space-x-4 truncate">
              <span>Course: <code className="font-mono text-slate-300">{note.courseCode}</code></span>
              <span className="hidden sm:inline">•</span>
              <span>Semester: <code className="font-mono text-emerald-400">{note.semester}</code></span>
            </div>
            <div className="flex items-center space-x-2 shrink-0">
              <span className="text-slate-400">Click & Drag to Pan • Press</span>
              <kbd className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 font-mono border border-white/10">ESC</kbd>
              <span className="text-slate-400">to exit</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
