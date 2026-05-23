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
  IndianRupee,
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

  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);

  const handleLocationChange = async (lat: number, lng: number) => {
    setLatitude(lat);
    setLongitude(lng);

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            "Accept-Language": "en",
          },
        }
      );
      if (res.ok) {
        const data = await res.json();
        if (data && data.address) {
          const addr = data.address;
          const streetParts = [];
          if (addr.road) streetParts.push(addr.road);
          if (addr.suburb) streetParts.push(addr.suburb);
          if (addr.neighbourhood) streetParts.push(addr.neighbourhood);

          setAddress(streetParts.join(", ") || data.display_name?.split(",")[0] || "");
          setCity(addr.city || addr.town || addr.village || addr.subdistrict || addr.county || "");
          setState(addr.state || "");
          setZipCode(addr.postcode || "");
        }
      }
    } catch (err) {
      console.error("Reverse geocoding failed", err);
    }
  };

  const handleSearchLocation = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`,
        {
          headers: {
            "Accept-Language": "en",
          },
        }
      );
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lng = parseFloat(data[0].lon);
          await handleLocationChange(lat, lng);
        } else {
          alert("Location not found. Please try another query.");
        }
      }
    } catch (err) {
      console.error("Geocoding search failed", err);
    } finally {
      setSearching(false);
    }
  };

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
                    <IndianRupee className="w-3.5 h-3.5" />
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="input-label">Street Address</label>
                  <input
                    name="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="input-field"
                    placeholder="Ex. Connaught Place, Block E"
                    required
                  />
                </div>
                <div>
                  <label className="input-label">City</label>
                  <input
                    name="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                    className="input-field"
                    placeholder="Ex. New Delhi"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="input-label">State</label>
                  <input
                    name="state"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    required
                    className="input-field"
                    placeholder="Ex. Delhi"
                  />
                </div>
                <div>
                  <label className="input-label">Zip Code / Pin Code</label>
                  <input
                    name="zip_code"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    required
                    className="input-field"
                    placeholder="Ex. 110001"
                  />
                </div>
              </div>

              {/* Map Picker & Search */}
              <div className="pt-2 border-t border-primary/10">
                <label className="input-label flex items-center gap-1 mb-3">
                  <MapPin className="w-3.5 h-3.5" />
                  Search & Pin Location on Map
                </label>
                
                {/* Geocoding Search Bar */}
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    placeholder="Type landmark, area or city (e.g. Connaught Place, Delhi)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input-field flex-1"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleSearchLocation();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleSearchLocation}
                    disabled={searching}
                    className="btn btn-primary px-5 py-3 rounded-xl cursor-pointer text-sm font-bold flex items-center gap-1 shadow-md shrink-0"
                  >
                    {searching ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : "Search & Pin"}
                  </button>
                </div>

                <LocationPicker
                  key={`${latitude}-${longitude}`} // Force re-render of map to center on new coordinates
                  defaultLat={latitude}
                  defaultLng={longitude}
                  onLocationChange={handleLocationChange}
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
