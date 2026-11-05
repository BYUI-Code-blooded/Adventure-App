"use client";

// Small Leaflet map where the user taps to drop the pin for a suggested activity.
import "leaflet/dist/leaflet.css";
import { CircleMarker, MapContainer, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { useEffect } from "react";
import { REXBURG } from "@/lib/suggestions";

export type Point = { lat: number; lon: number };

function ClickHandler({ onPick }: { onPick: (point: Point) => void }) {
  useMapEvents({
    click(event) {
      onPick({ lat: event.latlng.lat, lon: event.latlng.lng });
    },
  });
  return null;
}

function RecenterMap({ value, recenterKey, enabled }: { value: Point | null; recenterKey: number; enabled: boolean }) {
  const map = useMap();

  useEffect(() => {
    if (enabled && value) map.panTo([value.lat, value.lon]);
  }, [enabled, map, recenterKey, value]);

  return null;
}

export default function LocationPicker({ value, onChange, centerOnValue = false, recenterKey = 0 }: { value: Point | null; onChange: (point: Point) => void; centerOnValue?: boolean; recenterKey?: number }) {
  return (
    <MapContainer center={centerOnValue && value ? [value.lat, value.lon] : [REXBURG.lat, REXBURG.lon]} zoom={13} scrollWheelZoom className="h-72 w-full md:h-96">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickHandler onPick={onChange} />
      <RecenterMap value={value} recenterKey={recenterKey} enabled={centerOnValue} />
      {value && (
        <CircleMarker
          center={[value.lat, value.lon]}
          pathOptions={{ color: "#064e3b", fillColor: "#fcd34d", fillOpacity: 0.95 }}
          radius={11}
        />
      )}
    </MapContainer>
  );
}
