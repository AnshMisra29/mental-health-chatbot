import React, { useState, useEffect } from "react";
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
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  TrendingUp,
  Zap,
} from "lucide-react";

const MotionDiv = motion.div;

const DashboardPage = () => {
  const { user } = useSelector((state) => state.auth);
  const [weather, setWeather] = useState({
    temp: null,
    condition: "Loading...",
    city: "Locating...",
    icon: Sun,
    color: "text-amber-500",
  });

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        // 1. Get location based on IP
        const locationRes = await fetch("https://ipapi.co/json/");
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

    fetchWeather();
  }, []);

  const stats = [
    {
      label: "Active Days",
      value: "12",
      icon: Calendar,
      color: "text-cyan-400",
    },
    {
      label: "Mood Logs",
      value: "24",
      icon: Activity,
      color: "text-cyan-400",
    },
    {
      label: "Chat Sessions",
      value: "8",
      icon: MessageCircle,
      color: "text-cyan-400",
    },
    {
      label: "Meditation Min",
      value: "120",
      icon: Moon,
      color: "text-cyan-400",
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

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main Focus / Recommendations */}
          <div className="lg:col-span-2 space-y-12">
            <section>
              <h2 className="text-xl md:text-2xl font-black font-heading tracking-tight mb-8 flex items-center gap-3">
                <TrendingUp className="w-6 h-6 text-cyan-500" /> Recommended For
                You
              </h2>
              <div className="grid sm:grid-cols-2 gap-6">
                <Link
                  to="/community"
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
                    A quick 2-minute chat with Healo to set your day's
                    intention.
                  </p>
                  <span className="text-sm font-black uppercase tracking-widest text-cyan-600 dark:text-cyan-400 flex items-center gap-2">
                    Talk to Sia{" "}
                    <span className="group-hover:translate-x-2 transition-transform">
                      →
                    </span>
                  </span>
                </Link>
              </div>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl font-black font-heading tracking-tight mb-8">
                Recent Insights
              </h2>
              <div className="p-12 rounded-[3.5rem] bg-card/40 backdrop-blur-sm border border-border/60 border-dashed group hover:border-cyan-400/30 transition-all">
                <div className="text-center py-12 max-w-sm mx-auto">
                  <div className="w-16 h-16 rounded-3xl bg-foreground/5 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                    <Activity className="w-8 h-8 text-foreground/20" />
                  </div>
                  <p className="text-foreground/40 text-lg font-medium leading-relaxed mb-8">
                    You haven't logged enough data this week to generate
                    detailed insights.
                  </p>
                  <button className="px-8 py-4 rounded-3xl bg-foreground/5 text-foreground hover:bg-cyan-500 hover:text-white text-sm font-black uppercase tracking-widest transition-all">
                    Complete today’s check-in
                  </button>
                </div>
              </div>
            </section>
          </div>

          {/* Activity Feed */}
          <div>
            <h2 className="text-xl md:text-2xl font-black font-heading tracking-tight mb-8">
              Recent Activity
            </h2>
            <div className="space-y-6">
              {recentActivities.map((activity, i) => (
                <MotionDiv
                  key={activity.title}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  whileHover={{ x: 10 }}
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
              <Link
                to="/community"
                className="block text-center p-6 rounded-[2rem] border border-border/60 text-foreground/40 text-[10px] font-black uppercase tracking-[0.2em] hover:text-cyan-600 hover:border-cyan-400/20 hover:bg-cyan-500/5 transition-all"
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
