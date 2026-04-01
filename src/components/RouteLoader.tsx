"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname } from "next/navigation";

export default function RouteLoader() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timeout);
  }, [pathname]);

  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-surface/60 backdrop-blur-sm pointer-events-none transition-opacity duration-300">
      <div className="relative w-12 h-12">
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full border-[3px] border-outline-variant/20" />
        {/* Spinning arc */}
        <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-primary animate-spin" />
        {/* Inner glow dot */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_12px_rgba(0,110,26,0.6)]" />
      </div>
    </div>
  );
}
