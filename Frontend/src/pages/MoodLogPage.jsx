import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import AuthenticatedLayout from "../components/AuthenticatedLayout";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Clock,
  ArrowRight,
  Trash2,
  X,
  ChevronDown,
  Send,
  AlertTriangle,
  User,
} from "lucide-react";
import api from "../services/api";

const MotionDiv = motion.div;
const MotionButton = motion.button;

const CATEGORIES = ["Tips", "Exercises", "Awareness", "Stories", "External Blogs"];

const CATEGORY_COLORS = {
  Tips:            "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  Exercises:       "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Awareness:       "bg-violet-500/10 text-violet-400 border-violet-500/20",
  Stories:         "bg-rose-500/10 text-rose-400 border-rose-500/20",
  "External Blogs":"bg-amber-500/10 text-amber-400 border-amber-500/20",
};

const MoodLogPage = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useSelector((state) => state.auth);

  // ── Tabs ──────────────────────────────────────────────────────
  const tabs = ["All", ...CATEGORIES];
  const [activeTab, setActiveTab] = useState("All");

  // ── Posts ─────────────────────────────────────────────────────
  const [posts, setPosts]     = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      const { data } = await api.get("/community/posts");
      setPosts(data.data || []);
    } catch (err) {
      console.error("Error fetching posts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    window.addEventListener("community-post-created", fetchPosts);
    return () => window.removeEventListener("community-post-created", fetchPosts);
  }, []);

  // ── Share Post Modal ──────────────────────────────────────────
  const [showShareModal, setShowShareModal]   = useState(false);
  const [postTitle, setPostTitle]             = useState("");
  const [postContent, setPostContent]         = useState("");
  const [postCategory, setPostCategory]       = useState("Stories");
  const [submitting, setSubmitting]           = useState(false);
  const [submitError, setSubmitError]         = useState("");

  const openShareModal = () => {
    setPostTitle("");
    setPostContent("");
    setPostCategory(activeTab === "All" ? "Stories" : activeTab);
    setSubmitError("");
    setShowShareModal(true);
  };

  const handleSubmitPost = async (e) => {
    e.preventDefault();
    if (!postTitle.trim() || !postContent.trim()) {
      setSubmitError("Please fill in both the title and content.");
      return;
    }
    setSubmitting(true);
    setSubmitError("");
    try {
      await api.post("/community/posts", {
        title:    postTitle.trim(),
        content:  postContent.trim(),
        category: postCategory,
      });
      setShowShareModal(false);
      await fetchPosts();
      window.dispatchEvent(new CustomEvent("community-post-created"));
    } catch (err) {
      setSubmitError(err.response?.data?.error || "Failed to share post. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Delete Modal ──────────────────────────────────────────────
  const [deleteTarget, setDeleteTarget]     = useState(null); // post id
  const [deleting, setDeleting]             = useState(false);

  const handleDeletePost = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/community/posts/${deleteTarget}`);
      setPosts((prev) => prev.filter((p) => p.id !== deleteTarget));
      setDeleteTarget(null);
    } catch (err) {
      console.error("Error deleting post:", err);
    } finally {
      setDeleting(false);
    }
  };

  // ── Read Post Modal ───────────────────────────────────────────
  const [readPost, setReadPost] = useState(null);

  // ── Mood Tracker ──────────────────────────────────────────────
  const [loggingMood, setLoggingMood]     = useState(false);
  const [lastLoggedId, setLastLoggedId]   = useState(null);
  const [siaMoodResponse, setSiaMoodResponse] = useState(null);
  const [activeJoke, setActiveJoke]       = useState("");

  const jokes = [
    "Why don't scientists trust atoms? Because they make up everything!",
    "What do you call a fake noodle? An impasta!",
    "Why did the scarecrow win an award? Because he was outstanding in his field!",
    "How does a penguin build its house? Igloos it together!",
    "What do you call a bear with no teeth? A gummy bear!",
  ];

  const handleMoodLog = async (mood) => {
    if (loggingMood) return;
    setLoggingMood(true);
    try {
      await api.post("/mood/logs", { mood_label: mood.label, mood_emoji: mood.emoji });
      setLastLoggedId(mood.label);
      sessionStorage.setItem("moodLoggedThisSession", "true");
      window.dispatchEvent(new CustomEvent("mood-updated", { detail: { emoji: mood.emoji } }));
      if (mood.label === "Happy" || mood.label === "Calm") {
        setSiaMoodResponse(mood.label);
      } else if (mood.label === "Neutral") {
        setSiaMoodResponse("Neutral");
        setActiveJoke(jokes[Math.floor(Math.random() * jokes.length)]);
      } else {
        setSiaMoodResponse(mood.label);
      }
    } finally {
      setLoggingMood(false);
    }
  };

  // ── Derived list ──────────────────────────────────────────────
  const filteredPosts = activeTab === "All"
    ? posts
    : posts.filter((p) => p.category === activeTab);

  const formatDate = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })
      + " · "
      + d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <AuthenticatedLayout>
      <div className="flex-1 overflow-y-auto p-8 max-w-6xl mx-auto w-full">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-16">
          <div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black font-heading tracking-tight mb-4">
              Mood Log
            </h1>
            <p className="text-foreground/50 text-xl font-medium">
              Share, explore, and track your emotional wellness journey.
            </p>
          </div>
          <MotionButton
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={openShareModal}
            className="px-8 py-4 rounded-[2rem] bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-black uppercase tracking-widest text-xs transition-all shadow-xl flex items-center gap-3 w-fit"
          >
            <Sparkles className="w-5 h-5" />
            Share Your Post
          </MotionButton>
        </div>

        {/* Mood Tracker Widget */}
        <section className="mb-20 p-12 rounded-[3.5rem] bg-card/40 backdrop-blur-xl border border-border/60 shadow-soft">
          <h2 className="text-2xl font-black font-heading tracking-tight mb-10 text-center">
            How are you feeling today?
          </h2>
          <div className="flex flex-wrap justify-center gap-6">
            {[
              { emoji: "😊", label: "Happy",   color: "hover:bg-cyan-500/10 hover:border-cyan-500/20" },
              { emoji: "😌", label: "Calm",    color: "hover:bg-emerald-500/10 hover:border-emerald-500/20" },
              { emoji: "😐", label: "Neutral", color: "hover:bg-slate-500/10 hover:border-slate-500/20" },
              { emoji: "😔", label: "Sad",     color: "hover:bg-rose-500/10 hover:border-rose-500/20" },
              { emoji: "😤", label: "Stressed",color: "hover:bg-amber-500/10 hover:border-amber-500/20" },
            ].map((mood) => (
              <MotionDiv
                key={mood.label}
                whileHover={{ y: -5 }}
                onClick={() => handleMoodLog(mood)}
                className={`flex-1 min-w-[140px] p-8 rounded-[2rem] bg-card border transition-all flex flex-col items-center gap-4 group cursor-pointer shadow-soft hover:shadow-xl ${mood.color} ${loggingMood ? "opacity-50 pointer-events-none" : ""} ${lastLoggedId === mood.label ? "border-cyan-500 bg-cyan-500/5 ring-4 ring-cyan-500/10" : "border-border/60"}`}
              >
                <div className="relative">
                  <span className="text-5xl group-hover:scale-125 transition-transform duration-500 block">
                    {mood.emoji}
                  </span>
                  {lastLoggedId === mood.label && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="absolute -top-2 -right-2 bg-cyan-600 text-white p-1 rounded-full shadow-lg"
                    >
                      <Sparkles className="w-3 h-3" />
                    </motion.div>
                  )}
                </div>
                <span className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${lastLoggedId === mood.label ? "text-cyan-600" : "text-foreground/40 group-hover:text-foreground"}`}>
                  {lastLoggedId === mood.label ? "Logged!" : mood.label}
                </span>
              </MotionDiv>
            ))}
          </div>
        </section>

        {/* Category Tabs */}
        <div className="flex gap-4 mb-12 overflow-x-auto pb-6 scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-4 rounded-[2rem] text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap shadow-sm ${
                activeTab === tab
                  ? "bg-cyan-600 text-white shadow-xl translate-y-[-2px]"
                  : "bg-card text-foreground/40 hover:text-cyan-600 border border-border/60 hover:border-cyan-400/20"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Posts Grid */}
        {loading ? (
          <div className="text-center py-20 text-foreground/30 font-black uppercase tracking-widest text-xs">
            Loading posts…
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-foreground/30 font-black uppercase tracking-widest text-xs mb-4">No posts yet</p>
            <p className="text-foreground/20 text-sm">Be the first to share something!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            {filteredPosts.map((post, i) => {
              const isOwner = currentUser && post.user_id === currentUser.id;
              const catColor = CATEGORY_COLORS[post.category] || "bg-foreground/5 text-foreground/40 border-border/40";
              return (
                <MotionDiv
                  layout
                  key={post.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  whileHover={{ y: -8 }}
                  onClick={() => setReadPost(post)}
                  className="p-10 rounded-[3rem] bg-card border border-border/60 shadow-soft hover:shadow-xl hover:border-cyan-400/20 transition-all group cursor-pointer"
                >
                  {/* Top row: category badge + delete */}
                  <div className="flex items-center justify-between mb-6">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border ${catColor}`}>
                      {post.category}
                    </span>
                    {isOwner && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setDeleteTarget(post.id); }}
                        className="text-rose-500 hover:text-rose-400 transition-colors bg-rose-500/10 hover:bg-rose-500/20 p-2 rounded-xl"
                        title="Delete post"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl font-black mb-3 font-heading tracking-tight leading-tight group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                    {post.title}
                  </h3>

                  {/* Content preview */}
                  <p className="text-foreground/50 text-sm font-medium leading-relaxed line-clamp-3 mb-8">
                    {post.content}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-8 border-t border-border/60">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-cyan-600 dark:text-cyan-400 group-hover:gap-4 transition-all">
                      Read Post <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-foreground/30">
                        <User className="w-3 h-3" />
                        {post.user?.name || "Anonymous"}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-foreground/25">
                        <Clock className="w-3 h-3" />
                        {formatDate(post.created_at)}
                      </div>
                    </div>
                  </div>
                </MotionDiv>
              );
            })}
          </div>
        )}
      </div>

      {/* ── SHARE POST MODAL ─────────────────────────────────────── */}
      <AnimatePresence>
        {showShareModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowShareModal(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-card border border-border/60 rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              {/* Modal header */}
              <div className="bg-gradient-to-r from-cyan-600 to-emerald-600 px-10 py-8 flex items-center justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 blur-[50px] rounded-full translate-x-1/3 -translate-y-1/3" />
                <div className="relative z-10">
                  <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Community</p>
                  <h2 className="text-2xl font-black text-white font-heading tracking-tight">Share Your Post</h2>
                </div>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="relative z-10 text-white/40 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmitPost} className="p-8 space-y-5">
                {/* Title */}
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={postTitle}
                    onChange={(e) => setPostTitle(e.target.value)}
                    placeholder="Give your post a title…"
                    maxLength={120}
                    className="w-full px-5 py-4 rounded-[1.25rem] bg-background/60 border border-border/60 focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 text-foreground font-medium text-sm transition-all placeholder:text-foreground/25"
                  />
                </div>

                {/* Category dropdown */}
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 mb-2">
                    Category
                  </label>
                  <div className="relative">
                    <select
                      value={postCategory}
                      onChange={(e) => setPostCategory(e.target.value)}
                      className="w-full appearance-none px-5 py-4 pr-12 rounded-[1.25rem] bg-background/60 border border-border/60 focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 text-foreground font-black text-xs uppercase tracking-widest transition-all cursor-pointer"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40 pointer-events-none" />
                  </div>
                </div>

                {/* Content */}
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 mb-2">
                    Content
                  </label>
                  <textarea
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    placeholder="Write your post here… share a tip, a story, or an experience."
                    rows={5}
                    maxLength={2000}
                    className="w-full px-5 py-4 rounded-[1.25rem] bg-background/60 border border-border/60 focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 text-foreground font-medium text-sm transition-all placeholder:text-foreground/25 resize-none"
                  />
                  <p className="text-right text-[10px] text-foreground/25 mt-1 font-medium">
                    {postContent.length}/2000
                  </p>
                </div>

                {/* Error */}
                {submitError && (
                  <div className="flex items-center gap-3 p-4 rounded-[1rem] bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-medium">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    {submitError}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowShareModal(false)}
                    className="flex-1 py-4 rounded-[1.5rem] border border-border/60 text-foreground/40 font-black uppercase tracking-widest text-xs hover:text-foreground hover:border-border transition-all"
                  >
                    Cancel
                  </button>
                  <MotionButton
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={submitting}
                    className="flex-2 min-w-[160px] py-4 px-8 rounded-[1.5rem] bg-gradient-to-r from-cyan-600 to-emerald-600 text-white font-black uppercase tracking-widest text-xs shadow-xl disabled:opacity-60 flex items-center justify-center gap-3 transition-all"
                  >
                    {submitting ? (
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    {submitting ? "Posting…" : "Publish Post"}
                  </MotionButton>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── READ POST MODAL ───────────────────────────────────────── */}
      <AnimatePresence>
        {readPost && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setReadPost(null)}
              className="absolute inset-0 bg-background/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-card border border-border/60 rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-8 flex items-start justify-between gap-4 border-b border-border/60">
                <div className="flex-1 min-w-0">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border inline-block mb-3 ${CATEGORY_COLORS[readPost.category] || ""}`}>
                    {readPost.category}
                  </span>
                  <h2 className="text-2xl font-black font-heading tracking-tight leading-tight">{readPost.title}</h2>
                  <div className="flex items-center gap-4 mt-3">
                    <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-foreground/30">
                      <User className="w-3 h-3" /> {readPost.user?.name || "Anonymous"}
                    </span>
                    <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-foreground/25">
                      <Clock className="w-3 h-3" /> {formatDate(readPost.created_at)}
                    </span>
                  </div>
                </div>
                <button onClick={() => setReadPost(null)} className="text-foreground/20 hover:text-foreground transition-colors flex-shrink-0">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-8 overflow-y-auto">
                <p className="text-foreground/70 text-base font-medium leading-relaxed whitespace-pre-wrap">
                  {readPost.content}
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── DELETE CONFIRM MODAL ──────────────────────────────────── */}
      <AnimatePresence>
        {deleteTarget && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteTarget(null)}
              className="absolute inset-0 bg-background/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm bg-card border border-rose-500/20 rounded-[2rem] shadow-2xl p-8 text-center"
            >
              <div className="w-16 h-16 rounded-[1.5rem] bg-rose-500/10 flex items-center justify-center mx-auto mb-6">
                <Trash2 className="w-8 h-8 text-rose-500" />
              </div>
              <h3 className="text-2xl font-black font-heading tracking-tight mb-3">Delete Post?</h3>
              <p className="text-foreground/50 text-sm font-medium mb-8 leading-relaxed">
                This post will be permanently removed from the community. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 py-4 rounded-[1.5rem] border border-border/60 text-foreground/40 font-black uppercase tracking-widest text-xs hover:text-foreground hover:border-border transition-all"
                >
                  Cancel
                </button>
                <MotionButton
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDeletePost}
                  disabled={deleting}
                  className="flex-1 py-4 rounded-[1.5rem] bg-rose-500 hover:bg-rose-600 text-white font-black uppercase tracking-widest text-xs shadow-xl transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {deleting ? (
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  {deleting ? "Deleting…" : "Delete"}
                </MotionButton>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── SIA MOOD RESPONSE MODAL ───────────────────────────────── */}
      <AnimatePresence>
        {siaMoodResponse && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSiaMoodResponse(null)}
              className="absolute inset-0 bg-background/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-card border border-border/60 rounded-[3rem] shadow-2xl overflow-hidden p-12 text-center"
            >
              <div className="mb-10 flex justify-center">
                <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-cyan-600 to-emerald-600 p-0.5 shadow-xl">
                  <div className="w-full h-full rounded-[2rem] bg-card flex items-center justify-center">
                    <Sparkles className="w-10 h-10 text-cyan-600" />
                  </div>
                </div>
              </div>

              {siaMoodResponse === "Neutral" ? (
                <>
                  <h2 className="text-3xl font-black font-heading tracking-tight mb-4">Ohh that's fine!</h2>
                  <p className="text-foreground/80 text-lg font-medium mb-8 leading-relaxed">Wanna hear a joke to uplift your mood?</p>
                  <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-2xl p-6 mb-8">
                    <p className="text-cyan-600 dark:text-cyan-400 text-xl font-bold italic">"{activeJoke}"</p>
                  </div>
                  <p className="text-foreground/50 text-sm font-medium mb-8">Wanna hear more jokes?</p>
                  <MotionButton
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => { setSiaMoodResponse(null); navigate("/chat"); }}
                    className="w-full py-5 rounded-[2rem] bg-gradient-to-r from-cyan-600 to-emerald-600 text-white font-black uppercase tracking-widest text-xs transition-all shadow-xl"
                  >
                    Ask Sia for it
                  </MotionButton>
                </>
              ) : siaMoodResponse === "Sad" || siaMoodResponse === "Stressed" ? (
                <>
                  <h2 className="text-3xl font-black font-heading tracking-tight mb-6">We're here for you.</h2>
                  <p className="text-foreground/80 text-lg font-medium mb-12 leading-relaxed">
                    It's completely okay to feel <span className="text-rose-500 font-bold">{siaMoodResponse}</span>. Remember that you are not alone.
                  </p>
                  <MotionButton
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => { setSiaMoodResponse(null); navigate("/chat"); }}
                    className="w-full py-5 rounded-[2rem] bg-gradient-to-r from-rose-500 to-orange-500 text-white font-black uppercase tracking-widest text-xs transition-all shadow-xl"
                  >
                    Talk to Sia
                  </MotionButton>
                </>
              ) : (
                <>
                  <h2 className="text-3xl font-black font-heading tracking-tight mb-6">
                    Glad to hear you're feeling <span className="text-cyan-600">{siaMoodResponse}</span>!
                  </h2>
                  <p className="text-foreground/50 text-xl font-medium mb-12 leading-relaxed">
                    It's wonderful to see you doing well today. Keep shining!
                  </p>
                  <MotionButton
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => setSiaMoodResponse(null)}
                    className="w-full py-5 rounded-[2rem] bg-gradient-to-r from-cyan-600 to-emerald-600 text-white font-black uppercase tracking-widest text-xs transition-all shadow-xl"
                  >
                    Happy to hear
                  </MotionButton>
                </>
              )}

              <button
                onClick={() => setSiaMoodResponse(null)}
                className="absolute top-8 right-8 text-foreground/20 hover:text-foreground transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AuthenticatedLayout>
  );
};

export default MoodLogPage;
