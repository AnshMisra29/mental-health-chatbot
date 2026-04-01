import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import AuthenticatedLayout from "../components/AuthenticatedLayout";
import { motion, AnimatePresence } from "framer-motion";
import { KeyRound, LogOut, Trash2, Shield, AlertTriangle } from "lucide-react";
import { logout } from "../features/auth/authSlice";
import api from "../services/api";

const MotionDiv = motion.div;

const ProfilePage = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    if (passwords.new !== passwords.confirm) {
        return setError("New passwords do not match.");
    }
    
    setLoading(true);
    try {
        const res = await api.post("/auth/change-password", {
            current_password: passwords.current,
            new_password: passwords.new
        });
        setSuccess(res.data.message || "Password updated successfully.");
        setPasswords({ current: "", new: "", confirm: "" });
    } catch (err) {
        setError(err.response?.data?.error || "Failed to change password.");
    } finally {
        setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
        await api.delete("/auth/delete-account");
        dispatch(logout());
        navigate("/");
    } catch (err) {
        setError(err.response?.data?.error || "Failed to delete account.");
    }
  };

  const handleSignOut = () => {
      sessionStorage.removeItem("moodLoggedThisSession");
      dispatch(logout());
      navigate("/");
  };

  return (
    <AuthenticatedLayout>
      <div className="flex-1 overflow-y-auto p-8 max-w-4xl mx-auto w-full">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-black font-heading tracking-tight mb-3">
            Security & Profile
          </h1>
          <p className="text-foreground/50 text-xl font-medium">
            Manage your account details and secure your data.
          </p>
        </div>

        <div className="space-y-12 mb-20">
          {/* Identity Box */}
          <MotionDiv 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row items-center gap-8 p-10 rounded-[3rem] bg-card border border-border/60 shadow-xl"
          >
            <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-cyan-400 to-sky-400 flex items-center justify-center text-white font-black text-5xl shadow-xl shadow-cyan-500/20">
              {user?.name?.[0] || "U"}
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-3xl font-black text-foreground tracking-tight mb-1">{user?.name || "User"}</h2>
              <p className="text-foreground/50 text-lg font-medium">{user?.email}</p>
            </div>
          </MotionDiv>

          {/* Password Change Form */}
          <MotionDiv 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.1 }}
            className="p-10 rounded-[3rem] bg-card border border-border/60 shadow-xl"
          >
            <h3 className="text-2xl font-black font-heading flex items-center gap-3 mb-8">
              <KeyRound className="w-6 h-6 text-cyan-500" /> Change Password
            </h3>

            {error && (
              <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm font-bold">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-sm font-bold">
                {success}
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-foreground/50 ml-2">Current Password</label>
                <input
                  type="password"
                  required
                  value={passwords.current}
                  onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                  className="w-full px-6 py-4 rounded-2xl bg-background border border-border/60 focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/10 transition-all outline-none"
                  placeholder="Enter current password"
                />
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-foreground/50 ml-2">New Password</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={passwords.new}
                    onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                    className="w-full px-6 py-4 rounded-2xl bg-background border border-border/60 focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/10 transition-all outline-none"
                    placeholder="Min. 6 characters"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-foreground/50 ml-2">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={passwords.confirm}
                    onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                    className="w-full px-6 py-4 rounded-2xl bg-background border border-border/60 focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/10 transition-all outline-none"
                    placeholder="Repeat new password"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading || !passwords.current || !passwords.new || !passwords.confirm}
                className="mt-4 w-full md:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-600 to-sky-600 text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all disabled:opacity-50"
              >
                {loading ? "Updating..." : "Update Password"}
              </button>
            </form>
          </MotionDiv>

          {/* Danger Zone */}
          <MotionDiv 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.2 }}
            className="p-10 rounded-[3rem] bg-rose-500/5 border border-rose-500/10"
          >
            <h3 className="text-2xl font-black font-heading flex items-center gap-3 mb-8 text-rose-500">
              <Shield className="w-6 h-6" /> Account Actions
            </h3>
            
            <div className="flex flex-col sm:flex-row gap-6">
              <button
                onClick={handleSignOut}
                className="flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-card border border-border/60 hover:border-foreground/20 text-foreground font-black uppercase tracking-widest text-xs transition-all shadow-soft"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
              
              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-rose-500 text-white font-black uppercase tracking-widest text-xs transition-all shadow-lg hover:bg-rose-600 shadow-rose-500/20"
                >
                  <Trash2 className="w-4 h-4" /> Delete Account
                </button>
              ) : (
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20">
                  <span className="text-xs font-bold text-rose-500 uppercase tracking-widest flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> Are you sure?
                  </span>
                  <button onClick={handleDeleteAccount} className="px-4 py-2 rounded-xl bg-rose-500 text-white text-xs font-black uppercase tracking-widest hover:bg-rose-600">
                    Yes, Delete
                  </button>
                  <button onClick={() => setShowDeleteConfirm(false)} className="px-4 py-2 rounded-xl bg-card border border-border text-foreground text-xs font-black uppercase tracking-widest hover:bg-foreground/5">
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </MotionDiv>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default ProfilePage;
