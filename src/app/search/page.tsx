"use client";

import { useState, useCallback, useEffect } from "react";
import { getProperties } from "@/actions/properties";
import { getUserFavoriteIds } from "@/actions/favorites";
import SearchFilters from "@/components/SearchFilters";
import PropertyCard from "@/components/PropertyCard";
import MapView from "@/components/MapView";
import { MapPin, LayoutGrid, Map as MapIcon } from "lucide-react";
import type { Property, PropertyFilters } from "@/lib/types";

export default function SearchPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");

  // Auto-load on mount
  useEffect(() => {
    async function loadInitial() {
      setLoading(true);
      const [data, favIds] = await Promise.all([
        getProperties(),
        getUserFavoriteIds(),
      ]);
      setProperties(data as Property[]);
      setFavoriteIds(favIds);
      setLoaded(true);
      setLoading(false);
    }
    loadInitial();
  }, []);

  const handleFilter = useCallback(async (filters: PropertyFilters) => {
    setLoading(true);
    const [data, favIds] = await Promise.all([
      getProperties(filters),
      getUserFavoriteIds(),
    ]);
    setProperties(data as Property[]);
    setFavoriteIds(favIds);
    setLoaded(true);
    setLoading(false);
  }, []);

  const handleBoundsChange = useCallback(
    async (bounds: { north: number; south: number; east: number; west: number }) => {
      const data = await getProperties({ bounds });
      setProperties(data as Property[]);
    },
    []
  );

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <div className="bg-surface-container-low pt-28 pb-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-black font-headline text-on-surface mb-4 tracking-tight animate-fade-in-up">
            The Collection.
          </h1>
          <p className="text-xl text-on-surface-variant mb-10 max-w-2xl font-body italic animate-fade-in-up delay-75">
            Explore our curated inventory of refined living spaces. Hand-selected properties for the discerning individual.
          </p>

          <SearchFilters onFilter={handleFilter} className="max-w-5xl relative z-20" />
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {/* Toggle & Count */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <span className="font-bold text-on-surface text-lg uppercase tracking-widest text-outline">
              {loading
                ? "Curating..."
                : loaded
                ? `${properties.length} Results Found`
                : "Discovering"}
            </span>
          </div>

          <div className="flex gap-2 p-1 bg-surface-container rounded-xl shadow-inner">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-3 rounded-lg transition-all duration-300 font-bold flex items-center gap-2 cursor-pointer ${
                viewMode === "grid"
                  ? "bg-surface-container-lowest text-on-surface shadow-sm"
                  : "text-outline hover:text-on-surface"
              }`}
              aria-label="Editorial Grid"
            >
              <LayoutGrid className="w-5 h-5" />
              <span className="hidden sm:inline">Gallery</span>
            </button>
            <button
              onClick={() => setViewMode("map")}
              className={`p-3 rounded-lg transition-all duration-300 font-bold flex items-center gap-2 cursor-pointer ${
                viewMode === "map"
                  ? "bg-surface-container-lowest text-on-surface shadow-sm"
                  : "text-outline hover:text-on-surface"
              }`}
              aria-label="Map view"
            >
              <MapIcon className="w-5 h-5" />
              <span className="hidden sm:inline">Map</span>
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {[1,2,3,4,5,6].map((i) => (
               <div key={i} className="animate-pulse">
                <div className="w-full aspect-[4/5] bg-surface-variant rounded-2xl mb-4" />
                <div className="h-6 w-3/4 bg-surface-variant rounded-full mb-2" />
                <div className="h-4 w-1/2 bg-surface-variant rounded-full" />
              </div>
            ))}
          </div>
        )}

        {/* Results */}
        {!loading && viewMode === "grid" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-12 stagger-children">
            {properties.map((property, i) => (
              <PropertyCard
                key={property.id}
                property={property}
                isFavorited={favoriteIds.includes(property.id)}
                index={i}
              />
            ))}
          </div>
        )}

        {!loading && viewMode === "map" && (
          <div className="h-[75vh] rounded-3xl overflow-hidden shadow-ambient border border-surface-variant/30 relative z-10">
            <MapView
              properties={properties}
              onBoundsChange={handleBoundsChange}
            />
          </div>
        )}

        {!loading && loaded && properties.length === 0 && (
          <div className="text-center py-32 animate-fade-in-up">
            <div className="w-24 h-24 rounded-full bg-surface-container flex items-center justify-center mx-auto mb-6">
              <MapPin className="w-10 h-10 text-outline" />
            </div>
            <h3 className="text-3xl font-black font-headline text-on-surface mb-3">
              No Matches Found
            </h3>
            <p className="text-on-surface-variant text-lg max-w-md mx-auto italic">
              Try adjusting your editorial filters or searching in a different locale.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
