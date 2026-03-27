"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { toggleFavorite } from "@/actions/favorites";

interface FavoriteButtonProps {
  propertyId: string;
  initialFavorited: boolean;
}

export default function FavoriteButton({
  propertyId,
  initialFavorited,
}: FavoriteButtonProps) {
  const [favorited, setFavorited] = useState(initialFavorited);
  const [isAnimating, setIsAnimating] = useState(false);

  async function handleToggle() {
    setIsAnimating(true);
    setFavorited(!favorited);

    const result = await toggleFavorite(propertyId);
    if ("error" in result) {
      setFavorited(favorited);
    }

    setTimeout(() => setIsAnimating(false), 400);
  }

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        handleToggle();
      }}
      className="cursor-pointer w-9 h-9 rounded-full glass flex items-center justify-center transition-all duration-300 hover:scale-110"
      style={{
        transform: isAnimating ? "scale(1.3)" : "scale(1)",
        transition: "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}
      aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
    >
      <Heart
        className={`w-4 h-4 transition-colors duration-300 ${
          favorited
            ? "text-red-500 fill-red-500"
            : "text-gray-600"
        }`}
      />
    </button>
  );
}
