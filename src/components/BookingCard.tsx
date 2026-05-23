"use client";

import { useTransition } from "react";
import { CheckCircle, XCircle, Calendar, IndianRupee, Moon, Clock } from "lucide-react";
import { respondToBooking, cancelBookingRequest } from "@/actions/conversations";
import type { BookingRequest } from "@/lib/types";

interface BookingCardProps {
  booking: BookingRequest;
  conversationId: string;
  isLandlord: boolean;
  onResponded?: () => void;
}

export default function BookingCard({ booking, conversationId, isLandlord, onResponded }: BookingCardProps) {
  const [isPending, startTransition] = useTransition();

  async function handleRespond(accept: boolean) {
    startTransition(async () => {
      await respondToBooking(booking.id, conversationId, accept);
      onResponded?.();
    });
  }

  function handleCancel() {
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    startTransition(async () => {
      await cancelBookingRequest(booking.id, conversationId);
      onResponded?.();
    });
  }

  // Can cancel if today is strictly before the check-in day
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const checkInDate = new Date(booking.check_in);
  checkInDate.setHours(0, 0, 0, 0);

  const canCancel = today < checkInDate && (booking.status === "accepted" || booking.status === "pending");

  const statusColors: Record<string, string> = {
    pending: "border-primary/20 bg-primary/5",
    accepted: "border-primary-container bg-primary-container/10",
    rejected: "border-error/20 bg-error/5",
    cancelled: "border-outline-variant/30 bg-surface-container-low",
  };

  const statusLabels: Record<string, { icon: React.ElementType; text: string; color: string }> = {
    pending: { icon: Clock, text: "Awaiting Review", color: "text-primary" },
    accepted: { icon: CheckCircle, text: "Confirmed", color: "text-primary-container" },
    rejected: { icon: XCircle, text: "Declined", color: "text-error" },
    cancelled: { icon: XCircle, text: "Withdrawn", color: "text-outline" },
  };

  const status = statusLabels[booking.status] || statusLabels.pending;
  const StatusIcon = status.icon;

  return (
    <div className={`rounded-3xl p-6 shadow-ambient border transition-all ${statusColors[booking.status] || ""}`}>
      
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-outline-variant/20">
        <h4 className="font-black font-headline text-on-surface text-xl">Lease Proposal</h4>
        <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full bg-surface-container-lowest shadow-sm ${status.color}`}>
          <StatusIcon className="w-4 h-4" />
          {status.text}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-sm font-body">
         <div className="bg-surface-container-lowest p-4 rounded-xl shadow-inner border border-outline-variant/10 text-center">
             <Calendar className="w-5 h-5 text-primary mx-auto mb-2" />
             <div className="text-outline text-xs uppercase tracking-widest font-bold mb-1">Check-in</div>
             <div className="text-on-surface-variant font-bold">{new Date(booking.check_in).toLocaleDateString()}</div>
         </div>
         <div className="bg-surface-container-lowest p-4 rounded-xl shadow-inner border border-outline-variant/10 text-center">
             <Calendar className="w-5 h-5 text-primary mx-auto mb-2" />
             <div className="text-outline text-xs uppercase tracking-widest font-bold mb-1">Check-out</div>
             <div className="text-on-surface-variant font-bold">{new Date(booking.check_out).toLocaleDateString()}</div>
         </div>
         <div className="bg-surface-container-lowest p-4 rounded-xl shadow-inner border border-outline-variant/10 text-center">
             <Moon className="w-5 h-5 text-primary mx-auto mb-2" />
             <div className="text-outline text-xs uppercase tracking-widest font-bold mb-1">Duration</div>
             <div className="text-on-surface-variant font-bold">{booking.total_nights} Night{booking.total_nights !== 1 ? "s" : ""}</div>
         </div>
      </div>

      <div className="flex items-center justify-between mb-6 bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/20 shadow-ambient">
         <div className="text-sm font-bold text-outline tracking-widest uppercase">Proposed Rate</div>
         <div className="flex items-center gap-1.5 text-2xl font-black text-primary font-headline">
           <IndianRupee className="w-6 h-6" />
           {booking.proposed_price}
         </div>
      </div>

      {booking.note && (
        <div className="mb-6 p-4 bg-surface-container-lowest rounded-xl italic text-on-surface-variant font-body">
          &ldquo;{booking.note}&rdquo;
        </div>
      )}

      {isLandlord && booking.status === "pending" && (
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <button
            onClick={() => handleRespond(false)}
            disabled={isPending}
            className="flex-1 bg-surface-container-lowest border-2 border-error/50 text-error font-bold rounded-xl py-3 px-6 hover:bg-error/5 focus:ring-4 ring-error/20 active:scale-95 transition-all outline-none cursor-pointer flex justify-center items-center gap-2"
          >
            <XCircle className="w-5 h-5" />
            Decline
          </button>
          <button
            onClick={() => handleRespond(true)}
            disabled={isPending}
            className="flex-1 btn-primary py-3 px-6 rounded-xl text-lg font-black shadow-ambient active:scale-95 transition-all outline-none cursor-pointer flex justify-center items-center gap-2"
          >
            {isPending ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                Confirm
              </>
            )}
          </button>
        </div>
      )}

      {!isLandlord && canCancel && (
        <div className="mt-6 border-t border-outline-variant/10 pt-6">
          <button
            onClick={handleCancel}
            disabled={isPending}
            className="w-full bg-[#EF4444] border-2 border-[#EF4444] text-white hover:bg-[#DC2626] active:scale-95 font-bold rounded-xl py-3.5 px-6 transition-all outline-none cursor-pointer flex justify-center items-center gap-2 shadow-md"
          >
            {isPending ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <XCircle className="w-5 h-5" />
                Cancel Booking
              </>
            )}
          </button>
          <p className="text-xs text-text-muted mt-2 text-center font-medium">
            You can cancel this lease proposal until the check-in day ({new Date(booking.check_in).toLocaleDateString()}).
          </p>
        </div>
      )}
    </div>
  );
}
