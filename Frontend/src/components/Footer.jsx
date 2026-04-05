import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Github as GithubIcon,
  X,
  Info,
  Shield,
  LifeBuoy,
  Mail,
  AlertTriangle,
  FileText
} from "lucide-react";

const FOOTER_CONTENT = {
  "About Us": {
    icon: Info,
    title: "About Mind Sync",
    desc: "Mind Sync is dedicated to making mental healthcare accessible, affordable, and stigma-free globally. Our mission is to bridge the gap between technology and clinical psychology to provide 24/7 empathetic support for everyone."
  },
  "Privacy Policy": {
    icon: Shield,
    title: "Your Privacy Matters",
    desc: "We use clinical-grade encryption to ensure your data and conversations are strictly private. We never sell your personal information, and your chats with Sia are used only to improve your personal experience."
  },
  "Terms of Service": {
    icon: FileText,
    title: "Terms of Service",
    desc: "By using Mind Sync, you agree to our community guidelines of respect and safety. Our platform is a support tool and should not be used as a replacement for professional medical advice in emergency situations."
  },
  "Help Center": {
    icon: LifeBuoy,
    title: "Help & Support",
    desc: "Need assistance navigating Sia? Our help center provides guides on mood tracking, journaling, and how to get the most out of your AI companion. Reach out if you're experiencing technical issues."
  },
  "Contact": {
    icon: Mail,
    title: "Contact Us",
    desc: "Questions or feedback? We'd love to hear from you. You can reach our support team at support@mindsync.com. We typically respond within 24-48 hours."
  },
  "Crisis Resources": {
    icon: AlertTriangle,
    title: "Immediate Help",
    desc: "If you are in immediate danger, please reach out to: \n• India: iCall (9152987821)\n• UK: Samaritans (116 123)\n• USA: 988 Suicide & Crisis Lifeline\n• Global: Local Emergency Services"
  }
};

const Footer = () => {
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState(null);

  const openModal = (key) => {
    setModalData(FOOTER_CONTENT[key]);
    setShowModal(true);
  };

  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [showModal]);

  return (
    <footer className="bg-background border-t border-border/60 pt-32 pb-16 transition-colors duration-500 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2" />
      <div className="max-w-7xl mx-auto px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-16 mb-24">
          <div className="md:col-span-2 text-center md:text-left">
            <Link to="/" className="flex items-center justify-center md:justify-start gap-4 mb-8 group">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-600 to-emerald-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500">
                <Heart className="w-6 h-6 text-white fill-current" />
              </div>
              <span className="text-2xl font-black font-heading tracking-tighter">
                Mind Sync
              </span>
            </Link>
            <p className="text-foreground/40 text-lg font-medium max-w-sm mb-10 leading-relaxed mx-auto md:mx-0">
              Making mental healthcare accessible, affordable, and stigma-free
              globally. Your journey to wellness starts here.
            </p>
            <div className="flex justify-center md:justify-start gap-4">
              <a
                href="https://github.com/AnshMisra29/mental-health-chatbot"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-2xl bg-card border border-border/60 flex items-center justify-center text-foreground/30 hover:text-cyan-600 hover:border-cyan-400/30 hover:shadow-soft transition-all"
                aria-label="GitHub Repository"
              >
                <GithubIcon className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/80 mb-8">
              Product
            </h4>
            <ul className="space-y-5 text-foreground/40 text-xs font-black uppercase tracking-widest cursor-default">
              <li>Sia Chat</li>
              <li>Mood Log</li>
              <li>Posts</li>
              <li>Journal</li>
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/80 mb-8">
              Company
            </h4>
            <ul className="space-y-5 text-foreground/40 text-xs font-black uppercase tracking-widest">
              {["About Us", "Privacy Policy", "Terms of Service"].map(link => (
                <li key={link}>
                  <button onClick={() => openModal(link)} className="hover:text-cyan-600 transition-colors uppercase">
                    {link}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/80 mb-8">
              Support
            </h4>
            <ul className="space-y-5 text-foreground/40 text-xs font-black uppercase tracking-widest">
              {["Help Center", "Contact", "Crisis Resources"].map(link => (
                <li key={link}>
                  <button onClick={() => openModal(link)} className="hover:text-cyan-600 transition-colors uppercase">
                    {link}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-12 border-t border-border/60 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/20">
            © 2026 Mind Sync. All rights reserved.
          </p>
          <div className="flex gap-8">
            <button onClick={() => openModal("Privacy Policy")} className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/20 hover:text-cyan-600 transition-colors">
              Trust & Safety
            </button>
            <button onClick={() => openModal("Terms of Service")} className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/20 hover:text-cyan-600 transition-colors">
              Cookie Policy
            </button>
          </div>
        </div>
      </div>

      {/* Footer Informational Modal */}
      <AnimatePresence>
        {showModal && modalData && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 sm:p-0">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-lg"
            />
            <motion.div
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
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </footer>
  );
};

export default Footer;
