import { notFound } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  Bed,
  Bath,
  Maximize,
  ArrowLeft,
  Tag,
  CheckCircle,
  Info,
} from "lucide-react";
import { getProperty } from "@/actions/properties";
import { getUserFavoriteIds } from "@/actions/favorites";
import { formatCurrency } from "@/lib/utils";
import FavoriteButton from "@/components/FavoriteButton";
import InquiryForm from "@/components/InquiryForm";
import MapView from "@/components/MapView";

interface PropertyPageProps {
  params: Promise<{ id: string }>;
}

export default async function PropertyPage({ params }: PropertyPageProps) {
  const { id } = await params;
  const property = await getProperty(id);

  if (!property) notFound();

  const favoriteIds = await getUserFavoriteIds();
  const isFavorited = favoriteIds.includes(property.id);

  return (
    <div className="min-h-screen pb-16">
      {/* Back button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4">
        <Link
          href="/search"
          className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-primary transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Search
        </Link>
      </div>

      {/* Image Gallery */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 rounded-3xl overflow-hidden animate-reveal">
          {/* Main Image */}
          <div className="relative h-72 md:h-[420px]">
            {property.images?.[0] ? (
              <img
                src={property.images[0]}
                alt={property.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary-light/10 flex items-center justify-center">
                <MapPin className="w-16 h-16 text-primary/20" />
              </div>
            )}
            <div className="absolute top-4 right-4">
              <FavoriteButton
                propertyId={property.id}
                initialFavorited={isFavorited}
              />
            </div>
          </div>

          {/* Secondary images */}
          <div className="hidden md:grid grid-cols-2 gap-3">
            {(property.images?.slice(1, 5) || []).map(
              (img: string, i: number) => (
                <div key={i} className="relative h-[204px] overflow-hidden">
                  <img
                    src={img}
                    alt={`${property.title} ${i + 2}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500 cursor-pointer"
                  />
                </div>
              )
            )}
            {(!property.images || property.images.length < 2) &&
              [0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-[204px] bg-gradient-to-br from-primary/5 to-primary-light/5 flex items-center justify-center"
                >
                  <MapPin className="w-8 h-8 text-primary/15" />
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Details Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title & Price */}
            <div className="animate-fade-in-up">
              <div className="flex items-center gap-2 mb-2">
                <span className="badge badge-primary">
                  <Tag className="w-3 h-3" />
                  {property.property_type}
                </span>
                {property.is_available && (
                  <span className="badge badge-success">
                    <CheckCircle className="w-3 h-3" />
                    Available
                  </span>
                )}
              </div>

              <h1
                className="text-3xl sm:text-4xl font-bold text-text mb-2"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {property.title}
              </h1>

              <div className="flex items-center gap-2 text-text-muted mb-4">
                <MapPin className="w-4 h-4 shrink-0" />
                <span>
                  {property.address}, {property.city}, {property.state}{" "}
                  {property.zip_code}
                </span>
              </div>

              <div className="flex items-baseline gap-1">
                <span
                  className="text-4xl font-bold text-primary"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {formatCurrency(property.price_per_month)}
                </span>
                <span className="text-text-muted">/month</span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 animate-fade-in-up delay-75">
              {[
                { icon: Bed, label: "Bedrooms", value: property.bedrooms },
                { icon: Bath, label: "Bathrooms", value: property.bathrooms },
                {
                  icon: Maximize,
                  label: "Area",
                  value: `${property.area_sqft} ft²`,
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="glass rounded-2xl p-4 text-center"
                >
                  <stat.icon className="w-6 h-6 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold text-text">
                    {stat.value}
                  </div>
                  <div className="text-xs text-text-muted">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Description */}
            <div className="animate-fade-in-up delay-150">
              <h2
                className="text-xl font-bold text-text mb-3"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                About This Property
              </h2>
              <p className="text-text-muted leading-relaxed whitespace-pre-wrap">
                {property.description || "No description provided."}
              </p>
            </div>

            {/* Amenities */}
            {property.amenities?.length > 0 && (
              <div className="animate-fade-in-up delay-200">
                <h2
                  className="text-xl font-bold text-text mb-3"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  Amenities
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {property.amenities.map((amenity: string) => (
                    <div
                      key={amenity}
                      className="flex items-center gap-2 glass rounded-xl p-3 text-sm"
                    >
                      <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                      <span className="text-text">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Neighborhood */}
            {property.neighborhood_info && (
              <div className="animate-fade-in-up delay-300">
                <h2
                  className="text-xl font-bold text-text mb-3 flex items-center gap-2"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  <Info className="w-5 h-5 text-cta" />
                  Neighborhood Info
                </h2>
                <div className="glass rounded-2xl p-5">
                  <p className="text-text-muted leading-relaxed whitespace-pre-wrap">
                    {property.neighborhood_info}
                  </p>
                </div>
              </div>
            )}

            {/* Map */}
            {property.latitude && property.longitude && (
              <div className="animate-fade-in-up delay-300">
                <h2
                  className="text-xl font-bold text-text mb-3"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  Location
                </h2>
                <div className="h-64 rounded-2xl overflow-hidden shadow-lg">
                  <MapView
                    properties={[property]}
                    center={[property.latitude, property.longitude]}
                    zoom={15}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Sidebar — Inquiry */}
          <div className="space-y-6">
            <div className="sticky top-24 animate-slide-right">
              {/* Provider Card */}
              {property.provider && (
                <div className="glass rounded-2xl p-5 mb-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {property.provider.full_name
                          ?.split(" ")
                          .map((n: string) => n[0])
                          .join("")
                          .toUpperCase() || "?"}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold text-text">
                        {property.provider.full_name || "Property Owner"}
                      </div>
                      <div className="text-xs text-text-muted">
                        Property Owner
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Inquiry Form */}
              <InquiryForm
                propertyId={property.id}
                receiverId={property.provider_id}
                propertyTitle={property.title}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
