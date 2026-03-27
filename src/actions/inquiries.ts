"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function sendInquiry(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase.from("inquiries").insert({
    property_id: formData.get("property_id"),
    sender_id: user.id,
    receiver_id: formData.get("receiver_id"),
    message: formData.get("message"),
  });

  if (error) return { error: error.message };

  revalidatePath("/provider/inquiries");
  return { success: true };
}

export async function getReceivedInquiries() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data } = await supabase
    .from("inquiries")
    .select("*, sender:profiles!sender_id(*), property:properties(*)")
    .eq("receiver_id", user.id)
    .order("created_at", { ascending: false });

  return data ?? [];
}

export async function markInquiryRead(id: string) {
  const supabase = await createClient();
  await supabase.from("inquiries").update({ is_read: true }).eq("id", id);
  revalidatePath("/provider/inquiries");
}

export async function getUnreadCount() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return 0;

  const { count } = await supabase
    .from("inquiries")
    .select("*", { count: "exact", head: true })
    .eq("receiver_id", user.id)
    .eq("is_read", false);

  return count ?? 0;
}
