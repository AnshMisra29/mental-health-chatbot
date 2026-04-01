import React, { useState, useEffect } from "react";
import AuthenticatedLayout from "../components/AuthenticatedLayout";
import { motion } from "framer-motion";
import { Smile, Meh, Frown, Activity, Calendar } from "lucide-react";
import api from "../services/api";
import { 
  ResponsiveContainer, 
  ScatterChart, 
  Scatter, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ZAxis
} from "recharts";

const MotionDiv = motion.div;

const moodValues = {
  "Happy": 5,
  "Calm": 4,
  "Neutral": 3,
  "Okay": 3,
  "Sad": 2,
  "Stressed": 1,
  "Bad": 1,
  "Great": 5
};

const MoodTrackerPage = () => {
  const [selectedMood, setSelectedMood] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      const { data } = await api.get("/mood/logs");
      setLogs(data);
    } catch (error) {
      console.error("Error fetching mood logs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    window.addEventListener("mood-updated", fetchLogs);
    return () => window.removeEventListener("mood-updated", fetchLogs);
  }, []);

  const moods = [
    {
      id: "Great",
      label: "Great",
      icon: Smile,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
    },
    {
      id: "Okay",
      label: "Okay",
      icon: Meh,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
    },
    {
      id: "Bad",
      label: "Bad",
      icon: Frown,
      color: "text-rose-500",
      bg: "bg-rose-500/10",
      border: "border-rose-500/20",
    },
  ];

  const handleSave = async () => {
    if (!selectedMood) return;
    const moodObj = moods.find(m => m.id === selectedMood);
    try {
      await api.post("/mood/logs", {
        mood_label: moodObj.label,
        mood_emoji: moodObj.id === "Great" ? "😊" : moodObj.id === "Okay" ? "😐" : "😔",
        note: ""
      });
      setSelectedMood(null);
      window.dispatchEvent(new Event("mood-updated"));
    } catch (error) {
      console.error("Error saving mood:", error);
    }
  };

  // Prepare data for charts
  const chartData = [...logs].reverse().map(log => {
    const date = new Date(log.timestamp);
    return {
      date: date.toLocaleDateString([], { month: 'short', day: 'numeric' }),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      fullDate: date.toLocaleString(),
      value: moodValues[log.mood_label] || 3,
      label: log.mood_label,
      emoji: log.mood_emoji,
      note: log.note
    };
  });

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border/60 p-4 rounded-2xl shadow-xl">
          <p className="font-black text-foreground mb-1">{data.fullDate}</p>
          <p className="text-2xl mb-2">{data.emoji} <span className="text-sm font-bold ml-2">{data.label}</span></p>
          {data.note && <p className="text-foreground/60 text-xs italic">"{data.note}"</p>}
        </div>
      );
    }
    return null;
  };

  return (
    <AuthenticatedLayout>
      <div className="flex-1 overflow-y-auto p-8 max-w-6xl mx-auto w-full">
        <div className="mb-16">
          <MotionDiv
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black font-heading tracking-tight mb-3">
              Your{" "}
              <span className="text-cyan-600 dark:text-cyan-400">Journal</span>
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
              onClick={handleSave}
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
            <h3 className="text-2xl font-bold mb-4">Your Mood Statistics</h3>
            <p className="text-foreground/50 mb-8">
              You have logged {logs.length} mood entries. Keep logging to see long-term trends!
            </p>
            <div className="flex items-center gap-2 text-sm font-bold text-cyan-600 bg-cyan-500/10 px-6 py-3 rounded-full">
              <Calendar className="w-4 h-4" />
              <span>{logs.length > 0 ? new Date(logs[0].timestamp).toLocaleDateString() : "No logs yet"}</span>
            </div>
          </MotionDiv>
        </div>

        {/* Graphs Section */}
        {logs.length > 0 && (
          <MotionDiv 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-8"
          >
             <div className="p-8 md:p-12 rounded-[3.5rem] bg-card border border-border/60 shadow-soft">
               <h2 className="text-2xl font-black font-heading tracking-tight mb-8">Mood Trend</h2>
               <div className="h-[400px] w-full">
                 <ResponsiveContainer width="100%" height="100%">
                   <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                     <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                     <XAxis dataKey="date" stroke="#64748b" tick={{ fill: '#64748b' }} tickMargin={15} />
                     <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tickFormatter={(val) => {
                       return {5: 'Great', 4: 'Good', 3: 'Okay', 2: 'Sad', 1: 'Bad'}[val] || '';
                     }} stroke="#64748b" tick={{ fill: '#64748b' }} width={80} />
                     <Tooltip content={<CustomTooltip />} />
                     <Line 
                       type="monotone" 
                       dataKey="value" 
                       stroke="#06b6d4" 
                       strokeWidth={4} 
                       dot={{ r: 6, fill: "#06b6d4", strokeWidth: 2, stroke: "#fff" }} 
                       activeDot={{ r: 8, fill: "#10b981", strokeWidth: 0 }}
                       animationDuration={1500}
                     />
                   </LineChart>
                 </ResponsiveContainer>
               </div>
             </div>

             <div className="p-8 md:p-12 rounded-[3.5rem] bg-card border border-border/60 shadow-soft">
               <h2 className="text-2xl font-black font-heading tracking-tight mb-8">Mood Distribution (Scatter)</h2>
               <div className="h-[400px] w-full">
                 <ResponsiveContainer width="100%" height="100%">
                   <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                     <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                     <XAxis type="category" dataKey="date" name="Date" stroke="#64748b" tick={{ fill: '#64748b' }} tickMargin={15} allowDuplicatedCategory={true} />
                     <YAxis type="number" dataKey="value" name="Mood" domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tickFormatter={(val) => {
                       return {5: 'Great', 4: 'Good', 3: 'Okay', 2: 'Sad', 1: 'Bad'}[val] || '';
                     }} stroke="#64748b" tick={{ fill: '#64748b' }} width={80} />
                     <ZAxis type="category" dataKey="time" name="Time" />
                     <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
                     <Scatter 
                       data={chartData} 
                       fill="#10b981" 
                       line={{ stroke: "#10b981", strokeWidth: 1, opacity: 0.3 }}
                       shape="circle" 
                     />
                   </ScatterChart>
                 </ResponsiveContainer>
               </div>
             </div>
          </MotionDiv>
        )}
      </div>
    </AuthenticatedLayout>
  );
};

export default MoodTrackerPage;
