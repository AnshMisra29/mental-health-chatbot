import React, { useState } from "react";
import AuthenticatedLayout from "../components/AuthenticatedLayout";
import { motion } from "framer-motion";
import { Smile, Meh, Frown, Activity, Calendar } from "lucide-react";

const MotionDiv = motion.div;

const MoodTrackerPage = () => {
  const [selectedMood, setSelectedMood] = useState(null);

  const moods = [
    {
      id: "great",
      label: "Great",
      icon: Smile,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
    },
    {
      id: "okay",
      label: "Okay",
      icon: Meh,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
    },
    {
      id: "bad",
      label: "Bad",
      icon: Frown,
      color: "text-rose-500",
      bg: "bg-rose-500/10",
      border: "border-rose-500/20",
    },
  ];

  return (
    <AuthenticatedLayout>
      <div className="flex-1 overflow-y-auto p-8 max-w-6xl mx-auto w-full">
        <div className="mb-16">
          <MotionDiv
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black font-heading tracking-tight mb-3">
              Mood{" "}
              <span className="text-cyan-600 dark:text-cyan-400">Tracker</span>
            </h1>
            <p className="text-foreground/50 text-xl font-medium">
              How are you feeling today?
            </p>
          </MotionDiv>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-8 rounded-[2.5rem] bg-card border border-border/60 shadow-soft"
          >
            <h2 className="text-2xl font-bold mb-8">Log your mood</h2>
            <div className="flex justify-between gap-4">
              {moods.map((mood) => (
                <button
                  key={mood.id}
                  onClick={() => setSelectedMood(mood.id)}
                  className={`flex-1 flex flex-col items-center gap-4 p-6 rounded-[2rem] border transition-all duration-300 ${
                    selectedMood === mood.id
                      ? `${mood.bg} ${mood.border} scale-105`
                      : "bg-background border-border/40 hover:bg-card/80"
                  }`}
                >
                  <mood.icon className={`w-12 h-12 ${mood.color}`} />
                  <span className="font-bold">{mood.label}</span>
                </button>
              ))}
            </div>
            <button
              disabled={!selectedMood}
              className="w-full mt-8 px-8 py-4 rounded-[2rem] bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-black uppercase tracking-widest text-xs transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save Entry
            </button>
          </MotionDiv>

          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-8 rounded-[2.5rem] bg-card border border-border/60 shadow-soft flex flex-col justify-center items-center text-center"
          >
            <Activity className="w-16 h-16 text-cyan-500 mb-6 opacity-50" />
            <h3 className="text-2xl font-bold mb-4">Your Mood History</h3>
            <p className="text-foreground/50 mb-8">
              Log your mood daily to see your emotional trends over time.
            </p>
            <div className="flex items-center gap-2 text-sm font-bold text-cyan-600 bg-cyan-500/10 px-6 py-3 rounded-full">
              <Calendar className="w-4 h-4" />
              <span>View Calendar</span>
            </div>
          </MotionDiv>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default MoodTrackerPage;
