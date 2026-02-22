import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User, ArrowRight, GithubIcon, Heart } from "lucide-react";
import { login, register, clearError } from "../features/auth/authSlice";

const MotionDiv = motion.div;

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
  });
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLogin) {
      const result = await dispatch(
        login({ email: formData.email, password: formData.password }),
      );
      if (login.fulfilled.match(result)) {
        navigate("/dashboard");
      }
    } else {
      const result = await dispatch(register(formData));
      if (register.fulfilled.match(result)) {
        navigate("/dashboard");
      }
    }
  };

  const { error: authError, loading } = useSelector((state) => state.auth);

  const handleChange = (e) => {
    if (authError) dispatch(clearError());
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 relative overflow-hidden transition-colors duration-300"
    >
      {/* Subtle background */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-gradient-to-br from-cyan-400/8 to-emerald-400/6 blur-[140px] rounded-full -translate-x-1/2 -translate-y-1/2" />

      <MotionDiv
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-12">
          <Link to="/" className="inline-flex items-center gap-4 group mb-10">
            <div className="w-16 h-16 rounded-[2rem] bg-gradient-to-br from-cyan-600 to-emerald-600 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-500">
              <Heart className="w-8 h-8 text-white fill-current" />
            </div>
            <span className="text-4xl font-black font-heading tracking-tighter">
              InfiHeal
            </span>
          </Link>
          <h2 className="text-4xl md:text-5xl font-black text-foreground font-heading tracking-tight mb-4 leading-tight">
            {isLogin ? "Welcome back" : "Start your journey"}
          </h2>
          <p className="text-foreground/40 text-lg font-medium">
            {isLogin
              ? "Sign in to continue your progress"
              : "Join a community of support and empathy"}
          </p>
        </div>

        <div className="bg-card/40 backdrop-blur-xl border border-border/60 rounded-[3.5rem] p-10 md:p-14 relative overflow-hidden shadow-soft group">
          {/* Top accent */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-cyan-600 via-cyan-400 to-emerald-500 opacity-60 rounded-t-[3.5rem]" />

          {/* Mode Switcher */}
          <div className="flex p-1.5 bg-background border border-border/60 rounded-[2rem] mb-12 gap-1.5 shadow-inner">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-4 rounded-[1.8rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-sm ${
                isLogin
                  ? "bg-cyan-600 text-white shadow-xl translate-y-[-1px]"
                  : "text-foreground/40 hover:text-cyan-600 hover:bg-cyan-500/5"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-4 rounded-[1.8rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-sm ${
                !isLogin
                  ? "bg-cyan-600 text-white shadow-xl translate-y-[-1px]"
                  : "text-foreground/40 hover:text-cyan-600 hover:bg-cyan-500/5"
              }`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <MotionDiv
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="space-y-6 overflow-hidden"
                >
                  <div className="relative group">
                    <User className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-foreground/20 group-focus-within:text-cyan-500 transition-colors" />
                    <input
                      type="text"
                      name="fullName"
                      placeholder="Full Name"
                      required
                      value={formData.fullName}
                      onChange={handleChange}
                      className="w-full pl-16 pr-6 py-5 rounded-[2rem] bg-background border border-border/60 focus:outline-none focus:border-cyan-400/30 focus:ring-[12px] focus:ring-cyan-500/5 transition-all text-lg text-foreground placeholder:text-foreground/20 font-medium"
                    />
                  </div>
                </MotionDiv>
              )}
            </AnimatePresence>

            <div className="relative group">
              <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-foreground/20 group-focus-within:text-cyan-500 transition-colors" />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-16 pr-6 py-5 rounded-[2rem] bg-background border border-border/60 focus:outline-none focus:border-cyan-400/30 focus:ring-[12px] focus:ring-cyan-500/5 transition-all text-lg text-foreground placeholder:text-foreground/20 font-medium"
              />
            </div>

            <div className="relative group">
              <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-foreground/20 group-focus-within:text-cyan-500 transition-colors" />
              <input
                type="password"
                name="password"
                placeholder="Password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-16 pr-6 py-5 rounded-[2rem] bg-background border border-border/60 focus:outline-none focus:border-cyan-400/30 focus:ring-[12px] focus:ring-cyan-500/5 transition-all text-lg text-foreground placeholder:text-foreground/20 font-medium"
              />
            </div>

            {authError && (
              <div className="px-6 py-4 rounded-[1.5rem] bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[10px] font-black uppercase tracking-widest text-center shadow-sm">
                {authError}
              </div>
            )}

            {isLogin && (
              <div className="text-right px-4">
                <button
                  type="button"
                  className="text-xs font-black uppercase tracking-widest text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 transition-all"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <MotionButton
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              type="submit"
              className="w-full py-6 rounded-[2rem] bg-gradient-to-br from-cyan-600 to-sky-600 hover:from-cyan-400 hover:to-sky-500 disabled:opacity-20 disabled:cursor-not-allowed transition-all font-black uppercase tracking-widest text-xs text-white shadow-xl shadow-cyan-500/20 flex items-center justify-center gap-3 active:scale-95"
            >
              {loading ? (
                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {isLogin ? "Sign In" : "Create Account"}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </MotionButton>
          </form>

          <div className="mt-12 flex items-center gap-6">
            <div className="flex-1 h-px bg-border/60" />
            <span className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] whitespace-nowrap">
              Secure Access
            </span>
            <div className="flex-1 h-px bg-border/60" />
          </div>

          <div className="mt-10">
            <button className="w-full py-5 rounded-[2rem] bg-background border border-border/60 hover:bg-cyan-500/5 hover:border-cyan-400/20 transition-all font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-4 active:scale-95 text-foreground/50 hover:text-cyan-600 shadow-sm">
              <GithubIcon className="w-6 h-6 text-foreground" />
              Github Connection
            </button>
          </div>
        </div>

        <p className="text-center text-foreground/20 mt-12 text-[10px] font-black uppercase tracking-[0.2em] max-w-xs mx-auto leading-loose">
          By continuing, you agree to our <br />
          <span className="text-cyan-600 cursor-pointer hover:underline">
            Terms of Service
          </span>{" "}
          &{" "}
          <span className="text-cyan-600 cursor-pointer hover:underline">
            Privacy Policy
          </span>
        </p>
      </MotionDiv>
    </MotionDiv>
  );
};

export default AuthPage;
