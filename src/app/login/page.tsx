"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "@/actions/auth";
import { createClient } from "@/lib/supabase/client";
import { LogIn, Mail, Sparkles, ChevronLeft } from "lucide-react";
import { getSessionProvider } from "@/lib/auth-helpers";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Auth mode: 'password' or 'otp'
  const [authMode, setAuthMode] = useState<"password" | "otp">("password");
  
  // OTP sub-steps: 'request' or 'verify'
  const [otpStep, setOtpStep] = useState<"request" | "verify">("request");
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");

  async function handlePasswordSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMessage("");
    const formData = new FormData(e.currentTarget);
    const result = await signIn(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError("");
    setSuccessMessage("");
    
    try {
      const supabase = createClient();
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: `${window.location.origin}/api/auth/callback`,
          data: {
            provider: "otp"
          }
        }
      });

      setLoading(false);
      if (otpError) {
        setError(otpError.message);
      } else {
        setOtpStep("verify");
        setSuccessMessage("A secure 6-digit code has been sent to your email address.");
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred sending OTP.");
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !otpCode) return;
    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const supabase = createClient();
      const { error: verifyError, data } = await supabase.auth.verifyOtp({
        email,
        token: otpCode,
        type: "email",
      });

      if (verifyError) {
        setError(verifyError.message);
        setLoading(false);
      } else {
        try {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role, provider")
            .eq("id", data.user?.id)
            .single();

          const profileProvider = profile?.provider;
          const session = (await supabase.auth.getSession()).data.session;
          const sessionProvider = getSessionProvider(session);

          const isEquivalent = (p1: string, p2: string) => 
            p1 === p2 || (p1 === "twitter" && p2 === "x") || (p1 === "x" && p2 === "twitter");

          if (profileProvider && sessionProvider && !isEquivalent(profileProvider, sessionProvider)) {
            await supabase.auth.signOut();
            setError(`This email is already registered using ${profileProvider === 'email' ? 'Password' : profileProvider}. Please sign in using that method.`);
            setLoading(false);
            return;
          }
          
          router.push(profile?.role === "provider" ? "/provider/dashboard" : "/");
          router.refresh();
        } catch {
          router.push("/");
          router.refresh();
        }
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred verifying OTP.");
      setLoading(false);
    }
  }

  async function handleOAuthLogin(provider: "google" | "discord" | "twitter") {
    setLoading(true);
    setError("");
    setSuccessMessage("");
    try {
      const supabase = createClient();
      // Map 'twitter' to the new 'x' OAuth 2.0 provider name in Supabase
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
      setError(err?.message || `Failed to initialize ${provider} login.`);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 hero-gradient relative overflow-hidden py-10">
      <div className="absolute top-1/4 right-10 w-96 h-96 rounded-full bg-primary-light/20 blur-3xl animate-float mix-blend-multiply" />
      <div className="absolute bottom-1/4 left-10 w-80 h-80 rounded-full bg-accent/20 blur-3xl animate-float delay-300 mix-blend-multiply" />

      <div className="w-full max-w-md relative z-10">
        <div className="flex justify-end mb-3 animate-fade-in-up">
          <Link
            href="/register"
            className="text-xs font-bold px-4 py-2 rounded-full border border-primary/20 bg-white/40 hover:bg-white hover:border-primary/50 text-primary transition-all shadow-md backdrop-blur-md"
          >
            Create account
          </Link>
        </div>

        <div className="glass rounded-3xl p-8 animate-fade-in-up shadow-2xl border border-white/20">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center mx-auto mb-4 shadow-glow">
              <img src="/logo.png" alt="NestScout" className="w-12 h-12 object-contain" />
            </div>
            <h1 className="text-3xl font-bold text-text mb-2 tracking-tight">
              Welcome back
            </h1>
            <p className="text-text-muted text-sm font-medium">
              Log in to your NestScout account.
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

          {/* PASSWORD LOGIN FORM */}
          {authMode === "password" && (
            <form onSubmit={handlePasswordSubmit} className="space-y-5">
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
                className="btn btn-primary w-full py-4 text-base mt-2 shadow-glow flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Sign In
                    <LogIn className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* OTP LOGIN FORM */}
          {authMode === "otp" && (
            <div className="space-y-5">
              {otpStep === "request" ? (
                <form onSubmit={handleSendOtp} className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-primary mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full px-5 py-3.5 rounded-xl border-2 border-primary/20 bg-white/50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all outline-none text-text font-medium"
                      placeholder="Ex. pilot@nestscout.com"
                    />
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
                        Send Secure OTP
                        <Sparkles className="w-5 h-5" />
                      </>
                    )}
                  </button>

                  <div className="text-center mt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode("password");
                        setError("");
                        setSuccessMessage("");
                      }}
                      className="text-xs font-bold text-primary hover:text-accent hover:underline transition-colors focus:outline-none"
                    >
                      Back to Password Login
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-text-muted">
                      Sending OTP to <strong className="text-text">{email}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setOtpStep("request");
                        setError("");
                        setSuccessMessage("");
                      }}
                      className="text-xs font-bold text-accent hover:underline flex items-center gap-1"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      Edit Email
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-primary mb-2">
                      Verification Code (OTP)
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                      required
                      className="w-full px-5 py-3.5 rounded-xl border-2 border-primary/20 bg-white/50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all outline-none text-center text-2xl tracking-[0.75em] font-bold text-text"
                      placeholder="••••••"
                    />
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
                        Verify & Log In
                        <LogIn className="w-5 h-5" />
                      </>
                    )}
                  </button>

                  <div className="text-center mt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode("password");
                        setOtpStep("request");
                        setError("");
                        setSuccessMessage("");
                      }}
                      className="text-xs font-bold text-primary hover:text-accent hover:underline transition-colors focus:outline-none"
                    >
                      Back to Password Login
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Social Logins Divider */}
          <div className="relative my-7 text-center">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-primary/10"></span>
            </div>
            <span className="relative bg-[#fafdfb] px-4 text-xs font-bold text-text-muted uppercase tracking-wider">
              Or Connect Via
            </span>
          </div>

          {/* Social Logins Buttons Grid */}
          <div className="grid grid-cols-4 gap-3">
            {/* Google OAuth */}
            <button
              type="button"
              onClick={() => handleOAuthLogin("google")}
              disabled={loading}
              className="flex flex-col items-center justify-center p-3 rounded-2xl border-2 border-primary/10 bg-white/40 hover:bg-white hover:border-primary/30 transition-all duration-300 hover:shadow-md cursor-pointer group"
              title="Sign in with Google"
            >
              <svg className="w-6 h-6 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              <span className="text-[10px] font-bold text-text-muted mt-1.5">Google</span>
            </button>

            {/* Discord OAuth */}
            <button
              type="button"
              onClick={() => handleOAuthLogin("discord")}
              disabled={loading}
              className="flex flex-col items-center justify-center p-3 rounded-2xl border-2 border-primary/10 bg-white/40 hover:bg-white hover:border-[#5865F2]/30 hover:bg-[#5865F2]/5 transition-all duration-300 hover:shadow-md cursor-pointer group"
              title="Sign in with Discord"
            >
              <svg className="w-6 h-6 fill-[#5865F2] transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.873-.894a.077.077 0 0 1-.008-.128c.126-.093.252-.19.372-.287a.075.075 0 0 1 .077-.011c3.92 1.793 8.18 1.793 12.061 0a.073.073 0 0 1 .078.009c.12.099.246.195.373.289a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.894a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.156-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.156 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.156-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.156 2.418z" />
              </svg>
              <span className="text-[10px] font-bold text-text-muted mt-1.5">Discord</span>
            </button>

            {/* X OAuth */}
            <button
              type="button"
              onClick={() => handleOAuthLogin("twitter")}
              disabled={loading}
              className="flex flex-col items-center justify-center p-3 rounded-2xl border-2 border-primary/10 bg-white/40 hover:bg-white hover:border-black/30 hover:bg-black/5 transition-all duration-300 hover:shadow-md cursor-pointer group"
              title="Sign in with X"
            >
              <svg className="w-5.5 h-5.5 fill-black transition-transform duration-300 group-hover:scale-110 my-0.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              <span className="text-[10px] font-bold text-text-muted mt-1.5">X (Twitter)</span>
            </button>

            {/* Email OTP Connection */}
            <button
              type="button"
              onClick={() => {
                setAuthMode("otp");
                setOtpStep("request");
                setError("");
                setSuccessMessage("");
              }}
              disabled={loading}
              className="flex flex-col items-center justify-center p-3 rounded-2xl border-2 border-primary/10 bg-white/40 hover:bg-white hover:border-primary/30 transition-all duration-300 hover:shadow-md cursor-pointer group"
              title="Sign in with Email OTP"
            >
              <Mail className="w-6 h-6 text-primary transition-transform duration-300 group-hover:scale-110" />
              <span className="text-[10px] font-bold text-text-muted mt-1.5">OTP</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

