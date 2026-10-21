"use client";

// Current Supabase session plus the matching row of public.profiles.
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import type { Profile } from "@/lib/types";

export function useAuthProfile() {
  const [session, setSession] = useState<Session | null>(null);
  const [checking, setChecking] = useState(true);
  const [loaded, setLoaded] = useState<{ id: string; profile: Profile | null } | null>(null);

  useEffect(() => {
    // INITIAL_SESSION fires once the stored session is read. The timeout is a safety net.
    const { data } = supabase.auth.onAuthStateChange((event, next) => {
      setSession(next);
      if (event === "INITIAL_SESSION") setChecking(false);
    });
    const timer = setTimeout(() => setChecking(false), 4000);
    return () => {
      clearTimeout(timer);
      data.subscription.unsubscribe();
    };
  }, []);

  const userId = session?.user.id;
  useEffect(() => {
    if (!userId) return;
    supabase
      .from("profiles")
      .select("id, name, phone, role")
      .eq("id", userId)
      .maybeSingle()
      .then(({ data }) => setLoaded({ id: userId, profile: data as Profile | null }));
  }, [userId]);

  // undefined while loading, null if the row is missing
  const profile = loaded && loaded.id === userId ? loaded.profile : undefined;

  function setProfile(next: Profile) {
    if (userId) setLoaded({ id: userId, profile: next });
  }

  return { session, checking, profile, setProfile };
}
