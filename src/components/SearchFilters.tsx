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
      {/* Main Search Bar (Editorial Style) */}
      <div className="bg-surface-container-lowest rounded-xl p-3 ambient-glow flex flex-col md:flex-row gap-4 items-center animate-fade-in-up transition-shadow duration-300">
        
        <div className="flex-1 w-full flex items-center gap-3 px-4 border-b-2 border-transparent focus-within:border-primary transition-all">
          <Search className="w-5 h-5 text-outline shrink-0" />
          <input
            type="text"
            placeholder="Search by city, address, or title..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="w-full bg-transparent border-none focus:ring-0 py-3 text-on-surface placeholder:text-outline-variant font-body outline-none"
          />
          {keyword && (
            <button
              onClick={() => setKeyword("")}
              className="text-outline-variant hover:text-outline cursor-pointer p-1 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <button
          onClick={() => setFiltersOpen(!filtersOpen)}
          className={`btn justify-center font-bold px-6 py-3 w-full md:w-auto transition-colors ${
            filtersOpen ? "bg-surface-variant text-on-surface-variant" : "bg-transparent text-outline hover:bg-surface-container-low hover:text-on-surface"
          }`}
        >
          <SlidersHorizontal className="w-5 h-5" />
          <span className="md:hidden">Filters</span>
        </button>

        <button
          onClick={handleSearch}
          disabled={isPending}
          className="editorial-gradient text-on-primary w-full md:w-auto px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-ambient cursor-pointer"
        >
          {isPending ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <span className="flex items-center gap-2">Search</span>
          )}
        </button>
      </div>

      {/* Extended Filters */}
      {filtersOpen && (
        <div className="bg-surface-container-lowest rounded-2xl p-8 mt-4 ambient-glow animate-fade-in-up origin-top border border-outline-variant/30">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-black font-headline text-on-surface">
              Refine Search
            </h3>
            <button
              onClick={clearFilters}
              className="text-sm font-bold text-outline hover:text-on-surface transition-colors cursor-pointer flex items-center gap-1 uppercase tracking-widest"
            >
              <X className="w-4 h-4" />
              Clear Options
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-8">
            <div>
              <label className="input-label flex items-center gap-2 text-primary">
                <DollarSign className="w-4 h-4" />
                Min Price
              </label>
              <input
                type="number"
                placeholder="0"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="input-label flex items-center gap-2 text-primary">
                <DollarSign className="w-4 h-4" />
                Max Price
              </label>
              <input
                type="number"
                placeholder="Any"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="input-label flex items-center gap-2 text-primary">
                <Bed className="w-4 h-4" />
                Min Bedrooms
              </label>
              <select
                value={bedrooms}
                onChange={(e) => setBedrooms(e.target.value)}
                className="input-field cursor-pointer font-bold"
              >
                <option value="">Any Range</option>
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n}+
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="input-label flex items-center gap-2 text-primary">
                <ArrowUpDown className="w-4 h-4" />
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="input-field cursor-pointer font-bold"
              >
                <option value="newest">Featured Newest</option>
                <option value="price_asc">Price: Ascending</option>
                <option value="price_desc">Price: Descending</option>
              </select>
            </div>
          </div>

          <div className="mb-8">
            <label className="input-label flex items-center gap-2 text-primary mb-3">
              <Building className="w-4 h-4" />
              Categorize Property
            </label>
            <div className="flex flex-wrap gap-3">
              {PROPERTY_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() =>
                    setPropertyType(
                      propertyType === type.value ? "" : type.value
                    )
                  }
                  className={`px-5 py-2 rounded-full text-sm font-bold cursor-pointer transition-all duration-300 font-headline uppercase tracking-wide border-2 ${
                    propertyType === type.value
                      ? "bg-primary border-primary text-on-primary shadow-glow"
                      : "bg-transparent border-outline-variant/50 text-outline hover:border-primary hover:text-primary"
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="input-label text-primary mb-3">Curated Amenities</label>
            <div className="flex flex-wrap gap-2">
              {AMENITIES_LIST.map((amenity) => (
                <button
                  key={amenity}
                  onClick={() => toggleAmenity(amenity)}
                  className={`px-4 py-2 rounded-full text-sm font-bold cursor-pointer transition-all duration-300 font-body ${
                    selectedAmenities.includes(amenity)
                      ? "bg-primary-fixed text-on-primary-fixed shadow-ambient border-transparent"
                      : "bg-surface-container text-on-surface-variant hover:bg-surface-variant border border-transparent"
                  }`}
                >
                  {amenity}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-outline-variant/20 flex justify-end">
             <button onClick={handleSearch} className="btn-primary text-lg px-8 py-3 rounded-xl font-headline font-bold">
               Apply Curated Filters
             </button>
          </div>
        </div>
      )}
    </div>
  );
}
