"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Sparkles } from "lucide-react";

interface Property {
  id: string;
  title: string;
  location: string;
  price: string;
  image: string;
  vibes: string;
  details: string;
  curator: string;
  curatorAvatar: string;
}

const PROPERTIES: Property[] = [
  {
    id: "prop-1",
    title: "The Glasshouse Arches",
    location: "Portland, OR",
    price: "$3,200/mo",
    image: "https://images.unsplash.com/photo-1508333706533-1ab43ecb1606?auto=format&fit=crop&w=800&q=80",
    vibes: "A minimalist sanctuary constructed of glass and structural steel arches, seamlessly dissolving the boundary between forest and dwelling.",
    details: "3 Beds • 2 Baths",
    curator: "Elena Rostova",
    curatorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
  },
  {
    id: "prop-2",
    title: "Concrete Desert Oasis",
    location: "Joshua Tree, CA",
    price: "$4,500/mo",
    image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80",
    vibes: "Brutalist raw concrete volumes meet the warm hues of the Mojave. Thoughtfully oriented to frame panoramic desert vistas.",
    details: "2 Beds • 2 Baths",
    curator: "Marcus Thorne",
    curatorAvatar: "https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?auto=format&fit=crop&w=150&q=80"
  },
  {
    id: "prop-3",
    title: "Mid-Century Modern",
    location: "Austin, TX",
    price: "$3,800/mo",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
    vibes: "A masterfully restored 1962 organic-modern sanctuary. Features floor-to-ceiling mahogany panels and native limestone details.",
    details: "4 Beds • 3 Baths",
    curator: "Sarah Jenkins",
    curatorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80"
  },
  {
    id: "prop-4",
    title: "The Arch Loft",
    location: "Brooklyn, NY",
    price: "$5,100/mo",
    image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80",
    vibes: "Soaring 18-foot ceilings framed by iconic exposed brick arch windows. A highly curated historic industrial loft space.",
    details: "2 Beds • 1.5 Baths",
    curator: "David Chen",
    curatorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"
  },
  {
    id: "prop-5",
    title: "Japandi Forest Haven",
    location: "Seattle, WA",
    price: "$2,900/mo",
    image: "https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?auto=format&fit=crop&w=800&q=80",
    vibes: "A celebration of textures. Scandinavian functional styling meets Japanese structural joinery and cedar scent.",
    details: "3 Beds • 2 Baths",
    curator: "Aiko Tanaka",
    curatorAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80"
  }
];

// Triple the properties list to ensure seamless infinite scrolling loop
const TRIPLE_PROPERTIES = [...PROPERTIES, ...PROPERTIES, ...PROPERTIES];

export default function PropertySlider() {
  const [flippedIndex, setFlippedIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleCardClick = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    if (flippedIndex === index) {
      setFlippedIndex(null);
    } else {
      setFlippedIndex(index);
    }
  };

  return (
    <section 
      ref={containerRef}
      className="py-12 overflow-hidden relative select-none bg-transparent"
      onMouseLeave={() => setFlippedIndex(null)}
    >
      {/* Component-scoped CSS for infinite marquee */}
      <style>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.3333%);
          }
        }
        .marquee-track {
          display: flex;
          gap: 1.5rem;
          width: max-content;
          animation: marquee 32s linear infinite;
        }
        .marquee-track:hover {
          animation-play-state: paused;
        }
        .slider-card-container {
          transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.5s ease;
        }
        .slider-card-container:hover {
          transform: scale(1.06);
          z-index: 50;
        }
      `}</style>

      {/* Marquee Container */}
      <div className="relative w-full overflow-hidden py-4 flex items-center">
        <div className="marquee-track">
          {TRIPLE_PROPERTIES.map((prop, i) => {
            const isCardFlipped = flippedIndex === i;

            return (
              <div
                key={`${prop.id}-${i}`}
                onClick={(e) => handleCardClick(e, i)}
                className="slider-card-container w-[210px] md:w-[245px] h-[310px] md:h-[350px] perspective-1000 shrink-0 relative cursor-pointer"
              >
                {/* 3D Flip Card Inner */}
                <div 
                  className={`relative w-full h-full preserve-3d duration-700 transition-transform ${
                    isCardFlipped ? "rotate-y-180" : ""
                  }`}
                >
                  {/* FRONT SIDE */}
                  <div className="absolute inset-0 w-full h-full backface-hidden rounded-2xl overflow-hidden shadow-lg border border-black/5 bg-surface-container-lowest">
                    <Image
                      src={prop.image}
                      alt={prop.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 210px, 245px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent"></div>
                    
                    {/* Tiny Badge */}
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-full text-[8px] font-bold text-primary uppercase tracking-wider flex items-center gap-1 shadow-sm">
                      <Sparkles className="w-2.5 h-2.5 text-primary" />
                      Curated
                    </div>

                    {/* Meta info at bottom */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white text-left">
                      <span className="text-[9px] uppercase tracking-widest text-primary-fixed font-bold font-headline block mb-0.5">
                        {prop.location}
                      </span>
                      <h3 className="text-sm md:text-base font-headline font-bold leading-tight">
                        {prop.title}
                      </h3>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10">
                        <span className="text-xs font-semibold font-body text-white/90">
                          {prop.price}
                        </span>
                        <span className="text-[9px] uppercase font-bold tracking-widest text-primary-fixed/80">
                          Details
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* BACK SIDE */}
                  <div className="absolute inset-0 w-full h-full backface-hidden rounded-2xl overflow-hidden shadow-lg rotate-y-180 bg-[#1d271c] border border-primary-fixed/20 p-4 flex flex-col justify-between text-left text-white">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] uppercase tracking-widest text-primary-fixed font-bold">
                          {prop.location}
                        </span>
                        <span className="text-[8px] uppercase tracking-widest font-bold text-white/30">
                          Curator
                        </span>
                      </div>
                      <h3 className="text-xs md:text-sm font-headline font-bold text-white mt-1 leading-snug">
                        {prop.title}
                      </h3>
                      <div className="w-6 h-0.5 bg-primary-fixed mt-1.5"></div>
                      
                      <p className="text-[10px] md:text-xs text-white/80 font-body leading-relaxed mt-2.5 italic">
                        &ldquo;{prop.vibes}&rdquo;
                      </p>
                      
                      <div className="text-[9px] text-primary-fixed font-bold font-headline mt-2 bg-primary/20 px-2 py-0.5 rounded inline-block">
                        {prop.details}
                      </div>
                    </div>

                    <div className="border-t border-white/10 pt-2.5 flex flex-col gap-2.5">
                      {/* Curator Info */}
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full overflow-hidden relative shrink-0">
                          <Image
                            src={prop.curatorAvatar}
                            alt={prop.curator}
                            fill
                            className="object-cover"
                            sizes="24px"
                          />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-white leading-none">{prop.curator}</p>
                          <p className="text-[8px] text-white/40 uppercase font-semibold mt-0.5">Editor</p>
                        </div>
                      </div>

                      {/* Explore Button */}
                      <Link 
                        href="/search" 
                        className="w-full text-center py-1.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-primary-fixed text-on-primary-container hover:bg-primary-fixed-dim transition-colors cursor-pointer"
                      >
                        Explore Collection
                      </Link>
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
