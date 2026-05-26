"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getOrCreateConversation(propertyId: string, landlordId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  if (user.id === landlordId) {
    return { error: "You cannot inquire about or rent your own property." };
  }

  // Check if conversation exists using maybeSingle to avoid query errors
  const { data: existing, error: selectError } = await supabase
    .from("conversations")
    .select("*")
    .eq("property_id", propertyId)
    .eq("tenant_id", user.id)
    .maybeSingle();

  if (selectError) return { error: selectError.message };

  if (existing) {
    // If the conversation was mutually deleted, reset messages and booking requests to start fresh
    if (existing.deletion_status === "deleted") {
      const { error: deleteMessagesError } = await supabase
        .from("messages")
        .delete()
        .eq("conversation_id", existing.id);

      if (deleteMessagesError) return { error: deleteMessagesError.message };

      const { error: deleteBookingsError } = await supabase
        .from("booking_requests")
        .delete()
        .eq("conversation_id", existing.id);

      if (deleteBookingsError) return { error: deleteBookingsError.message };

      const { data: restored, error: updateError } = await supabase
        .from("conversations")
        .update({
          deletion_status: "none",
          deletion_requested_by: null,
          status: "active",
          updated_at: new Date().toISOString()
        })
        .eq("id", existing.id)
        .select()
        .single();

      if (updateError) return { error: updateError.message };
      revalidatePath(`/conversations/${existing.id}`);
      return { conversation: restored };
    }

    // If it was just requested deletion (one-sided) but not finalized, restore without clearing history
    if (existing.deletion_status === "requested" || existing.deletion_requested_by !== null) {
      const { data: restored, error: updateError } = await supabase
        .from("conversations")
        .update({
          deletion_status: "none",
          deletion_requested_by: null,
          updated_at: new Date().toISOString()
        })
        .eq("id", existing.id)
        .select()
        .single();

      if (updateError) return { error: updateError.message };
      revalidatePath(`/conversations/${existing.id}`);
      return { conversation: restored };
    }

    return { conversation: existing };
  }

  // Create new conversation
  const { data, error } = await supabase
    .from("conversations")
    .insert({
      property_id: propertyId,
      tenant_id: user.id,
      landlord_id: landlordId,
      deletion_status: "none",
      deletion_requested_by: null
    })
    .select()
    .single();

  if (error) return { error: error.message };
  
  revalidatePath("/conversations");
  return { conversation: data };
}

export async function sendMessage(conversationId: string, content: string, messageType: string = "text") {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase.from("messages").insert({
    conversation_id: conversationId,
    sender_id: user.id,
    content,
    message_type: messageType,
  });

  if (error) return { error: error.message };

  await supabase
    .from("conversations")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", conversationId);

  revalidatePath(`/conversations/${conversationId}`);
  return { success: true };
}

export async function getConversations() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("conversations")
    .select("*, property:properties(id, title, images, city, price_per_month), tenant:profiles!tenant_id(*), landlord:profiles!landlord_id(*)")
    .or(`tenant_id.eq.${user.id},landlord_id.eq.${user.id}`)
    .neq('deletion_status', 'deleted')
    .order("updated_at", { ascending: false });

  // Fetch the latest message for each conversation
  if (data) {
    for (const conv of data) {
      const { data: msgs } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conv.id)
        .order("created_at", { ascending: false })
        .limit(1);
      conv.latest_message = msgs?.[0] || null;
    }
  }

  return data ?? [];
}

export async function getConversation(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("conversations")
    .select("*, property:properties(id, title, images, city, price_per_month, provider_id), tenant:profiles!tenant_id(*), landlord:profiles!landlord_id(*)")
    .eq("id", id)
    .single();

  return data;
}

export async function getMessages(conversationId: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from("messages")
    .select("*, sender:profiles!sender_id(*)")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  return data ?? [];
}

