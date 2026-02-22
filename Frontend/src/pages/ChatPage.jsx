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
} from "lucide-react";
import AuthenticatedLayout from "../components/AuthenticatedLayout";
import { addMessage, setTyping, sendMessage, clearError } from "../features/chat/chatSlice";
import { logout } from "../features/auth/authSlice";

const MotionDiv = motion.div;

const ChatPage = () => {
  const [input, setInput] = useState("");
  const { messages, isTyping, error: chatError } = useSelector((state) => state.chat);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const scrollRef = useRef(null);
  const msgCounter = useRef(0);

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
      <div className="flex h-full flex-col relative overflow-hidden bg-slate-950">
        {/* Immersive Background Elements */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-500/5 blur-[120px] rounded-full -z-10 pointer-events-none" />

        {/* Chat Header Info */}
        <div className="px-8 py-4 bg-slate-900/40 backdrop-blur-md border-b border-slate-800 flex items-center justify-between z-10">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white">Sia AI</h2>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] text-emerald-500 font-black uppercase tracking-wider">
                  Sia is Online
                </span>
              </div>
            </div>
          </div>
          <button className="p-2 text-slate-400 hover:text-white transition-colors">
            <Info className="w-5 h-5" />
          </button>
        </div>

        {/* Message Area */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-8 space-y-8 scroll-smooth"
        >
          {messages.length === 0 && (
            <div className="max-w-md mx-auto text-center mt-20">
              <div className="w-20 h-20 rounded-3xl bg-indigo-600/10 flex items-center justify-center mx-auto mb-6 border border-indigo-500/20">
                <Sparkles className="w-10 h-10 text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">
                Welcome, {user?.name || "Friend"}
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
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
                    className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-400 hover:border-indigo-500/50 hover:text-white transition-all"
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
                  className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-1 ${msg.sender === "user"
                    ? "bg-indigo-500/20 text-indigo-400"
                    : "bg-slate-800 text-slate-400"
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
                    className={`px-5 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.sender === "user"
                      ? "bg-indigo-600 text-white rounded-tr-none"
                      : "bg-slate-900 border border-slate-800 text-slate-300 rounded-tl-none"
                      }`}
                  >
                    {msg.text}
                  </div>
                  <div className="flex items-center gap-2 px-1">
                    <p className="text-[10px] font-bold text-slate-600">
                      {msg.timestamp}
                    </p>
                    {msg.sender === "ai" && msg.emotion && (
                      <span className="text-[10px] font-black text-indigo-400/60 uppercase tracking-tighter">
                        • {msg.emotion}
                      </span>
                    )}
                  </div>
                </div>
              </MotionDiv>
            ))}
          </AnimatePresence>

          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-4"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 animate-pulse">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="px-5 py-4 rounded-2xl bg-slate-900 border border-slate-800 rounded-tl-none flex gap-1.5 items-center">
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" />
              </div>
            </motion.div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-8 bg-gradient-to-t from-slate-950 via-slate-950 to-transparent">
          <form
            onSubmit={handleSend}
            className="max-w-4xl mx-auto relative group"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-[2.2rem] opacity-20 blur group-focus-within:opacity-40 transition-opacity" />
            <div className="relative flex items-center bg-slate-900 border border-slate-800 rounded-[2rem] p-2 pl-6 focus-within:border-indigo-500/50 transition-all shadow-2xl">
              <Smile className="w-6 h-6 text-slate-500 hover:text-indigo-400 cursor-pointer transition-colors" />
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message or just say how you feel..."
                className="flex-1 bg-transparent px-4 py-3 text-sm text-white focus:outline-none placeholder:text-slate-600"
              />
              <div className="flex items-center gap-2 pr-2">
                <button
                  type="button"
                  className="p-2 text-slate-500 hover:text-indigo-400 transition-colors"
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
          <p className="text-center text-[10px] text-slate-600 mt-4 font-bold uppercase tracking-widest">
            Sia AI can make mistakes. Consider checking important info.
          </p>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default ChatPage;
