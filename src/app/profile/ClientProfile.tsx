"use client";

import { useState, useTransition } from "react";
import { User, Mail, Phone, Shield, CheckCircle, MapPin, Bell, History } from "lucide-react";
import { updateProfile } from "@/actions/profile";
import type { Profile } from "@/lib/types";
import Link from "next/link";

export default function ProfilePage({ initialProfile, userEmail }: { initialProfile: Profile, userEmail: string }) {
  const [fullName, setFullName] = useState(initialProfile.full_name || "");
  const [phone, setPhone] = useState(initialProfile.phone || "");
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

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
    <div className="min-h-screen bg-background relative overflow-x-hidden pb-32">
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
