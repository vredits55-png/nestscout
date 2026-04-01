"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "@/actions/auth";
import { LogIn, ArrowLeft, Home } from "lucide-react";

export default function LoginPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    const result = await signIn(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 hero-gradient relative overflow-hidden">
      <div className="absolute top-1/4 right-10 w-96 h-96 rounded-full bg-primary-light/20 blur-3xl animate-float mix-blend-multiply" />
      <div className="absolute bottom-1/4 left-10 w-80 h-80 rounded-full bg-accent/20 blur-3xl animate-float delay-300 mix-blend-multiply" />

      <div className="w-full max-w-md relative z-10">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-primary transition-colors mb-6 font-bold">
          <ArrowLeft className="w-4 h-4" />
          Back to exploration
        </Link>
        
        <div className="glass rounded-3xl p-8 animate-fade-in-up">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center mx-auto mb-4 shadow-glow">
              <img src="/logo.png" alt="NestScout" className="w-12 h-12 object-contain" />
            </div>
            <h1 className="text-3xl font-bold text-text mb-2 tracking-tight">
              Welcome back
            </h1>
            <p className="text-text-muted text-sm font-medium">
              Log in to your NestScout matrix.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 font-bold text-sm animate-fade-in">
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-primary mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                required
                className="w-full px-5 py-3.5 rounded-xl border-2 border-primary/20 bg-white/50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all outline-none text-text font-medium"
                placeholder="Ex. pilot@nestscout.com"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-bold text-primary">
                  Password
                </label>
                <Link href="#" className="text-sm font-bold text-accent hover:text-primary transition-colors">
                  Forgot?
                </Link>
              </div>
              <input
                type="password"
                name="password"
                required
                className="w-full px-5 py-3.5 rounded-xl border-2 border-primary/20 bg-white/50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all outline-none text-text font-medium"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full py-4 text-base mt-4 shadow-glow"
            >
              {loading ? (
                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Enter Matrix
                  <LogIn className="w-5 h-5 ml-2" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-border text-center">
            <p className="text-sm text-text-muted font-medium">
              First time here?{" "}
              <Link href="/register" className="font-bold text-primary hover:text-accent transition-colors">
                Initialize an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
