// Distance helpers for the map's distance slider.

export type LatLon = { lat: number; lon: number };

// Center of Rexburg (near BYU-Idaho). Distances are measured from here unless the visitor shares their location.
export const REXBURG_CENTER: LatLon = { lat: 43.826, lon: -111.7897 };

const EARTH_RADIUS_MILES = 3958.8;

function toRadians(degrees: number) {
  return (degrees * Math.PI) / 180;
}

/** Straight-line distance in miles between two points (haversine formula). */
export function distanceMiles(a: LatLon, b: LatLon) {
  const dLat = toRadians(b.lat - a.lat);
  const dLon = toRadians(b.lon - a.lon);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(a.lat)) * Math.cos(toRadians(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_MILES * Math.asin(Math.sqrt(h));
}
