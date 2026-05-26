"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Notification, Profile } from "@/lib/types";

interface SystemNotificationManagerProps {
  profile: Profile | null;
}

export default function SystemNotificationManager({
  profile,
}: SystemNotificationManagerProps) {
  const router = useRouter();

  useEffect(() => {
    if (!profile) return;

    // 1. Request native notification permissions
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission();
      }
    }

    // 2. Subscribe to real-time notification inserts in the database
    const supabase = createClient();
    const channel = supabase
      .channel(`system-notifications-${profile.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${profile.id}`,
        },
        (payload) => {
          const newNotif = payload.new as Notification;

          // 3. Trigger native OS system notification
          if (
            typeof window !== "undefined" &&
            "Notification" in window &&
            Notification.permission === "granted"
          ) {
            const systemNotif = new Notification(newNotif.title, {
              body: newNotif.message,
              icon: "/logo.png",
              tag: newNotif.id,
            });

            systemNotif.onclick = (e) => {
              e.preventDefault();
              window.focus();
              router.push(newNotif.link);
            };
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile, router]);

  return null; // Invisible component
}
