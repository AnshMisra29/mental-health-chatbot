import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Sparkles,
  User,
  Info,
  MoreHorizontal,
  Smile,
  Paperclip,
  Trash2,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Circle,
  XCircle,
  Activity,
  Heart,
} from "lucide-react";
import AuthenticatedLayout from "../components/AuthenticatedLayout";
import DoctorSuggestions from "../components/DoctorSuggestions";
import {
  addMessage,
  setTyping,
  sendMessage,
  clearError,
  clearFailedMessage,
  fetchChatHistory,
  deleteChatMessage,
  deleteBulkMessages,
} from "../features/chat/chatSlice";
import { logout } from "../features/auth/authSlice";

const MotionDiv = motion.div;

const ChatPage = () => {
  const [input, setInput] = useState("");
  const {
    messages,
    isTyping,
    error: chatError,
    failedMessage,
    historyLoading,
  } = useSelector((state) => state.chat);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const scrollRef = useRef(null);
  const msgCounter = useRef(0);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [showInfoDropdown, setShowInfoDropdown] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (showBulkDeleteModal || showAboutModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [showBulkDeleteModal, showAboutModal]);
  
  // Doctor Suggestion State (No longer needed for modal, but kept if we want to track something else)
  // const [activeAlertId, setActiveAlertId] = useState(null);


  // Load chat history on component mount
  useEffect(() => {
    if (!historyLoaded && user) {
      dispatch(fetchChatHistory({ page: 1, per_page: 50 }));
      setHistoryLoaded(true);
    }
  }, [user, dispatch, historyLoaded]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  useEffect(() => {
    if (chatError && chatError.includes("401")) {
      // If we got a 401, the interceptor cleared localStorage, now we update Redux state
      dispatch(logout());
    }
  }, [chatError, dispatch]);

  // Handle Crisis (Modal removed, logging for potential future use)
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.sender === "ai" && lastMessage.isCrisis && lastMessage.alertId) {
      console.log("Crisis detected, showing in-chat suggestions for alert:", lastMessage.alertId);
    }
  }, [messages]);


  const handleSend = async (e) => {
    e.preventDefault();
    const messageText = input.trim();
    if (!messageText) return;

    // Clear any previous error/retry state before sending
    dispatch(clearError());
    dispatch(clearFailedMessage());

    const userMessage = {
      id: `u-${Date.now()}`,
      text: messageText,
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    dispatch(addMessage(userMessage));
    setInput("");
    dispatch(sendMessage({ message: messageText }));
  };

  // Retry the last failed message — pre-fills the input so user just hits send
  const handleRetry = () => {
    if (failedMessage) {
      dispatch(clearError());
      dispatch(clearFailedMessage());
      setInput(failedMessage);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteBulkMessages(selectedIds)).unwrap();
      setShowBulkDeleteModal(false);
      setSelectedIds([]);
      setIsSelectionMode(false);
    } catch (err) {
      console.error("Failed to bulk delete chats:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleSelection = (chatDbId) => {
    const id = parseInt(chatDbId);
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const quickReplies = [
    "I'm feeling anxious",
    "How can I sleep better?",
    "I need to vent",
    "Tell me a joke",
  ];

  return (
    <AuthenticatedLayout>
      <div className="flex h-full flex-col relative overflow-hidden bg-background">
        {/* Immersive Background Elements */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-500/5 blur-[120px] rounded-full -z-10 pointer-events-none" />

        {/* Chat Header Info */}
        <div className="px-8 py-4 bg-background/40 backdrop-blur-md border-b border-border flex items-center justify-between z-10">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white">
                {isSelectionMode ? `Select Messages (${selectedIds.length})` : "Sia AI"}
              </h2>
              <div className="flex items-center gap-1.5">
                <div className={`w-1.5 h-1.5 rounded-full ${isSelectionMode ? "bg-amber-500" : "bg-emerald-500"} animate-pulse`} />
                <span className={`text-[10px] font-black uppercase tracking-wider ${isSelectionMode ? "text-amber-500" : "text-emerald-500"}`}>
                  {isSelectionMode ? "Selection Active" : "Sia is Online"}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {isSelectionMode ? (
              <button 
                onClick={() => {
                  setIsSelectionMode(false);
                  setSelectedIds([]);
                }}
                className="px-4 py-2 rounded-xl bg-foreground/5 hover:bg-foreground/10 text-foreground/60 text-[10px] font-black uppercase tracking-widest transition-all"
              >
                Cancel
              </button>
            ) : (
              <div className="relative">
                <button 
                  onClick={() => setShowInfoDropdown(!showInfoDropdown)}
                  className="p-2 text-foreground/60 hover:text-foreground transition-colors bg-foreground/5 rounded-xl border border-border/40"
                >
                  <Info className="w-5 h-5" />
                </button>
                
                <AnimatePresence>
                  {showInfoDropdown && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowInfoDropdown(false)} />
                      <MotionDiv
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-3 w-48 rounded-2xl bg-card border border-border shadow-soft p-2 z-20"
                      >
                        <button
                          onClick={() => {
                            setIsSelectionMode(true);
                            setShowInfoDropdown(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-rose-500/10 text-rose-500 transition-colors text-left"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="text-xs font-black uppercase tracking-widest">Delete Chats</span>
                        </button>
                        <div className="h-px bg-border/40 my-1" />
                        <button
                          onClick={() => {
                            setShowAboutModal(true);
                            setShowInfoDropdown(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-foreground/5 text-foreground/60 transition-colors text-left"
                        >
                          <Info className="w-4 h-4" />
                          <span className="text-xs font-black uppercase tracking-widest">About Sia</span>
                        </button>
                      </MotionDiv>
                    </>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

        {/* Message Area */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-8 space-y-8 scroll-smooth"
        >
          {historyLoading && messages.length === 0 && (
            <div className="max-w-md mx-auto text-center mt-20">
              <div className="w-20 h-20 rounded-3xl bg-indigo-600/10 flex items-center justify-center mx-auto mb-6 border border-indigo-500/20 animate-pulse">
                <Sparkles className="w-10 h-10 text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">
                Loading your history...
              </h3>
              <p className="text-foreground/60 text-sm leading-relaxed">
                Retrieving your previous conversations
              </p>
            </div>
          )}

          {messages.length === 0 && !historyLoading && (
            <div className="max-w-md mx-auto text-center mt-20">
              <div className="w-20 h-20 rounded-3xl bg-indigo-600/10 flex items-center justify-center mx-auto mb-6 border border-indigo-500/20">
                <Sparkles className="w-10 h-10 text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">
                Welcome, {user?.name || "Friend"}
              </h3>
              <p className="text-foreground/60 text-sm leading-relaxed">
                I'm Sia, your personal AI companion. I'm here to listen,
                support, and help you navigate your journey. What's on your mind
                today?
              </p>
              <div className="mt-8 grid grid-cols-2 gap-3">
                {quickReplies.map((reply) => (
                  <button
                    key={reply}
                    onClick={() => {
                      setInput(reply);
                      // Automatic send logic could go here
                    }}
                    className="p-3 rounded-xl bg-card border border-border text-xs font-bold text-foreground/60 hover:border-indigo-500/50 hover:text-foreground transition-all"
                  >
                    {reply}
                  </button>
                ))}
              </div>
            </div>
          )}

          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <MotionDiv
                key={msg.id}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex gap-4 ${msg.sender === "user" ? "flex-row-reverse text-right" : ""}`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-1 ${
                    msg.sender === "user"
                      ? "bg-indigo-500/20 text-indigo-400"
                      : "bg-card text-foreground/70"
                  }`}
                >
                  {msg.sender === "user" ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                </div>
                <div className="max-w-[75%] space-y-1">
                  <div
                    className={`px-5 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                      msg.sender === "user"
                        ? "bg-indigo-600 text-white rounded-tr-none"
                        : "bg-card border border-border text-foreground/80 rounded-tl-none"
                    }`}
                  >
                    {msg.text}
                  </div>
                    <div className="flex items-center gap-3 px-1">
                      <p className="text-[10px] font-bold text-foreground/60">
                        {msg.timestamp}
                      </p>
                      {msg.sender === "ai" && msg.emotion && (
                        <span className="text-[10px] font-black text-indigo-400/60 uppercase tracking-tighter">
                          • {msg.emotion}
                        </span>
                      )}
                      {msg.sender === "ai" && msg.riskLevel && (
                        <span
                          className={`text-[10px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-full ${
                            msg.riskLevel === "CRITICAL"
                              ? "bg-red-500/20 text-red-400"
                              : msg.riskLevel === "HIGH"
                                ? "bg-orange-500/20 text-orange-400"
                                : msg.riskLevel === "MEDIUM"
                                  ? "bg-yellow-500/20 text-yellow-400"
                                  : "bg-green-500/20 text-green-400"
                          }`}
                        >
                          {msg.riskLevel}
                        </span>
                      )}
                      
                      {/* History Selection UI */}
                      {msg.sender === "ai" && msg.id.startsWith("hist-") && isSelectionMode && (
                        <div 
                          onClick={(e) => {
                            e.stopPropagation();
                            const chatDbId = msg.id.split('-')[1];
                            toggleSelection(chatDbId);
                          }}
                          className="flex items-center gap-2 mt-4 p-2 rounded-xl bg-foreground/5 border border-border/40 cursor-pointer hover:bg-foreground/10 transition-all"
                        >
                          {selectedIds.includes(parseInt(msg.id.split('-')[1])) ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <Circle className="w-4 h-4 text-foreground/20" />
                          )}
                          <span className="text-[9px] font-black uppercase tracking-widest text-foreground/40">
                            {selectedIds.includes(parseInt(msg.id.split('-')[1])) ? "Selected for deletion" : "Tap to select"}
                          </span>
                        </div>
                      )}
                    </div>

                  {/* Inline Doctor Suggestions */}
                  {msg.sender === "ai" && msg.isCrisis && msg.alertId && (
                    <div className="w-full max-w-full overflow-hidden">
                      <DoctorSuggestions alertId={msg.alertId} />
                    </div>
                  )}
                </div>
              </MotionDiv>
            ))}
          </AnimatePresence>

          {/* Groq Error / Retry Banner */}
          {chatError && failedMessage && !isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-4"
            >
              <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center flex-shrink-0 mt-1">
                <Sparkles className="w-4 h-4 text-rose-400" />
              </div>
              <div className="max-w-[75%] space-y-2">
                <div className="px-5 py-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm rounded-tl-none">
                  Sia couldn't respond right now. Tap <strong>Try Again</strong> to resend your message.
                </div>
                <button
                  onClick={handleRetry}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black uppercase tracking-widest transition-all"
                >
                  Try Again
                </button>
              </div>
            </motion.div>
          )}

          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-4"
            >
              <div className="w-8 h-8 rounded-lg bg-card flex items-center justify-center text-foreground/60 animate-pulse">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="px-5 py-4 rounded-2xl bg-card border border-border rounded-tl-none flex gap-1.5 items-center">
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" />
              </div>
            </motion.div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-8 bg-gradient-to-t from-background via-background to-transparent">
          <form
            onSubmit={handleSend}
            className="max-w-4xl mx-auto relative group"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-[2.2rem] opacity-20 blur group-focus-within:opacity-40 transition-opacity" />
            <div className="relative flex items-center bg-card border border-border rounded-[2rem] p-2 pl-6 focus-within:border-indigo-500/50 transition-all shadow-2xl">
              <Smile className="w-6 h-6 text-foreground/60 hover:text-indigo-400 cursor-pointer transition-colors" />
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message or just say how you feel..."
                className="flex-1 bg-transparent px-4 py-3 text-sm text-foreground focus:outline-none placeholder:text-foreground/60"
              />
              <div className="flex items-center gap-2 pr-2">
                <button
                  type="button"
                  className="p-2 text-foreground/60 hover:text-indigo-400 transition-colors"
                >
                  <Paperclip className="w-5 h-5" />
                </button>
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 hover:bg-indigo-500 disabled:opacity-50 disabled:scale-95 transition-all"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </form>
          <p className="text-center text-[10px] text-foreground/60 mt-4 font-bold uppercase tracking-widest">
            Sia AI can make mistakes. Consider checking important info.
          </p>
        </div>

        {/* Floating Bulk Delete Button */}
        <AnimatePresence>
          {isSelectionMode && selectedIds.length > 0 && (
            <MotionDiv
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="fixed bottom-32 left-1/2 -translate-x-1/2 z-50 w-full max-w-xs px-4"
            >
              <button
                onClick={() => setShowBulkDeleteModal(true)}
                className="w-full py-4 rounded-[2rem] bg-rose-500 hover:bg-rose-600 text-white font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-rose-500/40 flex items-center justify-center gap-3 transition-all active:scale-95"
              >
                <Trash2 className="w-4 h-4" />
                Delete Selected ({selectedIds.length})
              </button>
            </MotionDiv>
          )}
        </AnimatePresence>

        {/* Delete Confirmation Modal (Bulk) */}
        <AnimatePresence>
          {showBulkDeleteModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-0">
              <MotionDiv
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowBulkDeleteModal(false)}
                className="absolute inset-0 bg-background/80 backdrop-blur-lg"
              />
              <MotionDiv
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-sm rounded-[2.5rem] bg-card border border-border/80 shadow-2xl p-10 text-center"
              >
                <div className="w-20 h-20 rounded-3xl bg-rose-500/10 flex items-center justify-center mx-auto mb-8 border border-rose-500/20">
                  <AlertCircle className="w-10 h-10 text-rose-500" />
                </div>
                <h3 className="text-2xl font-black mb-4 font-heading tracking-tight">Delete {selectedIds.length} Messages?</h3>
                <p className="text-foreground/60 text-sm leading-relaxed mb-10">
                  Are you sure you want to delete these {selectedIds.length} message pairs?
                  <span className="block mt-2 font-bold text-[10px] uppercase tracking-widest text-slate-500">Dashboard stats remain same</span>
                </p>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleBulkDelete}
                    disabled={isDeleting}
                    className="w-full py-4 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-rose-500/25 flex items-center justify-center gap-2"
                  >
                    {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : `Yes, Delete All (${selectedIds.length})`}
                  </button>
                  <button
                    onClick={() => setShowBulkDeleteModal(false)}
                    disabled={isDeleting}
                    className="w-full py-4 rounded-2xl bg-foreground/5 hover:bg-foreground/10 text-foreground/60 font-black uppercase tracking-widest text-xs transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </MotionDiv>
            </div>
          )}
        </AnimatePresence>

        {/* About Sia Modal */}
        <AnimatePresence>
          {showAboutModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-0">
              <MotionDiv
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowAboutModal(false)}
                className="absolute inset-0 bg-background/80 backdrop-blur-lg"
              />
              <MotionDiv
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-[3rem] bg-card border border-border/60 shadow-2xl overflow-x-hidden custom-scrollbar"
              >
                <div className="bg-gradient-to-br from-indigo-600 to-violet-600 p-12 text-center relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-3xl rounded-full translate-x-1/3 -translate-y-1/3" />
                   <div className="w-24 h-24 rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto mb-8 border border-white/30 shadow-2xl">
                     <Sparkles className="w-12 h-12 text-white" />
                   </div>
                   <h3 className="text-4xl font-black text-white font-heading tracking-tight mb-2">I'm Sia</h3>
                   <p className="text-white/80 text-[10px] font-black uppercase tracking-[0.3em]">Supportive AI Assistant</p>
                </div>
                
                <div className="p-12 space-y-10">
                  <div className="space-y-4 text-center">
                    <p className="text-foreground/70 text-lg leading-relaxed font-medium">
                      I'm here to provide a safe, non-judgmental space for your thoughts 
                      and feelings. I use advanced understanding to support your mental wellness journey 24/7.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { icon: Smile, title: "Active Listening", desc: "Non-judgmental support" },
                      { icon: Activity, title: "Mood Tracking", desc: "Understand your trends" },
                      { icon: AlertCircle, title: "Crisis Support", desc: "Rapid help connections" },
                      { icon: Heart, title: "Self-Care", desc: "Empathetic guidance" }
                    ].map(feat => (
                      <div key={feat.title} className="p-6 rounded-[2rem] bg-foreground/5 border border-border/40 flex flex-col gap-3 group hover:border-indigo-500/30 transition-all">
                        <feat.icon className="w-6 h-6 text-indigo-500 group-hover:scale-110 transition-transform" />
                        <div>
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-foreground">{feat.title}</h4>
                          <p className="text-[9px] text-foreground/40 font-medium leading-tight mt-1">{feat.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => setShowAboutModal(false)}
                    className="w-full py-5 rounded-[2rem] bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-[0.2em] text-[10px] transition-all shadow-xl shadow-indigo-500/25 active:scale-95"
                  >
                    Got it, Sia
                  </button>
                </div>
              </MotionDiv>
            </div>
          )}
        </AnimatePresence>

      </div>
    </AuthenticatedLayout>

  );
};

export default ChatPage;
