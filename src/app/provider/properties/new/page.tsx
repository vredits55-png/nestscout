"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Upload,
  MapPin,
  Bed,
  Bath,
  Maximize,
  DollarSign,
  Building,
  Image as ImageIcon,
  X,
  Info,
} from "lucide-react";
import { createProperty, uploadPropertyImage } from "@/actions/properties";
import { AMENITIES_LIST, PROPERTY_TYPES } from "@/lib/utils";
import LocationPicker from "@/components/LocationPicker";

export default function NewPropertyPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [latitude, setLatitude] = useState(28.6139);
  const [longitude, setLongitude] = useState(77.2090);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;

    setUploading(true);
    const urls: string[] = [];

    for (const file of Array.from(files)) {
      const result = await uploadPropertyImage(file);
      if ("url" in result && result.url) {
        urls.push(result.url as string);
      }
    }

    setImageUrls((prev) => [...prev, ...urls]);
    setUploading(false);
  }

  function removeImage(index: number) {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSubmit(formData: FormData) {
    selectedAmenities.forEach((amenity) => formData.append("amenities", amenity));
    imageUrls.forEach((url) => formData.append("image_urls", url));
    formData.set("latitude", String(latitude));
    formData.set("longitude", String(longitude));

    startTransition(async () => {
      const result = await createProperty(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        router.push("/provider/dashboard");
      }
    });
  }

  return (
    <div className="min-h-screen pb-16">
      <div className="hero-gradient pt-28 pb-8 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/provider/dashboard"
            className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-primary transition-colors cursor-pointer mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-text animate-fade-in-up">
            List a New Property
          </h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 text-sm font-semibold animate-fade-in-up">
            {error}
          </div>
        )}

        <form action={handleSubmit} className="space-y-8">
          {/* Basic Info */}
          <section className="glass rounded-2xl p-6 animate-fade-in-up">
            <h2 className="text-lg font-bold text-text mb-4 flex items-center gap-2">
              <Building className="w-5 h-5 text-primary" />
              Basic Details
            </h2>

            <div className="space-y-4">
              <div>
                <label className="input-label">Property Title</label>
                <input
                  name="title"
                  required
                  className="input-field"
                  placeholder="Charming 2BR Apartment in Downtown"
                />
              </div>

              <div>
                <label className="input-label">Description</label>
                <textarea
                  name="description"
                  rows={4}
                  className="input-field resize-none"
                  placeholder="Describe the property, its features, and what makes it special..."
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="input-label flex items-center gap-1">
                    <Building className="w-3.5 h-3.5" />
                    Type
                  </label>
                  <select name="property_type" className="input-field cursor-pointer">
                    {PROPERTY_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="input-label flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5" />
                    Price/mo
                  </label>
                  <input
                    name="price_per_month"
                    type="number"
                    required
                    className="input-field"
                    placeholder="2500"
                  />
                </div>
                <div>
                  <label className="input-label flex items-center gap-1">
                    <Bed className="w-3.5 h-3.5" />
                    Beds
                  </label>
                  <input
                    name="bedrooms"
                    type="number"
                    required
                    className="input-field"
                    placeholder="2"
                  />
                </div>
                <div>
                  <label className="input-label flex items-center gap-1">
                    <Bath className="w-3.5 h-3.5" />
                    Baths
                  </label>
                  <input
                    name="bathrooms"
                    type="number"
                    required
                    className="input-field"
                    placeholder="1"
                  />
                </div>
              </div>

              <div>
                <label className="input-label flex items-center gap-1">
                  <Maximize className="w-3.5 h-3.5" />
                  Area (sqft)
                </label>
                <input
                  name="area_sqft"
                  type="number"
                  className="input-field"
                  placeholder="1200"
                />
              </div>
            </div>
          </section>

          {/* Location */}
          <section className="glass rounded-2xl p-6 animate-fade-in-up delay-75">
            <h2 className="text-lg font-bold text-text mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-cta" />
              Location
            </h2>

            <div className="space-y-4">
              <div>
                <label className="input-label">Street Address</label>
                <input
                  name="address"
                  className="input-field"
                  placeholder="123 Main Street"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="input-label">City</label>
                  <input
                    name="city"
                    required
                    className="input-field"
                    placeholder="New York"
                  />
                </div>
                <div>
                  <label className="input-label">State</label>
                  <input
                    name="state"
                    className="input-field"
                    placeholder="NY"
                  />
                </div>
                <div>
                  <label className="input-label">Zip Code</label>
                  <input
                    name="zip_code"
                    className="input-field"
                    placeholder="10001"
                  />
                </div>
              </div>

              {/* Map Picker */}
              <div>
                <label className="input-label flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  Pin Location on Map
                </label>
                <LocationPicker
                  defaultLat={latitude}
                  defaultLng={longitude}
                  onLocationChange={(lat, lng) => {
                    setLatitude(lat);
                    setLongitude(lng);
                  }}
                />
              </div>
            </div>
          </section>

          {/* Neighborhood */}
          <section className="glass rounded-2xl p-6 animate-fade-in-up delay-150">
            <h2 className="text-lg font-bold text-text mb-4 flex items-center gap-2">
              <Info className="w-5 h-5 text-accent" />
              Neighborhood Info
            </h2>
            <textarea
              name="neighborhood_info"
              rows={3}
              className="input-field resize-none"
              placeholder="Describe the neighborhood — nearby restaurants, parks, transit, schools..."
            />
          </section>

          {/* Images */}
          <section className="glass rounded-2xl p-6 animate-fade-in-up delay-200">
            <h2 className="text-lg font-bold text-text mb-4 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-primary-light" />
              Property Images
            </h2>

            <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-primary/20 rounded-2xl cursor-pointer hover:border-primary hover:bg-primary/5 transition-all duration-300">
              <Upload className="w-8 h-8 text-text-light mb-2" />
              <span className="text-sm text-text-muted">
                {uploading ? "Uploading..." : "Click to upload images"}
              </span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>

            {imageUrls.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-4 stagger-children">
                {imageUrls.map((url, i) => (
                  <div key={i} className="relative group rounded-xl overflow-hidden h-24">
                    <img
                      src={url}
                      alt={`Upload ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Amenities */}
          <section className="glass rounded-2xl p-6 animate-fade-in-up delay-300">
            <h2 className="text-lg font-bold text-text mb-4">
              Amenities
            </h2>
            <div className="flex flex-wrap gap-2">
              {AMENITIES_LIST.map((amenity) => (
                <button
                  key={amenity}
                  type="button"
                  onClick={() =>
                    setSelectedAmenities((prev) =>
                      prev.includes(amenity)
                        ? prev.filter((a) => a !== amenity)
                        : [...prev, amenity]
                    )
                  }
                  className={`px-4 py-2 rounded-full text-sm font-medium cursor-pointer transition-all duration-300 ${
                    selectedAmenities.includes(amenity)
                      ? "bg-primary text-white shadow-md"
                      : "glass text-text-muted hover:text-primary"
                  }`}
                >
                  {amenity}
                </button>
              ))}
            </div>
          </section>

          {/* Submit */}
          <div className="flex justify-end gap-3">
            <Link
              href="/provider/dashboard"
              className="btn btn-ghost cursor-pointer"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isPending}
              className="btn btn-primary text-lg px-8 py-4 cursor-pointer"
            >
              {isPending ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Publish Listing
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
