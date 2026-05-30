import type { Session } from "@supabase/supabase-js";

export function parseJwt(token: string) {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    
    // In Edge/Browser/Node environments, atob is globally available
    const rawData = atob(base64);
    const jsonPayload = decodeURIComponent(
      rawData
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function getSessionProvider(session: Session | null) {
  if (!session) return null;
  const user = session.user;
  if (!user) return null;

  // Retrieve authentication method references (AMR)
  const jwtPayload = parseJwt(session.access_token);
  const amr = user?.app_metadata?.amr || jwtPayload?.amr;
  const rawProvider = user?.app_metadata?.provider || jwtPayload?.app_metadata?.provider;

  if (rawProvider === "email") {
    // Check amr to distinguish password vs otp
    if (amr && Array.isArray(amr)) {
      if (amr.includes("otp") || amr.includes("magiclink")) {
        return "otp";
      }
      if (amr.includes("password")) {
        return "email";
      }
    }
  }
  return rawProvider;
}
