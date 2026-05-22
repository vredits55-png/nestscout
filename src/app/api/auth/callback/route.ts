import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSessionProvider } from "@/lib/auth-helpers";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";
  const linking = searchParams.get("linking") === "true";
  const linkingProvider = searchParams.get("provider");

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      try {
        const user = data.user;
        const session = data.session;
        let redirectUrl = next;
        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role, provider, linked_providers")
            .eq("id", user.id)
            .single();

          if (linking && linkingProvider) {
            // Update linked_providers in DB
            const currentLinked = profile?.linked_providers || [];
            if (!currentLinked.includes(linkingProvider)) {
              const updatedLinked = [...currentLinked, linkingProvider];
              await supabase
                .from("profiles")
                .update({ linked_providers: updatedLinked })
                .eq("id", user.id);
            }
            return NextResponse.redirect(`${origin}/profile?linked=success&provider=${linkingProvider}`);
          }
          
          const profileProvider = profile?.provider;
          const linkedProviders = profile?.linked_providers || [];
          const sessionProvider = getSessionProvider(session);

          if (
            profileProvider &&
            sessionProvider &&
            profileProvider !== sessionProvider &&
            !linkedProviders.includes(sessionProvider)
          ) {
            await supabase.auth.signOut();
            return NextResponse.redirect(
              `${origin}/login?error=This email is already registered using ${profileProvider === 'email' ? 'Password' : profileProvider}. Please sign in using that method.`
            );
          }

          if (profile?.role === "undecided") {
            redirectUrl = "/select-role";
          } else if (profile?.role === "provider") {
            redirectUrl = "/provider/dashboard";
          }
        }
        return NextResponse.redirect(`${origin}${redirectUrl}`);
      } catch {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  return NextResponse.redirect(`${origin}/login?error=Could not exchange authorization code`);
}
