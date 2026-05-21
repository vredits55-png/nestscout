"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MessageCircle, ArrowRight, Clock, CheckCircle, XCircle, Home } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { createClient } from "@/lib/supabase/client";
import type { Conversation, Message, BookingRequest } from "@/lib/types";

interface ConversationsListProps {
  initialConversations: Conversation[];
  currentUserId: string;
}

export default function ConversationsList({ initialConversations, currentUserId }: ConversationsListProps) {
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);

  useEffect(() => {
    setConversations(initialConversations);
  }, [initialConversations]);

  useEffect(() => {
    const supabase = createClient();

    // 1. Refresh a specific conversation's latest data if something changes
    const refreshConversation = async (conversationId: string) => {
      const { data: updated } = await supabase
        .from("conversations")
        .select("*, property:properties(id, title, images, city, price_per_month), tenant:profiles!tenant_id(*), landlord:profiles!landlord_id(*)")
        .eq("id", conversationId)
        .single();

      if (!updated) return;

      // Fetch latest message
      const { data: msgs } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: false })
        .limit(1);

      const latestMessage = msgs?.[0] || null;
      const fullConv: Conversation = {
        ...updated,
        latest_message: latestMessage,
      };

      setConversations((prev) => {
        // If deleted, remove it
        if (fullConv.deletion_status === "deleted") {
          return prev.filter((c) => c.id !== conversationId);
        }

        const filtered = prev.filter((c) => c.id !== conversationId);
        // Put updated conversation at the beginning (since it was just updated)
        return [fullConv, ...filtered];
      });
    };

    // 2. Subscribe to conversation updates and inserts
    const channel = supabase
      .channel("conversations-list-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "conversations",
        },
        (payload) => {
          const record = (payload.new || payload.old) as Conversation;
          if (!record || !record.id) return;

          // If deletion_status is deleted, remove it instantly
          if (payload.eventType === "UPDATE" && record.deletion_status === "deleted") {
            setConversations((prev) => prev.filter((c) => c.id !== record.id));
          } else {
            // Otherwise refetch to get joined values (property, tenant, landlord details)
            refreshConversation(record.id);
          }
        }
      )
      // 3. Subscribe to messages changes (inserts and updates to keep snippet and read state in sync)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newMsg = payload.new as Message;
            if (!newMsg || !newMsg.conversation_id) return;

            // Check if we are in this conversation
            setConversations((prev) => {
              const exists = prev.find((c) => c.id === newMsg.conversation_id);
              if (!exists) {
                // If it's a new conversation that is not in state yet, refresh/fetch it
                refreshConversation(newMsg.conversation_id);
                return prev;
              }

              const updated = prev.map((c) => {
                if (c.id === newMsg.conversation_id) {
                  return {
                    ...c,
                    updated_at: newMsg.created_at,
                    latest_message: newMsg,
                  };
                }
                return c;
              });

              // Re-sort by updated_at descending
              return updated.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
            });
          } else if (payload.eventType === "UPDATE") {
            const updatedMsg = payload.new as Message;
            if (!updatedMsg || !updatedMsg.conversation_id) return;

            setConversations((prev) => {
              return prev.map((c) => {
                if (c.id === updatedMsg.conversation_id && c.latest_message?.id === updatedMsg.id) {
                  return {
                    ...c,
                    latest_message: updatedMsg,
                  };
                }
                return c;
              });
            });
          }
        }
      )
      // 4. Subscribe to booking_requests (status updates)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "booking_requests",
        },
        (payload) => {
          const booking = (payload.new || payload.old) as BookingRequest;
          if (booking && booking.conversation_id) {
            refreshConversation(booking.conversation_id);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId]);

  const statusConfig: Record<string, { icon: React.ElementType; label: string; color: string }> = {
    active: { icon: MessageCircle, label: "Active", color: "text-primary" },
    booking_requested: { icon: Clock, label: "Booking Pending", color: "text-cta" },
    confirmed: { icon: CheckCircle, label: "Confirmed", color: "text-success" },
    cancelled: { icon: XCircle, label: "Cancelled", color: "text-danger" },
  };

  if (conversations.length === 0) {
    return (
      <div className="text-center py-20 animate-fade-in-up">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 animate-breathe">
          <MessageCircle className="w-10 h-10 text-primary/40" />
        </div>
        <h3 className="text-xl font-semibold text-text mb-2">No Conversations Yet</h3>
        <p className="text-text-muted mb-4">Start by sending an inquiry on a property you like.</p>
        <Link href="/search" className="btn btn-primary">
          Browse Properties
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3 stagger-children">
      {conversations.map((conv: Conversation) => {
        const otherUser = currentUserId === conv.tenant_id ? conv.landlord : conv.tenant;
        const config = statusConfig[conv.status] || statusConfig.active;
        const StatusIcon = config.icon;

        const isUnread = conv.latest_message && 
                         conv.latest_message.sender_id !== currentUserId && 
                         !conv.latest_message.is_read;

        return (
          <Link
            key={conv.id}
            href={`/conversations/${conv.id}`}
            className="block glass rounded-2xl p-5 hover:shadow-glow transition-all duration-300 group"
          >
            <div className="flex items-start gap-4">
              {/* Property thumbnail */}
              <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-gradient-to-br from-primary/10 to-accent/10">
                {conv.property?.images?.[0] ? (
                  <img
                    src={conv.property.images[0]}
                    alt={conv.property.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Home className="w-6 h-6 text-primary/30" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <h3 className={`font-bold truncate group-hover:text-primary transition-colors ${
                      isUnread ? "text-text font-black" : "text-text"
                    }`}>
                      {conv.property?.title || "Property"}
                    </h3>
                    {isUnread && (
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0 animate-pulse"></span>
                    )}
                  </div>
                  <span className="text-xs text-text-light shrink-0">
                    {conv.updated_at && formatDistanceToNow(new Date(conv.updated_at), { addSuffix: true })}
                  </span>
                </div>

                <p className="text-sm text-text-muted mb-2">
                  with <span className="font-medium text-text">{otherUser?.full_name || "User"}</span>
                </p>

                <div className="flex items-center justify-between">
                  <p className={`text-sm truncate max-w-[70%] ${
                    isUnread ? "font-semibold text-[#0F172A]" : "text-text-light"
                  }`}>
                    {conv.latest_message?.content || "No messages yet"}
                  </p>
                  <div className={`flex items-center gap-1 text-xs font-medium ${config.color}`}>
                    <StatusIcon className="w-3.5 h-3.5" />
                    {config.label}
                  </div>
                </div>
              </div>

              <ArrowRight className="w-5 h-5 text-text-light group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0 mt-5" />
            </div>
          </Link>
        );
      })}
    </div>
  );
}
