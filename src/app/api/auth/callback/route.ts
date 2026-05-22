import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSessionProvider } from "@/lib/auth-helpers";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

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
            .select("role, provider")
            .eq("id", user.id)
            .single();
          
          const profileProvider = profile?.provider;
          const sessionProvider = getSessionProvider(session);

          if (profileProvider && sessionProvider && profileProvider !== sessionProvider) {
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
