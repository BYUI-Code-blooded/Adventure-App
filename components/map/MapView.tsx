"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Activity, ActivityCategory } from "@/lib/types";

const LeafletMap = dynamic(() => import("@/components/map/LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="grid h-[65svh] min-h-112 place-items-center rounded-2xl bg-emerald-900 text-amber-100" role="status">
      Loading the activity map…
    </div>
  ),
});

const categories: Array<{ value: ActivityCategory | "all"; label: string }> = [
  { value: "all", label: "All activities" },
  { value: "outdoor", label: "Outdoor" },
  { value: "indoor", label: "Indoor" },
  { value: "food", label: "Food & treats" },
  { value: "weekend", label: "Weekend events" },
];

export default function MapView() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [category, setCategory] = useState<ActivityCategory | "all">("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadActivities() {
      setLoading(true);
      setError(false);
      const { data, error: queryError } = await supabase
        .from("activities")
        .select("id, name, description, address, lat, lon, website_url, category, is_featured")
        .eq("status", "approved")
        .order("is_featured", { ascending: false })
        .order("name", { ascending: true });

      if (!active) return;
      if (queryError) {
        setError(true);
      } else {
        setActivities((data ?? []) as Activity[]);
      }
      setLoading(false);
    }

    void loadActivities().catch(() => {
      if (!active) return;
      setError(true);
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [reloadKey]);

  const visibleActivities = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase();
    return activities.filter((activity) => {
      const matchesCategory = category === "all" || activity.category === category;
      const searchableText = `${activity.name} ${activity.description ?? ""} ${activity.address ?? ""}`.toLocaleLowerCase();
      return matchesCategory && (!normalizedSearch || searchableText.includes(normalizedSearch));
    });
  }, [activities, category, search]);

  return (
    <div>
      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
        <div>
          <label htmlFor="activity-map-search" className="mb-2 block text-sm font-bold text-emerald-700">
            Search activities
          </label>
          <input
            id="activity-map-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, description, or address"
            className="w-full rounded-full border-2 border-emerald-900 bg-amber-50 px-5 py-3 text-emerald-950 placeholder:text-emerald-900/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
          />
        </div>
        <div>
          <label htmlFor="activity-map-category" className="mb-2 block text-sm font-bold text-emerald-700">
            Category
          </label>
          <select
            id="activity-map-category"
            value={category}
            onChange={(event) => setCategory(event.target.value as ActivityCategory | "all")}
            className="min-h-12 w-full rounded-full border-2 border-emerald-900 bg-amber-50 px-5 py-3 font-semibold text-emerald-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 md:min-w-52"
          >
            {categories.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <p className="mt-6 rounded-2xl bg-amber-50 p-6 text-emerald-900/80 shadow-sm" role="status">Loading activities…</p>
      ) : error ? (
        <div className="mt-6 rounded-2xl bg-amber-50 p-6 shadow-sm" role="alert">
          <p className="text-emerald-900/80">We couldn&apos;t load the activity map right now. Please try again.</p>
          <button type="button" onClick={() => setReloadKey((key) => key + 1)} className="mt-4 min-h-11 rounded-full bg-emerald-900 px-5 py-2 font-bold text-amber-50 hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700">Try again</button>
        </div>
      ) : visibleActivities.length === 0 ? (
        <p className="mt-6 rounded-2xl bg-amber-50 p-6 text-emerald-900/80" role="status">No activities match those filters.</p>
      ) : (
        <>
          <p className="mt-4 text-sm font-semibold text-emerald-900/80">Showing {visibleActivities.length} of {activities.length} activities.</p>
          <LeafletMap activities={visibleActivities} />
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visibleActivities.map((activity) => (
              <li key={activity.id} className="rounded-2xl bg-amber-50 p-5 shadow-sm">
                <h2 className="text-lg font-bold">{activity.name}</h2>
                <p className="mt-1 text-sm font-semibold text-emerald-700">{activity.category}</p>
                {activity.address && <p className="mt-2 text-sm text-emerald-900/80">{activity.address}</p>}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
