import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Home, MapPin } from "lucide-react";
import { getConversation, getMessages, getBookingRequests } from "@/actions/conversations";
import { createClient } from "@/lib/supabase/server";
import ChatThread from "@/components/ChatThread";
import ConversationSidebar from "@/components/ConversationSidebar";
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

  if (conversation.landlord_id === conversation.tenant_id) {
    redirect("/conversations");
  }

  const messages = await getMessages(id);
  const bookings = await getBookingRequests(id);

  const isLandlord = user.id === conversation.landlord_id;
  const isTenant = user.id === conversation.tenant_id;
  const otherUser = isLandlord ? conversation.tenant : conversation.landlord;

  const sidebarContent = (
    <ConversationSidebar
      conversationId={id}
      propertyId={conversation.property_id}
      pricePerMonth={conversation.property?.price_per_month || 0}
      initialBookings={bookings}
      initialStatus={conversation.status}
      isTenant={isTenant}
      isLandlord={isLandlord}
      currentUserId={user.id}
      initialDeletionStatus={conversation.deletion_status || "none"}
      initialDeletionRequestedBy={conversation.deletion_requested_by || null}
    />
  );

  return (
    <div className="h-[calc(100vh-72px)] flex flex-col bg-background overflow-hidden">
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
      <div className="flex-1 flex max-w-[1440px] mx-auto w-full relative z-10 min-h-0">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col relative min-h-0">
          
          {/* Mobile Interactions Dropdown */}
          <div className="lg:hidden p-4 bg-surface-container-lowest border-b border-outline-variant/20 z-20 shrink-0">
            <details className="group">
              <summary className="font-bold text-primary font-headline uppercase tracking-widest flex justify-between items-center cursor-pointer list-none py-3 px-6 bg-primary/10 hover:bg-primary/20 transition-colors rounded-[1.5rem] shadow-sm border border-primary/20">
                 <span>Manage Lease & Options</span>
                 <span className="transition duration-300 group-open:rotate-180">▼</span>
              </summary>
              <div className="mt-4 p-6 border border-outline-variant/20 rounded-[2rem] bg-surface-container-lowest shadow-ambient max-h-[40vh] overflow-y-auto overscroll-contain">
                 {sidebarContent}
              </div>
            </details>
          </div>

          <div className="flex-1 flex flex-col min-h-0">
            <ChatThread
              conversationId={id}
              currentUserId={user.id}
              initialMessages={messages}
              isLandlord={isLandlord}
              tenant={conversation.tenant}
              landlord={conversation.landlord}
            />
          </div>
        </div>

        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-[400px] border-l border-outline-variant/20 p-8 overflow-y-auto shadow-inner bg-surface-container-lowest h-full no-scrollbar">
           {sidebarContent}
        </div>
      </div>
    </div>
  );
}
