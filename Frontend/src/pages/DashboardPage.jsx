import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import AuthenticatedLayout from "../components/AuthenticatedLayout";
import api from "../services/api";
import { openModal } from "../features/ui/uiSlice";
import { motion } from "framer-motion";
import {
  Activity,
  Calendar,
  Heart,
  MessageCircle,
  Moon,
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  TrendingUp,
  Zap,
  BookOpen,
  X,
} from "lucide-react";

const MotionDiv = motion.div;
const MotionButton = motion.button;

const DashboardPage = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [weather, setWeather] = useState({
    temp: null,
    condition: "Loading...",
    city: "Locating...",
    icon: Sun,
    color: "text-amber-500",
  });
  const [dashboardStats, setDashboardStats] = useState({
    activeDays: 0,
    moodLogs: 0,
    chatSessions: 0,
    currentMood: null,
  });
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        // 1. Get location based on IP (using geojs for better rate limits)
        const locationRes = await fetch("https://get.geojs.io/v1/ip/geo.json");
        const locationData = await locationRes.json();
        const { city, latitude, longitude } = locationData;

        if (!latitude || !longitude) throw new Error("Location not found");

        // 2. Get weather using Open-Meteo (no API key required)
        const weatherRes = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`,
        );
        const weatherData = await weatherRes.json();
        const current = weatherData.current_weather;

        // 3. Map WMO weather code to condition and icon
        // WMO Weather interpretation codes (https://open-meteo.com/en/docs)
        let condition = "Clear";
        let icon = Sun;
        let color = "text-amber-500";

        const code = current.weathercode;
        if (code === 0) {
          condition = "Clear";
          icon = Sun;
          color = "text-amber-500";
        } else if (code >= 1 && code <= 3) {
          condition = "Partly Cloudy";
          icon = Cloud;
          color = "text-slate-400";
        } else if (code >= 45 && code <= 48) {
          condition = "Foggy";
          icon = Cloud;
          color = "text-slate-400";
        } else if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) {
          condition = "Rain";
          icon = CloudRain;
          color = "text-blue-400";
        } else if ((code >= 71 && code <= 77) || code === 85 || code === 86) {
          condition = "Snow";
          icon = CloudSnow;
          color = "text-sky-200";
        } else if (code >= 95 && code <= 99) {
          condition = "Thunderstorm";
          icon = CloudLightning;
          color = "text-purple-500";
        }

        setWeather({
          temp: Math.round(current.temperature),
          condition,
          city: city || "Unknown Location",
          icon,
          color,
        });
      } catch (error) {
        console.error("Error fetching weather:", error);
        setWeather({
          temp: "--",
          condition: "Unavailable",
          city: "Unknown",
          icon: Cloud,
          color: "text-slate-400",
        });
      }
    };

    const fetchDashboardData = async () => {
      try {
        // Add current timestamp as cache-buster to ensure we get fresh data
        const now = Date.now();
        const [moodRes, chatRes] = await Promise.all([
          api.get(`/mood/logs?t=${now}`),
          api.get(`/chat/history?per_page=5000&t=${now}`)
        ]);
        
        const logs = moodRes.data.data || [];
        const chats = chatRes.data.history || [];

        const moodLogsCount = logs.length;
        const chatSessionsCount = chatRes.data.total || 0;

        // Group by day to get combined active days
        const activeDates = new Set([
          ...logs.map(log => new Date(log.timestamp).toDateString()),
          ...chats.map(chat => new Date(chat.timestamp).toDateString())
        ]);
        
        const activeDaysCount = activeDates.size;
        
        let currentMood = null; 
        if (logs.length > 0) {
          // Sort by timestamp descending to get the absolute latest entry first
          const sortedLogs = [...logs].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
          
          // Check our reliable session flag to see if they logged a mood since logging in
          if (sessionStorage.getItem("moodLoggedThisSession") === "true") {
            currentMood = sortedLogs[0].mood_emoji;
          }
        }

        setDashboardStats({
          activeDays: activeDaysCount,
          moodLogs: moodLogsCount,
          chatSessions: chatSessionsCount,
          currentMood: currentMood,
          recentLogs: logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)),
          recentChats: chats.slice(-5).reverse()
        });
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      }
    };

    fetchWeather();
    fetchDashboardData();

    // Listen for custom events to refresh dashboard stats
    const handleDataRefresh = () => fetchDashboardData();
    window.addEventListener("mood-updated", handleDataRefresh);
    window.addEventListener("community-post-created", handleDataRefresh);

    return () => {
      window.removeEventListener("mood-updated", handleDataRefresh);
      window.removeEventListener("community-post-created", handleDataRefresh);
    };
  }, []);

  const stats = [
    {
      label: "Active Days",
      value: dashboardStats.activeDays.toString(),
      icon: Calendar,
      color: "text-cyan-400",
    },
    {
      label: "Mood Logs",
      value: dashboardStats.moodLogs.toString(),
      icon: Activity,
      color: "text-cyan-400",
    },
    {
      label: "Messages",
      value: dashboardStats.chatSessions.toString(),
      icon: MessageCircle,
      color: "text-cyan-400",
    },
    {
      label: "Current Mood",
      value: dashboardStats.currentMood || "—",
      icon: Heart,
      color: dashboardStats.currentMood ? "text-rose-500" : "text-cyan-400",
    },
  ];

  const recentActivities = [
    ...(dashboardStats.recentLogs || []).map(log => ({
      title: "Mood Logged",
      time: new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: "Mood Log",
      emoji: log.mood_emoji || "😌",
    })),
    ...(dashboardStats.recentLogs && dashboardStats.recentLogs.length === 0 ? [{
      title: "No entries yet",
      time: "Today",
      type: "System",
      emoji: "📝"
    }] : [])
  ].slice(0, 5); // Keep it clean with top 5

  return (
    <AuthenticatedLayout>
      <div className="flex-1 overflow-y-auto p-8 max-w-6xl mx-auto w-full">
        {/* Welcome Section */}
        <div className="mb-16">
          <MotionDiv
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-8"
          >
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black font-heading tracking-tight mb-3">
                Good morning,{" "}
                <span className="text-cyan-600 dark:text-cyan-400">
                  {user?.name?.split(" ")[0] || "User"}
                </span>
              </h1>
              <p className="text-foreground/50 text-xl font-medium">
                Here's your wellness overview for today.
              </p>
            </div>
            <div className="flex items-center gap-4 px-8 py-4 rounded-[2rem] bg-card border border-border/60 shadow-soft">
              <weather.icon className={`w-6 h-6 ${weather.color}`} />
              <div className="flex flex-col">
                <span className="text-base font-bold leading-tight">
                  {weather.temp !== null ? `${weather.temp}°C` : "--"} ·{" "}
                  {weather.condition}
                </span>
                <span className="text-[10px] text-foreground/40 font-black uppercase tracking-widest">
                  {weather.city}
                </span>
              </div>
            </div>
          </MotionDiv>
        </div>

        {/* Today's Mood Prompt */}
        {!dashboardStats.currentMood && (
          <MotionDiv
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-16 p-8 rounded-[2.5rem] bg-gradient-to-r from-cyan-600/20 to-emerald-600/20 border border-cyan-500/20 backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg"
          >
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-[1.5rem] bg-cyan-500/10 flex items-center justify-center text-cyan-400 shadow-inner group-hover:scale-110 transition-transform">
                <Heart className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-foreground mb-1 font-heading tracking-tight">How's your mind today?</h3>
                <p className="text-foreground/50 text-sm font-medium">Take a moment to center yourself and record your current emotional state.</p>
              </div>
            </div>
            <Link
              to="/mood-log"
              className="px-8 py-4 rounded-[2rem] bg-cyan-600 text-white font-black uppercase tracking-widest text-xs shadow-xl hover:bg-cyan-500 transition-all text-center"
            >
              Update Mood Now
            </Link>
          </MotionDiv>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {stats.map((stat, i) => (
            <MotionDiv
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -8 }}
              className="p-10 rounded-[2.5rem] bg-card border border-border/60 shadow-soft hover:shadow-xl hover:border-cyan-400/20 transition-all group"
            >
              <div className="flex justify-between items-start mb-10">
                <div className="w-16 h-16 rounded-[1.5rem] bg-cyan-500/5 flex items-center justify-center p-4 shadow-inner border border-cyan-500/10 transition-transform group-hover:scale-110 duration-500">
                  <stat.icon className={`w-full h-full ${stat.color}`} />
                </div>
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-black font-heading tracking-tight text-foreground mb-2">
                  {stat.value}
                </div>
                <div className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] leading-none">
                  {stat.label}
                </div>
              </div>
            </MotionDiv>
          ))}
        </div>

        <div className="space-y-16">
          {/* Main Focus / Recommendations */}
          <div>
            <section>
              <h2 className="text-xl md:text-2xl font-black font-heading tracking-tight mb-8 flex items-center gap-3">
                <TrendingUp className="w-6 h-6 text-cyan-500" /> Recommended For
                You
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <Link
                  to="/mood-log"
                  className="p-10 rounded-[2.5rem] bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 transition-all group relative overflow-hidden shadow-xl"
                >
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[4rem] rounded-full translate-x-1/3 -translate-y-1/3 group-hover:bg-white/15 transition-all duration-700" />
                  <Heart className="w-10 h-10 text-white mb-6 group-hover:scale-110 transition-transform" />
                  <h3 className="text-2xl font-black text-white mb-3">
                    Practice Gratitude
                  </h3>
                  <p className="text-white/80 text-lg leading-relaxed mb-8 font-medium">
                    Explore our new interactive gratitude journal exercises.
                  </p>
                  <span className="text-sm font-black uppercase tracking-widest text-white/90 flex items-center gap-2">
                    Start Now{" "}
                    <span className="group-hover:translate-x-2 transition-transform">
                      →
                    </span>
                  </span>
                </Link>
                <Link
                  to="/chat"
                  className="p-10 rounded-[2.5rem] bg-card border border-border/60 hover:border-cyan-400/30 transition-all group shadow-soft hover:shadow-xl relative overflow-hidden"
                >
                  <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-cyan-500/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <Zap className="w-10 h-10 text-cyan-400 mb-6 group-hover:scale-110 transition-transform" />
                  <h3 className="text-2xl font-black text-foreground mb-3 font-heading tracking-tight">
                    Morning Check-in
                  </h3>
                  <p className="text-foreground/50 text-lg leading-relaxed mb-8 font-medium">
                    A quick 2-minute chat with Sia to set your day's
                    intention.
                  </p>
                  <span className="text-sm font-black uppercase tracking-widest text-cyan-600 dark:text-cyan-400 flex items-center gap-2">
                    Talk to Sia{" "}
                    <span className="group-hover:translate-x-2 transition-transform">
                      →
                    </span>
                  </span>
                </Link>
                <Link
                  to="/journal"
                  className="p-10 rounded-[2.5rem] bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 transition-all group relative overflow-hidden shadow-xl"
                >
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[4rem] rounded-full translate-x-1/3 -translate-y-1/3 group-hover:bg-white/15 transition-all duration-700" />
                  <BookOpen className="w-10 h-10 text-white mb-6 group-hover:scale-110 transition-transform" />
                  <h3 className="text-2xl font-black text-white mb-3">
                    Write in Journal
                  </h3>
                  <p className="text-white/80 text-lg leading-relaxed mb-8 font-medium">
                    Jot down your thoughts and reflect on your day.
                  </p>
                  <span className="text-sm font-black uppercase tracking-widest text-white/90 flex items-center gap-2">
                    Start Now{" "}
                    <span className="group-hover:translate-x-2 transition-transform">
                      →
                    </span>
                  </span>
                </Link>
              </div>
            </section>
          </div>

          {/* Activity Feed */}
          <div>
            <h2 className="text-xl md:text-2xl font-black font-heading tracking-tight mb-8">
              Recent Activity
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {recentActivities.map((activity, i) => (
                <MotionDiv
                  key={activity.title + i}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="flex items-center gap-4 p-6 rounded-[2rem] bg-card border border-border/60 shadow-soft hover:shadow-xl hover:border-cyan-400/20 transition-all group"
                >
                  <div className="w-14 h-14 min-w-[3.5rem] rounded-2xl bg-foreground/5 flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform">
                    {activity.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-base font-black text-foreground truncate font-heading tracking-tight">
                      {activity.title}
                    </h4>
                    <p className="text-[10px] text-foreground/40 uppercase font-black tracking-widest mt-1">
                      {activity.type} · {activity.time}
                    </p>
                  </div>
                </MotionDiv>
              ))}
              <button
                onClick={() => setShowHistoryModal(true)}
                className="flex items-center justify-center text-center p-6 rounded-[2rem] border border-border/60 border-dashed text-foreground/40 text-[10px] font-black uppercase tracking-[0.2em] hover:text-cyan-600 hover:border-cyan-400/20 hover:bg-cyan-500/5 transition-all w-full h-full min-h-[104px]"
              >
                View Full History
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* FULL HISTORY MODAL */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-0">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowHistoryModal(false)}
            className="absolute inset-0 bg-background/80 backdrop-blur-md"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-2xl bg-card border border-border/60 rounded-[3rem] shadow-2xl overflow-hidden p-8 md:p-12"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-black font-heading tracking-tight leading-tight">
                Full History
              </h2>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="text-foreground/20 hover:text-foreground transition-colors p-2"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-4 custom-scrollbar">
              {dashboardStats.recentLogs && dashboardStats.recentLogs.length > 0 ? (
                dashboardStats.recentLogs.map((log, i) => (
                  <div key={log.id || i} className="flex items-center gap-4 p-5 rounded-[2rem] bg-background/50 border border-border/40">
                    <div className="w-12 h-12 min-w-[3rem] rounded-2xl bg-foreground/5 flex items-center justify-center text-2xl shadow-inner">
                      {log.mood_emoji || "😌"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base font-black text-foreground truncate font-heading tracking-tight">
                        Mood Logged: {log.mood_label}
                      </h4>
                      <p className="text-[10px] text-foreground/40 uppercase font-black tracking-widest mt-1">
                        {new Date(log.timestamp).toLocaleDateString()} · {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-foreground/50 font-medium">No mood history available.</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AuthenticatedLayout>
  );
};

export default DashboardPage;
