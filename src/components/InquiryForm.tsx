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
      <div className="glass rounded-2xl p-6 text-center animate-scale-in">
        <div className="w-14 h-14 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-3">
          <CheckCircle className="w-7 h-7 text-success" />
        </div>
        <h4
          className="text-lg font-semibold text-text mb-1"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Message Sent!
        </h4>
        <p className="text-sm text-text-muted mb-3">
          Opening your conversation about &ldquo;{propertyTitle}&rdquo;...
        </p>
        <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="glass rounded-2xl p-5">
      <h4
        className="text-lg font-semibold text-text mb-3"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        Contact Property Owner
      </h4>

      {error && (
        <div className="mb-3 p-3 rounded-xl bg-danger/10 text-danger text-sm animate-fade-in-up">
          {error}
        </div>
      )}

      <div className="mb-3">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={`Hi, I'm interested in "${propertyTitle}". I'd love to learn more about...`}
          rows={4}
          className="input-field resize-none"
          required
        />
      </div>

      <button
        type="submit"
        disabled={isPending || !message.trim()}
        className="btn btn-cta w-full cursor-pointer"
      >
        {isPending ? (
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            <MessageCircle className="w-4 h-4" />
            Start Conversation
          </>
        )}
      </button>
    </form>
  );
}
