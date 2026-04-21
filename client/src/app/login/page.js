"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { HiOutlineEnvelope, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeSlash } from "react-icons/hi2";
import { APP_NAME } from "@/lib/constants";

export default function LoginPage() {
  const { login, error, setError } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      router.push("/dashboard");
    } catch {
      // error is set in context
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative bg-gradient-hero">
      {/* Orbs */}
      <div className="orb orb-blue" style={{ top: "20%", left: "10%" }} />
      <div className="orb orb-purple" style={{ bottom: "20%", right: "10%" }} />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div className="glass-card p-8 sm:p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-6">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                style={{ background: "linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)" }}
              >
                SB
              </div>
            </Link>
            <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
              Welcome to {APP_NAME}
            </h1>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Sign in to continue your learning journey
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-3 rounded-lg text-sm text-red-700 bg-red-50 border border-red-200">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                Email
              </label>
              <div className="relative">
                <HiOutlineEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: "var(--text-muted)" }} />
                <input
                  id="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => { setForm({ ...form, email: e.target.value }); setError(null); }}
                  className="input-field pl-12"
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                Password
              </label>
              <div className="relative">
                <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: "var(--text-muted)" }} />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={form.password}
                  onChange={(e) => { setForm({ ...form, password: e.target.value }); setError(null); }}
                  className="input-field pl-12 pr-12"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--text-muted)" }}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <HiOutlineEyeSlash className="w-5 h-5" /> : <HiOutlineEye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full btn-lg"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-sm mt-6" style={{ color: "var(--text-muted)" }}>
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-semibold transition-colors hover:underline"
              style={{ color: "var(--primary)" }}
            >
              Sign up
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
