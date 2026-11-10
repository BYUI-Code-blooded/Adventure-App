"use client";

// Upcoming events, how many people are going, and joining or leaving as the current user.
import { useCallback, useEffect, useState } from "react";
import { useAuthProfile } from "@/components/auth/useAuthProfile";
import { supabase } from "@/lib/supabase";
import type { Event } from "@/lib/types";

// organizer_name is null when the organizer deleted their account. Email and phone are only
// filled in for signed-in members (see public.event_organizer_contacts).
export type EventWithCount = Event & {
  going: number;
  organizer_name: string | null;
  organizer_email: string | null;
  organizer_phone: string | null;
};

type EventRow = Event & { event_attendees: Array<{ count: number }> };
type Contact = { event_id: string; email: string | null; phone: string | null };

/** Organizer names (by creator id) for everyone, and contact details (by event id) for signed-in members. */
async function loadOrganizers(rows: Event[], signedIn: boolean) {
  const creatorIds = [...new Set(rows.map((row) => row.creator_id).filter((id): id is string => id !== null))];
  const [namesResult, contactsResult] = await Promise.all([
    creatorIds.length > 0
      ? supabase.from("public_profiles").select("id, name").in("id", creatorIds)
      : Promise.resolve({ data: [], error: null }),
    signedIn && rows.length > 0
      ? supabase.rpc("event_organizer_contacts", { p_event_ids: rows.map((row) => row.id) })
      : Promise.resolve({ data: [] as Contact[], error: null }),
  ]);
  return {
    names: new Map((namesResult.data ?? []).map((row: { id: string; name: string | null }) => [row.id, row.name])),
    contacts: new Map(((contactsResult.data ?? []) as Contact[]).map((row) => [row.event_id, row])),
    failed: Boolean(namesResult.error || contactsResult.error),
  };
}

export function useEvents() {
  const { session, checking } = useAuthProfile();
  const userId = session?.user.id;
  const signedIn = Boolean(session) && !session?.user.is_anonymous;

  const [events, setEvents] = useState<EventWithCount[]>([]);
  const [joinedIds, setJoinedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const reload = useCallback(() => setReloadKey((key) => key + 1), []);

  useEffect(() => {
    if (checking) return;
    let active = true;

    async function loadEvents() {
      setLoading(true);
      setError(false);
      const [eventsResult, joinedResult] = await Promise.all([
        supabase
          .from("events")
          .select("*, event_attendees(count)")
          .gte("end_time", new Date().toISOString())
          .order("start_time", { ascending: true }),
        userId
          ? supabase.from("event_attendees").select("event_id").eq("user_id", userId)
          : Promise.resolve({ data: [], error: null }),
      ]);

      if (!active) return;
      if (eventsResult.error || joinedResult.error) {
        setError(true);
        setLoading(false);
        return;
      }

      const rows = (eventsResult.data ?? []) as unknown as EventRow[];
      const organizers = await loadOrganizers(rows, signedIn);
      if (!active) return;
      if (organizers.failed) {
        setError(true);
      } else {
        setEvents(rows.map(({ event_attendees, ...event }) => {
          const contact = organizers.contacts.get(event.id);
          return {
            ...event,
            going: event_attendees[0]?.count ?? 0,
            organizer_name: event.creator_id ? organizers.names.get(event.creator_id) ?? null : null,
            organizer_email: contact?.email ?? null,
            organizer_phone: contact?.phone ?? null,
          };
        }));
        setJoinedIds((joinedResult.data ?? []).map((row) => row.event_id));
      }
      setLoading(false);
    }

    void loadEvents().catch(() => {
      if (!active) return;
      setError(true);
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [checking, signedIn, userId, reloadKey]);

  /** Returns an error message, or null when it worked. */
  async function join(eventId: string) {
    const { error: joinError } = await supabase.from("event_attendees").insert({ event_id: eventId });
    reload();
    if (!joinError) return null;
    return /full/i.test(joinError.message) ? "This event just filled up." : "We couldn't add you. Please try again.";
  }

  /** Returns an error message, or null when it worked. */
  async function leave(eventId: string) {
    if (!userId) return null;
    const { error: leaveError } = await supabase
      .from("event_attendees")
      .delete()
      .eq("event_id", eventId)
      .eq("user_id", userId);
    reload();
    return leaveError ? "We couldn't remove you. Please try again." : null;
  }

  return { events, joinedIds, loading, error, reload, signedIn, join, leave };
}
