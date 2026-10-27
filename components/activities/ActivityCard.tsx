"use client";

import { useEffect, useState } from "react";
import { getFoodOpenStatus } from "@/lib/food-hours";
import type { Activity } from "@/lib/types";

type FoodImage = { src: string; fit: "cover" | "contain" };

// Use location photos where available. Brand marks are the fallback for chain
// locations where a verified Rexburg photo was not available.
const foodImages: { match: RegExp; images: FoodImage[] }[] = [
  { match: /chick\s*[- ]?\s*fil|chick\s*[- ]?\s*flo/i, images: [
    { src: "https://cdn6.localdatacdn.com/images/5541950/d_chick_fil_a_photo.jpg", fit: "cover" },
    { src: "https://www.google.com/s2/favicons?domain=chick-fil-a.com&sz=256", fit: "contain" },
  ] },
  { match: /pizza\s*pie\s*cafe/i, images: [
    { src: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0b/e6/63/60/20160708-192430-largejpg.jpg?h=-1&s=1&w=1400", fit: "cover" },
    { src: "https://www.google.com/s2/favicons?domain=pizzapiecafe.co&sz=256", fit: "contain" },
  ] },
  { match: /big\s*jud/i, images: [
    { src: "https://s6.localdatacdn.com/images/3427115/m_big_jud_s_photo.jpg", fit: "cover" },
    { src: "https://www.google.com/s2/favicons?domain=bigjuds.com&sz=256", fit: "contain" },
  ] },
  { match: /hickory/i, images: [
    { src: "https://i.autoreserve.com/thumb/800x800/restaurant_image/image/045/299/450/45299450/f4f8bc52-c7bc-4211-bdcf-6fb5060b6347.jpg?format=webp", fit: "cover" },
    { src: "https://www.google.com/s2/favicons?domain=thehickory.com&sz=256", fit: "contain" },
  ] },
  { match: /mac\s*shack/i, images: [
    { src: "https://cdn6.localdatacdn.com/images/9438292/d_the_mac_shack_photo.jpg", fit: "cover" },
    { src: "https://img.cdn4dd.com/cdn-cgi/image/fit%3Dcontain%2Cwidth%3D1200%2Cheight%3D672%2Cformat%3Dauto/https%3A/doordash-static.s3.amazonaws.com/media/restaurant/cover/74c94d28-8477-4cf0-b7cf-08550a998a7e.jpg", fit: "contain" },
    { src: "https://www.google.com/s2/favicons?domain=doordash.com&sz=256", fit: "contain" },
  ] },
  { match: /little\s*caesar/i, images: [
    { src: "https://www.google.com/s2/favicons?domain=littlecaesars.com&sz=256", fit: "contain" },
  ] },
  { match: /mcdonald/i, images: [
    { src: "https://www.google.com/s2/favicons?domain=mcdonalds.com&sz=256", fit: "contain" },
  ] },
  { match: /freddy/i, images: [
    { src: "https://i1.sndcdn.com/artworks-000210602919-xnspqe-t1080x1080.jpg", fit: "cover" },
    { src: "https://www.google.com/s2/favicons?domain=freddys.com&sz=256", fit: "contain" },
  ] },
  { match: /dairy\s*queen|\bdq\b/i, images: [
    { src: "https://www.google.com/s2/favicons?domain=dairyqueen.com&sz=256", fit: "contain" },
  ] },
];

function getFoodImages(name: string, websiteUrl?: string | null): FoodImage[] {
  const curated = foodImages.find(({ match }) => match.test(name))?.images ?? [];
  const domain = websiteUrl ? safeWebsiteUrl(websiteUrl) : undefined;
  const logo = domain
    ? [{ src: `https://www.google.com/s2/favicons?domain=${encodeURIComponent(new URL(domain).hostname)}&sz=256`, fit: "contain" as const }]
    : [];
  return [...curated, ...logo];
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

export default function ActivityCard({ activity }: { activity: Activity }) {
  const [imageFailed, setImageFailed] = useState(false);
  const [foodImageIndex, setFoodImageIndex] = useState(0);
  const websiteUrl = safeWebsiteUrl(activity.website_url);
  const categoryLabel = activity.category.charAt(0).toUpperCase() + activity.category.slice(1);
  const foodImageCandidates = getFoodImages(activity.name, activity.website_url);
  const foodImage = foodImageCandidates[foodImageIndex];
  const imageUrl = activity.photo_url && !imageFailed
    ? activity.photo_url
    : activity.category === "food" ? foodImage?.src : undefined;

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl bg-amber-50 shadow-sm">
      {imageUrl ? (
        // Use the browser image element so database photo URLs do not need Next image host config.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt={activity.name}
          loading="lazy"
          decoding="async"
          onError={() => {
            if (activity.photo_url && !imageFailed) setImageFailed(true);
            else setFoodImageIndex((index) => index + 1);
          }}
          className={`aspect-video w-full bg-white ${foodImage?.fit === "contain" && (!activity.photo_url || imageFailed) ? "object-contain p-10" : "object-cover"}`}
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
