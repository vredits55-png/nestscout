"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const fullName = formData.get("fullName") as string;
  const phone = formData.get("phone") as string;

  if (!fullName) {
    return { error: "Full Name is required" };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      phone: phone || null,
    })
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/profile");
  return { success: true };
}

export async function unlinkProvider(provider: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Fetch the profile
  const { data: profile, error: fetchError } = await supabase
    .from("profiles")
    .select("linked_providers")
    .eq("id", user.id)
    .single();

  if (fetchError || !profile) {
    return { error: fetchError?.message || "Profile not found" };
  }

  const currentLinked = profile.linked_providers || [];
  const updatedLinked = currentLinked.filter((p: string) => p !== provider);

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ linked_providers: updatedLinked })
    .eq("id", user.id);

  if (updateError) {
    return { error: updateError.message };
  }

  revalidatePath("/profile");
  return { success: true };
}
