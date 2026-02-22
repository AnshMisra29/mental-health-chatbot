import AuthenticatedLayout from "../components/AuthenticatedLayout";
import { motion } from "framer-motion";
import {
  HelpCircle,
  Phone,
  MessageSquare,
  Mail,
  ShieldAlert,
  ChevronDown,
  ArrowRight
} from "lucide-react";
import { useDispatch } from "react-redux";
import { openModal } from "../features/ui/uiSlice";

const MotionDiv = motion.div;
const MotionButton = motion.button;

const HelpPage = () => {
  const dispatch = useDispatch();
  const faqs = [
    {
      q: "Is my data really private?",
      a: "Yes, we use end-to-end encryption for all conversations with Sia AI. Your data is never shared with third parties or used for advertising.",
    },
    {
      q: "Can Sia AI replace a real therapist?",
      a: "No. Sia AI is an AI companion designed for emotional support and coping strategies. It is not a clinical treatment or a replacement for licensed mental health professionals.",
    },
    {
      q: "What should I do in an emergency?",
      a: "If you are in immediate danger, please use the crisis resources listed below or contact your local emergency services immediately.",
    },
    {
      q: "How do I delete my account?",
      a: "You can delete your account and all associated data at any time through the Settings page.",
    },
  ];

  return (
    <AuthenticatedLayout>
      <MotionDiv
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 overflow-y-auto p-12 max-w-5xl mx-auto w-full"
      >
        <div className="text-center mb-24 max-w-2xl mx-auto">
          <h1 className="text-6xl font-black font-heading tracking-tighter mb-6 text-foreground">
            How can we help?
          </h1>
          <p className="text-foreground/40 text-xl font-medium leading-relaxed">
            Find answers, resources, and support whenever you need it. Our team and Sia AI are here for you.
          </p>
        </div>

        {/* Crisis Section */}
        <section className="mb-24 p-12 rounded-[3rem] bg-rose-500/5 border border-rose-500/10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 blur-[80px] rounded-full translate-x-1/2 -translate-y-1/2" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-6 mb-8">
              <div className="w-16 h-16 rounded-[1.5rem] bg-rose-500 flex items-center justify-center text-white shadow-xl shadow-rose-500/20 group-hover:scale-110 transition-transform duration-500">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <h2 className="text-3xl font-black font-heading tracking-tight text-rose-500">
                Crisis Resources
              </h2>
            </div>
            <p className="text-foreground/60 text-lg font-medium mb-10 leading-relaxed max-w-2xl">
              If you are experiencing a mental health crisis or thinking about
              self-harm, please reach out for help immediately. You are not alone.
            </p>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="p-10 rounded-[2.5rem] bg-card border border-border/60 shadow-soft hover:shadow-lg transition-all duration-500 group/card">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/40 mb-4">National Suicide Lifeline</h3>
                <p className="text-4xl font-black font-heading tracking-tighter text-foreground group-hover/card:text-rose-500 transition-colors">988</p>
                <p className="text-xs font-black uppercase tracking-widest text-foreground/20 mt-6 italic">
                  Available 24/7 in English & Spanish
                </p>
              </div>
              <div className="p-10 rounded-[2.5rem] bg-card border border-border/60 shadow-soft hover:shadow-lg transition-all duration-500 group/card">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/40 mb-4">Crisis Text Line</h3>
                <p className="text-3xl font-black font-heading tracking-tighter text-foreground group-hover/card:text-rose-500 transition-colors">
                  Text HOME to 741741
                </p>
                <p className="text-xs font-black uppercase tracking-widest text-foreground/20 mt-6 italic">
                  Free, 24/7 confidential support
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="mb-24">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-4xl font-black font-heading tracking-tight flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-600/10 flex items-center justify-center text-cyan-600">
                <HelpCircle className="w-6 h-6" />
              </div>
              Common Questions
            </h2>
          </div>
          
          <div className="grid gap-6">
            {faqs.map((faq, i) => (
              <MotionDiv
                key={faq.q}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-10 rounded-[2rem] bg-card/40 border border-border/60 hover:border-cyan-500/30 hover:shadow-soft transition-all cursor-pointer group backdrop-blur-sm"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-black font-heading tracking-tight text-foreground group-hover:text-cyan-600 transition-colors">
                    {faq.q}
                  </h3>
                  <div className="w-8 h-8 rounded-full bg-foreground/5 flex items-center justify-center group-hover:bg-cyan-600 group-hover:text-white transition-all transform group-hover:rotate-180">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-foreground/40 text-lg font-medium leading-relaxed group-hover:text-foreground/60 transition-colors">
                  {faq.a}
                </p>
              </MotionDiv>
            ))}
          </div>
        </section>

        {/* Contact Strip */}
        <section className="p-12 rounded-[3.5rem] bg-gradient-to-br from-cyan-600 to-emerald-600 text-white shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[60px] rounded-full translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform duration-700" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
            <div>
              <h2 className="text-4xl font-black font-heading tracking-tighter mb-4">Still need help?</h2>
              <p className="text-white/80 text-lg font-medium max-w-md">
                Our support team is available 24/7. Reach out to us via email or chat.
              </p>
            </div>
            <div className="flex gap-4">
              <MotionButton
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 rounded-[1.5rem] bg-white text-cyan-600 font-black uppercase tracking-widest text-xs shadow-xl flex items-center gap-3 transition-all"
              >
                <Mail className="w-4 h-4" />
                Email Us
              </MotionButton>
              <MotionButton
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 rounded-[1.5rem] bg-black/20 backdrop-blur-md text-white border border-white/20 font-black uppercase tracking-widest text-xs shadow-xl flex items-center gap-3 transition-all"
              >
                <MessageSquare className="w-4 h-4" />
                Live Chat
              </MotionButton>
            </div>
          </div>
        </section>
      </MotionDiv>
    </AuthenticatedLayout>
  );
};

export default HelpPage;
