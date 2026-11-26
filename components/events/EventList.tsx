"use client";

// Upcoming events as cards, with the organizer's details and a join button.
import { useState } from "react";
import Link from "next/link";
import { errorClass, primaryClass, secondaryClass } from "@/components/auth/styles";
import EventComments from "@/components/events/EventComments";
import type { EventWithCount } from "@/components/events/useEvents";
import { eventHasEnded, formatEventTime, formatSpots } from "@/lib/events";
import { googleCalendarUrl, icsCalendarContent } from "@/lib/calendar";
import { supabase } from "@/lib/supabase";

type JoinResult = Promise<string | null>;

function CalendarActions({ event }: { event: EventWithCount }) {
  const [open, setOpen] = useState(false);

  function downloadIcs() {
    const url = URL.createObjectURL(new Blob([icsCalendarContent(event)], { type: "text/calendar;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${event.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.ics`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return <div className="mt-4">
    <button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} className={`${secondaryClass} sm:w-auto`}>Add to calendar</button>
    {open && <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Calendar options">
      <a href={googleCalendarUrl(event)} target="_blank" rel="noopener noreferrer" className="rounded-full border border-emerald-900 px-4 py-2 text-sm font-bold hover:bg-emerald-100">Google Calendar</a>
      <button type="button" onClick={downloadIcs} className="rounded-full border border-emerald-900 px-4 py-2 text-sm font-bold hover:bg-emerald-100">Apple Calendar</button>
    </div>}
  </div>;
}

function ReportEvent({ eventId }: { eventId: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("inappropriate");
  const [details, setDetails] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    const { error } = await supabase.from("event_reports").insert({ event_id: eventId, reason, details: details.trim() || null });
    setBusy(false);
    setMessage(error?.code === "23505" ? "You already reported this event." : error ? "Please sign in before reporting an event." : "Report sent to the admins.");
    if (!error) setOpen(false);
  }

  return <div className="mt-3">
    <button
      type="button"
      onClick={() => setOpen((value) => !value)}
      aria-expanded={open}
      className="min-h-11 cursor-pointer rounded-lg py-2 text-left text-sm font-semibold text-red-800 underline underline-offset-4 hover:text-red-950 hover:decoration-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-800"
    >
      Report this event
    </button>
    {open && <div className="mt-2 rounded-xl border border-red-900/20 bg-red-50 p-3">
      <label htmlFor={`report-reason-${eventId}`} className="block text-sm font-bold">Why are you reporting it?</label>
      <select id={`report-reason-${eventId}`} value={reason} onChange={(event) => setReason(event.target.value)} className="mt-1 min-h-11 w-full rounded-xl border border-emerald-900/25 bg-white px-3"><option value="inappropriate">Inappropriate content</option><option value="spam">Spam</option><option value="unsafe">Unsafe or suspicious</option><option value="other">Other</option></select>
      <textarea value={details} onChange={(event) => setDetails(event.target.value)} maxLength={500} rows={3} placeholder="Optional details" className="mt-2 w-full rounded-xl border border-emerald-900/25 bg-white px-3 py-2" />
      <button type="button" disabled={busy} onClick={() => void submit()} className="mt-2 rounded-full bg-red-800 px-4 py-2 font-bold text-white disabled:opacity-60">{busy ? "Sending…" : "Send report"}</button>
    </div>}
    {message && <p className="mt-2 text-sm font-semibold" role="status">{message}</p>}
  </div>;
}

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

export default function EventList({ dayLabel, events, joinedIds, loading, error, signedIn, userId, onRetry, onJoin, onLeave, emptyMessage }: {
  dayLabel?: string;
  events: EventWithCount[];
  joinedIds: string[];
  loading: boolean;
  error: boolean;
  signedIn: boolean;
  userId?: string;
  onRetry: () => void;
  onJoin: (id: string) => JoinResult;
  onLeave: (id: string) => JoinResult;
  emptyMessage?: string;
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
        {emptyMessage ?? (dayLabel
          ? `No events on ${dayLabel} yet. Tap the map to start one.`
          : "No events yet. Be the first! Tap the map to drop a pin and start one.")}
      </p>
    );
  }

  const now = new Date();
  return (
    <ul className="mt-4 grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => {
        const ended = eventHasEnded(event.end_time, now);
        return (
        <li key={event.id} id={`event-${event.id}`} className="flex scroll-mt-28 flex-col items-start rounded-2xl bg-amber-50 p-6 shadow-sm">
          <p className="text-sm font-bold text-emerald-700">
            {formatEventTime(event.start_time, event.end_time)}
            {ended && <span className="ml-2 rounded-full bg-emerald-900 px-2 py-0.5 text-xs font-semibold text-amber-50">Ended</span>}
          </p>
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
          {ended ? (
            <p className="mt-5 text-sm font-semibold text-emerald-900/80">This event has ended.</p>
          ) : (
            <>
              {userId === event.creator_id && (
                <Link href={`/events/edit?id=${encodeURIComponent(event.id)}`} className={`mt-5 ${secondaryClass} sm:w-auto`}>
                  Edit event
                </Link>
              )}
              {signedIn ? (
                <JoinButton event={event} joined={joinedIds.includes(event.id)} onJoin={onJoin} onLeave={onLeave} />
              ) : (
                <Link href="/login" className={`mt-5 ${secondaryClass} sm:w-auto`}>Sign in to join</Link>
              )}
            </>
          )}
          <CalendarActions event={event} />
          <ReportEvent eventId={event.id} />
          <EventComments eventId={event.id} commentCount={event.comments} signedIn={signedIn} userId={userId} />
        </li>
        );
      })}
    </ul>
  );
}
