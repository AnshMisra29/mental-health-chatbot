import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User, ArrowRight, Heart, RefreshCcw, Loader2 } from "lucide-react";
import api from "../services/api";
import { login, register, clearError } from "../features/auth/authSlice";

const MotionDiv = motion.div;
const MotionButton = motion.button;

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otp, setOtp] = useState("");
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
  });
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleResendOtp = async () => {
    if (resendTimer > 0 || resendLoading) return;

    setResendLoading(true);
    try {
      await api.post("/auth/resend-otp", { email: formData.email });
      setResendTimer(60);
    } catch (err) {
      console.error("Failed to resend:", err);
    } finally {
      setResendLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) return;

    setVerifyingOtp(true);
    try {
      const res = await api.post("/auth/verify-otp", { 
        email: formData.email, 
        otp: otp 
      });
      setRegistrationSuccess(true);
      setShowOtpInput(false);
      setIsLogin(true); // Switch to login after verification
      setOtp("");
    } catch (err) {
      console.error("OTP Verification failed:", err);
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (registrationSuccess) setRegistrationSuccess(false);

    if (isLogin) {
      const result = await dispatch(
        login({ email: formData.email, password: formData.password }),
      );
      if (login.fulfilled.match(result)) {
        navigate("/dashboard");
      }
    } else {
      // Register
      const result = await dispatch(register(formData));
      
      if (register.fulfilled.match(result)) {
        setShowOtpInput(true);
        setResendTimer(60);
      }
    }
  };

  const { error: authError, loading } = useSelector((state) => state.auth);

  const handleChange = (e) => {
    if (authError) dispatch(clearError());
    if (registrationSuccess) setRegistrationSuccess(false);
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
              Aurora
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

          <form onSubmit={showOtpInput ? handleVerifyOtp : handleSubmit} className="space-y-6">
            <AnimatePresence mode="wait">
              {!isLogin && !showOtpInput && (
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

            {(!showOtpInput || isLogin) && (
              <>
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
              </>
            )}

            {!isLogin && showOtpInput && (
              <MotionDiv
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="px-6 py-4 rounded-[2rem] bg-cyan-500/5 border border-cyan-500/10 text-center">
                  <p className="text-xs text-slate-400">We've sent a 6-digit code to <span className="text-cyan-400">{formData.email}</span></p>
                </div>

                <div className="relative group">
                  <RefreshCcw className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-foreground/20 group-focus-within:text-cyan-500 transition-colors" />
                  <input
                    type="text"
                    maxLength="6"
                    placeholder="Enter 6-digit OTP"
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    className="w-full pl-16 pr-6 py-5 rounded-[2rem] bg-background border border-border/60 focus:outline-none focus:border-cyan-400/30 focus:ring-[12px] focus:ring-cyan-500/5 transition-all text-center text-2xl tracking-[0.5em] font-black text-foreground placeholder:text-foreground/10"
                  />
                </div>

                <div className="flex flex-col gap-3">
                  <MotionButton
                    type="submit"
                    disabled={otp.length !== 6 || verifyingOtp}
                    className="w-full py-5 rounded-[2rem] bg-cyan-600 text-white font-black uppercase tracking-widest text-xs shadow-xl disabled:opacity-50"
                  >
                    {verifyingOtp ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Verify & Register"}
                  </MotionButton>

                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendTimer > 0 || resendLoading}
                    className="text-[10px] font-black uppercase tracking-widest text-foreground/40 hover:text-cyan-500 transition-all disabled:opacity-50"
                  >
                    {resendTimer > 0 ? `Resend code in ${resendTimer}s` : "Resend OTP"}
                  </button>
                </div>
              </MotionDiv>
            )}

            {registrationSuccess && (
              <div className="px-6 py-6 rounded-[2rem] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium text-center shadow-sm space-y-2 animate-in fade-in zoom-in duration-300">
                <p className="font-black uppercase tracking-widest text-[10px]">Registration Successful!</p>
                <p className="text-xs text-slate-300">Your account is verified. Please log in with your details.</p>
              </div>
            )}

            {authError && (
              <div className={`px-6 py-4 rounded-[1.5rem] border text-[10px] font-black uppercase tracking-widest text-center shadow-sm ${
                authError.includes("verified") 
                  ? "bg-amber-500/10 border-amber-500/20 text-amber-500" 
                  : "bg-rose-500/10 border-rose-500/20 text-rose-500"
              }`}>
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

            {(!showOtpInput || isLogin) && (
              <MotionButton
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading}
                type="submit"
                className="w-full py-6 rounded-[2rem] bg-gradient-to-br from-cyan-600 to-sky-600 hover:from-cyan-400 hover:to-sky-500 disabled:opacity-20 disabled:cursor-not-allowed transition-all font-black uppercase tracking-widest text-xs text-white shadow-xl shadow-cyan-500/20 flex items-center justify-center gap-3 active:scale-95"
              >
                {loading ? (
                  <div className="w-6 h-6 border-[3px] border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {isLogin ? "Sign In" : "Create Account"}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </MotionButton>
            )}
          </form>

          <div className="mt-12 flex items-center gap-6">
            <div className="flex-1 h-px bg-border/60" />
            <span className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] whitespace-nowrap">
              Secure Access
            </span>
            <div className="flex-1 h-px bg-border/60" />
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
