"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { selectUserRole } from "@/actions/auth";
import { Key, Building, ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function SelectRolePage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<"client" | "provider" | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!selectedRole) return;
    setLoading(true);
    setError("");

    try {
      const res = await selectUserRole(selectedRole);
      if (res?.error) {
        setError(res.error);
        setLoading(false);
      } else {
        router.push(selectedRole === "provider" ? "/provider/dashboard" : "/");
        router.refresh();
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 hero-gradient relative overflow-hidden py-10">
      {/* Decorative Blur Blobs */}
      <div className="absolute top-1/4 right-10 w-96 h-96 rounded-full bg-primary-light/20 blur-3xl animate-float mix-blend-multiply" />
      <div className="absolute bottom-1/4 left-10 w-80 h-80 rounded-full bg-accent/20 blur-3xl animate-float delay-300 mix-blend-multiply" />

      <div className="w-full max-w-2xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="glass rounded-3xl p-8 md:p-12 shadow-2xl border border-white/20 text-center"
        >
          {/* Header */}
          <div className="mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center mx-auto mb-6 shadow-glow">
              <img src="/logo.png" alt="NestScout" className="w-12 h-12 object-contain" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-text mb-3 tracking-tight">
              Choose Your Role
            </h1>
            <p className="text-text-muted text-sm md:text-base font-medium max-w-md mx-auto">
              Welcome to NestScout! Tell us how you intend to interact with the platform so we can customize your dashboard.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 font-bold text-sm animate-fade-in">
              {error}
            </div>
          )}

          {/* Cards Selection Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Renter Card */}
            <div
              onClick={() => setSelectedRole("client")}
              className={`group relative rounded-2xl p-6 md:p-8 cursor-pointer border-2 transition-all duration-300 text-left flex flex-col justify-between min-h-[220px] ${
                selectedRole === "client"
                  ? "bg-primary/5 border-primary shadow-glow-strong"
                  : "bg-white/40 border-primary/10 hover:bg-white/60 hover:border-primary/30 hover:shadow-md"
              }`}
            >
              <div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110 ${
                  selectedRole === "client" ? "bg-primary text-white" : "bg-primary/10 text-primary"
                }`}>
                  <Key className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-text mb-2">
                  I want to Rent
                </h3>
                <p className="text-text-muted text-sm font-medium leading-relaxed">
                  Discover curated listings, schedule visits, and secure your next home seamlessly.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                <span>Select Renter</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Property Owner Card */}
            <div
              onClick={() => setSelectedRole("provider")}
              className={`group relative rounded-2xl p-6 md:p-8 cursor-pointer border-2 transition-all duration-300 text-left flex flex-col justify-between min-h-[220px] ${
                selectedRole === "provider"
                  ? "bg-primary/5 border-primary shadow-glow-strong"
                  : "bg-white/40 border-primary/10 hover:bg-white/60 hover:border-primary/30 hover:shadow-md"
              }`}
            >
              <div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110 ${
                  selectedRole === "provider" ? "bg-primary text-white" : "bg-primary/10 text-primary"
                }`}>
                  <Building className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-text mb-2">
                  I want to List
                </h3>
                <p className="text-text-muted text-sm font-medium leading-relaxed">
                  Manage inquiries, list properties, track booking schedules, and maximize earnings.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                <span>Select Property Owner</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* Continue Button */}
          <button
            onClick={handleSubmit}
            disabled={!selectedRole || loading}
            className="btn btn-primary w-full max-w-xs py-4 text-base shadow-glow flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mx-auto"
          >
            {loading ? (
              <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Confirm Role
                <Sparkles className="w-5 h-5" />
              </>
            )}
          </button>
        </motion.div>
      </div>
    </div>
  );
}
