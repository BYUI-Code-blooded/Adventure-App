"use client";

import { useEffect, useState } from "react";
import { getFoodOpenStatus } from "@/lib/food-hours";
import type { Activity } from "@/lib/types";

// Brand mark from the restaurant's website, used when the row has no working photo_url.
function getWebsiteLogo(websiteUrl?: string | null) {
  const url = safeWebsiteUrl(websiteUrl);
  return url
    ? `https://www.google.com/s2/favicons?domain=${encodeURIComponent(new URL(url).hostname)}&sz=256`
    : undefined;
}

function safeWebsiteUrl(value?: string | null) {
  if (!value) return undefined;

  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}

function useFoodOpenStatus(hours: Activity["weekly_hours"]) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const update = () => setNow(new Date());
    update();
    const interval = window.setInterval(update, 60_000);
    return () => window.clearInterval(interval);
  }, []);

  return getFoodOpenStatus(hours, now);
}

function FoodDetails({ activity }: { activity: Activity }) {
  const status = useFoodOpenStatus(activity.weekly_hours);
  const mapsUrl = safeWebsiteUrl(activity.google_maps_url);
  const checkedAt = activity.google_rating_checked_at
    ? new Date(`${activity.google_rating_checked_at}T12:00:00`).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : null;

  return (
    <div className="mt-4 space-y-2 rounded-xl border border-emerald-900/10 bg-white/70 p-4 text-sm">
      <p className={status.open === true ? "font-bold text-emerald-700" : "font-semibold text-stone-600"}>
        <span aria-hidden="true">{status.open === true ? "●" : status.open === false ? "●" : "◷"}</span>{" "}{status.label}
      </p>
      <p className="text-emerald-950">
        <span className="font-semibold">Delivery: </span>
        {activity.delivery_available == null ? "Check with restaurant" : activity.delivery_available ? "Available (address/coverage may vary)" : "No delivery listed"}
      </p>
      <p className="text-emerald-950">
        <span className="font-semibold">From BYU-I: </span>
        {activity.walkable_from_campus == null ? "Distance not verified" : activity.walkable_from_campus ? "Walkable" : "Driving recommended"}
      </p>
      {activity.google_rating != null && (
        <p className="text-emerald-950">
          {mapsUrl ? (
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="font-bold underline decoration-emerald-500 underline-offset-2 hover:text-emerald-700">
              ★ {activity.google_rating.toFixed(1)} Google Maps
            </a>
          ) : (
            <span className="font-bold">★ {activity.google_rating.toFixed(1)} Google Maps</span>
          )}
          {checkedAt && <span className="ml-1 text-xs text-emerald-900/60">(checked {checkedAt})</span>}
        </p>
      )}
    </div>
  );
}

export default function ActivityCard({ activity, showPhoto }: { activity: Activity; showPhoto: boolean }) {
  const [imageFailed, setImageFailed] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);
  const websiteUrl = safeWebsiteUrl(activity.website_url);
  const categoryLabel = activity.category.charAt(0).toUpperCase() + activity.category.slice(1);
  const usingPhoto = Boolean(activity.photo_url) && !imageFailed;
  const logoUrl = activity.category === "food" && !logoFailed ? getWebsiteLogo(activity.website_url) : undefined;
  const imageUrl = usingPhoto ? activity.photo_url : logoUrl;

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl bg-amber-50 shadow-sm">
      {!showPhoto ? null : imageUrl ? (
        // Use the browser image element so database photo URLs do not need Next image host config.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt={activity.name}
          loading="lazy"
          decoding="async"
          onError={() => (usingPhoto ? setImageFailed(true) : setLogoFailed(true))}
          className={`aspect-video w-full bg-white ${usingPhoto ? "object-cover" : "object-contain p-10"}`}
        />
      ) : (
        <div
          role="img"
          aria-label={`Photo unavailable for ${activity.name}`}
          className="grid aspect-video w-full place-items-center bg-emerald-900 px-4 text-center text-amber-300"
        >
          <span className="rounded-full border border-amber-300/60 px-4 py-2 text-sm font-bold">
            {categoryLabel} activity
          </span>
        </div>
      )}
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-bold">{activity.name}</h3>
          {activity.is_featured && (
            <span className="shrink-0 rounded-full bg-amber-300 px-3 py-1 text-xs font-bold text-emerald-950">
              Featured
            </span>
          )}
        </div>
        <p className="mt-2 flex-1 text-emerald-900/80">
          {activity.description || "More details coming soon."}
        </p>
        {activity.address && (
          <address className="mt-4 not-italic text-sm text-emerald-900/80">
            <span className="font-bold text-emerald-700">Address: </span>
            {activity.address}
          </address>
        )}
        {activity.category === "food" && <FoodDetails activity={activity} />}
        {websiteUrl && (
          <a
            href={websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex min-h-11 items-center self-start rounded-full bg-emerald-900 px-5 py-2 font-bold text-amber-50 hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
          >
            Visit website
          </a>
        )}
      </div>
    </article>
  );
}
