"use client";

import { useEffect, useState } from "react";
import ActivitiesGrid from "@/components/activities/ActivitiesGrid";
import { supabase } from "@/lib/supabase";
import type { Activity, ActivityCategory } from "@/lib/types";

type ActivityRow = Omit<Activity, "lon"> & { lon?: number; lng?: number };

export default function ActivityDirectory({ category }: { category: ActivityCategory }) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadActivities() {
      setLoading(true);
      setError(false);
      try {
        const { data, error: queryError } = await supabase
          .from("activities")
          .select("*")
          .eq("category", category)
          .eq("status", "approved")
          .order("is_featured", { ascending: false })
          .order("name", { ascending: true });

        if (!active) return;

        if (queryError) {
          setError(true);
        } else {
          const rows = (data ?? []) as ActivityRow[];
          setActivities(rows.map((row) => ({ ...row, lon: (row.lon ?? row.lng) as number })));
        }
      } catch {
        if (!active) return;
        setError(true);
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadActivities();
    return () => {
      active = false;
    };
  }, [category, reloadKey]);

  return (
    <ActivitiesGrid
      activities={activities}
      category={category}
      loading={loading}
      error={error}
      onRetry={() => setReloadKey((key) => key + 1)}
    />
  );
}