export async function createBookingRequest(
  conversationId: string,
  propertyId: string,
  checkIn: string,
  checkOut: string,
  totalNights: number,
  proposedPrice: number,
  note: string
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data, error } = await supabase
    .from("booking_requests")
    .insert({
      conversation_id: conversationId,
      property_id: propertyId,
      tenant_id: user.id,
      check_in: checkIn,
      check_out: checkOut,
      total_nights: totalNights,
      proposed_price: proposedPrice,
      note,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  // Update conversation status
  await supabase
    .from("conversations")
    .update({ status: "booking_requested", updated_at: new Date().toISOString() })
    .eq("id", conversationId);

  // Send system message
  await sendMessage(
    conversationId,
    `📋 Booking Request: ${checkIn} → ${checkOut} (${totalNights} nights) — ₹${proposedPrice}${note ? `\nNote: ${note}` : ""}`,
    "booking_request"
  );

  revalidatePath(`/conversations/${conversationId}`);
  return { booking: data };
}

export async function respondToBooking(bookingId: string, conversationId: string, accept: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const newStatus = accept ? "accepted" : "rejected";

  const { error } = await supabase
    .from("booking_requests")
    .update({ status: newStatus })
    .eq("id", bookingId);

  if (error) return { error: error.message };

  await supabase
    .from("conversations")
    .update({
      status: accept ? "confirmed" : "active",
      updated_at: new Date().toISOString(),
    })
    .eq("id", conversationId);

  await sendMessage(
    conversationId,
    accept ? "✅ Booking request has been ACCEPTED! The room is confirmed." : "❌ Booking request has been REJECTED.",
    accept ? "booking_confirmed" : "booking_rejected"
  );

  revalidatePath(`/conversations/${conversationId}`);
  return { success: true };
}

export async function getBookingRequests(conversationId: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from("booking_requests")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: false });

  return data ?? [];
}

export async function getUnreadConversationCount() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;

  // Count unread messages where someone ELSE sent the message to me
  const { count } = await supabase
    .from("messages")
    .select("*", { count: "exact", head: true })
    .neq("sender_id", user.id)
    .eq("is_read", false)
    .in(
      "conversation_id",
      // subquery: conversations I'm part of
      (await supabase
        .from("conversations")
        .select("id")
        .or(`tenant_id.eq.${user.id},landlord_id.eq.${user.id}`)
        .neq("deletion_status", "deleted")
      ).data?.map((c: { id: string }) => c.id) || []
    );

  return count ?? 0;
}

export async function requestConversationDeletion(conversationId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("conversations")
    .update({ 
      deletion_requested_by: user.id,
      deletion_status: 'requested',
      updated_at: new Date().toISOString()
    })
    .eq("id", conversationId)
    .or(`tenant_id.eq.${user.id},landlord_id.eq.${user.id}`);

  if (error) return { error: error.message };

  // Send a system message to notify the other party
  await sendMessage(
    conversationId,
    "🗑️ The other party has requested to delete this conversation. Do you agree?",
    "system"
  );

  revalidatePath(`/conversations/${conversationId}`);
  revalidatePath('/conversations');
  return { success: true };
}

export async function confirmConversationDeletion(conversationId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("conversations")
    .update({ 
      deletion_status: 'deleted',
      updated_at: new Date().toISOString()
    })
    .eq("id", conversationId)
    .or(`tenant_id.eq.${user.id},landlord_id.eq.${user.id}`);

  if (error) return { error: error.message };

  revalidatePath('/conversations');
  return { success: true, redirect: true };
}

export async function markMessagesAsRead(conversationId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // Mark all messages in this conversation that were NOT sent by me as read
  const { error } = await supabase
    .from("messages")
    .update({ is_read: true })
    .eq("conversation_id", conversationId)
    .neq("sender_id", user.id)
    .eq("is_read", false);

  if (error) return { error: error.message };

  revalidatePath(`/conversations/${conversationId}`);
  revalidatePath('/conversations');
  return { success: true };
}

export async function cancelBookingRequest(bookingId: string, conversationId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: booking, error: fetchError } = await supabase
    .from("booking_requests")
    .select("*")
    .eq("id", bookingId)
    .single();

  if (fetchError || !booking) {
    return { error: "Booking request not found." };
  }

  if (booking.tenant_id !== user.id) {
    return { error: "You are not authorized to cancel this booking." };
  }

  // Booking check-in date rules: today < check-in day
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const checkInDate = new Date(booking.check_in);
  checkInDate.setHours(0, 0, 0, 0);

  if (today >= checkInDate) {
    return { error: "You can only cancel a booking before the check-in day." };
  }

  const { error: updateError } = await supabase
    .from("booking_requests")
    .update({ status: "cancelled" })
    .eq("id", bookingId);

  if (updateError) return { error: updateError.message };

  await supabase
    .from("conversations")
    .update({
      status: "active",
      updated_at: new Date().toISOString(),
    })
    .eq("id", conversationId);

  await sendMessage(
    conversationId,
    `🚫 Booking request has been CANCELLED by the Renter.`,
    "system"
  );

  revalidatePath(`/conversations/${conversationId}`);
  revalidatePath('/conversations');
  return { success: true };
}

