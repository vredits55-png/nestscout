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
  MessageCircle,
  User,
} from "lucide-react";
import type { Profile } from "@/lib/types";
import { usePathname } from "next/navigation";

export default function Navbar({ initialProfile, unreadCount = 0 }: { initialProfile?: Profile | null, unreadCount?: number }) {
  const [profile, setProfile] = useState<Profile | null>(initialProfile || null);
  const [prevInitialProfile, setPrevInitialProfile] = useState<Profile | null | undefined>(initialProfile);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unread, setUnread] = useState(unreadCount);
  const pathname = usePathname();
  const isAuthPage = pathname === "/login" || pathname === "/register";

  if (initialProfile !== prevInitialProfile) {
    setProfile(initialProfile || null);
    setPrevInitialProfile(initialProfile);
  }

  const [prevUnreadCount, setPrevUnreadCount] = useState(unreadCount);
  if (unreadCount !== prevUnreadCount) {
    setPrevUnreadCount(unreadCount);
    setUnread(unreadCount);
  }

  useEffect(() => {
    if (!profile) return;

    const supabase = createClient();

    const fetchUnreadCount = async () => {
      // 1. Get user conversations
      const { data: convs } = await supabase
        .from("conversations")
        .select("id")
        .or(`tenant_id.eq.${profile.id},landlord_id.eq.${profile.id}`);

      if (!convs || convs.length === 0) {
        setUnread(0);
        return;
      }

      const convIds = convs.map((c) => c.id);

      // 2. Count unread messages
      const { count } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .neq("sender_id", profile.id)
        .eq("is_read", false)
        .in("conversation_id", convIds);

      setUnread(count || 0);
    };

    // Run initially
    fetchUnreadCount();

    // Subscribe to messages changes
    const messagesChannel = supabase
      .channel("navbar-messages-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
        },
        () => {
          fetchUnreadCount();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "conversations",
        },
        () => {
          fetchUnreadCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
    };
  }, [profile]);

  useEffect(() => {
    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data: prof } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();
        if (prof) {
          setProfile(prof);
        }
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

  if (pathname === "/select-role") return null;

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? "bg-[#f2fcec]/80 backdrop-blur-xl border-b border-primary/10 shadow-ambient py-3" : "bg-transparent py-5"
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
            {!isAuthPage && (
              <Link href="/search" className="text-sm font-medium text-[#475569] hover:text-[#0F172A] flex items-center gap-1.5 transition-colors">
                <Search className="w-4 h-4" />
                Search
              </Link>
            )}

            {profile ? (
              <div className={`flex items-center gap-4 ${isAuthPage ? "" : "border-l border-[#E2E8F0] pl-6"}`}>
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
                  className="text-sm font-medium text-[#475569] hover:text-[#0F172A] flex items-center gap-1.5 transition-colors relative"
                >
                  <MessageCircle className="w-4 h-4" />
                  Messages
                  {unread > 0 && (
                    <span className="absolute -top-1 -right-2 flex h-2 w-2">
                       <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                       <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                  )}
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
              !isAuthPage && (
                <div className="flex items-center gap-3 border-l border-[#E2E8F0] pl-6">
                  {pathname !== "/login" && (
                    <Link href="/login" className="btn btn-ghost btn-sm">
                      <LogIn className="w-4 h-4" />
                      Sign In
                    </Link>
                  )}
                  {pathname !== "/register" && (
                    <Link href="/register" className="btn btn-primary btn-sm">
                      Get Started
                    </Link>
                  )}
                </div>
              )
            )}
          </div>

          {/* Mobile Toggle */}
          {!isAuthPage && (
            <button
              className="md:hidden text-[#0F172A] p-2"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-[#E2E8F0] shadow-lg animate-fade-in px-4 py-4 flex flex-col gap-4">
          {!isAuthPage && (
            <Link
              href="/search"
              className="flex items-center gap-2 text-[#475569] hover:text-[#0F172A] font-medium"
              onClick={() => setMobileOpen(false)}
            >
              <Search className="w-5 h-5" />
              Search Rentals
            </Link>
          )}

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
                <div className="relative">
                   <MessageCircle className="w-5 h-5" />
                    {unread > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-2 w-2">
                         <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                         <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                      </span>
                    )}
                </div>
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
            !isAuthPage && (
              <div className="flex flex-col gap-2 pt-2 border-t border-[#E2E8F0]">
                {pathname !== "/login" && (
                  <Link
                    href="/login"
                    className="btn btn-outline justify-center w-full"
                    onClick={() => setMobileOpen(false)}
                  >
                    <LogIn className="w-4 h-4" />
                    Sign In
                  </Link>
                )}
                {pathname !== "/register" && (
                  <Link
                    href="/register"
                    className="btn btn-primary justify-center w-full"
                    onClick={() => setMobileOpen(false)}
                  >
                    Get Started
                  </Link>
                )}
              </div>
            )
          )}
        </div>
      )}
    </nav>
  );
}
