"use client";

import { useState, useTransition } from "react";
import { Calendar, IndianRupee, Moon, Send, FileText } from "lucide-react";
import { createBookingRequest } from "@/actions/conversations";

interface BookingRequestFormProps {
  conversationId: string;
  propertyId: string;
  pricePerMonth: number;
  onSent?: () => void;
}

export default function BookingRequestForm({
  conversationId,
  propertyId,
  pricePerMonth,
  onSent,
}: BookingRequestFormProps) {
  const [open, setOpen] = useState(false);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [proposedPrice, setProposedPrice] = useState(String(pricePerMonth));
  const [note, setNote] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const totalNights = checkIn && checkOut
    ? Math.max(1, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!checkIn || !checkOut || !proposedPrice) return;

    startTransition(async () => {
      const result = await createBookingRequest(
        conversationId,
        propertyId,
        checkIn,
        checkOut,
        totalNights,
        Number(proposedPrice),
        note
      );
      if (result?.error) {
        setError(result.error);
      } else {
        setOpen(false);
        setCheckIn("");
        setCheckOut("");
        setNote("");
        onSent?.();
      }
    });
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="btn btn-cta w-full cursor-pointer"
      >
        <Calendar className="w-4 h-4" />
        Request Booking
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="glass rounded-2xl p-5 space-y-4 animate-fade-in-up">
      <h4 className="font-bold text-text flex items-center gap-2">
        <FileText className="w-5 h-5 text-cta" />
        Request a Booking
      </h4>

      {error && (
        <div className="p-3 rounded-xl bg-danger/10 text-danger text-sm">{error}</div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="input-label flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            Check In
          </label>
          <input
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
            className="input-field"
            required
          />
        </div>
        <div>
          <label className="input-label flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            Check Out
          </label>
          <input
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            min={checkIn || new Date().toISOString().split("T")[0]}
            className="input-field"
            required
          />
        </div>
      </div>

      {totalNights > 0 && (
        <div className="flex items-center gap-2 text-sm text-primary font-medium">
          <Moon className="w-4 h-4" />
          {totalNights} night{totalNights !== 1 ? "s" : ""}
        </div>
      )}

      <div>
        <label className="input-label flex items-center gap-1">
          <IndianRupee className="w-3.5 h-3.5" />
          Proposed Total Price
        </label>
        <input
          type="number"
          value={proposedPrice}
          onChange={(e) => setProposedPrice(e.target.value)}
          className="input-field"
          placeholder={String(pricePerMonth)}
          required
        />
      </div>

      <div>
        <label className="input-label">Note (optional)</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="input-field resize-none"
          rows={2}
          placeholder="Any special requirements or questions..."
        />
      </div>

      <div className="flex gap-2">
        <button type="button" onClick={() => setOpen(false)} className="btn btn-ghost flex-1 cursor-pointer">
          Cancel
        </button>
        <button type="submit" disabled={isPending} className="btn btn-cta flex-1 cursor-pointer">
          {isPending ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Send className="w-4 h-4" />
              Send Request
            </>
          )}
        </button>
      </div>
    </form>
  );
}
