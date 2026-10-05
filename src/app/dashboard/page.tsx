"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Layers, RefreshCw, Bookmark, Download, Tag, Flame, Clock, CheckCircle2 } from "lucide-react";
import CommandIsland from "@/components/CommandIsland";
import MagneticNoteCard from "@/components/MagneticNoteCard";
import MorphingCategoryPills from "@/components/MorphingCategoryPills";
import DocumentModal from "@/components/DocumentModal";
import LiquidNavbar from "@/components/LiquidNavbar";
import { EnhancedNoteItem } from "@/components/NoteCard";

export default function StudentDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; name: string; email: string; role: "ADMIN" | "STUDENT" } | null>(null);
  const [notes, setNotes] = useState<EnhancedNoteItem[]>([]);
  const [dynamicSubjects, setDynamicSubjects] = useState<string[]>(["ALL"]);
  const [dynamicCourseCodes, setDynamicCourseCodes] = useState<string[]>(["ALL"]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("ALL");
  const [selectedTag, setSelectedTag] = useState("ALL");
  const [selectedCourseCode, setSelectedCourseCode] = useState("ALL");
  const [selectedSemester, setSelectedSemester] = useState("ALL");
  const [sortBy, setSortBy] = useState<"latest" | "upvotes">("latest");
  const [selectedNoteForPreview, setSelectedNoteForPreview] = useState<EnhancedNoteItem | null>(null);
  const [activeTab, setActiveTab] = useState<"ALL" | "SAVED" | "SPACED_REPETITION">("ALL");

  // Bookmarks & Spaced Repetition state
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [reviewedDates, setReviewedDates] = useState<Record<string, string>>({});

  useEffect(() => {
    try {
      const saved = localStorage.getItem("docsearch_bookmarks");
      if (saved) setBookmarkedIds(JSON.parse(saved));

      const rev = localStorage.getItem("docsearch_reviews");
      if (rev) setReviewedDates(JSON.parse(rev));
    } catch (e) {
      console.error(e);
    }

    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (!data.authenticated) {
          router.push("/login");
        } else {
          setUser(data.user);
        }
      })
      .catch(() => router.push("/login"));

    fetchNotes();
  }, [router]);

  const fetchNotes = (
    query = searchQuery,
    subject = selectedSubject,
    tag = selectedTag,
    courseCode = selectedCourseCode,
    semester = selectedSemester,
    sort = sortBy
  ) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (query) params.set("query", query);
    if (subject && subject !== "ALL") params.set("subject", subject);
    if (tag && tag !== "ALL") params.set("tag", tag);
    if (courseCode && courseCode !== "ALL") params.set("courseCode", courseCode);
    if (semester && semester !== "ALL") params.set("semester", semester);
    if (sort) params.set("sortBy", sort);

    fetch(`/api/notes?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setNotes(data.notes || []);
        if (data.subjects && Array.isArray(data.subjects)) {
          setDynamicSubjects(data.subjects);
        }
        if (data.courseCodes && Array.isArray(data.courseCodes)) {
          setDynamicCourseCodes(data.courseCodes);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleToggleBookmark = (note: EnhancedNoteItem) => {
    let updated: string[];
    if (bookmarkedIds.includes(note.id)) {
      updated = bookmarkedIds.filter((id) => id !== note.id);
    } else {
      updated = [...bookmarkedIds, note.id];
    }
    setBookmarkedIds(updated);
    try {
      localStorage.setItem("docsearch_bookmarks", JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkReviewed = (noteId: string) => {
    const updated = { ...reviewedDates, [noteId]: new Date().toISOString() };
    setReviewedDates(updated);
    try {
      localStorage.setItem("docsearch_reviews", JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const handleExportReadingList = () => {
    const bookmarkedNotes = notes.filter((n) => bookmarkedIds.includes(n.id));
    if (bookmarkedNotes.length === 0) {
      alert("No saved bookmarks to export. Bookmark some study materials first!");
      return;
    }

    const mdContent =
      `# DocSearch Curated Study Reading List\n\nGenerated on ${new Date().toLocaleDateString()}\n\n` +
      bookmarkedNotes
        .map(
          (n) =>
            `### ${n.title}\n- **Course Code**: ${n.courseCode || "CS-101"}\n- **Subject**: ${n.subject}\n- **Tag**: #${n.tag}\n- **Upvotes**: ${n.upvotes || 0}\n- **Drive Link**: [Google Drive View](${n.originalUrl})\n- **Summary**: ${n.description || "N/A"}\n`
        )
        .join("\n\n");

    const blob = new Blob([mdContent], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "DocSearch_Reading_List.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  const availableTags = Array.from(new Set(notes.map((n) => n.tag).filter(Boolean)));
  const semesters = ["ALL", "Fall 2026", "Spring 2026"];

  const displayedNotes =
    activeTab === "SAVED" || activeTab === "SPACED_REPETITION"
      ? notes.filter((n) => bookmarkedIds.includes(n.id))
      : notes;

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-slate-100 font-sans pb-28 pt-20 selection:bg-indigo-500 selection:text-white">
      {/* Central Floating Command Island (PDR Section 4.2) */}
      <CommandIsland
        user={user}
        searchQuery={searchQuery}
        onSearch={(q) => {
          setSearchQuery(q);
          fetchNotes(q, selectedSubject, selectedTag, selectedCourseCode, selectedSemester, sortBy);
        }}
        notes={notes}
        onSelectNote={(note) => setSelectedNoteForPreview(note)}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Dynamic Cascade Hero Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative rounded-3xl bg-gradient-to-r from-indigo-950/80 via-slate-900/90 to-purple-950/80 border border-white/10 p-6 sm:p-10 mb-8 backdrop-blur-2xl overflow-hidden shadow-2xl"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Dynamic Cascade UI • Zero-Download Platform</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
                Academic & Technical Study Repository
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
                Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-200 font-mono text-xs border border-white/10">Ctrl + K</kbd> to launch the command search palette. Hover over cards for 3D magnetic tilt physics and dynamic flashlight lighting.
              </p>
            </div>

            {/* View Mode Switcher Tabs */}
            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
              <div className="flex items-center p-1 bg-slate-950/90 border border-white/10 rounded-2xl">
                <button
                  onClick={() => setActiveTab("ALL")}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeTab === "ALL"
                      ? "bg-indigo-600 text-white shadow-lg"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  All Library ({notes.length})
                </button>
                <button
                  onClick={() => setActiveTab("SAVED")}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all ${
                    activeTab === "SAVED"
                      ? "bg-amber-500 text-slate-950 shadow-lg font-black"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5 fill-current" />
                  <span>Saved ({bookmarkedIds.length})</span>
                </button>
                <button
                  onClick={() => setActiveTab("SPACED_REPETITION")}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all ${
                    activeTab === "SPACED_REPETITION"
                      ? "bg-purple-600 text-white shadow-lg"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Clock className="w-3.5 h-3.5 text-purple-300" />
                  <span>Spaced Review</span>
                </button>
              </div>

              {bookmarkedIds.length > 0 && (
                <button
                  onClick={handleExportReadingList}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-white/10 text-xs font-bold flex items-center space-x-2 transition-colors"
                  title="Export Reading List as Markdown"
                >
                  <Download className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Export List</span>
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Spaced Repetition Review Planner Header */}
        {activeTab === "SPACED_REPETITION" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mb-8 p-6 rounded-3xl bg-purple-950/40 border border-purple-500/30 backdrop-blur-md"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Spaced Repetition Memory Planner</h3>
                <p className="text-xs text-slate-400">
                  Review bookmarked materials at Day 1, Day 3, and Day 7 intervals for optimal recall.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {displayedNotes.map((note) => {
                const lastRev = reviewedDates[note.id];
                const daysAgo = lastRev
                  ? Math.floor((new Date().getTime() - new Date(lastRev).getTime()) / (1000 * 3600 * 24))
                  : null;

                return (
                  <div
                    key={note.id}
                    className="p-4 rounded-2xl bg-slate-900/90 border border-white/10 flex items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-mono font-bold">
                          {note.courseCode}
                        </span>
                        <h4 className="text-sm font-bold text-white">{note.title}</h4>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        Status:{" "}
                        {daysAgo === null ? (
                          <span className="text-amber-400 font-semibold">Review Pending (Day 1)</span>
                        ) : daysAgo >= 3 ? (
                          <span className="text-purple-400 font-semibold">Due for Day 3/7 Recall Review</span>
                        ) : (
                          <span className="text-emerald-400 font-semibold">Reviewed recently ({daysAgo}d ago)</span>
                        )}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedNoteForPreview(note)}
                        className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors"
                      >
                        Read
                      </button>
                      <button
                        onClick={() => handleMarkReviewed(note.id)}
                        className="px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 text-xs font-bold flex items-center space-x-1 transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mark Reviewed</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Morphing Subject Category Indicators (PDR Section 4.2) */}
        <div className="flex flex-col space-y-4 mb-8 pb-4 border-b border-white/10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Morphing Capsule Subject Filters */}
            <MorphingCategoryPills
              categories={dynamicSubjects}
              selectedCategory={selectedSubject}
              onSelectCategory={(subj) => {
                setSelectedSubject(subj);
                fetchNotes(searchQuery, subj, selectedTag, selectedCourseCode, selectedSemester, sortBy);
              }}
            />

            {/* High-Yield / Upvote Sort Toggle */}
            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={() => {
                  const newSort = sortBy === "latest" ? "upvotes" : "latest";
                  setSortBy(newSort);
                  fetchNotes(searchQuery, selectedSubject, selectedTag, selectedCourseCode, selectedSemester, newSort);
                }}
                className={`px-3.5 py-2 rounded-2xl text-xs font-bold flex items-center space-x-1.5 border transition-all ${
                  sortBy === "upvotes"
                    ? "bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 border-amber-400 shadow-lg font-black"
                    : "bg-slate-900 text-slate-400 border-white/10 hover:text-white"
                }`}
              >
                <Flame className="w-3.5 h-3.5" />
                <span>{sortBy === "upvotes" ? "Sorted by High-Yield" : "Sort High-Yield"}</span>
              </button>

              <button
                onClick={() => fetchNotes()}
                className="p-2.5 rounded-2xl bg-slate-900 border border-white/10 text-slate-400 hover:text-white transition-colors"
                title="Refresh Feed"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Secondary Course Code & Semester Filters */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <div className="flex items-center space-x-2 overflow-x-auto scrollbar-none">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider shrink-0">
                Course Code:
              </span>
              {dynamicCourseCodes.map((code) => (
                <button
                  key={code}
                  onClick={() => {
                    setSelectedCourseCode(code);
                    fetchNotes(searchQuery, selectedSubject, selectedTag, code, selectedSemester, sortBy);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all border ${
                    selectedCourseCode === code
                      ? "bg-indigo-500/20 text-indigo-300 border-indigo-400"
                      : "bg-slate-900/60 text-slate-400 border-white/5 hover:text-white"
                  }`}
                >
                  {code}
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-2 ml-auto">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0">
                Semester:
              </span>
              {semesters.map((sem) => (
                <button
                  key={sem}
                  onClick={() => {
                    setSelectedSemester(sem);
                    fetchNotes(searchQuery, selectedSubject, selectedTag, selectedCourseCode, sem, sortBy);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border ${
                    selectedSemester === sem
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-400"
                      : "bg-slate-900/60 text-slate-400 border-white/5 hover:text-white"
                  }`}
                >
                  {sem}
                </button>
              ))}
            </div>
          </div>

          {/* Tag Cloud */}
          {availableTags.length > 0 && (
            <div className="flex items-center space-x-2 overflow-x-auto scrollbar-none pt-1">
              <Tag className="w-3.5 h-3.5 text-emerald-400 shrink-0 mr-1" />
              <button
                onClick={() => {
                  setSelectedTag("ALL");
                  fetchNotes(searchQuery, selectedSubject, "ALL", selectedCourseCode, selectedSemester, sortBy);
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                  selectedTag === "ALL"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                #AllTags
              </button>
              {availableTags.map((tg) => (
                <button
                  key={tg}
                  onClick={() => {
                    setSelectedTag(tg);
                    fetchNotes(searchQuery, selectedSubject, tg, selectedCourseCode, selectedSemester, sortBy);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all border ${
                    selectedTag === tg
                      ? "bg-emerald-500/25 text-emerald-300 border-emerald-400"
                      : "bg-slate-900/60 text-slate-400 border-white/5 hover:text-white"
                  }`}
                >
                  #{tg}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Fluid Masonry Grid (PDR Section 4.2: Dynamic Cascade Layout) */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-64 rounded-3xl bg-slate-900/50 border border-white/5 animate-pulse p-6 flex flex-col justify-between"
              />
            ))}
          </div>
        ) : displayedNotes.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/40 rounded-3xl border border-white/10 p-8">
            <Layers className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white">
              {activeTab === "SAVED" ? "No Saved Bookmarks Yet" : "No Study Materials Found"}
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-sm mx-auto">
              {activeTab === "SAVED"
                ? "Click the bookmark icon on any card to save it to your personal reading collection!"
                : "No documents match your filter. Try adjusting your subject or course code search."}
            </p>
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {displayedNotes.map((note, idx) => (
                <MagneticNoteCard
                  key={note.id}
                  note={note}
                  index={idx}
                  isBookmarked={bookmarkedIds.includes(note.id)}
                  onToggleBookmark={handleToggleBookmark}
                  onUpvote={() => fetchNotes()}
                  onPreview={(selected) => setSelectedNoteForPreview(selected)}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </main>

      {/* Floating Document Viewer */}
      <DocumentModal
        note={selectedNoteForPreview}
        onClose={() => setSelectedNoteForPreview(null)}
        isBookmarked={selectedNoteForPreview ? bookmarkedIds.includes(selectedNoteForPreview.id) : false}
        onToggleBookmark={handleToggleBookmark}
        onUpvote={() => fetchNotes()}
      />

      {/* Mobile Liquid Navigation */}
      <LiquidNavbar
        activeTab={activeTab === "SAVED" ? "saved" : "all"}
        onSelectTab={(tabId) => {
          if (tabId === "saved") {
            setActiveTab("SAVED");
          } else {
            setActiveTab("ALL");
          }
        }}
        isAdmin={false}
      />
    </div>
  );
}
