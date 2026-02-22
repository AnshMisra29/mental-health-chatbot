import React from "react";
import { Link } from "react-router-dom";
import { 
  Heart, 
  Twitter as TwitterIcon, 
  Instagram as InstagramIcon, 
  Linkedin as LinkedinIcon, 
  Github as GithubIcon 
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-background border-t border-border/60 pt-32 pb-16 transition-colors duration-500 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2" />
      <div className="max-w-7xl mx-auto px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-16 mb-24">
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-4 mb-8 group">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-600 to-emerald-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500">
                <Heart className="w-6 h-6 text-white fill-current" />
              </div>
              <span className="text-2xl font-black font-heading tracking-tighter">InfiHeal</span>
            </Link>
            <p className="text-foreground/40 text-lg font-medium max-w-sm mb-10 leading-relaxed">
              Making mental healthcare accessible, affordable, and stigma-free
              globally. Your journey to wellness starts here.
            </p>
            <div className="flex gap-4">
              {[TwitterIcon, InstagramIcon, LinkedinIcon, GithubIcon].map((Icon, idx) => (
                <a
                  key={idx}
                  href="#"
                  className="w-12 h-12 rounded-2xl bg-card border border-border/60 flex items-center justify-center text-foreground/30 hover:text-cyan-600 hover:border-cyan-400/30 hover:shadow-soft transition-all"
                  aria-label="Social Link"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/80 mb-8">Product</h4>
            <ul className="space-y-5 text-foreground/40 text-xs font-black uppercase tracking-widest">
              <li>
                <Link to="/chat" className="hover:text-cyan-600 transition-colors">
                  Sia AI
                </Link>
              </li>
              <li>
                <Link to="/community" className="hover:text-cyan-600 transition-colors">
                  Community
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-cyan-600 transition-colors">
                  CBT Tools
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-cyan-600 transition-colors">
                  Assessments
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/80 mb-8">Company</h4>
            <ul className="space-y-5 text-foreground/40 text-xs font-black uppercase tracking-widest">
              <li>
                <a href="#" className="hover:text-cyan-600 transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-cyan-600 transition-colors">
                  Careers
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-cyan-600 transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-cyan-600 transition-colors">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/80 mb-8">Support</h4>
            <ul className="space-y-5 text-foreground/40 text-xs font-black uppercase tracking-widest">
              <li>
                <a href="#" className="hover:text-cyan-600 transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-cyan-600 transition-colors">
                  Contact
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-cyan-600 transition-colors">
                  Crisis Resources
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-12 border-t border-border/60 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/20">
            © 2026 InfiHeal. All rights reserved.
          </p>
          <div className="flex gap-8">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/20 hover:text-cyan-600 cursor-pointer transition-colors">
              Trust & Safety
            </span>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/20 hover:text-cyan-600 cursor-pointer transition-colors">
              Cookie Policy
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
