"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSessionProvider } from "@/lib/auth-helpers";
import { headers } from "next/headers";

export async function signUp(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("full_name") as string;
  const role = formData.get("role") as string;

  const headersList = await headers();
  const host = headersList.get("host") || "localhost:3000";
  const protocol = headersList.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
  const origin = `${protocol}://${host}`;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/api/auth/callback`,
      data: { full_name: fullName, role },
    },
  });

  if (error) {
    return { error: error.message };
  }
  
  if (data.user && data.user.identities?.length === 0) {
    return { error: "An account with this email already exists." };
  }

  if (!data.session) {
    return { success: true, message: "Verification link sent! Please check your email to confirm your account." };
  }

  revalidatePath("/", "layout");
  redirect(role === "provider" ? "/provider/dashboard" : "/");
}

export async function signIn(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  const user = data.user;
  const session = data.session;
  let redirectUrl = "/";

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, provider, linked_providers")
      .eq("id", user.id)
      .single();

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
      return {
        error: `This email is already registered using ${profileProvider === 'email' ? 'Password' : profileProvider}. Please sign in using that method.`,
      };
    }

    if (profile?.role === "provider") {
      redirectUrl = "/provider/dashboard";
    } else if (profile?.role === "undecided") {
      redirectUrl = "/select-role";
    }
  }

  revalidatePath("/", "layout");
  redirect(redirectUrl);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  
  revalidatePath("/", "layout");
  redirect("/login");
}

export async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return profile;
}

export async function selectUserRole(role: "client" | "provider") {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  return { success: true };
}
