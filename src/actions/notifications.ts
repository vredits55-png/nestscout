"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createNotification(
  userId: string,
  senderId: string,
  type: "enquiry" | "booking_request" | "deletion_request",
  title: string,
  message: string,
  link: string
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  if (senderId !== user.id) {
    return { error: "Unauthorized: You cannot forge the sender ID." };
  }

  if (userId === user.id) {
    return { error: "Unauthorized: You cannot send notifications to yourself." };
  }

  const { data, error } = await supabase
    .from("notifications")
    .insert({
      user_id: userId,
      sender_id: senderId,
      type,
      title,
      message,
      link,
      is_read: false,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating notification:", error);
    return { error: error.message };
  }

  return { notification: data };
}

export async function getNotifications() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("notifications")
    .select("*, sender:profiles!sender_id(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }

  return data ?? [];
}

export async function markNotificationAsRead(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

export async function markAllNotificationsAsRead() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

export async function deleteNotification(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("notifications")
    .delete()
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  return { success: true };
}
