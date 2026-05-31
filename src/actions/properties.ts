"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { PropertyFilters } from "@/lib/types";
import { z } from "zod";

const propertySchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100, "Title must be under 100 characters"),
  description: z.string().min(10, "Description must be at least 10 characters").max(2000, "Description must be under 2000 characters"),
  property_type: z.enum(["apartment", "house", "studio", "villa", "condo"]),
  price_per_month: z.number().positive("Price must be greater than zero"),
  bedrooms: z.number().int().nonnegative("Bedrooms count cannot be negative"),
  bathrooms: z.number().int().nonnegative("Bathrooms count cannot be negative"),
  area_sqft: z.number().int().positive("Area must be greater than zero"),
  address: z.string().min(5, "Address must be at least 5 characters").max(200, "Address must be under 200 characters"),
  city: z.string().min(2, "City must be at least 2 characters").max(100, "City must be under 100 characters"),
  state: z.string().min(2, "State must be at least 2 characters").max(100, "State must be under 100 characters"),
  zip_code: z.string().min(2, "ZIP code must be at least 2 characters").max(20, "ZIP code must be under 20 characters"),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  amenities: z.array(z.string().max(50)),
  images: z.array(z.string().url("Invalid image URL")),
  neighborhood_info: z.string().max(1000).optional().nullable(),
});

export async function createProperty(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "provider") {
    return { error: "Unauthorized: Only users with the provider role can create listings." };
  }

  const amenities = formData.getAll("amenities") as string[];
  const images = formData.getAll("image_urls") as string[];

  const parsedData = propertySchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    property_type: formData.get("property_type"),
    price_per_month: Number(formData.get("price_per_month")),
    bedrooms: Number(formData.get("bedrooms")),
    bathrooms: Number(formData.get("bathrooms")),
    area_sqft: Number(formData.get("area_sqft")),
    address: formData.get("address"),
    city: formData.get("city"),
    state: formData.get("state"),
    zip_code: formData.get("zip_code"),
    latitude: Number(formData.get("latitude")),
    longitude: Number(formData.get("longitude")),
    amenities,
    images,
    neighborhood_info: formData.get("neighborhood_info") || null,
  });

  if (!parsedData.success) {
    const errorMsg = parsedData.error.issues.map(e => `${e.path.join(".")}: ${e.message}`).join(", ");
    return { error: `Validation error: ${errorMsg}` };
  }

  const validated = parsedData.data;

  const { error } = await supabase.from("properties").insert({
    provider_id: user.id,
    title: validated.title,
    description: validated.description,
    property_type: validated.property_type,
    price_per_month: validated.price_per_month,
    bedrooms: validated.bedrooms,
    bathrooms: validated.bathrooms,
    area_sqft: validated.area_sqft,
    address: validated.address,
    city: validated.city,
    state: validated.state,
    zip_code: validated.zip_code,
    latitude: validated.latitude,
    longitude: validated.longitude,
    amenities: validated.amenities,
    images: validated.images,
    neighborhood_info: validated.neighborhood_info,
  });

  if (error) return { error: error.message };

  revalidatePath("/provider/dashboard");
  return { success: true };
}

export async function updateProperty(id: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "provider") {
    return { error: "Unauthorized: Only users with the provider role can update listings." };
  }

  const { data: property } = await supabase
    .from("properties")
    .select("provider_id")
    .eq("id", id)
    .single();

  if (!property || property.provider_id !== user.id) {
    return { error: "Unauthorized: You do not own this property." };
  }

  const amenities = formData.getAll("amenities") as string[];
  const images = formData.getAll("image_urls") as string[];

  const parsedData = propertySchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    property_type: formData.get("property_type"),
    price_per_month: Number(formData.get("price_per_month")),
    bedrooms: Number(formData.get("bedrooms")),
    bathrooms: Number(formData.get("bathrooms")),
    area_sqft: Number(formData.get("area_sqft")),
    address: formData.get("address"),
    city: formData.get("city"),
    state: formData.get("state"),
    zip_code: formData.get("zip_code"),
    latitude: Number(formData.get("latitude")),
    longitude: Number(formData.get("longitude")),
    amenities,
    images,
    neighborhood_info: formData.get("neighborhood_info") || null,
  });

  if (!parsedData.success) {
    const errorMsg = parsedData.error.issues.map(e => `${e.path.join(".")}: ${e.message}`).join(", ");
    return { error: `Validation error: ${errorMsg}` };
  }

  const validated = parsedData.data;

  const { error } = await supabase
    .from("properties")
    .update({
      title: validated.title,
      description: validated.description,
      property_type: validated.property_type,
      price_per_month: validated.price_per_month,
      bedrooms: validated.bedrooms,
      bathrooms: validated.bathrooms,
      area_sqft: validated.area_sqft,
      address: validated.address,
      city: validated.city,
      state: validated.state,
      zip_code: validated.zip_code,
      latitude: validated.latitude,
      longitude: validated.longitude,
      amenities: validated.amenities,
      images: validated.images,
      is_available: formData.get("is_available") === "true",
      neighborhood_info: validated.neighborhood_info,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/provider/dashboard");
  return { success: true };
}

export async function deleteProperty(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "provider") {
    return { error: "Unauthorized: Only users with the provider role can delete listings." };
  }

  const { data: property } = await supabase
    .from("properties")
    .select("provider_id")
    .eq("id", id)
    .single();

  if (!property || property.provider_id !== user.id) {
    return { error: "Unauthorized: You do not own this property." };
  }

  const { error } = await supabase.from("properties").delete().eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/provider/dashboard");
  return { success: true };
}

