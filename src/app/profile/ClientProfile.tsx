"use client";

import { useState, useTransition, useEffect } from "react";
import { User, Mail, Phone, Shield, CheckCircle, MapPin, Bell, History } from "lucide-react";
import { updateProfile, unlinkProvider } from "@/actions/profile";
import type { Profile } from "@/lib/types";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useSearchParams } from "next/navigation";

export default function ProfilePage({
  initialProfile,
  userEmail,
  initialIdentities,
}: {
  initialProfile: Profile;
  userEmail: string;
  initialIdentities: any[];
}) {
  const searchParams = useSearchParams();
  const [fullName, setFullName] = useState(initialProfile.full_name || "");
  const [phone, setPhone] = useState(initialProfile.phone || "");
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [linkedProviders, setLinkedProviders] = useState<string[]>(initialProfile.linked_providers || []);
  const [identities, setIdentities] = useState<any[]>(initialIdentities);
  const [linkError, setLinkError] = useState("");
  const [linkSuccess, setLinkSuccess] = useState("");
  const [linkingProgress, setLinkingProgress] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const linked = searchParams.get("linked");
    const prov = searchParams.get("provider");
    const err = searchParams.get("error");

    if (err) {
      setLinkError(err);
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
      setTimeout(() => setLinkError(""), 6000);
    } else if (linked === "success" && prov) {
      const friendlyName = prov === 'twitter' ? 'X (Twitter)' : prov.charAt(0).toUpperCase() + prov.slice(1);
      setLinkSuccess(`Successfully linked ${friendlyName} account!`);
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
      setTimeout(() => setLinkSuccess(""), 5000);
    }
  }, [searchParams]);

  async function handleLink(provider: string) {
    setLinkError("");
    setLinkSuccess("");
    setLinkingProgress(prev => ({ ...prev, [provider]: true }));

    try {
      const supabase = createClient();
      // Map 'twitter' to the new 'x' OAuth 2.0 provider name in Supabase
      const actualProvider = provider === "twitter" ? "x" : provider;
      const { data, error } = await supabase.auth.linkIdentity({
        provider: actualProvider as any,
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback?linking=true&provider=${provider}`,
          queryParams: actualProvider === "google" ? { prompt: "select_account" } : undefined,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.url) {
        window.location.assign(data.url);
      } else {
        throw new Error("No authorization URL returned.");
      }
    } catch (err: any) {
      setLinkError(err?.message || `Failed to initiate linking for ${provider}.`);
      setLinkingProgress(prev => ({ ...prev, [provider]: false }));
    }
  }

  async function handleUnlink(provider: string) {
    setLinkError("");
    setLinkSuccess("");
    setLinkingProgress(prev => ({ ...prev, [provider]: true }));

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      const currentIdentities = user?.identities || identities;

      const actualProvider = provider === "twitter" ? "x" : provider;
      const identity = currentIdentities.find(id => id.provider === provider || id.provider === actualProvider);
      if (identity) {
        const { error: unlinkAuthError } = await supabase.auth.unlinkIdentity(identity);
        if (unlinkAuthError) {
          throw new Error(unlinkAuthError.message);
        }
      }

      const result = await unlinkProvider(provider);
      if (result.error) {
        throw new Error(result.error);
      }

      setLinkedProviders(prev => prev.filter(p => p !== provider));
      setIdentities(prev => prev.filter(id => id.provider !== provider));
      setLinkSuccess(`Successfully unlinked ${provider === 'twitter' ? 'X (Twitter)' : provider.charAt(0).toUpperCase() + provider.slice(1)}.`);
      setTimeout(() => setLinkSuccess(""), 4000);
    } catch (err: any) {
      setLinkError(err?.message || `Failed to unlink ${provider}.`);
    } finally {
      setLinkingProgress(prev => ({ ...prev, [provider]: false }));
    }
  }

  const isProvider = initialProfile.role === "provider";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSuccess(false);
    setError("");

    const formData = new FormData();
    formData.append("fullName", fullName);
    formData.append("phone", phone);

    startTransition(async () => {
      const result = await updateProfile(formData);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    });
  }

  return (
    <div className="min-h-screen bg-background relative pb-32 overflow-x-hidden">
      {/* Animated Floating Background Elements (Antigravity effects) */}
      <div className="floating-blob w-96 h-96 bg-primary-fixed top-[-5%] left-[-10%] rounded-full animate-float"></div>
      <div className="floating-blob w-80 h-80 bg-tertiary-fixed-dim top-[40%] right-[-5%] rounded-full animate-float-delayed"></div>
      
      {/* Top Header Spacing Area */}
      <div className="pt-28 pb-6 px-4 sm:px-8 relative z-10 w-full max-w-[1440px] mx-auto">
        
        {/* Profile Summary - Mirroring the Mobile Dashboard Mockup */}
        <section className="relative overflow-hidden p-6 sm:p-10 bg-surface-container-lowest rounded-[2.5rem] antialiased mb-10 shadow-ambient border border-white/50 backdrop-blur-md">
           
           <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-20 h-20 rounded-[1.2rem] bg-surface-container-low shadow-sm overflow-hidden flex items-center justify-center font-black text-primary text-3xl shrink-0">
                     {fullName ? fullName.charAt(0).toUpperCase() : <User className="w-8 h-8" />}
                  </div>
                  <span className="absolute -bottom-2 -right-2 w-7 h-7 bg-primary rounded-full flex items-center justify-center text-white border-[3px] border-surface-container-lowest shadow-sm">
                     <CheckCircle className="w-4 h-4" />
                  </span>
                </div>
                <div>
                  <h2 className="font-headline font-black text-2xl sm:text-3xl text-on-surface">Welcome back, {fullName ? fullName.split(' ')[0] : 'User'}</h2>
                  <p className="text-sm sm:text-base text-primary font-bold uppercase tracking-widest mt-1">
                     {isProvider ? "Property Curator" : "Digital Resident Level 1"}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-center p-4 sm:px-8 bg-surface-container-low rounded-2xl w-full sm:w-auto shadow-inner border border-outline-variant/10">
                <div className="text-center px-4">
                  <p className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-on-surface-variant font-bold mb-1">Saved</p>
                  <p className="font-headline font-extrabold text-xl sm:text-2xl text-primary">0</p>
                </div>
                 <div className="w-px h-10 bg-outline-variant/30"></div>
                <div className="text-center px-4">
                  <p className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-on-surface-variant font-bold mb-1">Tours</p>
                  <p className="font-headline font-extrabold text-xl sm:text-2xl text-primary">0</p>
                </div>
              </div>

           </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
           
           {/* Left Section: Active / Favorites */}
           <div className="lg:col-span-8 space-y-10">
             
              <section>
                 <div className="flex items-center justify-between mb-6 px-2">
                    <h3 className="font-headline font-bold text-xl text-on-surface">Active Match History (Demo)</h3>
                    <span className="text-xs font-bold text-primary px-4 py-1.5 bg-primary-container/20 rounded-full flex items-center gap-1"><MapPin className="w-3 h-3"/> Global</span>
                 </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Placeholder Card 1 */}
                    <Link href="/search" className="bg-surface-container-lowest rounded-[2rem] p-4 shadow-ambient group border border-outline-variant/20 flex flex-col hover:-translate-y-1 transition-transform">
                      <div className="relative h-48 mb-4 overflow-hidden rounded-[1.5rem] bg-surface-variant flex items-center justify-center">
                          <span className="text-outline-variant uppercase tracking-widest font-bold text-xs flex items-center gap-2">
                             <History className="w-4 h-4"/> Start a visual search
                          </span>
                      </div>
                      <div className="px-2">
                         <div className="flex justify-between items-start mb-2">
                            <h4 className="font-headline font-bold text-lg">Your Next Epoch</h4>
                         </div>
                         <p className="text-xs text-on-surface-variant flex items-center gap-1">
                            <MapPin className="w-3 h-3"/> Discover the collections
                         </p>
                      </div>
                    </Link>
                 </div>
              </section>

              {/* Dossier Form */}
              <section className="bg-surface-container-lowest rounded-[2.5rem] p-8 shadow-ambient border border-outline-variant/20 mt-10">
                 <h3 className="font-headline font-bold text-xl text-on-surface mb-6 px-2 flex items-center gap-3">
                    <Shield className="w-6 h-6 text-primary"/>
                    Identity Dossier
                 </h3>

                 <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="p-5 bg-surface-container-low border border-outline-variant/10 rounded-[1.5rem]">
                      <label className="input-label flex items-center gap-2 mb-2">
                        <Mail className="w-4 h-4 text-primary" />
                        Communication Channel
                      </label>
                      <input
                        type="email"
                        value={userEmail}
                        disabled
                        className="input-field opacity-60 bg-surface-variant cursor-not-allowed font-body"
                      />
                      <p className="text-[10px] font-bold text-outline uppercase tracking-widest mt-2 ml-2">Email designation is securely locked.</p>
                    </div>

                    <div className="p-5 bg-surface-container-low border border-outline-variant/10 rounded-[1.5rem]">
                      <label className="input-label flex items-center gap-2 mb-2">
                        <User className="w-4 h-4 text-primary" />
                        Primary Identifier
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Legal Name"
                        className="input-field bg-surface-container-lowest font-body border-transparent focus:border-primary shadow-sm"
                        required
                      />
                    </div>

                    <div className="p-5 bg-surface-container-low border border-outline-variant/10 rounded-[1.5rem]">
                      <label className="input-label flex items-center gap-2 mb-2">
                        <Phone className="w-4 h-4 text-primary" />
                        Direct Line
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1 (555) 000-0000"
                        className="input-field bg-surface-container-lowest font-body border-transparent focus:border-primary shadow-sm"
                      />
                    </div>

                    {error && (
                      <div className="p-4 rounded-[1rem] bg-error-container text-on-error-container font-bold text-xs border border-error/20 font-body animate-fade-in text-center flex items-center justify-center">
                        {error}
                      </div>
                    )}

                    {success && (
                      <div className="p-4 rounded-[1rem] bg-primary/10 text-primary font-bold text-sm border-2 border-primary/30 flex items-center justify-center gap-2 animate-scale-in">
                        <CheckCircle className="w-5 h-5" />
                        Dossier meticulously updated.
                      </div>
                    )}

                    <div className="pt-4 flex justify-end">
                      <button
                        type="submit"
                        disabled={isPending}
                        className="w-full sm:w-auto px-10 py-4 bg-primary text-on-primary rounded-full font-bold shadow-lg shadow-primary/20 active:scale-95 transition-all text-sm uppercase tracking-widest"
                      >
                        {isPending ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                        ) : (
                          "Apply Changes"
                        )}
                      </button>
                    </div>
                  </form>
              </section>

           </div>

           {/* Right Section: Messages / Invites */}
           <aside className="lg:col-span-4">
              <div className="sticky top-28 space-y-8">
                 
                 {/* Linked Connections Card */}
                 <div className="bg-surface-container-lowest p-8 rounded-[2.5rem] shadow-ambient border border-outline-variant/20 block animate-fade-in">
                    <h3 className="font-headline font-bold text-lg text-on-surface mb-6 flex items-center gap-2">
                      <Shield className="w-5 h-5 text-primary"/> Linked Connections
                    </h3>
                    
                    {linkSuccess && (
                      <div className="mb-4 p-3 bg-primary/10 text-primary border border-primary/20 rounded-xl text-xs font-bold flex items-center gap-2 animate-scale-in">
                        <CheckCircle className="w-4 h-4 shrink-0" />
                        <span>{linkSuccess}</span>
                      </div>
                    )}
                    {linkError && (
                      <div className="mb-4 p-3 bg-error-container text-on-error-container border border-error/20 rounded-xl text-xs font-bold flex items-center gap-2 animate-scale-in">
                        <Shield className="w-4 h-4 shrink-0 text-red-500" />
                        <span>{linkError}</span>
                      </div>
                    )}

                    <div className="space-y-4">
                      {[
                        {
                          id: "google",
                          name: "Google",
                          icon: (
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" fill="#FBBC05" />
                              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                          )
                        },
                        {
                          id: "discord",
                          name: "Discord",
                          icon: (
                            <svg className="w-5 h-5 fill-[#5865F2]" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.873-.894a.077.077 0 0 1-.008-.128c.126-.093.252-.19.372-.287a.075.075 0 0 1 .077-.011c3.92 1.793 8.18 1.793 12.061 0a.073.073 0 0 1 .078.009c.12.099.246.195.373.289a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.894a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.156-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.156 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.156-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.156 2.418z" />
                            </svg>
                          )
                        },
                        {
                          id: "twitter",
                          name: "X (Twitter)",
                          icon: (
                            <svg className="w-4 h-4 fill-black dark:fill-white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                            </svg>
                          )
                        }
                      ].map((item) => {
                        const isPrimary = initialProfile.provider === item.id || (item.id === "twitter" && initialProfile.provider === "x");
                        const isLinked = linkedProviders.includes(item.id) || 
                          (item.id === "twitter" && linkedProviders.includes("x")) ||
                          identities.some(id => id.provider === item.id || (item.id === "twitter" && id.provider === "x"));
                        
                        return (
                          <div key={item.id} className="p-4 bg-surface-container-low rounded-[1.5rem] border border-outline-variant/10 flex items-center justify-between gap-4 hover:scale-[1.01] transition-transform duration-300">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center border border-outline-variant/15 shrink-0">
                                {item.icon}
                              </div>
                              <div>
                                <h4 className="text-sm font-bold text-on-surface">{item.name}</h4>
                                <p className="text-[10px] uppercase tracking-wider font-extrabold mt-0.5">
                                  {isPrimary ? (
                                    <span className="text-primary font-black">Primary Method</span>
                                  ) : isLinked ? (
                                    <span className="text-primary-fixed-dim">Linked</span>
                                  ) : (
                                    <span className="text-outline">Disconnected</span>
                                  )}
                                </p>
                              </div>
                            </div>
                            
                            <div>
                              {isPrimary ? (
                                <span className="text-[10px] font-black tracking-widest text-outline-variant px-3 py-1.5 bg-surface-variant/40 rounded-full select-none uppercase">
                                  Locked
                                </span>
                              ) : isLinked ? (
                                <button
                                  type="button"
                                  onClick={() => handleUnlink(item.id)}
                                  disabled={linkingProgress[item.id]}
                                  className="text-xs font-bold text-error px-4 py-2 hover:bg-error/10 border border-error/20 rounded-full transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                                >
                                  {linkingProgress[item.id] ? "..." : "Unlink"}
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleLink(item.id)}
                                  disabled={linkingProgress[item.id]}
                                  className="text-xs font-bold text-primary px-4 py-2 hover:bg-primary/10 border border-primary/20 rounded-full transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                                >
                                  {linkingProgress[item.id] ? "..." : "Link"}
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                 </div>

                 <div className="bg-surface-container-lowest p-8 rounded-[2.5rem] shadow-ambient border border-outline-variant/20 block">
                    <h3 className="font-headline font-bold text-lg text-on-surface mb-6 flex items-center gap-2">
                      <Bell className="w-5 h-5 text-primary"/> Alerts & Inquiries
                    </h3>
                    <div className="space-y-4">
                       <Link href="/conversations" className="block p-4 bg-surface-container-low rounded-[1.5rem] hover:bg-surface-container transition-colors border border-outline-variant/10 cursor-pointer">
                          <div className="flex justify-between items-center mb-1">
                             <h4 className="text-sm font-bold text-on-surface">Inbox Terminal</h4>
                          </div>
                          <p className="text-xs text-on-surface-variant">View all active negotiations and chat rooms.</p>
                       </Link>
                    </div>
                 </div>
                 
                 {/* Visual Decorator */}
                 <div className="hidden lg:flex w-full h-48 rounded-[2.5rem] relative overflow-hidden glass-card ambient-glow border-white/50 bg-gradient-to-tr from-surface-variant/40 to-surface-container-lowest/20 flex-col justify-end p-6">
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary-container/20 rounded-full blur-2xl"></div>
                    <span className="material-symbols-outlined text-outline-variant mb-2 bg-white/40 backdrop-blur w-10 h-10 flex items-center justify-center rounded-full">loyalty</span>
                    <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1">Elite Status</p>
                    <p className="text-sm font-medium text-on-surface-variant leading-tight">Your architectural taste is in the top 5% of digital residents.</p>
                 </div>

              </div>
           </aside>

        </div>
      </div>
    </div>
  );
}
