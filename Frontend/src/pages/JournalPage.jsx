import React, { useState, useEffect } from "react";
import AuthenticatedLayout from "../components/AuthenticatedLayout";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Check, Clock, Edit2, Trash2, Calendar, Sparkles } from "lucide-react";
import api from "../services/api";

const MotionDiv = motion.div;

const JournalPage = () => {
  const [entries, setEntries] = useState([]);
  const [activeEntry, setActiveEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fetchEntries = async () => {
    try {
      const { data } = await api.get("/journal/entries");
      setEntries(data || []);
      // Auto select the first entry if none selected and not editing
      if (!activeEntry && !isEditing && data.length > 0) {
        handleSelectEntry(data[0]);
      }
    } catch (error) {
      console.error("Error fetching journal entries:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const handleSelectEntry = (entry) => {
    setActiveEntry(entry);
    setTitle(entry.title || "");
    setContent(entry.content || "");
    setIsEditing(false);
  };

  const startNewEntry = () => {
    setActiveEntry(null);
    setTitle("");
    setContent("");
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!content.trim()) return;
    setSaving(true);
    try {
      if (activeEntry) {
        // Update existing
        const { data } = await api.put(`/journal/entries/${activeEntry.id}`, { title, content });
        setActiveEntry(data.entry);
      } else {
        // Create new
        const { data } = await api.post("/journal/entries", { title, content });
        setActiveEntry(data.entry);
      }
      setSaveSuccess(true);
      setIsEditing(false);
      fetchEntries();
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (error) {
      console.error("Error saving entry:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/journal/entries/${id}`);
      if (activeEntry?.id === id) {
        startNewEntry();
      }
      fetchEntries();
    } catch (error) {
      console.error("Error deleting entry:", error);
    }
  };

  const formatDate = (dateString, withTime = false) => {
    if (!dateString) return "";
    const options = { month: "short", day: "numeric", year: "numeric" };
    if (withTime) {
      options.hour = "2-digit";
      options.minute = "2-digit";
    }
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <AuthenticatedLayout>
      <div className="flex-1 overflow-hidden flex flex-col md:flex-row max-w-7xl mx-auto w-full h-[calc(100vh-[header-height])] p-4 md:p-8 gap-6">
        
        {/* Sidebar - Entry List */}
        <div className="w-full md:w-1/3 flex flex-col gap-4 max-h-[30vh] md:max-h-none overflow-y-auto pr-2 scrollbar-hide">
          <MotionDiv initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-3xl font-black font-heading tracking-tight mb-2">My Journal</h1>
            <p className="text-foreground/50 text-sm font-medium mb-4">Reflect, relax, remember.</p>
            <button 
              onClick={startNewEntry}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-600 to-emerald-600 text-white font-black uppercase tracking-widest text-[10px] sm:text-xs transition-all shadow-lg hover:shadow-cyan-500/20 flex items-center justify-center gap-2 mb-6"
            >
              <Plus className="w-4 h-4" /> New Entry
            </button>
          </MotionDiv>
          
          <div className="flex-1 flex flex-col gap-3">
            {loading ? (
              <p className="text-foreground/40 text-sm font-medium italic p-4">Loading entries...</p>
            ) : entries.length === 0 ? (
              <div className="p-8 rounded-[2rem] bg-card/60 backdrop-blur-xl border border-border/60 text-center">
                <Sparkles className="w-8 h-8 text-cyan-600 mx-auto mb-3 opacity-50" />
                <p className="text-foreground/50 text-xs font-bold uppercase tracking-widest">No entries yet.</p>
              </div>
            ) : (
              entries.map((entry, i) => (
                <MotionDiv 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={entry.id} 
                  onClick={() => handleSelectEntry(entry)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer group flex flex-col gap-2 ${activeEntry?.id === entry.id ? 'bg-cyan-500/10 border-cyan-500/30 ring-2 ring-cyan-500/10' : 'bg-card border-border/60 hover:bg-card/80 hover:border-cyan-500/20'}`}
                >
                  <div className="flex justify-between items-start">
                    <h3 className={`font-bold font-heading truncate flex-1 pr-2 ${activeEntry?.id === entry.id ? 'text-cyan-600' : 'text-foreground'}`}>
                      {entry.title || "Untitled Entry"}
                    </h3>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDelete(entry.id); }}
                      className="text-foreground/20 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-foreground/40 line-clamp-2">
                    {entry.content}
                  </p>
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-foreground/30 mt-2">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(entry.created_at)}</span>
                  </div>
                </MotionDiv>
              ))
            )}
          </div>
        </div>

        {/* Main Editor Area */}
        <MotionDiv 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex-1 bg-card/40 backdrop-blur-xl border border-border/60 rounded-[2.5rem] md:rounded-[3rem] shadow-soft overflow-hidden flex flex-col"
        >
          {/* Editor Header */}
          <div className="px-8 py-6 border-b border-border/60 flex items-center justify-between bg-card/80">
            <div className="flex-1">
              {!isEditing && activeEntry ? (
                <>
                  <h2 className="text-2xl font-black font-heading text-foreground mb-1">
                    {activeEntry.title || "Untitled Entry"}
                  </h2>
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-foreground/40">
                    <Clock className="w-3 h-3" />
                    <span>Saved on {formatDate(activeEntry.updated_at, true)}</span>
                  </div>
                </>
              ) : (
                <input 
                  type="text"
                  placeholder="Give your entry a title... "
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-transparent text-2xl font-black font-heading text-foreground outline-none placeholder:text-foreground/20 placeholder:font-heading"
                />
              )}
            </div>
            
            <div className="flex items-center gap-3 ml-4">
              {(!isEditing && activeEntry) ? (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="p-3 rounded-xl bg-background border border-border/60 text-foreground/60 hover:text-cyan-600 hover:border-cyan-500/30 transition-all flex items-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  <span className="hidden sm:inline text-[10px] font-black uppercase tracking-widest">Edit</span>
                </button>
              ) : (
                <button 
                  onClick={handleSave}
                  disabled={saving || !content.trim()}
                  className="px-6 py-3 rounded-xl bg-cyan-600 text-white font-black uppercase tracking-widest text-[10px] transition-all shadow-md hover:bg-cyan-500 disabled:opacity-50 flex items-center gap-2 relative overflow-hidden"
                >
                  <AnimatePresence>
                    {saveSuccess && (
                      <MotionDiv 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute inset-0 bg-emerald-500 flex items-center justify-center font-bold"
                      >
                         <Check className="w-4 h-4" />
                      </MotionDiv>
                    )}
                  </AnimatePresence>
                  {saving ? "Saving..." : "Save"}
                </button>
              )}
            </div>
          </div>

          {/* Editor Body */}
          <div className="flex-1 p-8 relative">
            {/* The Notepad Lines Decoration */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05]" 
                 style={{ backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, currentColor 31px, currentColor 32px)', backgroundPositionY: '8px' }}>
            </div>
            
            {!isEditing && activeEntry ? (
              <div className="w-full h-full overflow-y-auto text-lg leading-[32px] text-foreground/80 whitespace-pre-wrap font-medium relative z-10 scrollbar-hide pb-20">
                {activeEntry.content}
              </div>
            ) : (
              <textarea 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Dear Journal..."
                className="w-full h-full bg-transparent resize-none outline-none text-lg leading-[32px] text-foreground/90 font-medium placeholder:text-foreground/30 relative z-10 scrollbar-hide pb-20"
                autoFocus
              />
            )}
          </div>
        </MotionDiv>
      </div>
    </AuthenticatedLayout>
  );
};

export default JournalPage;
