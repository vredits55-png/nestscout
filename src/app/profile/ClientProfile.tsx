"use client";

import { useState, useTransition } from "react";
import { User, Mail, Phone, Shield, CheckCircle } from "lucide-react";
import { updateProfile } from "@/actions/profile";
import type { Profile } from "@/lib/types";

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
    <div className="min-h-screen">
      <div className="hero-gradient pt-28 pb-10 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-text mb-2 animate-fade-in-up flex items-center gap-3">
            <User className="w-8 h-8 text-primary" />
            My Profile
          </h1>
          <p className="text-text-muted animate-fade-in-up delay-75">
            Manage your personal information and account settings.
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <div className="glass rounded-2xl p-6 sm:p-8 animate-fade-in-up">
          
          <div className="flex items-center gap-3 mb-8 p-4 rounded-xl bg-white/40 border border-white/60">
            <div className={`p-2 rounded-lg ${isProvider ? "bg-primary/10 text-primary" : "bg-cta/10 text-cta"}`}>
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-text-muted">Account Type</p>
              <p className="font-bold text-text capitalize">{initialProfile.role}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="input-label flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" />
                Email Address
              </label>
              <input
                type="email"
                value={userEmail}
                disabled
                className="input-field opacity-60 bg-white/30 cursor-not-allowed"
              />
              <p className="text-xs text-text-light mt-1 ml-1">Email cannot be changed.</p>
            </div>

            <div>
              <label className="input-label flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="input-label flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary" />
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="input-field"
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-danger/10 text-danger text-sm border border-danger/20">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 rounded-xl bg-success/10 text-success text-sm border border-success/20 flex items-center gap-2 animate-scale-in">
                <CheckCircle className="w-4 h-4" />
                Profile updated successfully!
              </div>
            )}

            <div className="pt-4">
              <button
                type="submit"
                disabled={isPending}
                className="btn btn-primary w-full cursor-pointer"
              >
                {isPending ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
