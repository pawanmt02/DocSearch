"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Lock, Mail, ShieldCheck, UserCheck, ArrowRight, Sparkles, CheckCircle2, AlertCircle, User, UserPlus, LogIn } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [authMode, setAuthMode] = useState<"SIGN_IN" | "REGISTER">("SIGN_IN");

  // Sign In State
  const [email, setEmail] = useState("admin@docsearch.com");
  const [password, setPassword] = useState("admin123");
  const [rememberMe, setRememberMe] = useState(true);
  const [selectedRole, setSelectedRole] = useState<"ADMIN" | "STUDENT">("ADMIN");

  // Registration State
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // Hardware-accelerated compression animation
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSelectDemoUser = (role: "ADMIN" | "STUDENT") => {
    setAuthMode("SIGN_IN");
    setSelectedRole(role);
    if (role === "ADMIN") {
      setEmail("admin@docsearch.com");
      setPassword("admin123");
    } else {
      setEmail("student@docsearch.com");
      setPassword("student123");
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setIsLoading(true);

    // Hardware-accelerated compression animation sequence (PDR Section 4.1)
    setIsSubmitting(true);
    await new Promise((res) => setTimeout(res, 450));

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      setSuccessMsg(`Welcome back, ${data.user.name}! Establishing JWT session...`);

      setTimeout(() => {
        if (data.user.role === "ADMIN") {
          router.push("/admin");
        } else {
          router.push("/dashboard");
        }
        router.refresh();
      }, 500);
    } catch (err: any) {
      setErrorMsg(err.message || "Login failed");
      setIsLoading(false);
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setIsLoading(true);

    setIsSubmitting(true);
    await new Promise((res) => setTimeout(res, 450));

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: regName,
          email: regEmail,
          password: regPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      setSuccessMsg(`Account created! Welcome, ${data.user.name}. Accessing dashboard...`);

      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 600);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to create student account");
      setIsLoading(false);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#e0e5ec] text-slate-700 flex flex-col justify-center items-center p-4 sm:p-6 font-sans relative overflow-hidden">
      {/* Soft Neumorphic Background Orbs */}
      <motion.div
        animate={{ scale: [1, 1.05, 1], rotate: [0, 5, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#e0e5ec] shadow-[20px_20px_60px_#becee6,-20px_-20px_60px_#ffffff] opacity-70 pointer-events-none"
      />
      <motion.div
        animate={{ scale: [1, 1.05, 1], rotate: [0, -5, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-[#e0e5ec] shadow-[20px_20px_60px_#becee6,-20px_-20px_60px_#ffffff] opacity-70 pointer-events-none"
      />

      {/* Main Animated Container */}
      <motion.div
        initial={{ opacity: 0, y: 25, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        className="w-full max-w-md relative z-10"
      >
        {/* Header Branding */}
        <div className="text-center mb-6">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 4 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#e0e5ec] shadow-[8px_8px_16px_#babecc,-8px_-8px_16px_#ffffff] text-indigo-600 mb-3 cursor-pointer"
          >
            <BookOpen className="w-8 h-8" />
          </motion.div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">
            Doc<span className="text-indigo-600">Search</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Role-Restricted Curated Academic Material Hub
          </p>
        </div>

        {/* Auth Mode Toggle Pill Switcher */}
        <div className="mb-6 bg-[#e0e5ec] p-1.5 rounded-2xl shadow-[inset_4px_4px_8px_#babecc,inset_-4px_-4px_8px_#ffffff] flex items-center justify-between relative">
          <button
            type="button"
            onClick={() => {
              setAuthMode("SIGN_IN");
              setErrorMsg("");
              setSuccessMsg("");
            }}
            className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-all relative z-10 ${
              authMode === "SIGN_IN"
                ? "text-indigo-600 shadow-[6px_6px_12px_#babecc,-6px_-6px_12px_#ffffff] bg-[#e0e5ec]"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode("REGISTER");
              setErrorMsg("");
              setSuccessMsg("");
            }}
            className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-all relative z-10 ${
              authMode === "REGISTER"
                ? "text-indigo-600 shadow-[6px_6px_12px_#babecc,-6px_-6px_12px_#ffffff] bg-[#e0e5ec]"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <UserPlus className="w-4 h-4 text-emerald-600" />
            <span>Create Student Account</span>
          </button>
        </div>

        {/* Central Neumorphic Login/Signup Card (PDR Section 4.1) */}
        <motion.div
          animate={{
            scale: isSubmitting ? 0.94 : 1,
            boxShadow: isSubmitting
              ? "inset 8px 8px 16px #babecc, inset -8px -8px 16px #ffffff"
              : "12px 12px 24px #babecc, -12px -12px 24px #ffffff",
          }}
          transition={{ type: "spring", stiffness: 450, damping: 22 }}
          className="bg-[#e0e5ec] rounded-3xl p-6 sm:p-8 relative overflow-hidden"
        >
          <AnimatePresence mode="wait">
            {authMode === "SIGN_IN" ? (
              /* Sign In Form */
              <motion.form
                key="signin"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.25 }}
                onSubmit={handleSignIn}
                className="space-y-5"
              >
                {/* Role Switcher Pills */}
                <div className="flex items-center justify-between gap-2 pb-2">
                  <span className="text-[11px] font-bold uppercase text-slate-500 tracking-wider">Demo Account:</span>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => handleSelectDemoUser("ADMIN")}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        selectedRole === "ADMIN"
                          ? "bg-[#e0e5ec] text-emerald-700 shadow-[3px_3px_6px_#babecc,-3px_-3px_6px_#ffffff]"
                          : "text-slate-400 hover:text-slate-700"
                      }`}
                    >
                      Admin
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectDemoUser("STUDENT")}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        selectedRole === "STUDENT"
                          ? "bg-[#e0e5ec] text-indigo-700 shadow-[3px_3px_6px_#babecc,-3px_-3px_6px_#ffffff]"
                          : "text-slate-400 hover:text-slate-700"
                      }`}
                    >
                      Student
                    </button>
                  </div>
                </div>

                {/* Email with Inverted Inset Shadow (PDR 4.1) */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">
                    Account Email
                  </label>
                  <div className="relative flex items-center">
                    <Mail className="w-4 h-4 absolute left-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@docsearch.com"
                      className="w-full pl-11 pr-4 py-3.5 bg-[#e0e5ec] text-slate-800 text-sm rounded-xl font-medium shadow-[inset_4px_4px_8px_#babecc,inset_-4px_-4px_8px_#ffffff] focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* Password with Inverted Inset Shadow (PDR 4.1) */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">
                    Security Passcode
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="w-4 h-4 absolute left-4 text-slate-400" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-11 pr-4 py-3.5 bg-[#e0e5ec] text-slate-800 text-sm rounded-xl font-medium shadow-[inset_4px_4px_8px_#babecc,inset_-4px_-4px_8px_#ffffff] focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* Animated Pill Switch for "Remember Me" (PDR Section 4.1) */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs font-semibold text-slate-600">Remember Me</span>
                  <button
                    type="button"
                    onClick={() => setRememberMe(!rememberMe)}
                    className={`relative w-12 h-6 rounded-full transition-colors p-1 flex items-center shadow-[inset_2px_2px_4px_#babecc,inset_-2px_-2px_4px_#ffffff] ${
                      rememberMe ? "bg-indigo-500" : "bg-slate-300"
                    }`}
                  >
                    <motion.div
                      layout
                      className="w-4 h-4 rounded-full bg-white shadow-md"
                      animate={{ x: rememberMe ? 24 : 0 }}
                      transition={{ type: "spring", stiffness: 600, damping: 25 }}
                    />
                  </button>
                </div>

                {/* Messages */}
                <AnimatePresence>
                  {errorMsg && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-3 rounded-xl bg-red-500/10 border border-red-400/30 text-red-600 text-xs font-medium flex items-center space-x-2"
                    >
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errorMsg}</span>
                    </motion.div>
                  )}

                  {successMsg && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-400/30 text-emerald-700 text-xs font-medium flex items-center space-x-2"
                    >
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>{successMsg}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Primary Embossed "Sign In" Button (PDR Section 4.1) */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 px-6 rounded-xl font-bold text-sm bg-indigo-600 text-white shadow-[6px_6px_12px_#babecc,-6px_-6px_12px_#ffffff] hover:bg-indigo-700 active:shadow-[inset_3px_3px_6px_#3730a3] transition-all flex items-center justify-center space-x-2 border border-indigo-500/30 disabled:opacity-75 cursor-pointer"
                >
                  <span>{isLoading ? "Authenticating Session..." : `Sign In as ${selectedRole}`}</span>
                  {!isLoading && <ArrowRight className="w-4 h-4" />}
                </motion.button>
              </motion.form>
            ) : (
              /* Student Registration Form */
              <motion.form
                key="register"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                onSubmit={handleRegister}
                className="space-y-5"
              >
                <div className="border-b border-slate-300/80 pb-3 mb-2">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
                    <UserPlus className="w-4 h-4 text-indigo-600" />
                    <span>Student Account Registration</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Self-service registration for curated study material access.
                  </p>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                    Full Name
                  </label>
                  <div className="relative flex items-center">
                    <User className="w-4 h-4 absolute left-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="e.g. Jordan Miller"
                      className="w-full pl-11 pr-4 py-3.5 bg-[#e0e5ec] text-slate-800 text-sm rounded-xl font-medium shadow-[inset_4px_4px_8px_#babecc,inset_-4px_-4px_8px_#ffffff] focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                    Student Email
                  </label>
                  <div className="relative flex items-center">
                    <Mail className="w-4 h-4 absolute left-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="jordan@university.edu"
                      className="w-full pl-11 pr-4 py-3.5 bg-[#e0e5ec] text-slate-800 text-sm rounded-xl font-medium shadow-[inset_4px_4px_8px_#babecc,inset_-4px_-4px_8px_#ffffff] focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                    Security Passcode
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="w-4 h-4 absolute left-4 text-slate-400" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full pl-11 pr-4 py-3.5 bg-[#e0e5ec] text-slate-800 text-sm rounded-xl font-medium shadow-[inset_4px_4px_8px_#babecc,inset_-4px_-4px_8px_#ffffff] focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* Messages */}
                <AnimatePresence>
                  {errorMsg && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-3 rounded-xl bg-red-500/10 border border-red-400/30 text-red-600 text-xs font-medium flex items-center space-x-2"
                    >
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errorMsg}</span>
                    </motion.div>
                  )}

                  {successMsg && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-400/30 text-emerald-700 text-xs font-medium flex items-center space-x-2"
                    >
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>{successMsg}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Register Submit Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 px-6 rounded-xl font-bold text-sm bg-indigo-600 text-white shadow-[6px_6px_12px_#babecc,-6px_-6px_12px_#ffffff] hover:bg-indigo-700 transition-all flex items-center justify-center space-x-2 border border-indigo-500/30 disabled:opacity-75 cursor-pointer"
                >
                  <span>{isLoading ? "Registering..." : "Create Student Account"}</span>
                  {!isLoading && <ArrowRight className="w-4 h-4" />}
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Footnote */}
          <div className="mt-6 pt-5 border-t border-slate-300/60 text-center text-xs text-slate-500">
            {authMode === "SIGN_IN" ? (
              <p>
                Need a student account?{" "}
                <button
                  type="button"
                  onClick={() => setAuthMode("REGISTER")}
                  className="text-indigo-600 font-bold hover:underline"
                >
                  Register here
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setAuthMode("SIGN_IN")}
                  className="text-indigo-600 font-bold hover:underline"
                >
                  Sign in here
                </button>
              </p>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
