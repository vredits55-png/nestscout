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
            // Prevent security breach: Check if the linked identity already exists under another user
            const linkedIdentity = user.identities?.find(
              (id) => id.provider === linkingProvider
            );
            if (linkedIdentity) {
              const identityEmail = linkedIdentity.identity_data?.email;
              if (identityEmail) {
                const { data: existingProfile } = await supabase
                  .from("profiles")
                  .select("id")
                  .eq("email", identityEmail)
                  .maybeSingle();

                if (existingProfile && existingProfile.id !== user.id) {
                  // Immediately unlink to prevent session merger / hijack
                  await supabase.auth.unlinkIdentity(linkedIdentity);
                  return NextResponse.redirect(
                    `${origin}/profile?error=Security violation: This ${
                      linkingProvider === "twitter" ? "X (Twitter)" : linkingProvider.charAt(0).toUpperCase() + linkingProvider.slice(1)
                    } account is already registered to another user.`
                  );
                }
              }
            }

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
