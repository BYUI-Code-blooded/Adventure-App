"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { googleCalendarUrl, icsCalendarContent } from "@/lib/calendar";
import { supabase } from "@/lib/supabase";
import type { Activity, AdventureEvent, RecurrenceFrequency } from "@/lib/types";
import { useAuthProfile } from "@/components/auth/useAuthProfile";

type EventWithActivity = AdventureEvent & { activity: Pick<Activity, "name" | "address" | "lat" | "lon"> };
const inputClass = "mt-1 min-h-11 w-full rounded-xl border-2 border-emerald-900/25 bg-white px-3 text-emerald-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700";

function recurrenceLabel(rule?: string | null) {
  return rule === "FREQ=WEEKLY" ? "Repeats weekly" : rule === "FREQ=MONTHLY" ? "Repeats monthly" : "One-time event";
}

function CalendarButtons({ event }: { event: EventWithActivity }) {
  function downloadAppleCalendar() {
    const blob = new Blob([icsCalendarContent(event, event.activity.name)], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${event.activity.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.ics`;
    anchor.click();
    URL.revokeObjectURL(url);
  }
  return <div className="mt-4 flex flex-wrap gap-2">
    <a href={googleCalendarUrl(event, event.activity.name)} target="_blank" rel="noopener noreferrer" className="rounded-full border border-emerald-900 px-3 py-2 text-sm font-bold hover:bg-emerald-100">Add to Google Calendar</a>
    <button type="button" onClick={downloadAppleCalendar} className="rounded-full border border-emerald-900 px-3 py-2 text-sm font-bold hover:bg-emerald-100">Add to Apple Calendar</button>
  </div>;
}

function ReportButton({ eventId }: { eventId: string }) {
  const { session } = useAuthProfile();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("inappropriate");
  const [details, setDetails] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!session) { setStatus("Please sign in to report an event."); return; }
    setBusy(true);
    const { error } = await supabase.from("event_reports").insert({ event_id: eventId, reporter_id: session.user.id, reason, details: details.trim() || null });
    setBusy(false);
    if (error?.code === "23505") setStatus("You already reported this event.");
    else if (error) setStatus("We couldn't send that report.");
    else { setOpen(false); setStatus("Report sent to the admins."); }
  }

  return <div className="mt-3">
    <button type="button" onClick={() => setOpen((value) => !value)} className="text-sm font-semibold text-red-800 underline underline-offset-2">Report this event</button>
    {open && <form onSubmit={submit} className="mt-3 rounded-xl border border-red-900/20 bg-red-50 p-3">
      <label className="block text-sm font-bold" htmlFor={`report-reason-${eventId}`}>Reason</label>
      <select id={`report-reason-${eventId}`} value={reason} onChange={(event) => setReason(event.target.value)} className={inputClass}>
        <option value="inappropriate">Inappropriate content</option><option value="spam">Spam</option><option value="unsafe">Unsafe or suspicious</option><option value="other">Other</option>
      </select>
      <label className="mt-3 block text-sm font-bold" htmlFor={`report-details-${eventId}`}>Details (optional)</label>
      <textarea id={`report-details-${eventId}`} value={details} onChange={(event) => setDetails(event.target.value)} maxLength={500} rows={3} className={inputClass} />
      <button disabled={busy} className="mt-3 rounded-full bg-red-800 px-4 py-2 font-bold text-white disabled:opacity-60">{busy ? "Sending…" : "Send report"}</button>
    </form>}
    {status && <p className="mt-2 text-sm font-semibold" role="status">{status}</p>}
  </div>;
}

function JoinButton({ event, onChanged }: { event: EventWithActivity; onChanged: () => void }) {
  const { session } = useAuthProfile();
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  async function join() {
    if (!session) { setStatus("Please sign in to join an event."); return; }
    setBusy(true);
    const { error } = await supabase.from("event_attendees").insert({ event_id: event.id, user_id: session.user.id });
    setBusy(false);
    setStatus(error?.code === "23505" ? "You already joined this event." : error ? "That event may be full." : "You joined this event.");
    if (!error) onChanged();
  }
  return <div className="mt-4 flex flex-wrap items-center gap-3"><button type="button" onClick={() => void join()} disabled={busy || (event.attendee_count ?? 0) >= event.max_participants} className="rounded-full bg-emerald-900 px-4 py-2 font-bold text-amber-50 disabled:opacity-60">{busy ? "Joining…" : "Join event"}</button><span className="text-sm font-semibold text-emerald-900/75">{event.attendee_count ?? 0} / {event.max_participants} spots</span>{status && <span className="text-sm font-semibold" role="status">{status}</span>}</div>;
}

export default function EventBoard({ activities }: { activities: Activity[] }) {
  const { session } = useAuthProfile();
  const [events, setEvents] = useState<EventWithActivity[]>([]);
  const [selectedActivity, setSelectedActivity] = useState(activities[0]?.id ?? "");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [maxParticipants, setMaxParticipants] = useState("10");
  const [frequency, setFrequency] = useState<RecurrenceFrequency>("none");
  const [recurrenceEnd, setRecurrenceEnd] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const sortedActivities = useMemo(() => activities.slice().sort((a, b) => a.name.localeCompare(b.name)), [activities]);

  async function loadEvents() {
    const { data } = await supabase.from("events").select("id, activity_id, creator_id, start_time, end_time, max_participants, recurrence_rule, recurrence_end_date, created_at, activities!inner(name, address, lat, lon), event_attendees(count)").gte("start_time", new Date().toISOString()).order("start_time").limit(50);
    if (data) setEvents(data.map((row) => ({ ...row, activity: row.activities, attendee_count: row.event_attendees?.[0]?.count ?? 0 })) as unknown as EventWithActivity[]);
  }
  useEffect(() => {
    const timer = window.setTimeout(() => { void loadEvents(); }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  async function createEvent(event: FormEvent) {
    event.preventDefault();
    if (!session) { setMessage("Please sign in before creating an event."); return; }
    if (!selectedActivity || !start || !end || (frequency !== "none" && !recurrenceEnd)) { setMessage("Choose an activity, times, and an end date for a repeating event."); return; }
    setBusy(true); setMessage("");
    const { error } = await supabase.from("events").insert({ activity_id: selectedActivity, creator_id: session.user.id, start_time: new Date(start).toISOString(), end_time: new Date(end).toISOString(), max_participants: Number(maxParticipants), recurrence_rule: frequency === "none" ? null : `FREQ=${frequency.toUpperCase()}`, recurrence_end_date: frequency === "none" ? null : recurrenceEnd });
    setBusy(false);
    if (error) { setMessage("We couldn't create that event. Check the time and try again."); return; }
    setMessage("Event created."); setStart(""); setEnd(""); setRecurrenceEnd(""); void loadEvents();
  }

  return <section className="mt-12" aria-labelledby="events-heading">
    <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-sm font-semibold uppercase tracking-widest text-emerald-700">Community events</p><h2 id="events-heading" className="mt-2 text-2xl font-extrabold md:text-3xl">Make a plan</h2></div><p className="max-w-md text-sm text-emerald-900/75">Join an event, add it to your calendar, or report it if it doesn&apos;t belong here.</p></div>
    <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
      <form onSubmit={createEvent} className="rounded-2xl bg-amber-50 p-5 shadow-sm"><h3 className="text-lg font-bold">Offer an event</h3><p className="mt-1 text-sm text-emerald-900/75">You&apos;ll need to sign in to publish it.</p>
        <label className="mt-4 block text-sm font-bold" htmlFor="event-activity">Activity</label><select id="event-activity" value={selectedActivity} onChange={(event) => setSelectedActivity(event.target.value)} className={inputClass}>{sortedActivities.map((activity) => <option key={activity.id} value={activity.id}>{activity.name}</option>)}</select>
        <div className="mt-3 grid gap-3 sm:grid-cols-2"><label className="text-sm font-bold">Starts<input required type="datetime-local" value={start} onChange={(event) => setStart(event.target.value)} className={inputClass} /></label><label className="text-sm font-bold">Ends<input required type="datetime-local" value={end} onChange={(event) => setEnd(event.target.value)} className={inputClass} /></label></div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2"><label className="text-sm font-bold">Spots<input required min="1" max="1000" type="number" value={maxParticipants} onChange={(event) => setMaxParticipants(event.target.value)} className={inputClass} /></label><label className="text-sm font-bold">Repeats<select value={frequency} onChange={(event) => setFrequency(event.target.value as RecurrenceFrequency)} className={inputClass}><option value="none">Does not repeat</option><option value="weekly">Every week</option><option value="monthly">Every month</option></select></label></div>
        {frequency !== "none" && <label className="mt-3 block text-sm font-bold">Repeat until<input required type="date" value={recurrenceEnd} onChange={(event) => setRecurrenceEnd(event.target.value)} className={inputClass} /></label>}
        <button disabled={busy || sortedActivities.length === 0} className="mt-5 rounded-full bg-emerald-900 px-5 py-3 font-bold text-amber-50 disabled:opacity-60">{busy ? "Publishing…" : "Offer event"}</button>{message && <p className="mt-3 text-sm font-semibold" role="status">{message}</p>}
      </form>
      <div className="space-y-4">{events.length === 0 ? <p className="rounded-2xl bg-amber-50 p-5 text-emerald-900/75">No upcoming events yet. Be the first to offer one.</p> : events.map((event) => <article key={event.id} className="rounded-2xl bg-amber-50 p-5 shadow-sm"><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="text-lg font-bold">{event.activity.name}</h3><p className="mt-1 font-semibold text-emerald-700">{new Date(event.start_time).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}</p></div><span className="rounded-full bg-amber-300 px-3 py-1 text-xs font-bold">{recurrenceLabel(event.recurrence_rule)}</span></div>{event.activity.address && <p className="mt-2 text-sm text-emerald-900/75">{event.activity.address}</p>}<JoinButton event={event} onChanged={() => void loadEvents()} /><CalendarButtons event={event} /><ReportButton eventId={event.id} /></article>)}</div>
    </div>
  </section>;
}
