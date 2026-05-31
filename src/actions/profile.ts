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

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
    })
    .eq("id", user.id);

  if (profileError) {
    return { error: profileError.message };
  }

  const { error: privateError } = await supabase
    .from("profiles_private")
    .update({
      phone: phone || null,
    })
    .eq("id", user.id);

  if (privateError) {
    return { error: privateError.message };
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
    .from("profiles_private")
    .select("linked_providers")
    .eq("id", user.id)
    .single();

  if (fetchError || !profile) {
    return { error: fetchError?.message || "Profile not found" };
  }

  const currentLinked = profile.linked_providers || [];
  const updatedLinked = currentLinked.filter((p: string) => p !== provider);

  const { error: updateError } = await supabase
    .rpc("update_linked_providers", {
      user_id: user.id,
      new_providers: updatedLinked,
    });

  if (updateError) {
    return { error: updateError.message };
  }

  revalidatePath("/profile");
  return { success: true };
}
