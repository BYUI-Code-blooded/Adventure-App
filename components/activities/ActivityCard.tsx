"use client";

import { useState } from "react";
import type { Activity } from "@/lib/types";

function safeWebsiteUrl(value?: string | null) {
  if (!value) return undefined;

  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}

export default function ActivityCard({ activity }: { activity: Activity }) {
  const [imageFailed, setImageFailed] = useState(false);
  const websiteUrl = safeWebsiteUrl(activity.website_url);
  const categoryLabel = activity.category.charAt(0).toUpperCase() + activity.category.slice(1);

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl bg-amber-50 shadow-sm">
      {activity.photo_url && !imageFailed ? (
        // Use the browser image element so database photo URLs do not need Next image host config.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={activity.photo_url}
          alt={activity.name}
          loading="lazy"
          decoding="async"
          onError={() => setImageFailed(true)}
          className="aspect-video w-full object-cover"
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
