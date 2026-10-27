"use client";

import "leaflet/dist/leaflet.css";
import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";
import type { Activity } from "@/lib/types";

const rexburgCenter: [number, number] = [43.826, -111.7897];

function safeWebsiteUrl(value?: string | null) {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}

export default function LeafletMap({ activities }: { activities: Activity[] }) {
  return (
    <div className="mt-4 overflow-hidden rounded-2xl border-2 border-emerald-900 bg-emerald-900">
      <MapContainer center={rexburgCenter} zoom={13} scrollWheelZoom className="h-[65svh] min-h-112 w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {activities.map((activity) => {
          const websiteUrl = safeWebsiteUrl(activity.website_url);
          return (
            <CircleMarker key={activity.id} center={[activity.lat, activity.lon]} pathOptions={{ color: "#064e3b", fillColor: "#fcd34d", fillOpacity: 0.95 }} radius={9}>
              <Popup>
                <div className="min-w-44 text-emerald-950">
                  <h2 className="font-bold">{activity.name}</h2>
                  <p className="mt-1 text-sm">{activity.description || "More details coming soon."}</p>
                  {activity.address && <p className="mt-2 text-sm">{activity.address}</p>}
                  {websiteUrl && <a className="mt-3 inline-block font-bold text-emerald-700 underline" href={websiteUrl} target="_blank" rel="noopener noreferrer">Visit website</a>}
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
