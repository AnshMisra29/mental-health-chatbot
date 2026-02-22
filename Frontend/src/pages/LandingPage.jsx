import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Sparkles,
  Shield,
  Zap,
  ArrowRight,
  Brain,
  MessageCircle,
  Users,
  LineChart,
} from "lucide-react";

const MotionDiv = motion.div;
const MotionButton = motion.button;

const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const handleStartJourney = () => {
    if (isAuthenticated) {
      navigate("/dashboard");
    } else {
      navigate("/auth");
    }
  };

  const handleExploreTools = () => {
    if (isAuthenticated) {
      navigate("/community");
    } else {
      navigate("/auth");
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <div className="min-h-screen bg-background transition-colors duration-500 overflow-x-hidden selection:bg-cyan-500/15">
      <Navbar />

      <main>
        {/* Hero Section */}
        <section className="relative pt-64 pb-48 overflow-hidden min-h-[90vh] flex items-center">
          {/* Advanced Decorative Elements */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[140%] h-[1000px] bg-gradient-to-b from-cyan-500/5 via-transparent to-transparent blur-[120px] rounded-full pointer-events-none" />
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />

          <div className="max-w-7xl mx-auto px-8 relative z-10 w-full">
            <MotionDiv
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="max-w-5xl"
            >
              <motion.div
                variants={itemVariants}
                className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-cyan-600/5 border border-cyan-400/20 text-cyan-600 mb-12"
              >
                <Sparkles className="w-4 h-4" />
                <span className="text-xs font-black uppercase tracking-[0.2em]">
                  NextGen Mental Health Platform
                </span>
              </motion.div>

              <motion.h1
                variants={itemVariants}
                className="text-8xl md:text-[9rem] lg:text-[11rem] font-black font-heading tracking-[-0.05em] leading-[0.85] mb-12 text-foreground"
              >
                Heal <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 via-emerald-600 to-cyan-600 bg-[length:200%_auto] animate-gradient-x">
                  Different.
                </span>
              </motion.h1>

              <motion.p
                variants={itemVariants}
                className="text-2xl md:text-3xl font-medium text-foreground/40 max-w-2xl mb-16 leading-relaxed"
              >
                Experience the world's most empathetic AI companion for mental
                wellness. Accessible 24/7, clinical-grade, and entirely private.
              </motion.p>

              <motion.div
                variants={itemVariants}
                className="flex flex-col sm:flex-row gap-6"
              >
                <MotionButton
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleStartJourney}
                  className="px-12 py-6 rounded-[2rem] bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-black uppercase tracking-[0.2em] text-xs shadow-[0_20px_40px_-10px_rgba(8,145,178,0.3)] flex items-center justify-center gap-4 group transition-all"
                >
                  Start Your Journey
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </MotionButton>
                <MotionButton
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleExploreTools}
                  className="px-12 py-6 rounded-[2rem] bg-card border border-border/60 text-foreground/80 font-black uppercase tracking-[0.2em] text-xs shadow-soft hover:shadow-lg flex items-center justify-center gap-4 transition-all"
                >
                  Explore CBT Tools
                </MotionButton>
              </motion.div>
            </MotionDiv>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-32 relative border-y border-border/60">
          <div className="absolute inset-0 bg-card/10 backdrop-blur-3xl" />
          <div className="max-w-7xl mx-auto px-8 relative z-10">
            <MotionDiv
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-2 md:grid-cols-4 gap-16"
            >
              {[
                { label: "Active Users", value: "85K+" },
                { label: "AI Chats", value: "2.4M+" },
                { label: "Self-Tests", value: "350K+" },
                { label: "Privacy Rate", value: "100%" },
              ].map((stat) => (
                <MotionDiv
                  variants={itemVariants}
                  key={stat.label}
                  className="group"
                >
                  <div className="text-5xl md:text-6xl font-black font-heading tracking-tighter text-cyan-600 mb-3 group-hover:scale-110 transition-transform duration-500">
                    {stat.value}
                  </div>
                  <div className="text-[10px] text-foreground/30 font-black uppercase tracking-[0.3em] group-hover:text-foreground/50 transition-colors">
                    {stat.label}
                  </div>
                </MotionDiv>
              ))}
            </MotionDiv>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-64 relative overflow-hidden">
          <div className="absolute -bottom-96 -left-96 w-[800px] h-[800px] bg-cyan-500/5 blur-[160px] rounded-full pointer-events-none" />

          <div className="max-w-7xl mx-auto px-8 relative z-10">
            <div className="text-center mb-32 max-w-3xl mx-auto">
              <h2 className="text-6xl md:text-8xl font-black font-heading tracking-tighter mb-10 leading-[0.9]">
                Designed for your{" "}
                <span className="text-cyan-600">wellness.</span>
              </h2>
              <p className="text-foreground/40 text-2xl font-medium leading-relaxed">
                We've combined clinical psychology with advanced AI to create a
                platform that truly understands your needs.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-12">
              {[
                {
                  title: "Sia AI Companion",
                  desc: "Proprietary LLM trained on 10,000+ clinical hours to provide empathetic, evidence-based support.",
                  icon: Brain,
                  color: "from-cyan-600 to-cyan-400",
                },
                {
                  title: "Clinical Tools",
                  desc: "Interactive CBT journals, mood trackers, and anxiety assessments developed by therapists.",
                  icon: LineChart,
                  color: "from-emerald-600 to-emerald-400",
                },
                {
                  title: "Safe Community",
                  desc: "Stigma-free zones where users share stories and find support in a moderated environment.",
                  icon: Users,
                  color: "from-blue-600 to-blue-400",
                },
              ].map((feature, idx) => (
                <MotionDiv
                  key={idx}
                  variants={itemVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="p-12 rounded-[3.5rem] bg-card/40 border border-border/60 backdrop-blur-xl shadow-soft hover:shadow-2xl hover:border-cyan-400/30 transition-all duration-500 group"
                >
                  <div
                    className={`w-16 h-16 rounded-[1.5rem] bg-gradient-to-br ${feature.color} flex items-center justify-center text-white mb-10 shadow-lg group-hover:scale-110 transition-transform duration-500`}
                  >
                    <feature.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-3xl font-black font-heading tracking-tight mb-6">
                    {feature.title}
                  </h3>
                  <p className="text-foreground/40 text-lg font-medium leading-relaxed group-hover:text-foreground/60 transition-colors">
                    {feature.desc}
                  </p>
                </MotionDiv>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="pb-64 pt-32">
          <div className="max-w-7xl mx-auto px-8">
            <div className="relative p-20 md:p-32 rounded-[4.5rem] bg-foreground text-background overflow-hidden shadow-[0_40px_80px_-15px_rgba(0,0,0,0.3)] group">
              <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-cyan-600/20 to-emerald-600/20 pointer-events-none" />
              <div className="relative z-10 text-center max-w-3xl mx-auto">
                <h2 className="text-6xl md:text-8xl font-black font-heading tracking-tighter mb-12 leading-[0.85]">
                  The future <br /> of healing is{" "}
                  <span className="text-cyan-400">here.</span>
                </h2>
                <p className="text-background/50 text-2xl font-medium mb-16 max-w-lg mx-auto leading-relaxed">
                  Join 85,000+ users who have already started their journey to a
                  better mind.
                </p>
                <MotionButton
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleStartJourney}
                  className="px-16 py-8 rounded-[2.5rem] bg-white text-black font-black uppercase tracking-[0.2em] text-sm shadow-2xl hover:bg-cyan-400 transition-all"
                >
                  Get Started For Free
                </MotionButton>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default LandingPage;
