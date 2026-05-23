import { type ClassValue, clsx } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export const AMENITIES_LIST = [
  "WiFi",
  "Parking",
  "Air Conditioning",
  "Heating",
  "Washer/Dryer",
  "Dishwasher",
  "Pool",
  "Gym",
  "Pet Friendly",
  "Balcony",
  "Furnished",
  "Storage",
  "Elevator",
  "Security",
  "Garden",
  "Rooftop",
] as const;

export const PROPERTY_TYPES = [
  { value: "apartment", label: "Apartment" },
  { value: "house", label: "House" },
  { value: "studio", label: "Studio" },
  { value: "villa", label: "Villa" },
  { value: "condo", label: "Condo" },
] as const;
