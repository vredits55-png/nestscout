"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import BookingRequestForm from "@/components/BookingRequestForm";
import BookingCard from "@/components/BookingCard";
import DeleteConversationButton from "@/components/DeleteConversationButton";
import type { BookingRequest, Conversation } from "@/lib/types";

interface ConversationSidebarProps {
  conversationId: string;
  propertyId: string;
  pricePerMonth: number;
  initialBookings: BookingRequest[];
  initialStatus: string;
  isTenant: boolean;
  isLandlord: boolean;
  currentUserId: string;
  initialDeletionStatus: "none" | "requested";
  initialDeletionRequestedBy: string | null;
}

export default function ConversationSidebar({
  conversationId,
  propertyId,
  pricePerMonth,
  initialBookings,
  initialStatus,
  isTenant,
  isLandlord,
  currentUserId,
  initialDeletionStatus,
  initialDeletionRequestedBy,
}: ConversationSidebarProps) {

  const [bookings, setBookings] = useState<BookingRequest[]>(initialBookings);
  const [conversationStatus, setConversationStatus] = useState<string>(initialStatus);
  const [deletionStatus, setDeletionStatus] = useState<string>(initialDeletionStatus);
  const [deletionRequestedBy, setDeletionRequestedBy] = useState<string | null>(initialDeletionRequestedBy);

  const [prevInitialBookings, setPrevInitialBookings] = useState(initialBookings);
  if (initialBookings !== prevInitialBookings) {
    setPrevInitialBookings(initialBookings);
    setBookings(initialBookings);
  }

  const [prevInitialStatus, setPrevInitialStatus] = useState(initialStatus);
  if (initialStatus !== prevInitialStatus) {
    setPrevInitialStatus(initialStatus);
    setConversationStatus(initialStatus);
  }

  const [prevInitialDeletionStatus, setPrevInitialDeletionStatus] = useState(initialDeletionStatus);
  if (initialDeletionStatus !== prevInitialDeletionStatus) {
    setPrevInitialDeletionStatus(initialDeletionStatus);
    setDeletionStatus(initialDeletionStatus);
  }

  const [prevInitialDeletionRequestedBy, setPrevInitialDeletionRequestedBy] = useState(initialDeletionRequestedBy);
  if (initialDeletionRequestedBy !== prevInitialDeletionRequestedBy) {
    setPrevInitialDeletionRequestedBy(initialDeletionRequestedBy);
    setDeletionRequestedBy(initialDeletionRequestedBy);
  }

  useEffect(() => {
    const supabase = createClient();

    // Channel names must be unique
    const channel = supabase
      .channel(`sidebar-${conversationId}`)
      // 1. Listen to booking_requests UPDATES (as required)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "booking_requests",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const updated = payload.new as BookingRequest;
          setBookings((prev) =>
            prev.map((b) => (b.id === updated.id ? updated : b))
          );

          // Real-time synchronization of conversation status when status changes on the booking
          if (updated.status === "accepted") {
            setConversationStatus("confirmed");
          } else if (updated.status === "rejected" || updated.status === "cancelled") {
            setConversationStatus("active");
          }
        }
      )
      // 2. Listen to booking_requests INSERTS (to support showing new booking requests in real-time)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "booking_requests",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const inserted = payload.new as BookingRequest;
          setBookings((prev) => {
            // Prevent duplicate inserts
            if (prev.some((b) => b.id === inserted.id)) return prev;
            return [inserted, ...prev];
          });
          setConversationStatus("booking_requested");
        }
      )
      // 3. Listen to conversations updates and deletion (for status / deletion_status / physical deletes)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "conversations",
          filter: `id=eq.${conversationId}`,
        },
        (payload) => {
          if (payload.eventType === "DELETE") {
            window.location.href = "/conversations";
            return;
          }
          const updatedConv = payload.new as Conversation;
          setConversationStatus(updatedConv.status);
          setDeletionStatus(updatedConv.deletion_status || "none");
          setDeletionRequestedBy(updatedConv.deletion_requested_by || null);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  return (
    <div className="space-y-6">
      {/* Booking Request Button (Tenant only) */}
      {isTenant && conversationStatus !== "confirmed" && conversationStatus !== "booking_requested" && (
        <BookingRequestForm
          conversationId={conversationId}
          propertyId={propertyId}
          pricePerMonth={pricePerMonth}
        />
      )}

      {/* Booking Cards */}
      {bookings.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-outline uppercase tracking-widest">Booking Requests</h3>
          {bookings.map((booking: BookingRequest) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              conversationId={conversationId}
              isLandlord={isLandlord}
            />
          ))}
        </div>
      )}

      {/* Confirmed Status */}
      {conversationStatus === "confirmed" && (
        <div className="bg-primary/5 rounded-[2rem] p-6 text-center border border-primary/20 shadow-ambient">
          <div className="text-4xl mb-4">🎉</div>
          <h4 className="font-black font-headline text-primary text-xl">Booking Confirmed!</h4>
          <p className="text-sm font-medium text-on-surface-variant mt-2">
            This property has been officially booked through the network.
          </p>
        </div>
      )}

      {/* Deletion Workflow */}
      <hr className="border-outline-variant/30 my-8" />
      <DeleteConversationButton
        conversationId={conversationId}
        currentUserId={currentUserId}
        deletionStatus={deletionStatus}
        deletionRequestedBy={deletionRequestedBy}
      />
    </div>
  );
}
