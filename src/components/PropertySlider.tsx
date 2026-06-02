"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

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
    details: "3 Beds • 2 Baths • 2,400 sqft",
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
    details: "2 Beds • 2 Baths • 1,800 sqft",
    curator: "Marcus Thorne",
    curatorAvatar: "https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?auto=format&fit=crop&w=150&q=80"
  },
  {
    id: "prop-3",
    title: "Mid-Century Sanctuary",
    location: "Austin, TX",
    price: "$3,800/mo",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
    vibes: "A masterfully restored 1962 organic-modern sanctuary. Features floor-to-ceiling mahogany panels and native limestone details.",
    details: "4 Beds • 3 Baths • 3,100 sqft",
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
    details: "2 Beds • 1.5 Baths • 1,600 sqft",
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
    details: "3 Beds • 2 Baths • 2,100 sqft",
    curator: "Aiko Tanaka",
    curatorAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80"
  }
];

export default function PropertySlider() {
  const [currentIndex, setCurrentIndex] = useState(2);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const autoplayTimer = useRef<NodeJS.Timeout | null>(null);

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % PROPERTIES.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + PROPERTIES.length) % PROPERTIES.length);
  };

  const handleCardClick = (index: number) => {
    if (index !== currentIndex) {
      setCurrentIndex(index);
      setIsFlipped(false);
    } else {
      setIsFlipped(!isFlipped);
    }
  };

  // Start Autoplay
  useEffect(() => {
    if (!isHovered) {
      autoplayTimer.current = setInterval(() => {
        handleNext();
      }, 5500);
    }

    return () => {
      if (autoplayTimer.current) {
        clearInterval(autoplayTimer.current);
      }
    };
  }, [isHovered]);

  return (
    <section 
      className="py-24 px-8 overflow-hidden relative select-none bg-inverse-surface text-white"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsFlipped(false);
      }}
    >
      {/* Component Styles for CSS variable calculations */}
      <style>{`
        .slider-card {
          position: absolute;
          left: 50%;
          transition: all 0.7s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @media (min-width: 768px) {
          .slider-card {
            transform: translateX(calc(-50% + var(--diff) * 23rem)) scale(calc(1.05 - var(--abs-diff) * 0.15));
          }
        }
        @media (max-width: 767px) {
          .slider-card {
            transform: translateX(calc(-50% + var(--diff) * 16.5rem)) scale(calc(1.02 - var(--abs-diff) * 0.2));
          }
        }
      `}</style>

      <div className="max-w-[1440px] mx-auto text-center mb-16 relative z-20">
        <span className="text-primary-fixed font-bold text-xs uppercase tracking-widest bg-primary/20 px-4 py-1.5 rounded-full border border-primary-fixed/20">
          Editorial Curation
        </span>
        <h2 className="text-4xl md:text-5xl font-headline font-extrabold mt-6 mb-4 text-white">
          The Curated Collections.
        </h2>
        <p className="text-white/60 max-w-xl mx-auto text-sm md:text-base font-body leading-relaxed">
          Evocative properties selected by our editorial team. Hover &amp; click the active center card to reveal design insights.
        </p>
      </div>

      {/* Main Slider Area */}
      <div className="relative w-full h-[470px] flex items-center justify-center max-w-[1440px] mx-auto">
        
        {/* Navigation Arrows */}
        <button 
          onClick={handlePrev} 
          className="absolute left-4 md:left-12 z-30 p-4 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/10 backdrop-blur-md shadow-2xl transition-all duration-300 hover:scale-110 cursor-pointer"
          aria-label="Previous property"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <button 
          onClick={handleNext} 
          className="absolute right-4 md:right-12 z-30 p-4 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/10 backdrop-blur-md shadow-2xl transition-all duration-300 hover:scale-110 cursor-pointer"
          aria-label="Next property"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Carousel Track */}
        <div className="relative w-full h-full max-w-[1200px] flex items-center justify-center">
          {PROPERTIES.map((prop, i) => {
            const diff = i - currentIndex;
            const absDiff = Math.abs(diff);
            
            // Render maximum 3 cards in view for clean aesthetics
            if (absDiff > 2) return null;

            return (
              <div
                key={prop.id}
                onClick={() => handleCardClick(i)}
                className="slider-card w-[270px] md:w-[325px] h-[390px] md:h-[430px] perspective-1000"
                style={{
                  "--diff": diff,
                  "--abs-diff": absDiff,
                  zIndex: 10 - absDiff,
                  opacity: absDiff === 0 ? 1 : absDiff === 1 ? 0.55 : 0.15,
                  pointerEvents: absDiff === 0 ? "auto" : "none"
                } as React.CSSProperties}
              >
                {/* 3D Flip Card Container */}
                <div 
                  className={`relative w-full h-full preserve-3d duration-700 transition-transform cursor-pointer ${
                    isFlipped && diff === 0 ? "rotate-y-180" : ""
                  }`}
                >
                  {/* FRONT SIDE */}
                  <div className="absolute inset-0 w-full h-full backface-hidden rounded-2xl overflow-hidden shadow-2xl border border-white/5 bg-inverse-surface">
                    <Image
                      src={prop.image}
                      alt={prop.title}
                      fill
                      className="object-cover transition-transform duration-700 hover:scale-105"
                      sizes="(max-width: 768px) 270px, 325px"
                      priority={absDiff === 0}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
                    
                    {/* Badge */}
                    <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-primary uppercase tracking-wider flex items-center gap-1.5 shadow-md">
                      <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
                      Vibe of the Week
                    </div>

                    {/* Meta */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white text-left">
                      <span className="text-xs uppercase tracking-widest text-primary-fixed font-bold font-headline block mb-1">
                        {prop.location}
                      </span>
                      <h3 className="text-xl md:text-2xl font-headline font-extrabold leading-tight">
                        {prop.title}
                      </h3>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
                        <span className="text-sm font-semibold font-body text-white/95">
                          {prop.price}
                        </span>
                        <span className="text-[10px] uppercase font-bold tracking-widest text-primary-fixed hover:underline flex items-center gap-1">
                          Click to Flip
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* BACK SIDE */}
                  <div className="absolute inset-0 w-full h-full backface-hidden rounded-2xl overflow-hidden shadow-2xl rotate-y-180 bg-[#1d271c] border border-primary-fixed/20 p-6 flex flex-col justify-between text-left">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase tracking-widest text-primary-fixed font-bold">
                          {prop.location}
                        </span>
                        <span className="text-[10px] uppercase tracking-widest font-bold text-white/40">
                          Curator Review
                        </span>
                      </div>
                      <h3 className="text-lg md:text-xl font-headline font-bold text-white mt-1.5 leading-snug">
                        {prop.title}
                      </h3>
                      <div className="w-8 h-0.5 bg-primary-fixed mt-2.5"></div>
                      
                      <p className="text-xs md:text-sm text-white/80 font-body leading-relaxed mt-4 italic">
                        &ldquo;{prop.vibes}&rdquo;
                      </p>
                      
                      <div className="text-[11px] text-primary-fixed font-bold font-headline mt-3 bg-primary/20 px-3 py-1 rounded-md inline-block">
                        {prop.details}
                      </div>
                    </div>

                    <div className="border-t border-white/10 pt-4 flex flex-col gap-4">
                      {/* Curator Info */}
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden relative shrink-0">
                          <Image
                            src={prop.curatorAvatar}
                            alt={prop.curator}
                            fill
                            className="object-cover"
                            sizes="32px"
                          />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white leading-none">{prop.curator}</p>
                          <p className="text-[9px] text-white/40 uppercase tracking-wider font-semibold mt-0.5">Editorial Curator</p>
                        </div>
                      </div>

                      {/* Explore Button */}
                      <Link 
                        href="/search" 
                        className="w-full text-center py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-primary-fixed text-on-primary-container hover:bg-primary-fixed-dim transition-colors cursor-pointer"
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
