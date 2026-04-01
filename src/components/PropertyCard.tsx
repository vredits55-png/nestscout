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
    <div
      className="group cursor-pointer"
      style={{ animationDelay: `${index * 0.07}s` }}
    >
      <Link href={`/properties/${property.id}`} className="block">
        <div className="relative overflow-hidden rounded-[20px] mb-4 shadow-ambient group-hover:shadow-glow-strong transition-shadow duration-500">
          {/* Image */}
          <div className="relative aspect-[4/5] bg-surface-container-low flex items-center justify-center">
            {property.images?.[0] ? (
              <img
                src={property.images[0]}
                alt={property.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full bg-editorial-gradient opacity-10 flex items-center justify-center" />
            )}
            {!property.images?.[0] && (
               <MapPin className="absolute w-10 h-10 text-primary/40 animate-breathe" />
            )}
          </div>

          {/* Overlay tags */}
          <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 pointer-events-none">
            <span className="bg-primary text-on-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-1 shadow-ambient backdrop-blur-md">
              <Tag className="w-3 h-3" />
              {property.property_type}
            </span>
          </div>

          {/* Favorite (Pointer events need to be enabled for this button) */}
          <div className="absolute top-4 right-4 z-20 transition-transform hover:scale-110" onClick={(e) => e.preventDefault()}>
            <FavoriteButton
              propertyId={property.id}
              initialFavorited={isFavorited}
            />
          </div>
        </div>

        {/* Content Area */}
        <div className="space-y-3 px-1">
          <div className="flex justify-between items-start gap-2">
            <div>
              <h3
                className="font-bold text-on-surface truncate text-2xl font-headline group-hover:text-primary transition-colors duration-300"
                title={property.title}
              >
                {property.title}
              </h3>
              <p className="text-on-surface-variant font-medium flex items-center gap-1 mt-1 truncate">
                <MapPin className="w-4 h-4 shrink-0 text-primary/70" />
                {property.city}, {property.state}
              </p>
            </div>
            
            <div className="text-right shrink-0">
               <span className="text-2xl font-black text-primary font-headline block leading-none">
                 {formatCurrency(property.price_per_month)}
               </span>
               <span className="text-xs text-outline uppercase tracking-widest font-bold block mt-1">/ Month</span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 text-on-surface-variant font-bold text-sm pt-2">
            <div className="flex items-center gap-1.5">
              <Bed className="w-4 h-4 text-primary" />
              <span>{property.bedrooms} Beds</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Bath className="w-4 h-4 text-primary" />
              <span>{property.bathrooms} Baths</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Maximize className="w-4 h-4 text-primary" />
              <span>{property.area_sqft} sqft</span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
