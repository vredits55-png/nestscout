import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .single();
        
        const redirectUrl = profile?.role === "provider" ? "/provider/dashboard" : next;
        return NextResponse.redirect(`${origin}${redirectUrl}`);
      } catch {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  return NextResponse.redirect(`${origin}/login?error=Could not exchange authorization code`);
}
