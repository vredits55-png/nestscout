export type UserRole = "provider" | "client";

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  phone?: string;
  avatar_url?: string;
  created_at: string;
  provider?: string;
  linked_providers?: string[];
}

export interface Property {
  id: string;
  provider_id: string;
  title: string;
  description: string;
  property_type: "apartment" | "house" | "studio" | "villa" | "condo";
  price_per_month: number;
  bedrooms: number;
  bathrooms: number;
  area_sqft: number;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  latitude: number;
  longitude: number;
  amenities: string[];
  images: string[];
  is_available: boolean;
  neighborhood_info?: string;
  created_at: string;
  updated_at: string;
  provider?: Profile;
}

export interface Favorite {
  id: string;
  user_id: string;
  property_id: string;
  created_at: string;
  property?: Property;
}

export interface Inquiry {
  id: string;
  property_id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  is_read: boolean;
  created_at: string;
  sender?: Profile;
  receiver?: Profile;
  property?: Property;
}

export interface PropertyFilters {
  keyword?: string;
  city?: string;
  min_price?: number;
  max_price?: number;
  bedrooms?: number;
  property_type?: string;
  amenities?: string[];
  sort_by?: "price_asc" | "price_desc" | "newest";
  bounds?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
}

export interface Conversation {
  id: string;
  property_id: string;
  tenant_id: string;
  landlord_id: string;
  status: "active" | "booking_requested" | "confirmed" | "cancelled";
  created_at: string;
  updated_at: string;
  property?: Property;
  tenant?: Profile;
  landlord?: Profile;
  messages?: Message[];
  latest_message?: Message;
  deletion_requested_by?: string | null;
  deletion_status?: 'none' | 'requested';
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: "text" | "booking_request" | "booking_confirmed" | "booking_rejected" | "system";
  is_read: boolean;
  created_at: string;
  sender?: Profile;
}

export interface BookingRequest {
  id: string;
  conversation_id: string;
  property_id: string;
  tenant_id: string;
  check_in: string;
  check_out: string;
  total_nights: number;
  proposed_price: number;
  note?: string;
  status: "pending" | "accepted" | "rejected" | "cancelled";
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  sender_id: string;
  type: "enquiry" | "booking_request" | "deletion_request";
  title: string;
  message: string;
  link: string;
  is_read: boolean;
  created_at: string;
  sender?: Profile;
}

export interface Review {
  id: string;
  property_id: string;
  user_id: string;
  rating: number;
  comment: string;
  created_at: string;
  author?: Profile;
}

