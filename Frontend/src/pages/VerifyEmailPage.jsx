import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle, XCircle, Loader2, ArrowRight } from "lucide-react";
import api from "../services/api";

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("loading"); // loading, success, error
  const [message, setMessage] = useState("");

  const token = searchParams.get("token");

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus("error");
        setMessage("Invalid verification link. Token is missing.");
        return;
      }

      try {
        const response = await api.get(`/auth/verify-email?token=${token}`);
        setStatus("success");
        setMessage(response.data.message || "Email verified successfully!");
      } catch (err) {
        setStatus("error");
        setMessage(
          err.response?.data?.error || "Verification failed. The link may be expired or invalid."
        );
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-900 text-white">
      <div className="max-w-md w-full bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-8 rounded-3xl shadow-2xl text-center space-y-6">
        {status === "loading" && (
          <div className="space-y-4 py-8">
            <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mx-auto" />
            <h2 className="text-xl font-bold">Verifying your email...</h2>
            <p className="text-slate-400 text-sm">Please wait while we confirm your account.</p>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-4 py-4 animate-in zoom-in duration-500">
            <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10 text-emerald-500" />
            </div>
            <h2 className="text-2xl font-bold text-emerald-400">Success!</h2>
            <p className="text-slate-300 text-sm leading-relaxed">{message}</p>
            <div className="pt-4">
              <Link
                to="/auth"
                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20 group"
              >
                Go to Login
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-4 py-4 animate-in zoom-in duration-500">
            <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto">
              <XCircle className="w-10 h-10 text-rose-500" />
            </div>
            <h2 className="text-2xl font-bold text-rose-400">Verification Failed</h2>
            <p className="text-slate-300 text-sm leading-relaxed">{message}</p>
            <div className="pt-4">
              <Link
                to="/auth"
                className="inline-flex items-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-bold transition-all"
              >
                Back to Login
              </Link>
            </div>
          </div>
        )}

        <div className="pt-6 border-t border-slate-700/50">
          <p className="text-slate-500 text-[10px] uppercase tracking-widest font-bold">
            Mind Sync Mental Health Assistant
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
