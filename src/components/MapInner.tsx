"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

interface MapInnerProps {
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

function createPinIcon(price: number) {
  const label = price >= 1000 ? `${(price / 1000).toFixed(0)}k` : `${price}`;
  return L.divIcon({
    className: "custom-map-pin",
    html: `
      <div style="
        background: linear-gradient(135deg, #0F766E, #14B8A6);
        color: white;
        padding: 4px 8px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 700;
        font-family: 'Josefin Sans', sans-serif;
        box-shadow: 0 2px 8px rgba(15, 118, 110, 0.4);
        white-space: nowrap;
        cursor: pointer;
        transition: all 0.3s ease;
      ">
        ₹${label}
      </div>
    `,
    iconSize: [50, 24],
    iconAnchor: [25, 12],
  });
}

function BoundsTracker({
  onBoundsChange,
}: {
  onBoundsChange?: MapInnerProps["onBoundsChange"];
}) {
  useMapEvents({
    moveend: (e) => {
      if (!onBoundsChange) return;
      const bounds = e.target.getBounds();
      onBoundsChange({
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest(),
      });
    },
  });
  return null;
}

function MapResizer() {
  const map = useMap();
  useEffect(() => {
    // Invalidate size immediately
    map.invalidateSize();
    
    // Invalidate size after short delays to ensure parent animations and layout transitions have finished
    const timer1 = setTimeout(() => {
      map.invalidateSize();
    }, 150);
    
    const timer2 = setTimeout(() => {
      map.invalidateSize();
    }, 500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [map]);
  return null;
}

export default function MapInner({
  properties,
  center = [40.7128, -74.006],
  zoom = 12,
  onBoundsChange,
  interactive = true,
}: MapInnerProps) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      minZoom={3}
      maxBounds={[
        [-90, -180],
        [90, 180]
      ]}
      maxBoundsViscosity={1.0}
      className="w-full h-full rounded-2xl z-0 bg-[#AAD3DF]"
      zoomControl={false}
      scrollWheelZoom={false}
      dragging={interactive}
      doubleClickZoom={interactive}
      touchZoom={interactive}
      boxZoom={interactive}
      keyboard={interactive}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        noWrap={true}
      />
      <BoundsTracker onBoundsChange={onBoundsChange} />
      <MapResizer />

      {properties.map((property) => (
        <Marker
          key={property.id}
          position={[property.latitude, property.longitude]}
          icon={createPinIcon(property.price_per_month)}
        >
          {interactive && (
            <Popup>
              <Link
                href={`/properties/${property.id}`}
                className="block cursor-pointer group"
              >
                <div className="min-w-[200px]">
                  {property.images?.[0] && (
                    <div className="h-28 overflow-hidden rounded-t-lg">
                      <img
                        src={property.images[0]}
                        alt={property.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}
                  <div className="p-3">
                    <h4
                      className="font-semibold text-sm mb-1 group-hover:text-[#0F766E] transition-colors"
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      {property.title}
                    </h4>
                    <p className="text-xs text-gray-500">{property.city}</p>
                    <p className="text-sm font-bold mt-1" style={{ color: "#0F766E" }}>
                      {formatCurrency(property.price_per_month)}/mo
                    </p>
                  </div>
                </div>
              </Link>
            </Popup>
          )}
        </Marker>
      ))}
    </MapContainer>
  );
}
