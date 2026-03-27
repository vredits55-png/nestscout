import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Home, MapPin } from "lucide-react";
import { getConversation, getMessages, getBookingRequests } from "@/actions/conversations";
import { createClient } from "@/lib/supabase/server";
import ChatThread from "@/components/ChatThread";
import BookingRequestForm from "@/components/BookingRequestForm";
import BookingCard from "@/components/BookingCard";
import DeleteConversationButton from "@/components/DeleteConversationButton";
import { formatCurrency } from "@/lib/utils";

interface ConversationPageProps {
  params: Promise<{ id: string }>;
}

export default async function ConversationPage({ params }: ConversationPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const conversation = await getConversation(id);
  if (!conversation) notFound();

  const messages = await getMessages(id);
  const bookings = await getBookingRequests(id);

  const isLandlord = user.id === conversation.landlord_id;
  const isTenant = user.id === conversation.tenant_id;
  const otherUser = isLandlord ? conversation.tenant : conversation.landlord;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-md border-b border-border pt-20 pb-4 px-4 sm:px-6 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/conversations"
            className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-primary transition-colors cursor-pointer mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Messages
          </Link>

          <div className="flex items-center gap-4">
            {/* Property thumbnail */}
            <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-gradient-to-br from-primary/10 to-accent/10">
              {conversation.property?.images?.[0] ? (
                <img
                  src={conversation.property.images[0]}
                  alt={conversation.property.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Home className="w-6 h-6 text-primary/30" />
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h1 className="font-bold text-text truncate text-lg">
                {conversation.property?.title || "Property"}
              </h1>
              <div className="flex items-center gap-2 text-sm text-text-muted">
                <span>with <strong>{otherUser?.full_name || "User"}</strong></span>
                {conversation.property?.city && (
                  <>
                    <span>·</span>
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{conversation.property.city}</span>
                  </>
                )}
                {conversation.property?.price_per_month && (
                  <>
                    <span>·</span>
                    <span className="font-bold text-primary">{formatCurrency(conversation.property.price_per_month)}/mo</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex max-w-4xl mx-auto w-full">
        {/* Chat */}
        <div className="flex-1 flex flex-col" style={{ height: "calc(100vh - 160px)" }}>
          <ChatThread
            conversationId={id}
            currentUserId={user.id}
            initialMessages={messages}
            isLandlord={isLandlord}
          />
        </div>

        {/* Sidebar */}
        <div className="hidden lg:block w-80 border-l border-border p-4 overflow-y-auto" style={{ height: "calc(100vh - 160px)" }}>
          <div className="space-y-4">
            {/* Booking Request Button (Tenant only) */}
            {isTenant && conversation.status !== "confirmed" && (
              <BookingRequestForm
                conversationId={id}
                propertyId={conversation.property_id}
                pricePerMonth={conversation.property?.price_per_month || 0}
              />
            )}

            {/* Booking Cards */}
            {bookings.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-text-muted uppercase tracking-wider">Booking Requests</h3>
                {bookings.map((booking: any) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    conversationId={id}
                    isLandlord={isLandlord}
                  />
                ))}
              </div>
            )}

            {/* Confirmed Status */}
            {conversation.status === "confirmed" && (
              <div className="glass rounded-2xl p-5 text-center border-2 border-success/30 bg-success/5">
                <div className="text-3xl mb-2">🎉</div>
                <h4 className="font-bold text-success">Booking Confirmed!</h4>
                <p className="text-sm text-text-muted mt-1">This property has been booked. Happy moving!</p>
              </div>
            )}

            {/* Deletion Workflow */}
            <hr className="border-border/60 my-6" />
            <DeleteConversationButton
              conversationId={id}
              isLandlord={isLandlord}
              currentUserId={user.id}
              deletionStatus={conversation.deletion_status || 'none'}
              deletionRequestedBy={conversation.deletion_requested_by}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
