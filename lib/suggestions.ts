// Rules for suggesting an activity. The database enforces the same limits (see supabase/schema.sql).
import type { ActivityCategory } from "@/lib/types";

export const REXBURG = { lat: 43.826, lon: -111.7897 };
export const MAX_DISTANCE_KM = 300;
export const MAX_PENDING = 5;

export const NAME_MAX = 100;
export const DESCRIPTION_MAX = 1000;
export const ADDRESS_MAX = 200;
export const URL_MAX = 500;
export const REASON_MAX = 300;

export const categoryOptions: Array<{ value: ActivityCategory; label: string }> = [
  { value: "outdoor", label: "Outdoor" },
  { value: "indoor", label: "Indoor" },
  { value: "food", label: "Food & treats" },
  { value: "weekend", label: "Weekend events" },
];

/** Distance in km between two points (haversine). */
export function distanceKm(aLat: number, aLon: number, bLat: number, bLon: number) {
  const rad = Math.PI / 180;
  const h =
    Math.sin(((bLat - aLat) * rad) / 2) ** 2 +
    Math.cos(aLat * rad) * Math.cos(bLat * rad) * Math.sin(((bLon - aLon) * rad) / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

export function isNearRexburg(lat: number, lon: number) {
  return distanceKm(lat, lon, REXBURG.lat, REXBURG.lon) <= MAX_DISTANCE_KM;
}

export function validateActivityName(value: string) {
  const name = value.trim();
  if (!name) return "Please give the place or activity a name.";
  if (name.length > NAME_MAX) return `Keep the name under ${NAME_MAX} characters.`;
  return null;
}

export function validateDescription(value: string) {
  if (value.trim().length > DESCRIPTION_MAX) return `Keep the description under ${DESCRIPTION_MAX} characters.`;
  return null;
}

export function validateAddress(value: string) {
  if (value.trim().length > ADDRESS_MAX) return `Keep the address under ${ADDRESS_MAX} characters.`;
  return null;
}

/** Optional link. Pass httpsOnly for photos (the database requires https there). */
export function validateUrl(value: string, httpsOnly = false) {
  const text = value.trim();
  if (!text) return null;
  if (text.length > URL_MAX) return "That link is too long.";
  try {
    const url = new URL(text);
    if (url.protocol === "https:") return null;
    if (url.protocol === "http:" && !httpsOnly) return null;
  } catch {
    // falls through to the message below
  }
  return httpsOnly ? "Use a link that starts with https://" : "Use a full link, like https://example.com";
}

export function validateLocation(point: { lat: number; lon: number } | null) {
  if (!point) return "Tap the map to drop a pin where it is.";
  if (!isNearRexburg(point.lat, point.lon)) return `Pick a spot within ${MAX_DISTANCE_KM} km of Rexburg.`;
  return null;
}
