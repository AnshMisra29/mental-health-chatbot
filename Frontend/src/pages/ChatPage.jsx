import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, User, Info, Smile, Paperclip } from "lucide-react";
import AuthenticatedLayout from "../components/AuthenticatedLayout";
import { addMessage, sendMessage } from "../features/chat/chatSlice";

const MotionDiv = motion.div;
const MotionButton = motion.button;

const ChatPage = () => {
  const [input, setInput] = useState("");
  const { messages, isTyping } = useSelector((state) => state.chat);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const scrollRef = useRef(null);
  const hasMessages = messages && messages.length > 0;

  useEffect(() => {
    if (!scrollRef.current) return;
    // Avoid auto-scrolling when there are no messages (welcome state)
    if (!messages || messages.length === 0) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping]);

  const handleSend = async (e) => {
    e.preventDefault();
    const messageText = input.trim();
    if (!messageText) return;

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

    // Call real API
    dispatch(sendMessage({ message: messageText }));
  };

  const quickReplies = [
    "I'm feeling anxious",
    "How can I sleep better?",
    "I need to vent",
    "Tell me a joke",
  ];

  return (
    <AuthenticatedLayout>
      <div className="flex flex-1 flex-col relative overflow-hidden bg-background min-h-0">
        <div className="px-8 py-5 bg-background/80 backdrop-blur-xl border-b border-border/60 flex items-center justify-between z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-[1.25rem] bg-gradient-to-br from-cyan-500 to-emerald-500 p-0.5 shadow-lg group transition-transform hover:scale-105 active:scale-95 cursor-pointer">
              <div className="w-full h-full rounded-[1.1rem] bg-background flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-cyan-500 group-hover:animate-pulse" />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-black text-foreground font-heading tracking-tight leading-tight">
                Sia AI
              </h2>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-black uppercase tracking-[0.2em]">
                  Online
                </span>
              </div>
            </div>
          </div>
          <button className="w-10 h-10 rounded-full bg-foreground/5 flex items-center justify-center text-foreground/40 hover:text-cyan-500 hover:bg-cyan-500/5 transition-all">
            <Info className="w-5 h-5" />
          </button>
        </div>

        {/* Message Area */}
        <div
          ref={scrollRef}
          className={`flex-1 ${hasMessages ? "overflow-y-auto space-y-8 scroll-smooth" : "flex items-center justify-center"} px-8 py-10`}
        >
          {!hasMessages && (
            <div className="max-w-xl mx-auto text-center px-6">
              <MotionDiv
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-24 h-24 rounded-[2.5rem] bg-gradient-to-br from-cyan-500/10 to-emerald-500/10 flex items-center justify-center mx-auto mb-10 border border-cyan-500/10 shadow-soft"
              >
                <Sparkles className="w-12 h-12 text-cyan-600 dark:text-cyan-400" />
              </MotionDiv>
              <h3 className="text-4xl md:text-5xl font-black mb-6 font-heading tracking-tight leading-tight">
                Welcome, {user?.name?.split(" ")[0] || "Friend"}
              </h3>
              <p className="text-foreground/40 text-lg font-medium leading-relaxed max-w-md mx-auto mb-12">
                I’m Sia, your personal AI companion. I’m here to listen,
                support, and help you navigate your journey. What’s on your
                mind?
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto">
                {quickReplies.map((reply, i) => (
                  <MotionDiv
                    key={reply}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * i }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setInput(reply)}
                    className="p-5 rounded-2xl bg-card border border-border/60 text-xs font-black uppercase tracking-widest text-foreground/40 hover:border-cyan-400/30 hover:text-cyan-600 hover:shadow-soft transition-all cursor-pointer text-center"
                  >
                    {reply}
                  </MotionDiv>
                ))}
              </div>
            </div>
          )}

          <AnimatePresence initial={false}>
            {(messages || []).map((msg) => (
              <MotionDiv
                key={msg.id}
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className={`flex gap-6 ${msg.sender === "user" ? "flex-row-reverse" : ""}`}
              >
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 mt-1 shadow-soft p-3 ${
                    msg.sender === "user"
                      ? "bg-cyan-500 text-white"
                      : "bg-card border border-border/60 text-foreground/40"
                  }`}
                >
                  {msg.sender === "user" ? (
                    <User className="w-6 h-6" />
                  ) : (
                    <Sparkles className="w-6 h-6" />
                  )}
                </div>
                <div
                  className={`max-w-[70%] space-y-2 ${msg.sender === "user" ? "text-right" : ""}`}
                >
                  <div
                    className={`px-8 py-5 rounded-[2.5rem] text-sm md:text-base leading-relaxed shadow-soft font-medium ${
                      msg.sender === "user"
                        ? "bg-gradient-to-r from-cyan-600 to-sky-600 text-white rounded-tr-none"
                        : "bg-card border border-border/60 text-foreground/80 rounded-tl-none backdrop-blur-sm"
                    }`}
                  >
                    {msg.text}
                  </div>
                  <div
                    className={`flex items-center gap-3 px-3 ${msg.sender === "user" ? "flex-row-reverse" : ""}`}
                  >
                    <p className="text-[10px] font-black uppercase tracking-widest text-foreground/20">
                      {msg.timestamp}
                    </p>
                    {msg.sender === "ai" && msg.emotion && (
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-500 opacity-60">
                        • {msg.emotion}
                      </span>
                    )}
                  </div>
                </div>
              </MotionDiv>
            ))}
          </AnimatePresence>

          {isTyping && (
            <MotionDiv
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="flex gap-6"
            >
              <div className="w-12 h-12 rounded-2xl bg-card border border-border/60 shadow-soft flex items-center justify-center text-foreground/40 p-3">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="px-8 py-5 rounded-[2rem] bg-card border border-border/60 rounded-tl-none shadow-soft flex gap-2.5 items-center">
                <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" />
              </div>
            </MotionDiv>
          )}
        </div>

        {/* Input Area */}
        <div className="px-8 py-10 bg-background/80 backdrop-blur-xl border-t border-border/60">
          <form
            onSubmit={handleSend}
            className="max-w-4xl mx-auto relative group"
          >
            <div className="flex items-center bg-card border border-border/60 rounded-[3rem] p-4 pl-10 pr-4 shadow-soft transition-all duration-500 focus-within:shadow-xl focus-within:border-cyan-400/30 focus-within:scale-[1.01]">
              <Smile className="w-8 h-8 text-foreground/20 hover:text-cyan-500 cursor-pointer transition-colors p-1" />
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Share your thoughts with Sia..."
                className="flex-1 bg-transparent px-6 py-4 text-lg text-foreground focus:outline-none placeholder:text-foreground/30 font-medium"
              />
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  className="w-12 h-12 rounded-full text-foreground/20 hover:text-cyan-500 hover:bg-cyan-500/5 transition-all flex items-center justify-center"
                >
                  <Paperclip className="w-5 h-5" />
                </button>
                <MotionButton
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={!input.trim()}
                  className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-600 to-sky-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20 disabled:opacity-20 transition-all hover:shadow-cyan-500/40"
                >
                  <Send className="w-6 h-6" />
                </MotionButton>
              </div>
            </div>
            <div className="absolute -bottom-8 left-10 flex gap-6">
              <span className="text-[10px] font-black uppercase tracking-widest text-foreground/20">
                Sia is listening
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest text-cyan-500 opacity-0 group-focus-within:opacity-100 transition-opacity">
                Type naturally
              </span>
            </div>
          </form>
          <p className="text-center text-[10px] text-foreground/30 mt-3 tracking-wide">
            Sia may make mistakes. Always check important information.
          </p>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default ChatPage;
