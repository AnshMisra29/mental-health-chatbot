import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import AuthenticatedLayout from "../components/AuthenticatedLayout";
import { motion } from "framer-motion";
import {
  BookOpen,
  Sparkles,
  Zap,
  Heart,
  Clock,
  ArrowRight,
  MessageSquare,
  Trash2,
} from "lucide-react";
import { openModal } from "../features/ui/uiSlice";
import api from "../services/api";

const MotionDiv = motion.div;
const MotionButton = motion.button;

const CommunityPage = () => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("All");
  const tabs = [
    "All",
    "Tips",
    "Exercises",
    "Awareness",
    "Stories",
    "External Blogs",
  ];

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      const { data } = await api.get("/community/posts");
      setPosts(data);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  // NOTE: Need to ensure useEffect is actually imported at top

  useEffect(() => {
    fetchPosts();
    window.addEventListener("community-post-created", fetchPosts);
    return () => window.removeEventListener("community-post-created", fetchPosts);
  }, []);

  const externalBlogs = [
  ];

  const allItems = [
    ...posts.map((post) => ({
      id: post.id,
      type: post.category,
      title: post.title,
      author: typeof post.user === "object" ? post.user?.name : "Anonymous",
      readTime: new Date(post.createdAt).toLocaleDateString([], {
        month: "short",
        day: "numeric",
      }) + " " + new Date(post.createdAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      color: "bg-rose-500/10 text-rose-400 border-rose-500/20",
      icon: Sparkles,
      content: post.content,
      isUserPost: true,
    })),
    ...externalBlogs
  ];

  const filteredResources =
    activeTab === "All"
      ? allItems
      : allItems.filter((r) => r.type === activeTab);

  return (
    <AuthenticatedLayout>
      <div className="flex-1 overflow-y-auto p-8 max-w-6xl mx-auto w-full">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-16">
          <div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black font-heading tracking-tight mb-4">
              Mental Health Awareness
            </h1>
            <p className="text-foreground/50 text-xl font-medium">
              Discover tips, stories, and tools to help you thrive.
            </p>
          </div>
          <MotionButton
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() =>
              dispatch(
                openModal({ type: "community_post", data: { category: activeTab === "All" ? "Stories" : activeTab } }),
              )
            }
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
              {
                emoji: "😊",
                label: "Happy",
                color: "hover:bg-cyan-500/10 hover:border-cyan-500/20",
              },
              {
                emoji: "😌",
                label: "Calm",
                color: "hover:bg-emerald-500/10 hover:border-emerald-500/20",
              },
              {
                emoji: "😐",
                label: "Neutral",
                color: "hover:bg-slate-500/10 hover:border-slate-500/20",
              },
              {
                emoji: "😔",
                label: "Sad",
                color: "hover:bg-rose-500/10 hover:border-rose-500/20",
              },
              {
                emoji: "😤",
                label: "Stressed",
                color: "hover:bg-amber-500/10 hover:border-amber-500/20",
              },
            ].map((mood) => (
              <MotionDiv
                key={mood.label}
                whileHover={{ y: -5 }}
                onClick={() =>
                  dispatch(
                    openModal({
                      type: "mood",
                      data: { title: `Feeling ${mood.label}` },
                    }),
                  )
                }
                className={`flex-1 min-w-[140px] p-8 rounded-[2rem] bg-card border border-border/60 transition-all flex flex-col items-center gap-4 group cursor-pointer shadow-soft hover:shadow-xl ${mood.color}`}
              >
                <span className="text-5xl group-hover:scale-125 transition-transform duration-500">
                  {mood.emoji}
                </span>
                <span className="text-[10px] font-black text-foreground/40 group-hover:text-foreground uppercase tracking-[0.2em]">
                  {mood.label}
                </span>
              </MotionDiv>
            ))}
          </div>
        </section>

        {/* Featured Card */}
        <section className="mb-20 relative overflow-hidden p-12 md:p-16 rounded-[3.5rem] bg-gradient-to-br from-cyan-600 via-cyan-500 to-emerald-500 shadow-xl group">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 blur-[100px] rounded-full translate-x-1/3 -translate-y-1/3 transition-all duration-1000 group-hover:scale-125" />
          <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="px-5 py-2 rounded-full bg-white/20 text-white text-[10px] font-black uppercase tracking-[0.2em] mb-10 inline-block border border-white/10 backdrop-blur-sm">
                Featured Insight
              </span>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-8 font-heading tracking-tight leading-[0.9]">
                The Power of <br /> Daily Reflection
              </h2>
              <p className="text-white/80 text-xl mb-10 leading-relaxed font-medium max-w-lg">
                Taking just 5 minutes a day to journal your thoughts can
                significantly reduce stress and improve emotional clarity.
              </p>
              <MotionButton
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() =>
                  dispatch(
                    openModal({
                      type: "resource",
                      data: { title: "Daily Reflection" },
                    }),
                  )
                }
                className="px-8 py-4 rounded-[2rem] bg-white text-cyan-700 font-black uppercase tracking-widest text-xs hover:bg-cyan-50 transition-all flex items-center gap-3 w-fit shadow-xl"
              >
                Read More{" "}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </MotionButton>
            </div>
            <div className="hidden md:flex justify-center">
              <div className="w-72 h-72 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-[4rem] flex items-center justify-center border border-white/20 shadow-2xl relative group-hover:rotate-6 transition-transform duration-700">
                <Sparkles className="w-40 h-40 text-white/40" />
                <div className="absolute -top-6 -right-6 w-20 h-20 bg-emerald-400 rounded-3xl blur-2xl opacity-40 animate-pulse" />
              </div>
            </div>
          </div>
        </section>

        {/* Categories / Tabs */}
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

        {/* Resources Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {filteredResources.map((resource, i) => (
            <MotionDiv
              layout
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={resource.title}
              whileHover={{ y: -10 }}
              onClick={() => {
                if (resource.link) {
                  window.open(resource.link, "_blank", "noopener,noreferrer");
                } else {
                  dispatch(openModal({ type: "resource", data: resource }));
                }
              }}
              className="p-10 rounded-[3rem] bg-card border border-border/60 shadow-soft hover:shadow-xl hover:border-cyan-400/20 transition-all group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-8">
                <div
                  className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border shadow-sm ${resource.color}`}
                >
                  {resource.type}
                </div>
              </div>
              <h3 className="text-2xl font-black mb-6 font-heading tracking-tight leading-tight group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                {resource.title}
              </h3>
              <div className="flex items-center justify-between mt-10 pt-10 border-t border-border/60">
                <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-cyan-600 dark:text-cyan-400 group-hover:gap-5 transition-all">
                  {resource.link ? "Visit Blog" : "Read Post"}{" "}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
                <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-foreground/40">
                  <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {resource.readTime}
                  </span>
                  {resource.isUserPost && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        dispatch(openModal({ type: "confirm_delete", data: { id: resource.id } }));
                      }}
                      className="text-rose-500 hover:text-rose-600 transition-colors bg-rose-500/10 hover:bg-rose-500/20 p-2 rounded-lg ml-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </MotionDiv>
          ))}
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default CommunityPage;
