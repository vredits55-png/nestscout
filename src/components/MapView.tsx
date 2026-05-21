"use client";

import dynamic from "next/dynamic";

const MapInner = dynamic(() => import("./MapInner"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full rounded-2xl skeleton" />
  ),
});

interface MapViewProps {
  properties: Array<{
    id: string;
    title: string;
    latitude: number;
    longitude: number;
    price_per_month: number;
    images?: string[];
    city: string;
  }>;
  center?: [number, number];
  zoom?: number;
  onBoundsChange?: (bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  }) => void;
  interactive?: boolean;
}

export default function MapView(props: MapViewProps) {
  return <MapInner {...props} />;
}
