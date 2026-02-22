import { useState } from "react";
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
} from "lucide-react";
import { openModal } from "../features/ui/uiSlice";

const MotionDiv = motion.div;
const MotionButton = motion.button;

const CommunityPage = () => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("All");
  const tabs = ["All", "Tips", "Exercises", "Awareness", "Stories"];

  const resources = [
    {
      type: "Tips",
      title: "5 Ways to Manage Workplace Stress",
      author: "Dr. Emily Chen",
      readTime: "4 min read",
      color: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
      icon: Zap,
      likes: 124,
      comments: 18,
    },
    {
      type: "Exercises",
      title: "10-Minute Mindfulness Meditation",
      author: "Healo Guide",
      readTime: "10 min read",
      color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      icon: Heart,
      likes: 89,
      comments: 12,
    },
    {
      type: "Awareness",
      title: "Understanding Anxiety: Signs & Symptoms",
      author: "Mental Wellness Org",
      readTime: "6 min read",
      color: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      icon: BookOpen,
      likes: 56,
      comments: 7,
    },
    {
      type: "Stories",
      title: "My Journey with Healo: A Story of Growth",
      author: "Alex J.",
      readTime: "8 min read",
      color: "bg-rose-500/10 text-rose-400 border-rose-500/20",
      icon: Sparkles,
      likes: 210,
      comments: 45,
    },
  ];

  const filteredResources =
    activeTab === "All"
      ? resources
      : resources.filter((r) => r.type === activeTab);

  return (
    <AuthenticatedLayout>
      <div className="flex-1 overflow-y-auto p-8 max-w-6xl mx-auto w-full">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-3xl font-black mb-2">
              Mental Health Awareness
            </h1>
            <p className="text-foreground/70">
              Discover tips, stories, and tools to help you thrive.
            </p>
          </div>
          <button
            onClick={() =>
              dispatch(
                openModal({ type: "resource", data: { title: "Create Post" } }),
              )
            }
            className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2 w-fit"
          >
            <Sparkles className="w-5 h-5" />
            Share Your Story
          </button>
        </div>

        {/* Mood Tracker Widget */}
        <section className="mb-12 p-8 rounded-[2.5rem] bg-card border border-border">
          <h2 className="text-xl font-bold mb-6">How are you feeling today?</h2>
          <div className="flex flex-wrap gap-4">
            {[
              {
                emoji: "😊",
                label: "Happy",
                color: "hover:bg-emerald-500/20 hover:border-emerald-500/40",
              },
              {
                emoji: "😌",
                label: "Calm",
                color: "hover:bg-indigo-500/20 hover:border-indigo-500/40",
              },
              {
                emoji: "😐",
                label: "Neutral",
                color: "hover:bg-slate-700/20 hover:border-slate-700/40",
              },
              {
                emoji: "😔",
                label: "Sad",
                color: "hover:bg-rose-500/20 hover:border-rose-500/40",
              },
              {
                emoji: "😤",
                label: "Stressed",
                color: "hover:bg-amber-500/20 hover:border-amber-500/40",
              },
            ].map((mood) => (
              <button
                key={mood.label}
                onClick={() =>
                  dispatch(
                    openModal({
                      type: "mood",
                      data: { title: `Feeling ${mood.label}` },
                    }),
                  )
                }
                className={`flex-1 min-w-[100px] p-4 rounded-2xl bg-background border border-border transition-all flex flex-col items-center gap-2 group ${mood.color}`}
              >
                <span className="text-2xl group-hover:scale-125 transition-transform">
                  {mood.emoji}
                </span>
                <span className="text-xs font-bold text-foreground/50 group-hover:text-foreground uppercase tracking-wider">
                  {mood.label}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Featured Card */}
        <section className="mb-12 relative overflow-hidden p-8 md:p-12 rounded-[2.5rem] bg-indigo-600">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[60px] rounded-full translate-x-1/2 -translate-y-1/2" />
          <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
            <div>
              <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider mb-6 inline-block">
                Featured Tip
              </span>
              <h2 className="text-3xl md:text-4xl font-black text-white mb-6">
                The Power of <br /> Daily Reflection
              </h2>
              <p className="text-indigo-100 text-lg mb-8 opacity-90 leading-relaxed">
                Taking just 5 minutes a day to journal your thoughts can
                significantly reduce stress and improve emotional clarity.
              </p>
              <button
                onClick={() =>
                  dispatch(
                    openModal({
                      type: "resource",
                      data: { title: "Daily Reflection" },
                    }),
                  )
                }
                className="px-8 py-3 rounded-xl bg-white text-indigo-600 font-bold hover:bg-indigo-50 transition-all flex items-center gap-2 shadow-xl shadow-indigo-500/20"
              >
                Read More <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="hidden md:flex justify-center">
              <div className="w-64 h-64 bg-indigo-500 rounded-full flex items-center justify-center border-8 border-indigo-400/30">
                <Sparkles className="w-32 h-32 text-white/50" />
              </div>
            </div>
          </div>
        </section>

        {/* Categories / Tabs */}
        <div className="flex gap-4 mb-10 overflow-x-auto pb-4 scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-2xl text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === tab
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                  : "bg-card text-foreground/70 hover:text-foreground border border-border"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Resources Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {filteredResources.map((resource, i) => (
            <MotionDiv
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={resource.title}
              onClick={() =>
                dispatch(openModal({ type: "resource", data: resource }))
              }
              className="p-8 rounded-[2rem] bg-card border border-border hover:border-indigo-500/30 transition-all group cursor-pointer hover:bg-border/50"
            >
              <div className="flex items-center justify-between mb-6">
                <div
                  className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${resource.color}`}
                >
                  {resource.type}
                </div>
                <div className="flex items-center gap-2 text-foreground/50 text-xs font-medium">
                  <Clock className="w-3.5 h-3.5" />
                  {resource.readTime}
                </div>
              </div>
              <h3 className="text-xl font-bold mb-4 group-hover:text-indigo-400 transition-colors">
                {resource.title}
              </h3>
              <div className="flex items-center justify-between mt-8 pt-8 border-t border-border">
                <div className="flex items-center gap-4 text-xs font-bold text-foreground/50">
                  <span className="flex items-center gap-1.5 hover:text-rose-400 transition-colors">
                    <Heart className="w-4 h-4" /> {resource.likes}
                  </span>
                  <span className="flex items-center gap-1.5 hover:text-indigo-400 transition-colors">
                    <MessageSquare className="w-4 h-4" /> {resource.comments}
                  </span>
                </div>
                <div className="flex items-center gap-2 font-bold text-xs text-indigo-400 group-hover:gap-3 transition-all">
                  Read Article <ArrowRight className="w-4 h-4" />
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
