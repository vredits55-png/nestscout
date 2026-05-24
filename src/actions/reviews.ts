"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createReview({
  propertyId,
  rating,
  comment,
}: {
  propertyId: string;
  rating: number;
  comment: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "You must be signed in to submit a review." };

  // Check the property to verify provider_id
  const { data: property, error: propError } = await supabase
    .from("properties")
    .select("provider_id")
    .eq("id", propertyId)
    .single();

  if (propError || !property) {
    return { error: "Property not found." };
  }

  if (property.provider_id === user.id) {
    return { error: "You cannot write a review for your own property." };
  }

  // Insert the review
  const { error } = await supabase.from("reviews").insert({
    property_id: propertyId,
    user_id: user.id,
    rating,
    comment: comment.trim(),
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "You have already reviewed this property." };
    }
    return { error: error.message };
  }

  revalidatePath(`/properties/${propertyId}`);
  return { success: true };
}

export async function getReviewsForProperty(propertyId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("*, author:profiles(*)")
    .eq("property_id", propertyId)
    .order("created_at", { ascending: false });

  if (error) return [];
  return data ?? [];
}
