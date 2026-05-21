import Link from "next/link";
import { MessageCircle, ArrowRight, Clock, CheckCircle, XCircle, Home } from "lucide-react";
import { getConversations } from "@/actions/conversations";
import { createClient } from "@/lib/supabase/server";
import { formatDistanceToNow } from "date-fns";
import type { Conversation } from "@/lib/types";

export default async function ConversationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const conversations = await getConversations();

  const statusConfig: Record<string, { icon: React.ElementType; label: string; color: string }> = {
    active: { icon: MessageCircle, label: "Active", color: "text-primary" },
    booking_requested: { icon: Clock, label: "Booking Pending", color: "text-cta" },
    confirmed: { icon: CheckCircle, label: "Confirmed", color: "text-success" },
    cancelled: { icon: XCircle, label: "Cancelled", color: "text-danger" },
  };

  return (
    <div className="min-h-screen">
      <div className="hero-gradient pt-28 pb-10 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-text mb-2 animate-fade-in-up">Messages</h1>
          <p className="text-text-muted animate-fade-in-up delay-75">Your conversations with landlords and tenants.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {conversations.length === 0 ? (
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
        ) : (
          <div className="space-y-3 stagger-children">
            {conversations.map((conv: Conversation) => {
              const otherUser = user?.id === conv.tenant_id ? conv.landlord : conv.tenant;
              const config = statusConfig[conv.status] || statusConfig.active;
              const StatusIcon = config.icon;

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
                        <h3 className="font-bold text-text truncate group-hover:text-primary transition-colors">
                          {conv.property?.title || "Property"}
                        </h3>
                        <span className="text-xs text-text-light shrink-0">
                          {conv.updated_at && formatDistanceToNow(new Date(conv.updated_at), { addSuffix: true })}
                        </span>
                      </div>

                      <p className="text-sm text-text-muted mb-2">
                        with <span className="font-medium text-text">{otherUser?.full_name || "User"}</span>
                      </p>

                      <div className="flex items-center justify-between">
                        <p className="text-sm text-text-light truncate max-w-[70%]">
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
        )}
      </div>
    </div>
  );
}
