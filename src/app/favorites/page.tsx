import { getFavorites } from "@/actions/favorites";
import PropertyCard from "@/components/PropertyCard";
import { Heart, ArrowRight } from "lucide-react";
import Link from "next/link";

export default async function FavoritesPage() {
  const favorites = await getFavorites();

  return (
    <div className="min-h-screen">
      <div className="hero-gradient py-10 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <h1
            className="text-3xl font-bold text-text mb-2 animate-fade-in-up flex items-center gap-3"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            <Heart className="w-8 h-8 text-red-500 fill-red-500" />
            Your Favorites
          </h1>
          <p className="text-text-muted animate-fade-in-up delay-75">
            Properties you&apos;ve saved for later
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {favorites.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
            {favorites.map((fav: { id: string; property: any }, i: number) => (
              <PropertyCard
                key={fav.id}
                property={fav.property}
                isFavorited={true}
                index={i}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 animate-fade-in-up">
            <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
              <Heart className="w-10 h-10 text-red-300" />
            </div>
            <h3
              className="text-xl font-semibold text-text mb-2"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              No Favorites Yet
            </h3>
            <p className="text-text-muted max-w-md mx-auto mb-6">
              Start exploring rentals and save the ones you love!
            </p>
            <Link href="/search" className="btn btn-primary cursor-pointer">
              Explore Rentals
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
