import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User, ArrowRight, Github, Heart } from "lucide-react";
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
      const result = await dispatch(login({ email: formData.email, password: formData.password }));
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
      className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden"
    >
      {/* Background Orbs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-600/10 blur-[100px] rounded-full -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-500/10 blur-[100px] rounded-full translate-x-1/2 translate-y-1/2" />

      <MotionDiv
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-2 group mb-6">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Heart className="w-7 h-7 text-white fill-current" />
            </div>
            <span className="text-2xl font-black tracking-tight">InfiHeal</span>
          </Link>
          <h2 className="text-3xl font-bold bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
            {isLogin ? "Welcome back" : "Start your journey"}
          </h2>
          <p className="text-slate-400 mt-2">
            {isLogin
              ? "Sign in to continue your progress"
              : "Join a community of support and empathy"}
          </p>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-[2.5rem] p-8 md:p-10 shadow-2xl">
          {/* Mode Switcher */}
          <div className="flex p-1 bg-slate-950 rounded-2xl mb-8 border border-slate-800">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${isLogin
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                : "text-slate-500 hover:text-white"
                }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${!isLogin
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                : "text-slate-500 hover:text-white"
                }`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <MotionDiv
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-5 overflow-hidden"
                >
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                    <input
                      type="text"
                      name="fullName"
                      placeholder="Full Name"
                      required
                      value={formData.fullName}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-950 border border-slate-800 focus:outline-none focus:border-indigo-500/50 transition-all text-sm group-hover:border-slate-700"
                    />
                  </div>
                </MotionDiv>
              )}
            </AnimatePresence>

            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-950 border border-slate-800 focus:outline-none focus:border-indigo-500/50 transition-all text-sm group-hover:border-slate-700"
              />
            </div>

            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
              <input
                type="password"
                name="password"
                placeholder="Password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-950 border border-slate-800 focus:outline-none focus:border-indigo-500/50 transition-all text-sm group-hover:border-slate-700"
              />
            </div>

            {authError && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold text-center">
                {authError}
              </div>
            )}

            {isLogin && (
              <div className="text-right">
                <button
                  type="button"
                  className="text-xs font-bold text-indigo-400 hover:text-indigo-300"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <button
              disabled={loading}
              type="submit"
              className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold text-lg shadow-xl shadow-indigo-500/20 active:scale-95 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {isLogin ? "Sign In" : "Create Account"}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 flex items-center gap-4">
            <div className="flex-1 h-px bg-slate-800" />
            <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">
              or continue with
            </span>
            <div className="flex-1 h-px bg-slate-800" />
          </div>

          <div className="mt-6">
            <button className="w-full py-4 rounded-2xl bg-slate-950 border border-slate-800 hover:bg-slate-900 transition-all font-bold text-sm flex items-center justify-center gap-3 active:scale-95">
              <Github className="w-5 h-5" />
              Github
            </button>
          </div>
        </div>

        <p className="text-center text-slate-500 mt-10 text-sm">
          By continuing, you agree to our <br />
          <span className="text-slate-300 font-medium cursor-pointer hover:underline">
            Terms of Service
          </span>{" "}
          and{" "}
          <span className="text-slate-300 font-medium cursor-pointer hover:underline">
            Privacy Policy
          </span>
        </p>
      </MotionDiv>
    </MotionDiv>
  );
};

export default AuthPage;