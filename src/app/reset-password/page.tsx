"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updatePassword } from "@/actions/auth";
import { Lock, Sparkles, Eye, EyeOff } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMessage("");

    const formData = new FormData(e.currentTarget);
    const result = await updatePassword(formData);

    setLoading(false);
    if (result?.error) {
      setError(result.error);
    } else if (result?.success) {
      setSuccessMessage("Your password has been successfully updated!");
      setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 2000);
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 hero-gradient relative overflow-hidden py-10">
      <div className="absolute top-1/4 right-10 w-96 h-96 rounded-full bg-primary-light/20 blur-3xl animate-float mix-blend-multiply" />
      <div className="absolute bottom-1/4 left-10 w-80 h-80 rounded-full bg-accent/20 blur-3xl animate-float delay-300 mix-blend-multiply" />

      <div className="w-full max-w-md relative z-10">
        <div className="glass rounded-3xl p-8 animate-fade-in-up shadow-2xl border border-white/20">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center mx-auto mb-4 shadow-glow">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-text mb-2 tracking-tight">
              Create New Password
            </h1>
            <p className="text-text-muted text-sm font-medium">
              Please enter your new password below to secure your NestScout account.
            </p>
          </div>

          {error && (
            <div className="mb-5 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 font-bold text-sm animate-fade-in">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="mb-5 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-600 font-bold text-sm animate-fade-in flex items-center gap-2">
              <Sparkles className="w-4 h-4 shrink-0 animate-pulse text-green-500" />
              <span>{successMessage}</span>
            </div>
          )}

          {!successMessage && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-primary mb-2">
                  New Password
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
                disabled={loading}
                className="btn btn-primary w-full py-4 text-base mt-2 shadow-glow flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Update Password
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
