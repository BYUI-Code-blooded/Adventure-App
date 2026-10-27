"use client";

// Small Leaflet map where the user taps to drop the pin for a suggested activity.
import "leaflet/dist/leaflet.css";
import { CircleMarker, MapContainer, TileLayer, useMapEvents } from "react-leaflet";
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

export default function LocationPicker({ value, onChange }: { value: Point | null; onChange: (point: Point) => void }) {
  return (
    <MapContainer center={[REXBURG.lat, REXBURG.lon]} zoom={13} scrollWheelZoom className="h-72 w-full md:h-96">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickHandler onPick={onChange} />
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
