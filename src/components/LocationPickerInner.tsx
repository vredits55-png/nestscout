"use client";

import { useState, useCallback } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Navigation, MapPin } from "lucide-react";

const pinIcon = L.divIcon({
  className: "custom-location-pin",
  html: `<div style="
    width: 32px; height: 32px;
    background: linear-gradient(135deg, #0F766E, #2DD4BF);
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    box-shadow: 0 4px 15px rgba(15, 118, 110, 0.5);
    display: flex; align-items: center; justify-content: center;
  "><div style="
    width: 10px; height: 10px;
    background: white;
    border-radius: 50%;
    transform: rotate(45deg);
  "></div></div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

interface LocationPickerInnerProps {
  defaultLat?: number;
  defaultLng?: number;
  onLocationChange?: (lat: number, lng: number) => void;
}

function MapClickHandler({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function LocationPickerInner({
  defaultLat = 28.6139,
  defaultLng = 77.2090,
  onLocationChange,
}: LocationPickerInnerProps) {
  const [position, setPosition] = useState<[number, number]>([defaultLat, defaultLng]);
  const [locating, setLocating] = useState(false);

  const handleLocationSelect = useCallback((lat: number, lng: number) => {
    setPosition([lat, lng]);
    onLocationChange?.(lat, lng);
  }, [onLocationChange]);

  function useMyLocation() {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        handleLocationSelect(lat, lng);
        setLocating(false);
      },
      () => {
        setLocating(false);
        alert("Could not get your location. Please allow location access.");
      },
      { enableHighAccuracy: true }
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={useMyLocation}
          disabled={locating}
          className="btn btn-ghost btn-sm cursor-pointer flex items-center gap-2"
        >
          <Navigation className={`w-4 h-4 ${locating ? "animate-spin" : ""}`} />
          {locating ? "Locating..." : "Use My Location"}
        </button>
        <span className="text-xs text-text-muted">or click on the map to set location</span>
      </div>

      <div className="rounded-xl overflow-hidden border-2 border-primary/20 shadow-sm" style={{ height: 300 }}>
        <MapContainer
          center={position}
          zoom={13}
          className="w-full h-full z-0"
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={position} icon={pinIcon} />
          <MapClickHandler onLocationSelect={handleLocationSelect} />
        </MapContainer>
      </div>

      <div className="flex items-center gap-2 text-xs text-text-muted font-medium">
        <MapPin className="w-3.5 h-3.5 text-primary" />
        <span>Lat: {position[0].toFixed(4)}, Lng: {position[1].toFixed(4)}</span>
      </div>
    </div>
  );
}