export async function getProviderProperties(userId?: string) {
  const supabase = await createClient();
  let finalUserId = userId;

  if (!finalUserId) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];
    finalUserId = user.id;
  }

  const { data } = await supabase
    .from("properties")
    .select("*")
    .eq("provider_id", finalUserId)
    .order("created_at", { ascending: false });

  return data ?? [];
}

export async function getProperties(filters?: PropertyFilters) {
  const supabase = await createClient();

  let query = supabase
    .from("properties")
    .select("*, provider:profiles(id, full_name, role, avatar_url, created_at)")
    .eq("is_available", true);

  if (filters?.keyword) {
    query = query.or(
      `title.ilike.%${filters.keyword}%,city.ilike.%${filters.keyword}%,address.ilike.%${filters.keyword}%`
    );
  }
  if (filters?.city) {
    query = query.ilike("city", `%${filters.city}%`);
  }
  if (filters?.min_price) {
    query = query.gte("price_per_month", filters.min_price);
  }
  if (filters?.max_price) {
    query = query.lte("price_per_month", filters.max_price);
  }
  if (filters?.bedrooms) {
    query = query.gte("bedrooms", filters.bedrooms);
  }
  if (filters?.property_type) {
    query = query.eq("property_type", filters.property_type);
  }
  if (filters?.amenities?.length) {
    query = query.contains("amenities", filters.amenities);
  }
  if (filters?.bounds) {
    query = query
      .gte("latitude", filters.bounds.south)
      .lte("latitude", filters.bounds.north)
      .gte("longitude", filters.bounds.west)
      .lte("longitude", filters.bounds.east);
  }

  // Sorting
  if (filters?.sort_by === "price_asc") {
    query = query.order("price_per_month", { ascending: true });
  } else if (filters?.sort_by === "price_desc") {
    query = query.order("price_per_month", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const { data } = await query.limit(50);
  return data ?? [];
}

export async function getProperty(id: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("properties")
    .select("*, provider:profiles(id, full_name, role, avatar_url, created_at)")
    .eq("id", id)
    .single();

  return data;
}

export async function uploadPropertyImage(file: File) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "provider") {
    return { error: "Unauthorized: Only users with the provider role can upload property images." };
  }

  const maxBytes = 5 * 1024 * 1024;
  if (file.size > maxBytes) {
    return { error: "File size exceeds the 5MB limit." };
  }

  const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowedMimeTypes.includes(file.type)) {
    return { error: "Invalid file type. Only JPEG, PNG, WEBP, and GIF images are allowed." };
  }

  const fileExt = file.name.split(".").pop()?.toLowerCase();
  const allowedExtensions = ["jpg", "jpeg", "png", "webp", "gif"];
  if (!fileExt || !allowedExtensions.includes(fileExt)) {
    return { error: "Invalid file extension. Only .jpg, .jpeg, .png, .webp, and .gif are allowed." };
  }

  const fileName = `${user.id}/${Date.now()}.${fileExt}`;

  const { error } = await supabase.storage
    .from("property-images")
    .upload(fileName, file);

  if (error) return { error: error.message };

  const {
    data: { publicUrl },
  } = supabase.storage.from("property-images").getPublicUrl(fileName);

  return { url: publicUrl };
}
