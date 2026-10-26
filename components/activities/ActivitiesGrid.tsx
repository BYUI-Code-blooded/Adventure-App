"use client";

import { useMemo, useState } from "react";
import ActivityCard from "@/components/activities/ActivityCard";
import type { Activity, ActivityCategory } from "@/lib/types";

type ActivitiesGridProps = {
  activities: Activity[];
  category: ActivityCategory;
  loading: boolean;
  error: boolean;
  onRetry: () => void;
};

export default function ActivitiesGrid({
  activities,
  category,
  loading,
  error,
  onRetry,
}: ActivitiesGridProps) {
  const [search, setSearch] = useState("");
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const normalizedSearch = search.trim().toLocaleLowerCase();
  const visibleActivities = useMemo(
    () => activities.filter((activity) => {
      const matchesSearch = !normalizedSearch ||
        `${activity.name} ${activity.description ?? ""}`.toLocaleLowerCase().includes(normalizedSearch);
      return matchesSearch && (!featuredOnly || activity.is_featured);
    }),
    [activities, featuredOnly, normalizedSearch],
  );

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
          No activities match those filters. Try a different search or turn off Featured only.
        </p>
      )}
      <p className="sr-only" aria-live="polite">Showing {visibleActivities.length} activities.</p>
    </>
  );
}
