import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Home, MapPin } from "lucide-react";
import { getConversation, getMessages, getBookingRequests } from "@/actions/conversations";
import type { BookingRequest } from "@/lib/types";
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

  const sidebarContent = (
    <div className="space-y-6">
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
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-outline uppercase tracking-widest">Booking Requests</h3>
          {bookings.map((booking: BookingRequest) => (
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
        <div className="bg-primary/5 rounded-[2rem] p-6 text-center border border-primary/20 shadow-ambient">
          <div className="text-4xl mb-4">🎉</div>
          <h4 className="font-black font-headline text-primary text-xl">Booking Confirmed!</h4>
          <p className="text-sm font-medium text-on-surface-variant mt-2">This property has been officially booked through the network.</p>
        </div>
      )}

      {/* Deletion Workflow */}
      <hr className="border-outline-variant/30 my-8" />
      <DeleteConversationButton
        conversationId={id}
        _isLandlord={isLandlord}
        currentUserId={user.id}
        deletionStatus={conversation.deletion_status || 'none'}
        deletionRequestedBy={conversation.deletion_requested_by}
      />
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="bg-surface/80 backdrop-blur-md border-b border-outline-variant/20 pt-20 pb-4 px-4 sm:px-8 sticky top-0 z-40">
        <div className="max-w-[1440px] mx-auto">
          <Link
            href="/conversations"
            className="inline-flex items-center gap-2 text-sm text-outline font-bold uppercase tracking-widest hover:text-primary transition-colors cursor-pointer mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Thread
          </Link>

          <div className="flex items-center gap-4">
            {/* Property thumbnail */}
            <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 bg-surface-container shadow-sm border border-outline-variant/20 relative">
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
              <h1 className="font-black font-headline text-on-surface truncate text-xl sm:text-2xl tracking-tight">
                {conversation.property?.title || "Property"}
              </h1>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-sm text-on-surface-variant font-bold mt-1">
                <span className="bg-surface-container-low px-3 py-1 rounded-full text-xs uppercase tracking-widest border border-outline-variant/10 shadow-sm">
                   Protocol with: {otherUser?.full_name || "User"}
                </span>
                {conversation.property?.city && (
                  <span className="flex items-center gap-1.5 opacity-80">
                    <MapPin className="w-4 h-4 text-primary" />
                    {conversation.property.city}
                  </span>
                )}
                {conversation.property?.price_per_month && (
                  <span className="font-black text-primary font-headline text-lg">
                    {formatCurrency(conversation.property.price_per_month)}
                    <span className="text-[10px] font-bold uppercase tracking-widest text-outline ml-1">/ mo</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex max-w-[1440px] mx-auto w-full relative z-10">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col relative h-[calc(100vh-160px)]">
          
          {/* Mobile Interactions Dropdown */}
          <div className="lg:hidden p-4 bg-surface-container-lowest border-b border-outline-variant/20 z-20">
            <details className="group">
              <summary className="font-bold text-primary font-headline uppercase tracking-widest flex justify-between items-center cursor-pointer list-none py-3 px-6 bg-primary/10 hover:bg-primary/20 transition-colors rounded-[1.5rem] shadow-sm border border-primary/20">
                 <span>Manage Lease & Options</span>
                 <span className="transition duration-300 group-open:rotate-180">▼</span>
              </summary>
              <div className="mt-4 p-6 border border-outline-variant/20 rounded-[2rem] bg-surface-container-lowest shadow-ambient max-h-[50vh] overflow-y-auto overscroll-contain">
                 {sidebarContent}
              </div>
            </details>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar">
            <ChatThread
              conversationId={id}
              currentUserId={user.id}
              initialMessages={messages}
              isLandlord={isLandlord}
            />
          </div>
        </div>

        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-[400px] border-l border-outline-variant/20 p-8 overflow-y-auto shadow-inner bg-surface-container-lowest h-[calc(100vh-160px)] no-scrollbar">
           {sidebarContent}
        </div>
      </div>
    </div>
  );
}
