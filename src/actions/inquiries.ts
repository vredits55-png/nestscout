"use server";

import { createClient } from "@/lib/supabase/server";

export async function getReceivedInquiries(userId?: string) {
  const supabase = await createClient();
  let finalUserId = userId;

  if (!finalUserId) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];
    finalUserId = user.id;
  }

  const { data: convs } = await supabase
    .from("conversations")
    .select("*, property:properties(id, title, images, city, price_per_month), tenant:profiles!tenant_id(id, full_name, role, avatar_url, created_at), landlord:profiles!landlord_id(id, full_name, role, avatar_url, created_at)")
    .eq("landlord_id", finalUserId)
    .order("updated_at", { ascending: false });

  if (!convs || convs.length === 0) return [];

  const promises = convs.map(async (conv) => {
    const [msgsResult, unreadResult] = await Promise.all([
      supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conv.id)
        .order("created_at", { ascending: false })
        .limit(1),
      supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("conversation_id", conv.id)
        .neq("sender_id", finalUserId)
        .eq("is_read", false)
    ]);

    const latestMsg = msgsResult.data?.[0];
    const unreadCount = unreadResult.count ?? 0;

    return {
      id: conv.id,
      property_id: conv.property_id,
      sender_id: conv.tenant_id,
      receiver_id: conv.landlord_id,
      message: latestMsg?.content || "No messages yet",
      is_read: unreadCount === 0,
      created_at: latestMsg?.created_at || conv.updated_at,
      sender: conv.tenant,
      property: conv.property,
    };
  });

  return Promise.all(promises);
}


export async function getUnreadCount() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return 0;

  const { data: convs } = await supabase
    .from("conversations")
    .select("id")
    .eq("landlord_id", user.id);

  if (!convs || convs.length === 0) return 0;

  const convIds = convs.map((c) => c.id);

  const { count } = await supabase
    .from("messages")
    .select("*", { count: "exact", head: true })
    .in("conversation_id", convIds)
    .neq("sender_id", user.id)
    .eq("is_read", false);

  return count ?? 0;
}
