"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import {
  Search,
  SlidersHorizontal,
  X,
  Bed,
  DollarSign,
  Building,
  ArrowUpDown,
} from "lucide-react";
import { AMENITIES_LIST, PROPERTY_TYPES } from "@/lib/utils";
import type { PropertyFilters } from "@/lib/types";

interface SearchFiltersProps {
  onFilter: (filters: PropertyFilters) => void;
  className?: string;
}

export default function SearchFilters({ onFilter, className = "" }: SearchFiltersProps) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [keyword, setKeyword] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "price_asc" | "price_desc">("newest");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRender = useRef(true);

  function buildFilters(): PropertyFilters {
    return {
      keyword: keyword || undefined,
      min_price: minPrice ? Number(minPrice) : undefined,
      max_price: maxPrice ? Number(maxPrice) : undefined,
      bedrooms: bedrooms ? Number(bedrooms) : undefined,
      property_type: propertyType || undefined,
      amenities: selectedAmenities.length ? selectedAmenities : undefined,
      sort_by: sortBy,
    };
  }

  function handleSearch() {
    startTransition(() => {
      onFilter(buildFilters());
    });
  }

  // Live search: debounce keyword changes
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      handleSearch();
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword]);

  function toggleAmenity(amenity: string) {
    setSelectedAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((a) => a !== amenity)
        : [...prev, amenity]
    );
  }

  function clearFilters() {
    setKeyword("");
    setMinPrice("");
    setMaxPrice("");
    setBedrooms("");
    setPropertyType("");
    setSortBy("newest");
    setSelectedAmenities([]);
    startTransition(() => onFilter({}));
  }

  return (
    <div className={`${className}`}>
      {/* Main Search Bar */}
      <div className="glass rounded-2xl p-2 flex items-center gap-2 animate-fade-in-up">
        <div className="flex-1 flex items-center gap-2 px-3">
          <Search className="w-5 h-5 text-primary shrink-0" />
          <input
            type="text"
            placeholder="Search by city, address, or title..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="w-full py-2.5 bg-transparent outline-none text-text placeholder:text-text-light"
          />
          {keyword && (
            <button
              onClick={() => setKeyword("")}
              className="text-text-light hover:text-text cursor-pointer p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <button
          onClick={() => setFiltersOpen(!filtersOpen)}
          className={`btn btn-sm cursor-pointer ${
            filtersOpen ? "btn-primary" : "btn-ghost"
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span className="hidden sm:inline">Filters</span>
        </button>

        <button
          onClick={handleSearch}
          disabled={isPending}
          className="btn btn-primary btn-sm cursor-pointer"
        >
          {isPending ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            "Search"
          )}
        </button>
      </div>

      {/* Extended Filters */}
      {filtersOpen && (
        <div className="glass rounded-2xl p-6 mt-3 animate-fade-in-up">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-text">
              Filters
            </h3>
            <button
              onClick={clearFilters}
              className="text-sm text-primary hover:underline cursor-pointer flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              Clear All
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="input-label flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5" />
                Min Price
              </label>
              <input
                type="number"
                placeholder="500"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="input-label flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5" />
                Max Price
              </label>
              <input
                type="number"
                placeholder="5000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="input-label flex items-center gap-1">
                <Bed className="w-3.5 h-3.5" />
                Min Bedrooms
              </label>
              <select
                value={bedrooms}
                onChange={(e) => setBedrooms(e.target.value)}
                className="input-field cursor-pointer"
              >
                <option value="">Any</option>
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n}+
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="input-label flex items-center gap-1">
                <ArrowUpDown className="w-3.5 h-3.5" />
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="input-field cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="price_asc">Price: Low → High</option>
                <option value="price_desc">Price: High → Low</option>
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="input-label flex items-center gap-1">
              <Building className="w-3.5 h-3.5" />
              Property Type
            </label>
            <div className="flex flex-wrap gap-2">
              {PROPERTY_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() =>
                    setPropertyType(
                      propertyType === type.value ? "" : type.value
                    )
                  }
                  className={`px-4 py-2 rounded-full text-sm font-medium cursor-pointer transition-all duration-300 ${
                    propertyType === type.value
                      ? "bg-primary text-white shadow-md shadow-primary/30"
                      : "glass text-text-muted hover:text-primary hover:shadow-glow"
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="input-label">Amenities</label>
            <div className="flex flex-wrap gap-2">
              {AMENITIES_LIST.map((amenity) => (
                <button
                  key={amenity}
                  onClick={() => toggleAmenity(amenity)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all duration-300 ${
                    selectedAmenities.includes(amenity)
                      ? "bg-primary-light/20 text-primary border border-primary/30"
                      : "glass text-text-muted hover:text-primary"
                  }`}
                >
                  {amenity}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button onClick={handleSearch} className="btn btn-primary cursor-pointer">
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
