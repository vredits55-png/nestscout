"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { Send, Calendar, CheckCircle, XCircle } from "lucide-react";
import { sendMessage } from "@/actions/conversations";
import type { Message } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";

interface ChatThreadProps {
  conversationId: string;
  currentUserId: string;
  initialMessages: Message[];
  isLandlord: boolean;
}

export default function ChatThread({ conversationId, currentUserId, initialMessages, isLandlord }: ChatThreadProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const msg = newMessage.trim();
    setNewMessage("");

    // Optimistic update
    const optimistic: Message = {
      id: `temp-${Date.now()}`,
      conversation_id: conversationId,
      sender_id: currentUserId,
      content: msg,
      message_type: "text",
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);

    startTransition(async () => {
      await sendMessage(conversationId, msg);
    });
  }

  function getMessageStyle(msg: Message) {
    const isOwn = msg.sender_id === currentUserId;
    const isSystem = msg.message_type !== "text";

    if (isSystem) {
      return "mx-auto max-w-[80%] text-center";
    }
    return isOwn ? "ml-auto" : "mr-auto";
  }

  function getMessageBubbleStyle(msg: Message) {
    const isOwn = msg.sender_id === currentUserId;

    switch (msg.message_type) {
      case "booking_request":
        return "bg-cta/10 border border-cta/30 text-text";
      case "booking_confirmed":
        return "bg-success/10 border border-success/30 text-success";
      case "booking_rejected":
        return "bg-danger/10 border border-danger/30 text-danger";
      case "system":
        return "bg-primary/5 border border-primary/10 text-text-muted italic";
      default:
        return isOwn
          ? "bg-primary text-white"
          : "glass text-text";
    }
  }

  function getIcon(type: string) {
    switch (type) {
      case "booking_request": return <Calendar className="w-4 h-4 text-cta inline mr-1" />;
      case "booking_confirmed": return <CheckCircle className="w-4 h-4 text-success inline mr-1" />;
      case "booking_rejected": return <XCircle className="w-4 h-4 text-danger inline mr-1" />;
      default: return null;
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col group ${getMessageStyle(msg)}`} style={{ maxWidth: msg.message_type !== "text" ? "80%" : "70%" }}>
            <div className="flex items-center gap-2">
              <div className={`rounded-2xl px-4 py-3 text-sm flex-1 ${getMessageBubbleStyle(msg)}`}>
                {getIcon(msg.message_type)}
                <span className="whitespace-pre-wrap">{msg.content}</span>
              </div>
            </div>
            
            <span className={`text-[10px] text-text-light mt-1 px-2 ${msg.sender_id === currentUserId ? 'text-right' : ''}`}>
              {msg.sender?.full_name && <span className="font-medium">{msg.sender.full_name} · </span>}
              {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
            </span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="border-t border-border p-4 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 input-field !py-3"
            autoFocus
          />
          <button
            type="submit"
            disabled={isPending || !newMessage.trim()}
            className="btn btn-primary p-3 cursor-pointer shrink-0"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}
