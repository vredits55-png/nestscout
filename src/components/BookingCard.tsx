"use client";

import { useTransition } from "react";
import { CheckCircle, XCircle, Calendar, DollarSign, Moon, Clock } from "lucide-react";
import { respondToBooking } from "@/actions/conversations";
import type { BookingRequest } from "@/lib/types";

interface BookingCardProps {
  booking: BookingRequest;
  conversationId: string;
  isLandlord: boolean;
  onResponded?: () => void;
}

export default function BookingCard({ booking, conversationId, isLandlord, onResponded }: BookingCardProps) {
  const [isPending, startTransition] = useTransition();

  function handleRespond(accept: boolean) {
    startTransition(async () => {
      await respondToBooking(booking.id, conversationId, accept);
      onResponded?.();
    });
  }

  const statusColors: Record<string, string> = {
    pending: "border-cta/30 bg-cta/5",
    accepted: "border-success/30 bg-success/5",
    rejected: "border-danger/30 bg-danger/5",
    cancelled: "border-text-light/30 bg-text-light/5",
  };

  const statusLabels: Record<string, { icon: React.ElementType; text: string; color: string }> = {
    pending: { icon: Clock, text: "Pending Review", color: "text-cta" },
    accepted: { icon: CheckCircle, text: "Accepted ✓", color: "text-success" },
    rejected: { icon: XCircle, text: "Rejected", color: "text-danger" },
    cancelled: { icon: XCircle, text: "Cancelled", color: "text-text-light" },
  };

  const status = statusLabels[booking.status] || statusLabels.pending;
  const StatusIcon = status.icon;

  return (
    <div className={`rounded-2xl border-2 p-4 ${statusColors[booking.status] || ""} transition-all`}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-bold text-text text-sm">Booking Request</h4>
        <div className={`flex items-center gap-1 text-xs font-bold ${status.color}`}>
          <StatusIcon className="w-3.5 h-3.5" />
          {status.text}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-3 text-sm">
        <div className="flex items-center gap-1.5 text-text-muted">
          <Calendar className="w-3.5 h-3.5 text-primary" />
          <span>{new Date(booking.check_in).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-1.5 text-text-muted">
          <Calendar className="w-3.5 h-3.5 text-primary" />
          <span>{new Date(booking.check_out).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-1.5 text-text-muted">
          <Moon className="w-3.5 h-3.5 text-primary" />
          <span>{booking.total_nights} night{booking.total_nights !== 1 ? "s" : ""}</span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 mb-3 text-lg font-bold text-primary">
        <DollarSign className="w-5 h-5" />
        {booking.proposed_price}
      </div>

      {booking.note && (
        <p className="text-sm text-text-muted mb-3 italic">"{booking.note}"</p>
      )}

      {isLandlord && booking.status === "pending" && (
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => handleRespond(false)}
            disabled={isPending}
            className="btn btn-ghost btn-sm flex-1 cursor-pointer !text-danger !border-danger/30 hover:!bg-danger/10"
          >
            <XCircle className="w-4 h-4" />
            Reject
          </button>
          <button
            onClick={() => handleRespond(true)}
            disabled={isPending}
            className="btn btn-primary btn-sm flex-1 cursor-pointer"
          >
            {isPending ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Accept
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
