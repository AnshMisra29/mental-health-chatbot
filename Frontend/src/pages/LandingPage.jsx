import React from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  Heart,
  Users,
  MessageCircle,
  Shield,
  Zap,
  CheckCircle2,
  Star,
} from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const MotionDiv = motion.div;
const MotionH1 = motion.h1;
const MotionP = motion.p;

const LandingPage = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <MotionDiv
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-slate-950 min-h-screen selection:bg-indigo-500/30"
    >
      <Navbar />

      <main>
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
          {/* Animated background Blobs */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-indigo-600/10 blur-[120px] rounded-full -z-10 animate-pulse" />
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-emerald-500/5 blur-[80px] rounded-full -z-10" />

          <MotionDiv
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-7xl mx-auto px-6 text-center"
          >
            <MotionDiv
              variants={itemVariants}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/50 border border-slate-800 text-indigo-400 text-xs font-semibold mb-8 backdrop-blur-md"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Join 50,000+ users on their wellness journey</span>
            </MotionDiv>

            <MotionH1
              variants={itemVariants}
              className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[1.1] mb-8"
            >
              Find your <span className="text-indigo-500">calm</span>{" "}
              <br className="hidden md:block" /> with AI empathy.
            </MotionH1>

            <MotionP
              variants={itemVariants}
              className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              Sia is more than a chatbot. It's an empathetic AI companion
              trained to support your mental health 24/7. No stigma, no waiting,
              just help when you need it.
            </MotionP>

            <MotionDiv
              variants={itemVariants}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link
                to="/auth"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 transition-all font-bold text-lg shadow-xl shadow-indigo-500/25 active:scale-95 hover:-translate-y-1"
              >
                Start Chatting Now
              </Link>
              <Link
                to="/community"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-all font-bold text-lg active:scale-95"
              >
                Join Community
              </Link>
            </MotionDiv>
          </MotionDiv>
        </section>

        {/* Stats Section */}
        <section className="py-20 bg-slate-900/30 border-y border-slate-900">
          <div className="max-w-7xl mx-auto px-6">
            <MotionDiv
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-2 md:grid-cols-4 gap-8"
            >
              {[
                { label: "Users Helped", value: "50K+" },
                { label: "Conversations", value: "1.2M+" },
                { label: "Self-Tests Taken", value: "200K+" },
                { label: "Safe & Secure", value: "100%" },
              ].map((stat, i) => (
                <MotionDiv
                  variants={itemVariants}
                  key={i}
                  className="text-center"
                >
                  <div className="text-3xl md:text-4xl font-black text-white mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-slate-500 uppercase tracking-widest font-bold">
                    {stat.label}
                  </div>
                </MotionDiv>
              ))}
            </MotionDiv>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-32">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-20">
              <h2 className="text-3xl md:text-5xl font-black mb-6">
                Designed for your wellness.
              </h2>
              <p className="text-slate-400 max-w-xl mx-auto text-lg">
                We've combined clinical psychology with advanced AI to create a
                platform that truly understands.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: MessageCircle,
                  title: "Empathetic Chat",
                  desc: "Sia uses proven therapeutic techniques to help you navigate your emotions without judgment.",
                  gradient: "from-indigo-500/20 to-transparent",
                },
                {
                  icon: Shield,
                  title: "Private & Secure",
                  desc: "Your data is end-to-end encrypted. We prioritize your privacy above everything else.",
                  gradient: "from-emerald-500/20 to-transparent",
                },
                {
                  icon: Users,
                  title: "Peer Community",
                  author: "Sia Guide",
                  desc: "Connect with a global community. Share stories, find support, and realize you're not alone.",
                  gradient: "from-blue-500/20 to-transparent",
                },
                {
                  icon: Zap,
                  title: "My Journey with Sia: A Story of Growth",
                  desc: "No appointments needed. Get crisis support and immediate coping strategies in seconds.",
                  gradient: "from-amber-500/20 to-transparent",
                },
                {
                  icon: Sparkles,
                  title: "Daily Exercises",
                  desc: "From mindfulness to mood tracking, get personalized tools based on your needs.",
                  gradient: "from-pink-500/20 to-transparent",
                },
                {
                  icon: CheckCircle2,
                  title: "Better Results",
                  desc: "Regular interaction with Sia is proven to reduce stress and improve emotional clarity.",
                  gradient: "from-violet-500/20 to-transparent",
                },
              ].map((feature, i) => (
                <MotionDiv
                  key={i}
                  whileHover={{ y: -10 }}
                  className={`p-8 rounded-[2rem] bg-slate-900/50 border border-slate-800 backdrop-blur-sm relative overflow-hidden group`}
                >
                  <div
                    className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${feature.gradient}`}
                  />
                  <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <feature.icon className="w-7 h-7 text-indigo-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-slate-400 leading-relaxed text-sm">
                    {feature.desc}
                  </p>
                </MotionDiv>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-32 bg-indigo-600/5">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-8">
              <div className="max-w-xl">
                <h2 className="text-3xl md:text-5xl font-black mb-6 italic">
                  "Sia changed my life when I had nobody to talk to."
                </h2>
                <div className="flex gap-1 text-amber-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current" />
                  ))}
                </div>
                <p className="text-slate-300 font-bold text-xl">
                  — Sarah M., Early Beta User
                </p>
              </div>
              <div className="flex gap-4">
                <div className="w-16 h-16 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center cursor-pointer hover:bg-slate-700 transition-colors">
                  ←
                </div>
                <div className="w-16 h-16 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center cursor-pointer hover:bg-slate-700 transition-colors">
                  →
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 max-w-7xl mx-auto px-6">
          <div className="relative p-12 md:p-24 rounded-[3rem] bg-indigo-600 overflow-hidden text-center">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-slate-900/20 blur-[100px] rounded-full -translate-x-1/2 translate-y-1/2" />

            <h2 className="text-4xl md:text-6xl font-black text-white mb-8 relative z-10">
              Ready to feel better?
            </h2>
            <p className="text-indigo-100 text-lg md:text-xl max-w-xl mx-auto mb-12 relative z-10 opacity-90">
              Start your journey today. It's free, safe, and only takes a minute
              to set up your profile.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 relative z-10">
              <Link
                to="/auth"
                className="px-10 py-5 rounded-2xl bg-white text-indigo-600 font-black text-xl hover:bg-indigo-50 transition-all shadow-2xl shadow-slate-950/20 active:scale-95"
              >
                Get Started Now
              </Link>
              <a href="#" className="font-bold text-white hover:underline">
                View crisis resources
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </MotionDiv>
  );
};

export default LandingPage;
