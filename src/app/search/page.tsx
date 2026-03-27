"use client";

import { useState, useCallback, useEffect } from "react";
import { getProperties } from "@/actions/properties";
import { getUserFavoriteIds } from "@/actions/favorites";
import SearchFilters from "@/components/SearchFilters";
import PropertyCard from "@/components/PropertyCard";
import MapView from "@/components/MapView";
import { MapPin, LayoutGrid, Map as MapIcon, Loader2 } from "lucide-react";
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
    <div className="min-h-screen">
      {/* Header */}
      <div className="hero-gradient pt-28 pb-10 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-text mb-3 tracking-tight animate-fade-in-up">
            Find Your Next Home
          </h1>
          <p className="text-lg text-text-muted mb-8 animate-fade-in-up delay-75">
            Search through verified premium rental properties across the country.
          </p>

          <SearchFilters onFilter={handleFilter} className="max-w-5xl" />
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Toggle & Count */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-primary" />
            <span className="font-semibold text-text text-lg">
              {loading
                ? "Loading..."
                : loaded
                ? `${properties.length} Properties Found`
                : "Search to discover properties"}
            </span>
          </div>

          <div className="flex gap-1 p-1 glass rounded-xl">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition-all duration-300 cursor-pointer ${
                viewMode === "grid"
                  ? "bg-primary text-white shadow"
                  : "text-text-muted hover:text-text"
              }`}
              aria-label="Grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("map")}
              className={`p-2 rounded-lg transition-all duration-300 cursor-pointer ${
                viewMode === "map"
                  ? "bg-primary text-white shadow"
                  : "text-text-muted hover:text-text"
              }`}
              aria-label="Map view"
            >
              <MapIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map((i) => (
              <div key={i} className="glass rounded-2xl overflow-hidden animate-breathe" style={{animationDelay: `${i * 100}ms`}}>
                <div className="h-52 bg-gradient-to-br from-primary/5 to-accent/5" />
                <div className="p-5 space-y-3">
                  <div className="h-4 w-3/4 bg-primary/10 rounded-full" />
                  <div className="h-3 w-1/2 bg-primary/5 rounded-full" />
                  <div className="flex gap-3">
                    <div className="h-3 w-16 bg-primary/10 rounded-full" />
                    <div className="h-3 w-16 bg-primary/10 rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Results */}
        {!loading && viewMode === "grid" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
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
          <div className="h-[70vh] rounded-2xl overflow-hidden shadow-lg border-2 border-primary/10">
            <MapView
              properties={properties}
              onBoundsChange={handleBoundsChange}
            />
          </div>
        )}

        {!loading && loaded && properties.length === 0 && (
          <div className="text-center py-20 animate-fade-in-up">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 animate-breathe">
              <MapPin className="w-10 h-10 text-primary/40" />
            </div>
            <h3 className="text-xl font-semibold text-text mb-2">
              No Properties Found
            </h3>
            <p className="text-text-muted max-w-md mx-auto">
              Try adjusting your filters or searching in a different area.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
