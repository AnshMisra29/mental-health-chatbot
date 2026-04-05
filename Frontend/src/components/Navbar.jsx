import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { Heart, Menu, X, Sparkles, Activity, LifeBuoy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "./ThemeToggle";

const MotionDiv = motion.div;

const NAV_CONTENT = {
  "Features": {
    icon: Sparkles,
    title: "Eco-System Features",
    desc: "Mind Sync offers a comprehensive suite of mental wellness tools:\n\n• Sia AI: Your clinical-grade empathetic companion.\n• Real-time Journals: A safe space for gratitude and reflection.\n• Community Posts: Share and read supportive stories anonymously.\n• CBT Assessments: Evidence-based tools to understand your mind."
  },
  "Mood Log": {
    icon: Activity,
    title: "Mood Tracking",
    desc: "Our interactive Mood Log helps you visualize your emotional journey:\n\n• Daily Tracking: Log how you feel in seconds.\n• Trend Analysis: See patterns in your mood over weeks and months.\n• Personalized Insights: Sia provides feedback based on your logs.\n• Weather Sync: Understand how your environment affects your mind."
  },
  "Help": {
    icon: LifeBuoy,
    title: "How to use Sia",
    desc: "Getting started with Mind Sync is easy:\n\n• Chatting: Just start typing to talk to Sia about anything.\n• Privacy: Your data is encrypted and secure.\n• Navigation: Use the dashboard to access all your wellness tools.\n• Support: If you need technical help, reach out via the footer contact link."
  }
};

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState(null);
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [showModal]);

  const openModal = (key) => {
    setModalData(NAV_CONTENT[key]);
    setShowModal(true);
    setIsMobileMenuOpen(false);
  };

  const navLinks = ["Features", "Mood Log", "Help"];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? "py-4 bg-background/80 backdrop-blur-xl border-b border-border/60 shadow-soft"
          : "py-8 bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-8 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-4 group">
          <div className="w-12 h-12 rounded-[1.25rem] bg-gradient-to-br from-cyan-600 to-emerald-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500">
            <Heart className="w-6 h-6 text-white fill-current" />
          </div>
          <span className="text-2xl font-black font-heading tracking-tighter">
            Mind Sync
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-10">
          <div className="flex items-center gap-8 px-8 py-3 rounded-full bg-card/40 backdrop-blur-sm border border-border/60 shadow-inner">
            {navLinks.map((name) => (
              <button
                key={name}
                onClick={() => openModal(name)}
                className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 hover:text-cyan-600 transition-colors"
              >
                {name}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link
              to={isAuthenticated ? "/dashboard" : "/auth"}
              className="px-8 py-3.5 rounded-full bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-white font-black uppercase tracking-widest text-[10px] transition-all shadow-xl shadow-cyan-500/10 hover:shadow-cyan-500/25 active:scale-95"
            >
              {isAuthenticated ? "Dashboard" : "Sign In"}
            </Link>
          </div>
        </div>

        {/* Mobile Toggle */}
        <div className="flex items-center gap-4 md:hidden">
          <ThemeToggle />
          <button
            className="p-2 text-[var(--foreground)]"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <MotionDiv
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background border-b border-border overflow-hidden"
          >
            <div className="px-6 py-8 flex flex-col gap-6">
              {navLinks.map((name) => (
                <button
                  key={name}
                  onClick={() => openModal(name)}
                  className="text-lg font-black uppercase tracking-widest text-foreground/60 text-left hover:text-cyan-600 transition-colors"
                >
                  {name}
                </button>
              ))}
              <Link
                to={isAuthenticated ? "/dashboard" : "/auth"}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-white font-black uppercase tracking-widest text-center transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {isAuthenticated ? "Dashboard" : "Get Started"}
              </Link>
            </div>
          </MotionDiv>
        )}
      </AnimatePresence>

      {/* Navbar Informational Modal */}
      <AnimatePresence>
        {showModal && modalData && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 sm:p-0">
            <MotionDiv
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-lg"
            />
            <MotionDiv
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg rounded-[2.5rem] bg-card border border-border/80 shadow-2xl overflow-hidden"
            >
              <div className="p-10">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-600">
                      <modalData.icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-black font-heading tracking-tight">
                      {modalData.title}
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-foreground/20 hover:text-foreground transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <div className="space-y-4">
                  <p className="text-foreground/60 text-base leading-relaxed whitespace-pre-line">
                    {modalData.desc}
                  </p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-full mt-10 py-4 rounded-2xl bg-foreground text-background font-black uppercase tracking-widest text-[10px] transition-all hover:bg-cyan-600 hover:text-white"
                >
                  Got it
                </button>
              </div>
            </MotionDiv>
          </div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
