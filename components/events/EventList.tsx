"use client";

// Upcoming events as cards, with the organizer's details and a join button.
import { useState } from "react";
import Link from "next/link";
import { errorClass, primaryClass, secondaryClass } from "@/components/auth/styles";
import type { EventWithCount } from "@/components/events/useEvents";
import { formatEventTime, formatSpots } from "@/lib/events";

type JoinResult = Promise<string | null>;

function JoinButton({ event, joined, onJoin, onLeave }: {
  event: EventWithCount;
  joined: boolean;
  onJoin: (id: string) => JoinResult;
  onLeave: (id: string) => JoinResult;
}) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const full = event.max_participants !== null && event.going >= event.max_participants;

  async function toggle() {
    setBusy(true);
    setMessage((await (joined ? onLeave : onJoin)(event.id)) ?? "");
    setBusy(false);
  }

  return (
    <>
      {joined ? (
        <button type="button" onClick={toggle} disabled={busy} className={`mt-5 ${secondaryClass} sm:w-auto`}>
          {busy ? "Saving…" : "Leave event"}
        </button>
      ) : (
        <button type="button" onClick={toggle} disabled={busy || full} className={`mt-5 ${primaryClass} sm:w-auto`}>
          {full ? "Event is full" : busy ? "Saving…" : "Join event"}
        </button>
      )}
      {message && <p role="alert" className={errorClass}>{message}</p>}
    </>
  );
}

export default function EventList({ events, joinedIds, loading, error, signedIn, onRetry, onJoin, onLeave }: {
  events: EventWithCount[];
  joinedIds: string[];
  loading: boolean;
  error: boolean;
  signedIn: boolean;
  onRetry: () => void;
  onJoin: (id: string) => JoinResult;
  onLeave: (id: string) => JoinResult;
}) {
  if (loading && events.length === 0) {
    return <p className="mt-4 rounded-2xl bg-amber-50 p-6 text-emerald-900/80 shadow-sm" role="status">Loading events…</p>;
  }

  if (error) {
    return (
      <div className="mt-4 rounded-2xl bg-amber-50 p-6 shadow-sm" role="alert">
        <p className="text-emerald-900/80">We couldn&apos;t load events right now. Please try again.</p>
        <button type="button" onClick={onRetry} className={`mt-4 ${primaryClass} sm:w-auto`}>Try again</button>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <p className="mt-4 rounded-2xl bg-amber-50 p-6 text-emerald-900/80 shadow-sm">
        No events yet. Be the first! Tap the map to drop a pin and start one.
      </p>
    );
  }

  return (
    <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => (
        <li key={event.id} id={`event-${event.id}`} className="flex scroll-mt-28 flex-col items-start rounded-2xl bg-amber-50 p-6 shadow-sm">
          <p className="text-sm font-bold text-emerald-700">{formatEventTime(event.start_time, event.end_time)}</p>
          <h3 className="mt-2 text-lg font-bold">{event.name}</h3>
          <p className="mt-2 flex-1 whitespace-pre-line text-emerald-900/80">{event.description}</p>
          {event.address && <p className="mt-3 text-sm text-emerald-900/80">{event.address}</p>}
          <p className="mt-3 text-sm font-semibold">{formatSpots(event.going, event.max_participants)}</p>
          <div className="mt-3 max-w-full text-sm text-emerald-900/80">
            <p>Organized by {event.organizer_name ?? "a former member"}</p>
            {event.organizer_email && (
              <a href={`mailto:${event.organizer_email}`} className="block break-all font-semibold text-emerald-700 underline">
                {event.organizer_email}
              </a>
            )}
            {event.organizer_phone && <p>{event.organizer_phone}</p>}
          </div>
          {signedIn ? (
            <JoinButton event={event} joined={joinedIds.includes(event.id)} onJoin={onJoin} onLeave={onLeave} />
          ) : (
            <Link href="/login"className={`mt-5 ${secondaryClass} sm:w-auto`}>Sign in to join</Link>
          )}
        </li>
      ))}
    </ul>
  );
}
