import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  BarChart2,
  MessageCircle,
  Users,
  LogOut,
  Menu,
  X,
  Heart,
  Layout as LayoutIcon,
  BookOpen,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { setSidebarOpen, closeModal } from "../features/ui/uiSlice";
import { logout } from "../features/auth/authSlice";
import ThemeToggle from "./ThemeToggle";

const MotionDiv = motion.div;

const AuthenticatedLayout = ({ children }) => {
  const { isSidebarOpen, modal } = useSelector((state) => state.ui);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const location = useLocation();

  const menuItems = [
    { name: "Dashboard", icon: LayoutIcon, path: "/dashboard" },
    { name: "Sia Chat", icon: MessageCircle, path: "/chat" },
    { name: "Community", icon: Users, path: "/community" },
    { name: "Resources", icon: BookOpen, path: "/community" },
    { name: "Mood Tracker", icon: BarChart2, path: "/mood-tracker" },
  ];

  const getPageTitle = () => {
    switch (location.pathname) {
      case "/dashboard":
        return "Your Journey";
      case "/chat":
        return "AI Companion";
      case "/community":
        return "Wellness Feed";
      case "/mood-tracker":
        return "Mood Tracker";
      case "/help":
        return "Support center";
      default:
        return "Sia";
    }
  };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden transition-colors duration-300">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-80 bg-card/60 backdrop-blur-2xl border-r border-border/60 transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] transform shadow-2xl ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-10 flex items-center justify-between">
            <Link
              to="/"
              onClick={() => dispatch(setSidebarOpen(false))}
              className="flex items-center gap-4 group"
            >
              <div className="w-12 h-12 rounded-[1.25rem] bg-gradient-to-br from-cyan-600 to-emerald-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500">
                <Heart className="w-6 h-6 text-white fill-current" />
              </div>
              <span className="text-2xl font-black font-heading tracking-tighter text-foreground pl-1">
                InfiHeal
              </span>
            </Link>
          </div>

          <nav className="flex-1 px-8 space-y-3 mt-10">
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/20 mb-6 px-4">
              Main Navigation
            </div>
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => dispatch(setSidebarOpen(false))}
                  className={`flex items-center gap-4 px-6 py-4 rounded-[1.5rem] transition-all duration-500 group relative ${
                    isActive
                      ? "bg-cyan-600/5 text-cyan-600 shadow-sm border border-cyan-400/20"
                      : "text-foreground/40 hover:text-cyan-600 hover:bg-cyan-500/5"
                  }`}
                >
                  <item.icon
                    className={`w-6 h-6 transition-transform duration-500 group-hover:scale-110 ${isActive ? "text-cyan-600" : "text-foreground/25"}`}
                  />
                  <span className="text-xs font-black uppercase tracking-widest">
                    {item.name}
                  </span>
                  {isActive && (
                    <div className="absolute left-[-2rem] w-1.5 h-8 bg-cyan-600 rounded-r-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="p-8 border-t border-border/60">
            <div className="p-6 rounded-[2rem] bg-foreground/5 border border-border/60 mb-8 group hover:bg-cyan-500/5 transition-all duration-500">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-400 to-sky-400 flex items-center justify-center text-white font-black text-xs shadow-md group-hover:scale-110 transition-transform">
                  {user?.name?.[0] || "U"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black text-foreground truncate uppercase tracking-widest">
                    {user?.name || "User"}
                  </p>
                  <p className="text-[10px] text-foreground/30 font-black uppercase tracking-tighter">
                    Pro member
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                dispatch(logout());
                dispatch(setSidebarOpen(false));
              }}
              className="w-full flex items-center gap-4 px-6 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] text-rose-500/40 hover:text-rose-600 hover:bg-rose-500/5 transition-all border border-transparent hover:border-rose-400/20"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Backdrop */}
      <AnimatePresence>
        {isSidebarOpen && (
          <MotionDiv
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => dispatch(setSidebarOpen(false))}
            className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-8 bg-background/50 backdrop-blur-xl border-b border-border z-30">
          <div className="flex items-center gap-4 flex-1">
            <button
              className="p-2 text-foreground/60 hover:text-foreground bg-card rounded-lg border border-border transition-colors hover:border-border"
              onClick={() => dispatch(setSidebarOpen(!isSidebarOpen))}
            >
              <AnimatePresence mode="wait" initial={false}>
                <MotionDiv
                  key={isSidebarOpen ? "close" : "open"}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {isSidebarOpen ? (
                    <X className="w-5 h-5" />
                  ) : (
                    <Menu className="w-5 h-5" />
                  )}
                </MotionDiv>
              </AnimatePresence>
            </button>
            <div className="flex flex-col">
              <span className="text-[10px] font-semibold text-cyan-600 dark:text-cyan-400 uppercase tracking-[0.2em]">
                {getPageTitle()}
              </span>
              <h1 className="text-sm font-bold text-foreground leading-tight">
                {location.pathname === "/chat"
                  ? "Empathy & Support"
                  : "Good morning, " + (user?.name?.split(" ")[0] || "User")}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <AnimatePresence mode="wait">
              {location.pathname !== "/chat" && (
                <MotionDiv
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <Link
                    to="/chat"
                    onClick={() => dispatch(setSidebarOpen(false))}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 transition-colors text-xs font-medium block text-white"
                  >
                    Talk to Sia
                  </Link>
                </MotionDiv>
              )}
            </AnimatePresence>
          </div>
        </header>

        <main className="flex-1 flex flex-col min-h-0 bg-background overflow-hidden px-4 md:px-0">
          <AnimatePresence mode="wait">
            <MotionDiv
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="flex-1 flex flex-col min-h-0"
            >
              {children}
            </MotionDiv>
          </AnimatePresence>
        </main>
      </div>

      {/* Global Modal Overlay */}
      {modal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-background/40 backdrop-blur-xl">
          <MotionDiv
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-card border border-border/60 w-full max-w-xl rounded-[3.5rem] p-12 relative shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)]"
          >
            <button
              onClick={() => dispatch(closeModal())}
              className="absolute top-8 right-8 w-12 h-12 rounded-2xl bg-background border border-border/60 flex items-center justify-center text-foreground/30 hover:text-cyan-600 hover:border-cyan-400/30 transition-all hover:rotate-90"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-10">
              <div className="w-16 h-16 rounded-[1.5rem] bg-cyan-600/10 flex items-center justify-center mb-8">
                <Heart className="w-8 h-8 text-cyan-600 fill-cyan-600/20" />
              </div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-600 mb-2">
                {modal.data?.type || "Resources"}
              </h4>
              <h2 className="text-4xl font-black font-heading tracking-tighter text-foreground leading-tight">
                {modal.data?.title || "Sia Support"}
              </h2>
            </div>

            <div className="space-y-6 text-foreground/40 text-lg font-medium leading-relaxed mb-12">
              <p>
                {modal.data?.author
                  ? "Contribution by " + modal.data.author
                  : "Thank you for engaging with our community."}
              </p>
              <p>
                This content is currently being finalized to provide you with
                the most accurate and empathetic support possible. We're
                dedicated to your journey.
              </p>
            </div>

            <MotionButton
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => dispatch(closeModal())}
              className="w-full py-5 rounded-[2rem] bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-cyan-600/20 transition-all"
            >
              Understand & Close
            </MotionButton>
          </MotionDiv>
        </div>
      )}
    </div>
  );
};

export default AuthenticatedLayout;
