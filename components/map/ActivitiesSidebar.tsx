"use client";

// Scrollable list of the activities shown on the map. Hovering (or focusing) one highlights its dot on the map,
// and tapping one opens its details in place.
import { useState } from "react";
import Link from "next/link";
import { newEventForActivityHref } from "@/lib/events";
import type { Activity } from "@/lib/types";

const categoryLabels: Record<Activity["category"], string> = {
  outdoor: "Outdoor",
  indoor: "Indoor",
  food: "Food & treats",
  weekend: "Weekend events",
};

type Props = {
  activities: Activity[];
  openId: string | null;
  onOpen: (id: string | null) => void;
  onHover: (id: string | null) => void;
};

// Only http(s) links are shown, so a bad value can never become a javascript: link.
function safeWebsiteUrl(value?: string | null) {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}

export default function ActivitiesSidebar({ activities, openId, onOpen, onHover }: Props) {
  const [hidden, setHidden] = useState(false);

  if (hidden) {
    return (
      <button
        type="button"
        onClick={() => setHidden(false)}
        className="mt-3 rounded-full bg-emerald-900 px-4 py-2 text-sm font-bold text-amber-50 hover:bg-emerald-800 md:absolute md:right-3 md:top-3 md:z-[900] md:mt-0"
      >
        Show activities ({activities.length})
      </button>
    );
  }

  return (
    <aside
      aria-label="Activities"
      className="mt-3 flex max-h-[28rem] flex-col overflow-hidden rounded-2xl border-2 border-emerald-900 bg-amber-50 shadow-lg md:absolute md:bottom-3 md:right-3 md:top-3 md:z-[900] md:mt-0 md:max-h-none md:w-80"
    >
      <div className="flex items-center justify-between gap-2 border-b border-emerald-900/20 px-4 py-3">
        <h2 className="font-extrabold">Activities ({activities.length})</h2>
        <button type="button" onClick={() => setHidden(true)} className="text-sm font-bold text-emerald-700 underline">Hide</button>
      </div>
      <ul className="min-h-0 flex-1 overflow-y-auto">
        {activities.map((activity) => {
          const open = openId === activity.id;
          const websiteUrl = safeWebsiteUrl(activity.website_url);
          return (
            <li
              key={activity.id}
              className={`border-b border-emerald-900/10 ${open ? "bg-emerald-100/60" : ""}`}
              onMouseEnter={() => onHover(activity.id)}
              onMouseLeave={() => onHover(null)}
              onFocus={() => onHover(activity.id)}
              onBlur={() => onHover(null)}
            >
              <button
                type="button"
                aria-expanded={open}
                onClick={() => onOpen(open ? null : activity.id)}
                className="block w-full px-4 py-3 text-left hover:bg-emerald-100/60 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-emerald-700"
              >
                <span className="block font-bold">{activity.name}</span>
                <span className="mt-1 block text-xs font-bold text-emerald-700">{categoryLabels[activity.category]}</span>
              </button>
              {open && (
                <div className="px-4 pb-4 text-sm text-emerald-900/80">
                  <p>{activity.description || "More details coming soon."}</p>
                  {activity.address && <p className="mt-2">{activity.address}</p>}
                  {websiteUrl && (
                    <a href={websiteUrl} target="_blank" rel="noopener noreferrer" className="mt-2 block font-bold text-emerald-700 underline">Visit website</a>
                  )}
                  <Link
                    href={newEventForActivityHref(activity.id)}
                    className="mt-3 inline-block rounded-full bg-emerald-900 px-4 py-2 font-bold text-amber-50 hover:bg-emerald-800"
                  >
                    Create an event
                  </Link>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
