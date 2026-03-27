"use client";

import Link from "next/link";
import { MapPin, Bed, Bath, Maximize, Tag } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import FavoriteButton from "./FavoriteButton";
import type { Property } from "@/lib/types";

interface PropertyCardProps {
  property: Property;
  isFavorited?: boolean;
  index?: number;
}

export default function PropertyCard({
  property,
  isFavorited = false,
  index = 0,
}: PropertyCardProps) {
  return (
    <Link href={`/properties/${property.id}`}>
      <div
        className="nest-card group"
        style={{ animationDelay: `${index * 0.07}s` }}
      >
        {/* Image */}
        <div className="card-image relative h-52 overflow-hidden">
          {property.images?.[0] ? (
            <img
              src={property.images[0]}
              alt={property.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <MapPin className="w-10 h-10 text-primary/50 animate-breathe" />
            </div>
          )}

          {/* Overlay tags */}
          <div className="absolute top-3 left-3 flex gap-2 z-10">
            <span className="glass px-3 py-1.5 rounded-full text-xs font-bold text-primary flex shadow-glow">
              <Tag className="w-3 h-3 mr-1" />
              {property.property_type}
            </span>
          </div>

          {/* Favorite */}
          <div className="absolute top-3 right-3 z-10 transition-transform hover:scale-110">
            <FavoriteButton
              propertyId={property.id}
              initialFavorited={isFavorited}
            />
          </div>

          {/* Price overlay */}
          <div className="absolute bottom-3 left-3 z-10">
            <div className="glass rounded-xl px-4 py-2 border-primary-light/30">
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent drop-shadow-sm">
                {formatCurrency(property.price_per_month)}
              </span>
              <span className="text-xs text-text-muted font-bold ml-1">/mo</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 bg-white/40">
          <h3
            className="font-bold text-text truncate mb-2 group-hover:text-primary transition-colors duration-300 drop-shadow-sm text-lg"
          >
            {property.title}
          </h3>

          <div className="flex items-center gap-1.5 text-text-muted text-sm mb-4 font-body">
            <MapPin className="w-4 h-4 shrink-0 text-accent/80" />
            <span className="truncate">
              {property.city}, {property.state}
            </span>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm font-bold text-primary/80">
            <div className="flex items-center gap-1.5 bg-white/50 px-2 py-1 rounded-lg">
              <Bed className="w-4 h-4" />
              <span>{property.bedrooms} Bed</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/50 px-2 py-1 rounded-lg">
              <Bath className="w-4 h-4" />
              <span>{property.bathrooms} Bath</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/50 px-2 py-1 rounded-lg">
              <Maximize className="w-4 h-4" />
              <span>{property.area_sqft} ft²</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
