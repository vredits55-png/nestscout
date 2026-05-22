"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { signUp } from "@/actions/auth";
import { UserPlus, ArrowLeft, User, Building, Eye, EyeOff } from "lucide-react";

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

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 hero-gradient relative overflow-hidden pt-10 pb-20">
      <div className="absolute top-1/4 right-10 w-96 h-96 rounded-full bg-primary-light/20 blur-3xl animate-float mix-blend-multiply" />
      <div className="absolute bottom-1/4 left-10 w-80 h-80 rounded-full bg-accent/20 blur-3xl animate-float delay-300 mix-blend-multiply" />

      <div className="w-full max-w-lg relative z-10">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-primary transition-colors mb-6 font-bold">
          <ArrowLeft className="w-4 h-4" />
          Abort sequence
        </Link>
        
        <div className="glass rounded-3xl p-8 sm:p-10 animate-fade-in-up">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-primary flex items-center justify-center mx-auto mb-4 shadow-glow">
              <img src="/logo.png" alt="NestScout" className="w-12 h-12 object-contain" />
            </div>
            <h1 className="text-3xl font-bold text-text mb-2 tracking-tight">
              Create Account
            </h1>
            <p className="text-text-muted text-sm font-medium">
              Create your profile to access premium real estate listings.
            </p>
          </div>

          <div className="flex gap-3 mb-8 p-1.5 bg-white/50 backdrop-blur-md rounded-2xl border border-primary/10 shadow-inner">
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
            <div className="mb-6 p-4 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-700 font-bold text-sm animate-fade-in shadow-glow">
              {successMsg}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-primary mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="full_name"
                required
                className="w-full px-5 py-3.5 rounded-xl border-2 border-primary/20 bg-white/50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all outline-none text-text font-medium"
                placeholder="Ex. John Doe"
              />
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
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              <p className="text-xs text-text-muted font-medium mt-2">Must be at least 6 characters.</p>
            </div>

            <button
              type="submit"
              disabled={loading || !!successMsg}
              className="btn btn-primary w-full py-4 text-base mt-6 shadow-glow"
            >
              {loading ? (
                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Sign Up
                  <UserPlus className="w-5 h-5 ml-2" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-border text-center">
            <p className="text-sm text-text-muted font-medium">
              Already have an account?{" "}
              <Link href="/login" className="font-bold text-primary hover:text-accent transition-colors">
                Return to Login
              </Link>
            </p>
          </div>
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
