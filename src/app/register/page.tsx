"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { signUp } from "@/actions/auth";
import { createClient } from "@/lib/supabase/client";
import { UserPlus, ArrowLeft, User, Building, Eye, EyeOff, Sparkles } from "lucide-react";

function RegisterContent() {
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get("role") || "client";

  const [role, setRole] = useState(defaultRole);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");
    const formData = new FormData(e.currentTarget);
    
    // Assemble full_name from first_name and last_name
    const firstName = formData.get("first_name") as string;
    const lastName = formData.get("last_name") as string;
    const fullName = `${firstName} ${lastName}`.trim();

    if (!fullName) {
      setError("Please provide your name.");
      setLoading(false);
      return;
    }

    // Client-side password mismatch validation
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirm_password") as string;
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    formData.set("full_name", fullName);
    formData.set("role", role);

    const result = await signUp(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else if (result?.success) {
      setSuccessMsg(result.message);
      setLoading(false);
    }
  }

  async function handleOAuthLogin(provider: "google" | "discord" | "twitter") {
    setLoading(true);
    setError("");
    setSuccessMsg("");
    try {
      const supabase = createClient();
      const actualProvider = provider === "twitter" ? "x" : provider;
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: actualProvider,
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback`,
          queryParams: actualProvider === "google" ? { prompt: "select_account" } : undefined,
        },
      });
      if (oauthError) {
        setError(oauthError.message);
        setLoading(false);
      }
    } catch (err: any) {
      setError(err?.message || `Failed to initialize ${provider} registration.`);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 hero-gradient relative overflow-hidden pt-10 pb-20">
      <div className="absolute top-1/4 right-10 w-96 h-96 rounded-full bg-primary-light/20 blur-3xl animate-float mix-blend-multiply" />
      <div className="absolute bottom-1/4 left-10 w-80 h-80 rounded-full bg-accent/20 blur-3xl animate-float delay-300 mix-blend-multiply" />

      <div className="w-full max-w-lg relative z-10">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-primary transition-colors mb-6 font-bold">
          <ArrowLeft className="w-4 h-4" />
          Abort sequence
        </Link>
        
        <div className="glass rounded-3xl p-8 sm:p-10 animate-fade-in-up shadow-2xl border border-white/20">
          <div className="text-center mb-6">
            <Link href="/" className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-primary flex items-center justify-center mx-auto mb-4 shadow-glow transition-transform hover:scale-105">
              <img src="/logo.png" alt="NestScout" className="w-12 h-12 object-contain" />
            </Link>
            <h1 className="text-3xl font-bold text-text mb-2 tracking-tight">
              Create an account
            </h1>
            <p className="text-text-muted text-sm font-medium">
              Already have an account?{" "}
              <Link href="/login" className="font-bold text-primary hover:text-accent transition-colors underline">
                Sign in
              </Link>
            </p>
          </div>

          {/* Renter/Landlord Role Toggle */}
          <div className="flex gap-3 mb-6 p-1.5 bg-white/50 backdrop-blur-md rounded-2xl border border-primary/10 shadow-inner">
            <button
              type="button"
              onClick={() => setRole("client")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                role === "client"
                  ? "bg-white text-primary shadow-lg border-b-2 border-primary scale-105"
                  : "text-text-muted hover:text-primary"
              }`}
            >
              <User className="w-5 h-5" />
              Renter
            </button>
            <button
              type="button"
              onClick={() => setRole("provider")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                role === "provider"
                  ? "bg-white text-primary shadow-lg border-b-2 border-primary scale-105"
                  : "text-text-muted hover:text-primary"
              }`}
            >
              <Building className="w-5 h-5" />
              Property Owner
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 font-bold text-sm animate-fade-in">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="mb-6 p-4 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-700 font-bold text-sm animate-fade-in shadow-glow flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-600 animate-pulse" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Social Logins Buttons Grid (3-column layout at top) */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {/* Google OAuth */}
            <button
              type="button"
              onClick={() => handleOAuthLogin("google")}
              disabled={loading}
              className="flex items-center justify-center gap-2.5 p-3 rounded-xl border border-primary/10 bg-white/40 hover:bg-white hover:border-primary/30 hover:shadow-sm transition-all duration-300 cursor-pointer group text-sm font-bold text-text"
            >
              <svg className="w-5 h-5 shrink-0 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Google
            </button>

            {/* Discord OAuth */}
            <button
              type="button"
              onClick={() => handleOAuthLogin("discord")}
              disabled={loading}
              className="flex items-center justify-center gap-2.5 p-3 rounded-xl border border-primary/10 bg-white/40 hover:bg-white hover:border-[#5865F2]/30 hover:bg-[#5865F2]/5 hover:shadow-sm transition-all duration-300 cursor-pointer group text-sm font-bold text-text"
            >
              <svg className="w-5 h-5 shrink-0 fill-[#5865F2] transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.873-.894a.077.077 0 0 1-.008-.128c.126-.093.252-.19.372-.287a.075.075 0 0 1 .077-.011c3.92 1.793 8.18 1.793 12.061 0a.073.073 0 0 1 .078.009c.12.099.246.195.373.289a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.894a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.156-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.156 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.156-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.156 2.418z" />
              </svg>
              Discord
            </button>

            {/* X OAuth */}
            <button
              type="button"
              onClick={() => handleOAuthLogin("twitter")}
              disabled={loading}
              className="flex items-center justify-center gap-2.5 p-3 rounded-xl border border-primary/10 bg-white/40 hover:bg-white hover:border-black/30 hover:bg-black/5 hover:shadow-sm transition-all duration-300 cursor-pointer group text-sm font-bold text-text"
            >
              <svg className="w-4.5 h-4.5 shrink-0 fill-black transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              X
            </button>
          </div>

          {/* Separation Divider */}
          <div className="relative mb-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-primary/10"></span>
            </div>
            <span className="relative bg-[#fafdfb] px-4 text-xs font-bold text-text-muted uppercase tracking-wider">
              Or Continue With Email
            </span>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            {/* First and Last Name in 2 Columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-primary mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  name="first_name"
                  required
                  className="w-full px-5 py-3.5 rounded-xl border-2 border-primary/20 bg-white/50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all outline-none text-text font-medium"
                  placeholder="Ex. John"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-primary mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  name="last_name"
                  required
                  className="w-full px-5 py-3.5 rounded-xl border-2 border-primary/20 bg-white/50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all outline-none text-text font-medium"
                  placeholder="Ex. Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-primary mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                required
                className="w-full px-5 py-3.5 rounded-xl border-2 border-primary/20 bg-white/50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all outline-none text-text font-medium"
                placeholder="Ex. john.doe@example.com"
              />
            </div>

            {/* Password and Confirm Password */}
            <div>
              <label className="block text-sm font-bold text-primary mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  minLength={6}
                  className="w-full pl-5 pr-12 py-3.5 rounded-xl border-2 border-primary/20 bg-white/50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all outline-none text-text font-medium"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-primary/50 hover:text-primary transition-colors cursor-pointer p-1 rounded-md focus:outline-none flex items-center justify-center"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <Eye className="w-5 h-5" />
                  ) : (
                    <EyeOff className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-primary mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirm_password"
                  required
                  minLength={6}
                  className="w-full pl-5 pr-12 py-3.5 rounded-xl border-2 border-primary/20 bg-white/50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all outline-none text-text font-medium"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Terms of Service Agreement Checkbox */}
            <div className="flex items-start gap-2.5 mt-2 px-1">
              <input
                type="checkbox"
                id="agree-terms"
                required
                className="w-4 h-4 rounded border-2 border-primary/30 text-primary focus:ring-primary/20 cursor-pointer accent-primary mt-1"
              />
              <label htmlFor="agree-terms" className="text-xs text-text-muted font-bold cursor-pointer select-none">
                I agree to the{" "}
                <Link href="/terms" className="text-primary hover:text-accent transition-colors underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-primary hover:text-accent transition-colors underline">
                  Privacy Policy
                </Link>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || !!successMsg}
              className="btn btn-primary w-full py-4 text-base mt-2 shadow-glow flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Create Account
                  <UserPlus className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-white"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
      <RegisterContent />
    </Suspense>
  );
}
