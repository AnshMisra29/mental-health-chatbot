import AuthenticatedLayout from "../components/AuthenticatedLayout";
import { motion, AnimatePresence } from "framer-motion";

const MotionDiv = motion.div;
import {
  HelpCircle,
  Phone,
  MessageSquare,
  Mail,
  ShieldAlert,
  ChevronDown,
} from "lucide-react";

import { useDispatch } from "react-redux";
import { openModal } from "../features/ui/uiSlice";

const HelpPage = () => {
  const dispatch = useDispatch();
  const faqs = [
    {
      q: "Is my data really private?",
      a: "Yes, we use end-to-end encryption for all conversations with Healo. Your data is never shared with third parties or used for advertising.",
    },
    {
      q: "Can Healo replace a real therapist?",
      a: "No. Healo is an AI companion designed for emotional support and coping strategies. It is not a clinical treatment or a replacement for licensed mental health professionals.",
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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-8 max-w-4xl mx-auto"
      >
        <div className="text-center mb-16">
          <h1 className="text-4xl font-black mb-4">How can we help?</h1>
          <p className="text-slate-400">
            Find answers, resources, and support whenever you need it.
          </p>
        </div>

        {/* Crisis Section */}
        <section className="mb-16 p-8 rounded-[2rem] bg-rose-500/10 border border-rose-500/20">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-rose-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/20">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-bold text-rose-400">
              Crisis Resources
            </h2>
          </div>
          <p className="text-slate-300 mb-8 leading-relaxed">
            If you are experiencing a mental health crisis or thinking about
            self-harm, please reach out for help immediately. You are not alone.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
              <h3 className="font-bold mb-2">National Suicide Lifeline</h3>
              <p className="text-2xl font-black text-white">988</p>
              <p className="text-xs text-slate-500 mt-2 italic">
                Available 24/7 in English and Spanish
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
              <h3 className="font-bold mb-2">Crisis Text Line</h3>
              <p className="text-2xl font-black text-white">
                Text HOME to 741741
              </p>
              <p className="text-xs text-slate-500 mt-2 italic">
                Free, 24/7 confidential support
              </p>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
            <HelpCircle className="w-6 h-6 text-indigo-400" />
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white group-hover:text-indigo-400 transition-colors">
                    {faq.q}
                  </h3>
                  <ChevronDown className="w-5 h-5 text-slate-600 group-hover:text-indigo-400 transition-colors" />
                </div>
                <p className="mt-4 text-slate-400 text-sm leading-relaxed hidden group-hover:block animate-in fade-in slide-in-from-top-1">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section className="text-center p-12 rounded-[2.5rem] bg-indigo-600/5 border border-indigo-500/10">
          <h2 className="text-2xl font-bold mb-4">Still need help?</h2>
          <p className="text-slate-400 mb-8">
            Can't find what you're looking for? Our team is here to support you.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() =>
                dispatch(
                  openModal({
                    type: "support",
                    data: { title: "Email Support" },
                  }),
                )
              }
              className="px-6 py-3 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-all flex items-center gap-2 text-sm font-bold"
            >
              <Mail className="w-4 h-4 text-indigo-400" />
              Email Support
            </button>
            <button
              onClick={() =>
                dispatch(
                  openModal({
                    type: "support",
                    data: { title: "Live Chat" },
                  }),
                )
              }
              className="px-6 py-3 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-all flex items-center gap-2 text-sm font-bold"
            >
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              Live Chat
            </button>
          </div>
        </section>
      </MotionDiv>
    </AuthenticatedLayout>
  );
};

export default HelpPage;
