"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Circle, CircleMarker, MapContainer, Popup, TileLayer, useMap, useMapEvents } from "react-leaflet";
import type { EventWithCount } from "@/components/events/useEvents";
import { formatEventTime, formatSpots, newEventAtPointHref, newEventForActivityHref } from "@/lib/events";
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

// Leaflet's own styles color popup links, so the text color here needs ! to win.
const popupLinkClass = "mt-3 inline-block rounded-full bg-emerald-900 px-4 py-2 font-bold text-amber-50! hover:bg-emerald-800";

const METERS_PER_MILE = 1609.344;

// Shows the distance range from the slider as a circle that grows and shrinks with it (the map zoom is left alone).
// The outer circle is the maximum distance; when a minimum is set, an inner cream circle makes a ring.
// maxMiles is null when the slider is at its open-ended end, so no outer circle is drawn then.
function DistanceCircle({ center, minMiles, maxMiles }: { center: [number, number]; minMiles: number; maxMiles: number | null }) {
  const map = useMap();
  const [lat, lon] = center;

  // Only the starting point moves the map (pan, never zoom). The slider just redraws the circle,
  // so the zoom level the visitor chose stays put.
  useEffect(() => {
    map.panTo([lat, lon]);
  }, [map, lat, lon]);

  return (
    <>
      {maxMiles !== null && (
        <Circle center={center} radius={maxMiles * METERS_PER_MILE} interactive={false} pathOptions={{ color: "#047857", weight: 2, dashArray: "6 6", fillColor: "#047857", fillOpacity: 0.12 }} />
      )}
      {minMiles > 0 && (
        <Circle center={center} radius={minMiles * METERS_PER_MILE} interactive={false} pathOptions={{ color: "#047857", weight: 2, dashArray: "6 6", fillColor: "#fffbeb", fillOpacity: 0.6 }} />
      )}
      <CircleMarker center={center} radius={5} interactive={false} pathOptions={{ color: "#fffbeb", weight: 2, fillColor: "#047857", fillOpacity: 1 }} />
    </>
  );
}

// Tapping the map drops a pin with a link to the event form. Going straight to the form would
// fire on every stray tap, including the one that closes a popup.
function DropPin() {
  const [point, setPoint] = useState<{ lat: number; lon: number } | null>(null);
  useMapEvents({
    click(event) {
      setPoint({ lat: event.latlng.lat, lon: event.latlng.lng });
    },
  });
  if (!point) return null;

  return (
    <>
      <CircleMarker center={[point.lat, point.lon]} pathOptions={{ color: "#064e3b", fillColor: "#047857", fillOpacity: 0.95 }} radius={11} interactive={false} />
      <Popup key={`${point.lat},${point.lon}`} position={[point.lat, point.lon]}>
        <div className="min-w-44 text-emerald-950">
          <h2 className="font-bold">Plan something here?</h2>
          <Link className={popupLinkClass} href={newEventAtPointHref(point)}>Create an event here</Link>
        </div>
      </Popup>
    </>
  );
}

type Props = {
  activities: Activity[];
  events: EventWithCount[];
  center?: [number, number]; // where distances are measured from; defaults to central Rexburg
  minMiles?: number;
  maxMiles?: number | null; // null = no upper limit
};

export default function LeafletMap({ activities, events, center = rexburgCenter, minMiles = 0, maxMiles = null }: Props) {
  return (
    <div className="mt-4 overflow-hidden rounded-2xl border-2 border-emerald-900 bg-emerald-900">
      <MapContainer center={rexburgCenter} zoom={13} scrollWheelZoom className="h-[65svh] min-h-112 w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <DistanceCircle center={center} minMiles={minMiles} maxMiles={maxMiles} />
        {activities.map((activity) => {
          const websiteUrl = safeWebsiteUrl(activity.website_url);
          return (
            <CircleMarker key={activity.id} center={[activity.lat, activity.lon]} bubblingMouseEvents={false} pathOptions={{ color: "#064e3b", fillColor: "#fcd34d", fillOpacity: 0.95 }} radius={9}>
              <Popup>
                <div className="min-w-44 text-emerald-950">
                  <h2 className="font-bold">{activity.name}</h2>
                  <p className="mt-1 text-sm">{activity.description || "More details coming soon."}</p>
                  {activity.address && <p className="mt-2 text-sm">{activity.address}</p>}
                  {websiteUrl && <a className="mt-3 block font-bold text-emerald-700 underline" href={websiteUrl} target="_blank" rel="noopener noreferrer">Visit website</a>}
                  <Link className={popupLinkClass} href={newEventForActivityHref(activity.id)}>Create an event</Link>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
        {events.map((event) => event.lat !== null && event.lon !== null && (
          <CircleMarker key={event.id} center={[event.lat, event.lon]} bubblingMouseEvents={false} pathOptions={{ color: "#fcd34d", fillColor: "#064e3b", fillOpacity: 0.95, weight: 3 }} radius={11}>
            <Popup>
              <div className="min-w-44 text-emerald-950">
                <h2 className="font-bold">{event.name}</h2>
                <p className="mt-1 text-sm font-semibold">{formatEventTime(event.start_time, event.end_time)}</p>
                <p className="mt-1 text-sm">{formatSpots(event.going, event.max_participants)}</p>
                <a className="mt-3 inline-block font-bold text-emerald-700 underline" href={`#event-${event.id}`}>See details</a>
              </div>
            </Popup>
          </CircleMarker>
        ))}
        <DropPin />
      </MapContainer>
    </div>
  );
}
