"use client";

import { useEffect, useMemo, useState } from "react";
import ActivityCard from "@/components/activities/ActivityCard";
import { getFoodOpenStatus } from "@/lib/food-hours";
import type { Activity, ActivityCategory } from "@/lib/types";

type ActivitiesGridProps = {
  activities: Activity[];
  category: ActivityCategory;
  loading: boolean;
  error: boolean;
  onRetry: () => void;
};

type TriStateFilter = "any" | "yes" | "no" | "unknown";

export default function ActivitiesGrid({
  activities,
  category,
  loading,
  error,
  onRetry,
}: ActivitiesGridProps) {
  const [search, setSearch] = useState("");
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [walkable, setWalkable] = useState<TriStateFilter>("any");
  const [delivery, setDelivery] = useState<TriStateFilter>("any");
  const [openNowOnly, setOpenNowOnly] = useState(false);
  const [minimumRating, setMinimumRating] = useState("any");
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    if (category !== "food") return;
    const interval = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(interval);
  }, [category]);

  const normalizedSearch = search.trim().toLocaleLowerCase();
  const visibleActivities = useMemo(
    () => activities.filter((activity) => {
      const matchesSearch = !normalizedSearch ||
        `${activity.name} ${activity.description ?? ""}`.toLocaleLowerCase().includes(normalizedSearch);
      const matchesTriState = (value: boolean | null | undefined, filter: TriStateFilter) =>
        filter === "any" || (filter === "yes" && value === true) ||
        (filter === "no" && value === false) || (filter === "unknown" && value == null);
      const matchesFoodFilters = category !== "food" || (
        matchesTriState(activity.walkable_from_campus, walkable) &&
        matchesTriState(activity.delivery_available, delivery) &&
        (!openNowOnly || getFoodOpenStatus(activity.weekly_hours, now).open === true) &&
        (minimumRating === "any" || (activity.google_rating != null && activity.google_rating >= Number(minimumRating)))
      );
      return matchesSearch && (!featuredOnly || activity.is_featured) && matchesFoodFilters;
    }),
    [activities, category, delivery, featuredOnly, minimumRating, normalizedSearch, now, openNowOnly, walkable],
  );

  const resetFilters = () => {
    setSearch("");
    setFeaturedOnly(false);
    setWalkable("any");
    setDelivery("any");
    setOpenNowOnly(false);
    setMinimumRating("any");
  };

  if (loading) {
    return (
      <p role="status" className="rounded-2xl bg-amber-50 p-6 text-emerald-900/80 shadow-sm">
        Loading {category} activities…
      </p>
    );
  }

  if (error) {
    return (
      <div role="alert" className="rounded-2xl bg-amber-50 p-6 shadow-sm">
        <p className="text-emerald-900/80">We couldn&apos;t load activities right now. Please try again.</p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 min-h-11 rounded-full bg-emerald-900 px-5 py-2 font-bold text-amber-50 hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
        >
          Try again
        </button>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <p className="rounded-2xl bg-amber-50 p-6 text-emerald-900/80 shadow-sm">
        No {category} activities have been added yet. Check back soon.
      </p>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-4 rounded-2xl border border-emerald-900/10 bg-amber-50 p-4 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="w-full sm:max-w-md">
          <label htmlFor={`${category}-activity-search`} className="mb-2 block text-sm font-bold text-emerald-700">
            Search activities
          </label>
          <input
            id={`${category}-activity-search`}
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name or description"
            className="w-full rounded-full border-2 border-emerald-900 bg-amber-50 px-5 py-3 text-emerald-950 placeholder:text-emerald-900/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
          />
          </div>
          <label className="flex min-h-11 items-center gap-3 font-semibold text-emerald-950">
            <input
              type="checkbox"
              checked={featuredOnly}
              onChange={(event) => setFeaturedOnly(event.target.checked)}
              className="size-5 accent-emerald-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
            />
            Featured only
          </label>
        </div>
        {category === "food" && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <label className="text-sm font-bold text-emerald-800">
              From BYU-I
              <select value={walkable} onChange={(event) => setWalkable(event.target.value as TriStateFilter)} className="mt-1 min-h-11 w-full rounded-xl border border-emerald-900/25 bg-white px-3 font-medium text-emerald-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700">
                <option value="any">Any distance</option><option value="yes">Walkable</option><option value="no">Driving recommended</option><option value="unknown">Not listed</option>
              </select>
            </label>
            <label className="text-sm font-bold text-emerald-800">
              Google rating
              <select value={minimumRating} onChange={(event) => setMinimumRating(event.target.value)} className="mt-1 min-h-11 w-full rounded-xl border border-emerald-900/25 bg-white px-3 font-medium text-emerald-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700">
                <option value="any">Any rating</option><option value="3">3.0+ stars</option><option value="3.5">3.5+ stars</option><option value="4">4.0+ stars</option><option value="4.5">4.5+ stars</option>
              </select>
            </label>
            <label className="text-sm font-bold text-emerald-800">
              Delivery
              <select value={delivery} onChange={(event) => setDelivery(event.target.value as TriStateFilter)} className="mt-1 min-h-11 w-full rounded-xl border border-emerald-900/25 bg-white px-3 font-medium text-emerald-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700">
                <option value="any">Any</option><option value="yes">Available</option><option value="no">Not available</option><option value="unknown">Not listed</option>
              </select>
            </label>
            <div className="flex items-end justify-between gap-3">
              <label className="flex min-h-11 items-center gap-2 font-semibold text-emerald-950">
                <input type="checkbox" checked={openNowOnly} onChange={(event) => setOpenNowOnly(event.target.checked)} className="size-5 accent-emerald-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700" />
                Open now
              </label>
              <button type="button" onClick={resetFilters} className="min-h-11 px-2 text-sm font-bold text-emerald-800 underline underline-offset-2 hover:text-emerald-600">Clear filters</button>
            </div>
          </div>
        )}
      </div>

      {visibleActivities.length > 0 ? (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {visibleActivities.map((activity) => (
            <li key={activity.id}>
              <ActivityCard activity={activity} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-8 rounded-2xl bg-amber-50 p-6 text-emerald-900/80 shadow-sm" role="status">
          No activities match those filters. Try a different search or clear a filter. Restaurants without listed hours won&apos;t appear when Open now is selected.
        </p>
      )}
      <p className="sr-only" aria-live="polite">Showing {visibleActivities.length} activities.</p>
    </>
  );
}
