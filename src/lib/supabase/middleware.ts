import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSessionProvider } from "@/lib/auth-helpers";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user;

  const pathname = request.nextUrl.pathname;

  // Bypass Next.js static files, images, and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/static") ||
    pathname.includes(".") // e.g., favicon.ico, .png, .jpg
  ) {
    return supabaseResponse;
  }

  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/register");
  const isSelectRolePage = pathname === "/select-role";

  // If NOT logged in and NOT on an auth page, redirect to login
  if (!user && !isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // If LOGGED IN
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, provider, linked_providers")
      .eq("id", user.id)
      .single();

    const role = profile?.role;
    const profileProvider = profile?.provider;
    const linkedProviders = profile?.linked_providers || [];
    const sessionProvider = getSessionProvider(session);

    // Security check: if login method doesn't match registered method, force log out
    if (
      profileProvider &&
      sessionProvider &&
      profileProvider !== sessionProvider &&
      !linkedProviders.includes(sessionProvider)
    ) {
      await supabase.auth.signOut();
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set(
        "error",
        `This email is already registered using ${profileProvider === 'email' ? 'Password' : profileProvider}. Please sign in using that method.`
      );
      return NextResponse.redirect(url);
    }

    // If role is 'undecided', they MUST complete selection
    if (role === "undecided") {
      if (!isSelectRolePage) {
        const url = request.nextUrl.clone();
        url.pathname = "/select-role";
        return NextResponse.redirect(url);
      }
    } else {
      // If role is decided, redirect away from onboarding or auth pages
      if (isSelectRolePage || isAuthPage) {
        const url = request.nextUrl.clone();
        url.pathname = role === "provider" ? "/provider/dashboard" : "/";
        return NextResponse.redirect(url);
      }
    }
  }

  return supabaseResponse;
}
