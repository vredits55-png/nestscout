"use client";

import dynamic from "next/dynamic";

const LocationPickerInner = dynamic(() => import("./LocationPickerInner"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[300px] rounded-xl bg-primary/5 flex items-center justify-center animate-breathe">
      <span className="text-text-muted text-sm font-medium">Loading map...</span>
    </div>
  ),
});

interface LocationPickerProps {
  defaultLat?: number;
  defaultLng?: number;
  onLocationChange?: (lat: number, lng: number) => void;
}

export default function LocationPicker(props: LocationPickerProps) {
  return <LocationPickerInner {...props} />;
}
