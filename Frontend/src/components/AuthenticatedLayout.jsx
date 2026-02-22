import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  BarChart2,
  MessageCircle,
  Users,
  Settings,
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
    { name: "Healo Chat", icon: MessageCircle, path: "/chat" },
    { name: "Community", icon: Users, path: "/community" },
    { name: "Resources", icon: BookOpen, path: "/community" },
    { name: "Mood Tracker", icon: BarChart2, path: "/dashboard" },
  ];

  const getPageTitle = () => {
    switch (location.pathname) {
      case "/dashboard":
        return "Your Journey";
      case "/chat":
        return "AI Companion";
      case "/community":
        return "Wellness Feed";
      case "/help":
        return "Support center";
      default:
        return "Healo";
    }
  };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden transition-colors duration-300">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-card border-r border-border transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] transform shadow-2xl ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-8 flex items-center justify-between">
            <Link
              to="/"
              onClick={() => dispatch(setSidebarOpen(false))}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Heart className="w-6 h-6 text-white fill-current" />
              </div>
              <span className="text-xl font-bold tracking-tight text-foreground">
                InfiHeal
              </span>
            </Link>
            <button
              onClick={() => dispatch(setSidebarOpen(false))}
              className="p-2 rounded-xl bg-background border border-border text-foreground/70 hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 px-4 space-y-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => dispatch(setSidebarOpen(false))}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-300 active:scale-95 ${
                    isActive
                      ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/20"
                      : "text-foreground/70 hover:text-foreground hover:bg-border"
                  }`}
                >
                  <item.icon
                    className={`w-5 h-5 ${isActive ? "text-indigo-400" : "text-slate-400"}`}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="p-6 border-t border-border">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-background border border-border mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center font-bold text-indigo-400">
                {user?.name?.[0] || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground truncate">
                  {user?.name || "User"}
                </p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={() => {
                dispatch(logout());
                dispatch(setSidebarOpen(false));
              }}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-sm font-bold text-rose-400 hover:bg-rose-500/10 transition-all font-outfit"
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
              className="p-2 text-foreground/70 hover:text-foreground bg-card rounded-lg border border-border transition-all hover:border-indigo-500/50"
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
              <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em]">
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
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 transition-all text-xs font-bold shadow-lg shadow-indigo-500/20 block text-white"
                  >
                    Talk to Healo
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-background/80 backdrop-blur-md">
          <div className="bg-card border border-border w-full max-w-lg rounded-[2.5rem] p-8 relative shadow-2xl animate-in zoom-in-95 duration-200">
            <button
              onClick={() => dispatch(closeModal())}
              className="absolute top-6 right-6 p-2 rounded-xl bg-background text-foreground/70 hover:text-foreground border border-border transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-8">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-indigo-500" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                {modal.data?.title || "Healo Support"}
              </h2>
              <p className="text-slate-400">
                {modal.data?.type || "Resources"}
              </p>
            </div>

            <div className="space-y-4 text-slate-300 leading-relaxed text-sm">
              <p>
                {modal.data?.author
                  ? "Contribution by " + modal.data.author
                  : "Thank you for engaging with our community."}
              </p>
              <p>
                This content is currently being finalized to provide you with
                the most accurate and empathetic support possible.
              </p>
            </div>

            <button
              onClick={() => dispatch(closeModal())}
              className="w-full mt-10 py-4 rounded-2xl bg-indigo-600 text-white font-bold hover:bg-indigo-500 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthenticatedLayout;
