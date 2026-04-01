"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Send, CheckCircle, MessageCircle } from "lucide-react";
import { getOrCreateConversation, sendMessage } from "@/actions/conversations";

interface InquiryFormProps {
  propertyId: string;
  receiverId: string;
  propertyTitle: string;
}

export default function InquiryForm({
  propertyId,
  receiverId,
  propertyTitle,
}: InquiryFormProps) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;

    startTransition(async () => {
      // Create or get existing conversation
      const result = await getOrCreateConversation(propertyId, receiverId);
      if (result?.error) {
        setError(result.error);
        return;
      }

      // Send the message in the conversation thread
      const msgResult = await sendMessage(result.conversation!.id, message);
      if (msgResult?.error) {
        setError(msgResult.error);
        return;
      }

      setSent(true);
      setMessage("");

      // Redirect to conversation after a brief moment
      setTimeout(() => {
        router.push(`/conversations/${result.conversation!.id}`);
      }, 1500);
    });
  }

  if (sent) {
    return (
      <div className="text-center animate-scale-in py-8">
        <div className="w-16 h-16 rounded-full bg-surface-container-low border-2 border-primary/20 flex flex-col items-center justify-center mx-auto mb-4 animate-breathe text-primary">
          <CheckCircle className="w-8 h-8" />
        </div>
        <h4 className="text-2xl font-black font-headline text-on-surface mb-2 tracking-tight">
          Inquiry Pending
        </h4>
        <p className="text-outline italic font-body mb-6 text-lg max-w-sm mx-auto">
          We are currently directing you to the conversation room for &ldquo;{propertyTitle}&rdquo;...
        </p>
        <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full">
      {error && (
        <div className="p-4 rounded-xl bg-error/20 text-error-container font-bold text-sm animate-fade-in-up border border-error/50">
          {error}
        </div>
      )}

      <div>
        <label className="input-label text-white/50 uppercase tracking-widest text-xs mb-3 block font-bold">
          Enquire To Lease
        </label>
        <div className="relative group">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={`I am interested in "${propertyTitle}". Let's arrange a viewing...`}
            rows={5}
            className="w-full bg-white/5 border border-white/10 text-white placeholder:text-white/30 p-5 rounded-2xl resize-none transition-all duration-300 focus:bg-white/10 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none font-body shadow-inner scrollbar-thin overflow-y-auto"
            required
          />
          {/* Subtle glow effect on focus within group */}
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-tertiary/20 rounded-3xl blur opacity-0 group-focus-within:opacity-100 transition duration-500 pointer-events-none -z-10"></div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending || !message.trim()}
        className="w-full flex justify-center items-center gap-2 px-6 py-4 bg-primary text-on-primary rounded-2xl font-headline font-black text-lg transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100 shadow-[0_0_20px_rgba(0,110,26,0.3)] hover:shadow-[0_0_30px_rgba(0,110,26,0.5)] cursor-pointer"
      >
        {isPending ? (
          <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            <MessageCircle className="w-5 h-5 flex-shrink-0" />
            <span>Send Inquiry</span>
          </>
        )}
      </button>
    </form>
  );
}
