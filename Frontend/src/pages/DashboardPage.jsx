import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import AuthenticatedLayout from "../components/AuthenticatedLayout";
import { motion } from "framer-motion";
import {
  Activity,
  Calendar,
  Heart,
  MessageCircle,
  Moon,
  Sun,
  TrendingUp,
  Zap,
} from "lucide-react";

const MotionDiv = motion.div;

const DashboardPage = () => {
  const { user } = useSelector((state) => state.auth);

  const stats = [
    {
      label: "Active Days",
      value: "12",
      icon: Calendar,
      color: "text-indigo-400",
    },
    {
      label: "Mood Logs",
      value: "24",
      icon: Activity,
      color: "text-emerald-400",
    },
    {
      label: "Chat Sessions",
      value: "8",
      icon: MessageCircle,
      color: "text-blue-400",
    },
    {
      label: "Meditation Min",
      value: "120",
      icon: Moon,
      color: "text-violet-400",
    },
  ];

  const recentActivities = [
    {
      title: "Journal Entry",
      time: "2 hours ago",
      type: "Mood Log",
      emoji: "😌",
    },
    { title: "Healo Session", time: "Yesterday", type: "Therapy", emoji: "💬" },
    {
      title: "Daily Exercise",
      time: "2 days ago",
      type: "Mindfulness",
      emoji: "🧘",
    },
  ];

  return (
    <AuthenticatedLayout>
      <div className="flex-1 overflow-y-auto p-8 max-w-6xl mx-auto w-full">
        {/* Welcome Section */}
        <div className="mb-12">
          <MotionDiv
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col md:flex-row md:items-center justify-between gap-6"
          >
            <div>
              <h1 className="text-4xl font-black mb-2">
                Good morning,{" "}
                <span className="text-indigo-500">
                  {user?.name?.split(" ")[0] || "User"}
                </span>
              </h1>
              <p className="text-foreground/70">
                Here's your wellness overview for today.
              </p>
            </div>
            <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-card border border-border">
              <Sun className="w-5 h-5 text-amber-400" />
              <span className="text-sm font-bold">18°C · Sunny in London</span>
            </div>
          </MotionDiv>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, i) => (
            <MotionDiv
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-6 rounded-3xl bg-card border border-border hover:border-indigo-500/30 transition-all group"
            >
              <stat.icon
                className={`w-6 h-6 ${stat.color} mb-4 group-hover:scale-110 transition-transform`}
              />
              <div className="text-3xl font-black text-foreground mb-1">
                {stat.value}
              </div>
              <div className="text-xs font-bold text-foreground/50 uppercase tracking-wider">
                {stat.label}
              </div>
            </MotionDiv>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Focus / Recommendations */}
          <div className="lg:col-span-2 space-y-8">
            <section>
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-400" /> Recommended
                For You
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <Link
                  to="/community"
                  className="p-8 rounded-[2rem] bg-indigo-600 hover:bg-indigo-500 transition-all group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl rounded-full translate-x-1/3 -translate-y-1/3" />
                  <Heart className="w-8 h-8 text-white mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">
                    Practice Gratitude
                  </h3>
                  <p className="text-indigo-100/80 text-sm leading-relaxed mb-6">
                    Explore our new interactive gratitude journal exercises.
                  </p>
                  <span className="text-sm font-black text-white group-hover:gap-2 flex items-center gap-1 transition-all">
                    Start Now →
                  </span>
                </Link>
                <Link
                  to="/chat"
                  className="p-8 rounded-[2rem] bg-card border border-border hover:border-indigo-500/30 transition-all group"
                >
                  <Zap className="w-8 h-8 text-emerald-400 mb-4" />
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    Morning Check-in
                  </h3>
                  <p className="text-foreground/70 text-sm leading-relaxed mb-6">
                    A quick 2-minute chat with Healo to set your day's
                    intention.
                  </p>
                  <span className="text-sm font-black text-indigo-400 group-hover:gap-2 flex items-center gap-1 transition-all">
                    Talk to Healo →
                  </span>
                </Link>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-6">Recent Insights</h2>
              <div className="p-8 rounded-[2.5rem] bg-card border border-border border-dashed">
                <div className="text-center py-8">
                  <p className="text-foreground/50 text-sm">
                    You haven't logged enough data this week to generate
                    detailed insights.
                  </p>
                  <button className="mt-4 text-indigo-400 font-bold hover:underline">
                    Complete today's check-in
                  </button>
                </div>
              </div>
            </section>
          </div>

          {/* Activity Feed */}
          <div>
            <h2 className="text-xl font-bold mb-6">Recent Activity</h2>
            <div className="space-y-4">
              {recentActivities.map((activity, i) => (
                <MotionDiv
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border hover:bg-border transition-all"
                >
                  <div className="w-12 h-12 rounded-xl bg-background flex items-center justify-center text-xl shadow-inner">
                    {activity.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-foreground truncate">
                      {activity.title}
                    </h4>
                    <p className="text-[10px] text-foreground/50 uppercase font-black">
                      {activity.type} · {activity.time}
                    </p>
                  </div>
                </MotionDiv>
              ))}
              <Link
                to="/community"
                className="block text-center p-4 rounded-2xl border border-border text-foreground/50 text-xs font-bold hover:text-foreground transition-all"
              >
                View Full History
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default DashboardPage;
