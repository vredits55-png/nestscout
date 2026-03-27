"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { signOut } from "@/actions/auth";
import {
  Search,
  Heart,
  LogIn,
  LogOut,
  LayoutDashboard,
  Menu,
  X,
  UserPlus,
  MessageCircle,
  User,
} from "lucide-react";
import type { Profile } from "@/lib/types";

export default function Navbar() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    
    async function fetchProfile(userId: string) {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      if (data) setProfile(data);
    }

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) fetchProfile(user.id);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white/90 backdrop-blur-md border-b border-[#E2E8F0] shadow-sm py-3" : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between">
          
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center bg-white shadow-sm ring-1 ring-black/5">
              <img src="/logo.png" alt="NestScout Logo" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            </div>
            <span
              className="text-2xl font-bold tracking-tight text-[#0F172A]"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              NestScout
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/search" className="text-sm font-medium text-[#475569] hover:text-[#0F172A] flex items-center gap-1.5 transition-colors">
              <Search className="w-4 h-4" />
              Search
            </Link>

            {profile ? (
              <div className="flex items-center gap-4 border-l border-[#E2E8F0] pl-6">
                {profile.role === "provider" ? (
                  <Link
                    href="/provider/dashboard"
                    className="text-sm font-medium text-[#475569] hover:text-[#0F172A] flex items-center gap-1.5 transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>
                ) : (
                  <Link
                    href="/favorites"
                    className="text-sm font-medium text-[#475569] hover:text-[#0F172A] flex items-center gap-1.5 transition-colors"
                  >
                    <Heart className="w-4 h-4" />
                    Favorites
                  </Link>
                )}

                <Link
                  href="/conversations"
                  className="text-sm font-medium text-[#475569] hover:text-[#0F172A] flex items-center gap-1.5 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  Messages
                </Link>

                <Link
                  href="/profile"
                  className="text-sm font-medium text-[#475569] hover:text-[#0F172A] flex items-center gap-1.5 transition-colors"
                >
                  <User className="w-4 h-4" />
                  My Profile
                </Link>

                <form action={signOut}>
                  <button type="submit" className="text-sm font-medium text-[#475569] hover:text-[#0F172A] flex items-center gap-1.5 transition-colors cursor-pointer">
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </form>
              </div>
            ) : (
              <div className="flex items-center gap-3 border-l border-[#E2E8F0] pl-6">
                <Link href="/login" className="btn btn-ghost btn-sm">
                  <LogIn className="w-4 h-4" />
                  Sign In
                </Link>
                <Link href="/register" className="btn btn-primary btn-sm">
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            className="md:hidden text-[#0F172A] p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-[#E2E8F0] shadow-lg animate-fade-in px-4 py-4 flex flex-col gap-4">
          <Link
            href="/search"
            className="flex items-center gap-2 text-[#475569] hover:text-[#0F172A] font-medium"
            onClick={() => setMobileOpen(false)}
          >
            <Search className="w-5 h-5" />
            Search Rentals
          </Link>

          {profile ? (
            <>
              {profile.role === "provider" ? (
                <Link
                  href="/provider/dashboard"
                  className="flex items-center gap-2 text-[#475569] hover:text-[#0F172A] font-medium"
                  onClick={() => setMobileOpen(false)}
                >
                  <LayoutDashboard className="w-5 h-5" />
                  Dashboard
                </Link>
              ) : (
                <Link
                  href="/favorites"
                  className="flex items-center gap-2 text-[#475569] hover:text-[#0F172A] font-medium"
                  onClick={() => setMobileOpen(false)}
                >
                  <Heart className="w-5 h-5" />
                  Favorites
                </Link>
              )}

              <Link
                href="/conversations"
                className="flex items-center gap-2 text-[#475569] hover:text-[#0F172A] font-medium"
                onClick={() => setMobileOpen(false)}
              >
                <MessageCircle className="w-5 h-5" />
                Messages
              </Link>

              <Link
                href="/profile"
                className="flex items-center gap-2 text-[#475569] hover:text-[#0F172A] font-medium"
                onClick={() => setMobileOpen(false)}
              >
                <User className="w-5 h-5" />
                My Profile
              </Link>

              <form action={signOut}>
                <button
                  type="submit"
                  className="flex items-center gap-2 text-[#475569] hover:text-[#0F172A] font-medium w-full text-left"
                >
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </button>
              </form>
            </>
          ) : (
            <div className="flex flex-col gap-2 pt-2 border-t border-[#E2E8F0]">
              <Link
                href="/login"
                className="btn btn-outline justify-center w-full"
                onClick={() => setMobileOpen(false)}
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </Link>
              <Link
                href="/register"
                className="btn btn-primary justify-center w-full"
                onClick={() => setMobileOpen(false)}
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
