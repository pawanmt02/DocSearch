"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { PlusCircle, Filter, ShieldCheck, Link as LinkIcon, CheckCircle, AlertCircle, X, Database, ArrowRight, Tag, BarChart3, TrendingUp, Layers, Users, BookOpen } from "lucide-react";
import CommandIsland from "@/components/CommandIsland";
import MagneticNoteCard from "@/components/MagneticNoteCard";
import MorphingCategoryPills from "@/components/MorphingCategoryPills";
import DocumentModal from "@/components/DocumentModal";
import LiquidNavbar from "@/components/LiquidNavbar";
import { extractGoogleDriveId } from "@/lib/drive";
import { EnhancedNoteItem } from "@/components/NoteCard";

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; name: string; email: string; role: "ADMIN" | "STUDENT" } | null>(null);
  const [notes, setNotes] = useState<EnhancedNoteItem[]>([]);
  const [dynamicSubjects, setDynamicSubjects] = useState<string[]>(["ALL"]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("ALL");
  const [selectedNoteForPreview, setSelectedNoteForPreview] = useState<EnhancedNoteItem | null>(null);
  const [isIngestModalOpen, setIsIngestModalOpen] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(true);
  const [mobileTab, setMobileTab] = useState("all");

  // Ingest Form state
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [customSubjectInput, setCustomSubjectInput] = useState("");
  const [isCustomSubject, setIsCustomSubject] = useState(false);
  const [courseCode, setCourseCode] = useState("CS-301");
  const [semester, setSemester] = useState("Fall 2026");
  const [driveUrl, setDriveUrl] = useState("");
  const [tag, setTag] = useState("General");
  const [description, setDescription] = useState("");
  const [ocrText, setOcrText] = useState("");

  const [formExtractedId, setFormExtractedId] = useState("");
  const [formUrlValid, setFormUrlValid] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (!data.authenticated) {
          router.push("/login");
        } else if (data.user.role !== "ADMIN") {
          router.push("/dashboard");
        } else {
          setUser(data.user);
        }
      })
      .catch(() => router.push("/login"));

    fetchNotes();
  }, [router]);

  const fetchNotes = (query = searchQuery, subj = selectedSubject) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (query) params.set("query", query);
    if (subj && subj !== "ALL") params.set("subject", subj);

    fetch(`/api/notes?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setNotes(data.notes || []);
        if (data.subjects && Array.isArray(data.subjects)) {
          setDynamicSubjects(data.subjects);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleUrlChange = (val: string) => {
    setDriveUrl(val);
    if (!val.trim()) {
      setFormExtractedId("");
      setFormUrlValid(false);
      return;
    }

    const info = extractGoogleDriveId(val);
    if (info.isValid) {
      setFormExtractedId(info.fileId);
      setFormUrlValid(true);
      setFormError("");
    } else {
      setFormExtractedId("");
      setFormUrlValid(false);
    }
  };

  const handleIngestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    const finalSubject = isCustomSubject ? customSubjectInput.trim() : subject.trim();

    if (!finalSubject) {
      setFormError("Please enter or select a Subject Taxonomy name.");
      return;
    }

    if (!formUrlValid) {
      setFormError("Please provide a valid Google Drive sharing link.");
      return;
    }

    setFormSubmitting(true);

    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          subject: finalSubject,
          url: driveUrl,
          tag,
          courseCode,
          semester,
          description,
          ocrText,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to ingest material");
      }

      setFormSuccess(`Successfully ingested "${title}" with Course Code ${courseCode}!`);
      fetchNotes();

      setTimeout(() => {
        setIsIngestModalOpen(false);
        setTitle("");
        setDriveUrl("");
        setDescription("");
        setOcrText("");
        setCustomSubjectInput("");
        setIsCustomSubject(false);
        setFormExtractedId("");
        setFormUrlValid(false);
        setFormSuccess("");
        setFormSubmitting(false);
      }, 900);
    } catch (err: any) {
      setFormError(err.message || "Failed to upload note");
      setFormSubmitting(false);
    }
  };

  const handleDeleteNote = async (id: string) => {
    try {
      const res = await fetch(`/api/notes/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete failed");
      fetchNotes();
    } catch (e: any) {
      alert(e.message || "Could not delete material");
    }
  };

  const subjectCounts: Record<string, number> = {};
  notes.forEach((n) => {
    subjectCounts[n.subject] = (subjectCounts[n.subject] || 0) + 1;
  });

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-slate-100 font-sans pb-28 pt-20 selection:bg-indigo-500 selection:text-white">
      {/* Central Floating Command Island */}
      <CommandIsland
        user={user}
        searchQuery={searchQuery}
        onSearch={(q) => {
          setSearchQuery(q);
          fetchNotes(q, selectedSubject);
        }}
        notes={notes}
        onSelectNote={(note) => setSelectedNoteForPreview(note)}
        onOpenIngest={() => setIsIngestModalOpen(true)}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Admin Control Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/70 to-purple-950/70 border border-emerald-500/20 p-6 sm:p-10 mb-8 backdrop-blur-xl shadow-2xl overflow-hidden"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-3">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Authorized Administrator Control Panel</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white">
                Content Ingestion & Dynamic Cascade Control
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
                Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-200 font-mono text-xs border border-white/10">Ctrl + K</kbd> to launch search. Ingest materials with Course Codes (`CS-301`), custom Taxonomies, and OCR text indexing.
              </p>
            </div>

            <div className="flex items-center space-x-3 shrink-0">
              <button
                onClick={() => setShowAnalytics(!showAnalytics)}
                className="px-4 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-white/10 text-xs font-bold flex items-center space-x-2 transition-colors"
              >
                <BarChart3 className="w-4 h-4 text-indigo-400" />
                <span>{showAnalytics ? "Hide Analytics" : "Show Analytics"}</span>
              </button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsIngestModalOpen(true)}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 border border-indigo-400/40 flex items-center space-x-2 transition-transform"
              >
                <PlusCircle className="w-5 h-5" />
                <span>Ingest Material</span>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Admin Analytics Panel */}
        {showAnalytics && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8 space-y-6"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-md flex items-center space-x-4">
                <div className="p-3 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-semibold uppercase">Total Materials</p>
                  <p className="text-2xl font-extrabold text-white mt-0.5">{notes.length}</p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-md flex items-center space-x-4">
                <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <Layers className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-semibold uppercase">Taxonomies</p>
                  <p className="text-2xl font-extrabold text-white mt-0.5">{dynamicSubjects.length - 1}</p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-md flex items-center space-x-4">
                <div className="p-3 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-semibold uppercase">Storage Bandwidth</p>
                  <p className="text-2xl font-extrabold text-white mt-0.5">0 MB</p>
                  <span className="text-[10px] text-emerald-400 font-bold">Decentralized Drive</span>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-md flex items-center space-x-4">
                <div className="p-3 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-semibold uppercase">Uploader Role</p>
                  <p className="text-2xl font-extrabold text-white mt-0.5">System Admin</p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-md">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center space-x-2">
                <BarChart3 className="w-4 h-4 text-indigo-400" />
                <span>Subject Category Distribution</span>
              </h3>
              <div className="space-y-3">
                {Object.entries(subjectCounts).map(([subj, count]) => {
                  const percentage = Math.round((count / (notes.length || 1)) * 100);
                  return (
                    <div key={subj} className="space-y-1">
                      <div className="flex items-center justify-between text-xs text-slate-300 font-medium">
                        <span>{subj}</span>
                        <span className="text-slate-400">{count} notes ({percentage}%)</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-white/5">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* Morphing Category Pills Header */}
        <div className="flex items-center justify-between gap-4 mb-8 pb-4 border-b border-white/10 overflow-x-auto">
          <MorphingCategoryPills
            categories={dynamicSubjects}
            selectedCategory={selectedSubject}
            onSelectCategory={(subj) => {
              setSelectedSubject(subj);
              fetchNotes(searchQuery, subj);
            }}
          />

          <div className="text-xs text-slate-400 shrink-0 hidden sm:block">
            Total Notes: <span className="font-bold text-indigo-400">{notes.length}</span>
          </div>
        </div>

        {/* Dynamic Cascade Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 rounded-3xl bg-slate-900/50 border border-white/5 animate-pulse" />
            ))}
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {notes.map((note, idx) => (
                <MagneticNoteCard
                  key={note.id}
                  note={note}
                  index={idx}
                  isAdmin={true}
                  onPreview={(n) => setSelectedNoteForPreview(n)}
                  onDelete={handleDeleteNote}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </main>

      {/* Ingestion Drawer */}
      <AnimatePresence>
        {isIngestModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-end overflow-hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setIsIngestModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="relative z-10 h-full w-full max-w-xl bg-slate-900 border-l border-white/15 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl flex flex-col justify-between overflow-y-auto"
            >
              <div>
                <div className="flex items-center justify-between border-b border-white/10 pb-5 mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                      <Database className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Create Subject & Course Mapping</h3>
                      <p className="text-xs text-slate-400">Admin Ingestion & OCR Extraction Pipeline</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsIngestModalOpen(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleIngestSubmit} className="space-y-4">
                  {/* Title */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                      Document Title
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Autonomous Robotics & Kinematic Algorithms"
                      className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder:text-slate-600"
                    />
                  </div>

                  {/* Course Code & Semester Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-indigo-300 mb-1.5 uppercase tracking-wider">
                        Course Code
                      </label>
                      <input
                        type="text"
                        required
                        value={courseCode}
                        onChange={(e) => setCourseCode(e.target.value)}
                        placeholder="e.g. CS-301, AI-401"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-indigo-500/40 text-white text-sm font-mono focus:outline-none focus:border-indigo-500 placeholder:text-slate-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                        Semester
                      </label>
                      <select
                        value={semester}
                        onChange={(e) => setSemester(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500"
                      >
                        <option value="Fall 2026">Fall 2026</option>
                        <option value="Spring 2026">Spring 2026</option>
                        <option value="Summer 2026">Summer 2026</option>
                      </select>
                    </div>
                  </div>

                  {/* Dynamic Subject Taxonomy Creator */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                        Subject Taxonomy Name
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsCustomSubject(!isCustomSubject)}
                        className="text-xs text-indigo-400 hover:underline font-semibold"
                      >
                        {isCustomSubject ? "Pick Existing Subject" : "+ Create New Subject Category"}
                      </button>
                    </div>

                    {isCustomSubject ? (
                      <div className="relative">
                        <Tag className="w-4 h-4 absolute left-3.5 top-3.5 text-indigo-400" />
                        <input
                          type="text"
                          required
                          value={customSubjectInput}
                          onChange={(e) => setCustomSubjectInput(e.target.value)}
                          placeholder="Type new subject taxonomy (e.g. Robotics & Automation)..."
                          className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-indigo-500/50 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder:text-slate-600"
                        />
                      </div>
                    ) : (
                      <select
                        value={subject}
                        onChange={(e) => {
                          if (e.target.value === "__NEW__") {
                            setIsCustomSubject(true);
                          } else {
                            setSubject(e.target.value);
                          }
                        }}
                        className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500"
                      >
                        <option value="">Select Existing Subject Taxonomy...</option>
                        {dynamicSubjects
                          .filter((s) => s !== "ALL")
                          .map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        <option value="__NEW__">+ Create Custom Subject Taxonomy...</option>
                      </select>
                    )}
                  </div>

                  {/* Tag */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                      Taxonomy Tag
                    </label>
                    <input
                      type="text"
                      required
                      value={tag}
                      onChange={(e) => setTag(e.target.value)}
                      placeholder="e.g. Kinematics, Machine Learning, Organic Chemistry"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500 placeholder:text-slate-600"
                    />
                  </div>

                  {/* Google Drive Link */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                      Google Drive Sharing Link
                    </label>
                    <div className="relative">
                      <LinkIcon className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                      <input
                        type="text"
                        required
                        value={driveUrl}
                        onChange={(e) => handleUrlChange(e.target.value)}
                        placeholder="https://drive.google.com/file/d/1BxiMVs.../view"
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500 placeholder:text-slate-600"
                      />
                    </div>

                    {driveUrl && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-2.5 p-3 rounded-xl bg-slate-950/90 border border-white/10 text-xs"
                      >
                        {formUrlValid ? (
                          <div className="flex items-center space-x-2 text-emerald-400">
                            <CheckCircle className="w-4 h-4 shrink-0" />
                            <span>Extracted File ID: <code className="font-mono font-bold text-white bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">{formExtractedId}</code></span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2 text-amber-400">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span>Parsing string for valid Google Drive alphanumeric ID...</span>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </div>

                  {/* OCR Text */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider flex items-center justify-between">
                      <span>OCR Extracted Text (For Search Indexing)</span>
                      <span className="text-[10px] text-indigo-400 font-semibold">Optional</span>
                    </label>
                    <textarea
                      rows={2}
                      value={ocrText}
                      onChange={(e) => setOcrText(e.target.value)}
                      placeholder="Paste extracted text from scanned lecture slides or formulas..."
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500 placeholder:text-slate-600 font-mono"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                      Abstract / Summary
                    </label>
                    <textarea
                      rows={2}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Brief summary of topics, formulas, or key concepts..."
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500 placeholder:text-slate-600"
                    />
                  </div>

                  {/* Alerts */}
                  {formError && (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium">
                      {formError}
                    </div>
                  )}
                  {formSuccess && (
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
                      {formSuccess}
                    </div>
                  )}

                  {/* Submit Action */}
                  <div className="pt-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={formSubmitting || !formUrlValid}
                      className="w-full py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-600/30 border border-indigo-400/40 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span>{formSubmitting ? "Publishing Taxonomy..." : "Publish Subject & Material"}</span>
                      {!formSubmitting && <ArrowRight className="w-4 h-4" />}
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Viewer */}
      <DocumentModal
        note={selectedNoteForPreview}
        onClose={() => setSelectedNoteForPreview(null)}
      />

      {/* Mobile Navigation */}
      <LiquidNavbar
        activeTab={mobileTab}
        onSelectTab={(tabId) => {
          setMobileTab(tabId);
          if (tabId === "ingest") {
            setIsIngestModalOpen(true);
          }
        }}
        isAdmin={true}
      />
    </div>
  );
}
