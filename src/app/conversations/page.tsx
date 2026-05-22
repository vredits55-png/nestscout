import { redirect } from "next/navigation";
import { getConversations } from "@/actions/conversations";
import { createClient } from "@/lib/supabase/server";
import ConversationsList from "@/components/ConversationsList";

export default async function ConversationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect("/login");
  }

  const conversations = await getConversations();

  return (
    <div className="min-h-screen">
      <div className="hero-gradient pt-28 pb-10 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-text mb-2 animate-fade-in-up">Messages</h1>
          <p className="text-text-muted animate-fade-in-up delay-75">Your conversations with property owners and renters.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <ConversationsList initialConversations={conversations} currentUserId={user.id} />
      </div>
    </div>
  );
}
