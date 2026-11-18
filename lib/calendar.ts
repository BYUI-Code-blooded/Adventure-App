import type { Event } from "@/lib/types";

function formatCalendarDate(value: string) {
  return new Date(value).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function escapeIcs(value: string) {
  return value.replace(/[\\;,]/g, (match) => `\\${match}`).replace(/\r?\n/g, "\\n");
}

function recurrenceRule(event: Event) {
  if (!event.recurrence_rule) return null;
  const until = event.recurrence_end_date ? event.recurrence_end_date.replace(/-/g, "") + "T235959Z" : null;
  return until ? `${event.recurrence_rule};UNTIL=${until}` : event.recurrence_rule;
}

export function googleCalendarUrl(event: Event) {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.name,
    dates: `${formatCalendarDate(event.start_time)}/${formatCalendarDate(event.end_time)}`,
    details: "Rexburg Adventures event",
  });
  const rule = recurrenceRule(event);
  if (rule) params.set("recur", `RRULE:${rule}`);
  if (event.address) params.set("location", event.address);
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function icsCalendarContent(event: Event) {
  const lines = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Rexburg Adventures//Events//EN", "BEGIN:VEVENT",
    `UID:${event.id}@rexburg-adventures`, `DTSTAMP:${formatCalendarDate(new Date().toISOString())}`,
    `DTSTART:${formatCalendarDate(event.start_time)}`, `DTEND:${formatCalendarDate(event.end_time)}`,
    `SUMMARY:${escapeIcs(event.name)}`,
  ];
  if (event.address) lines.push(`LOCATION:${escapeIcs(event.address)}`);
  const rule = recurrenceRule(event);
  if (rule) lines.push(`RRULE:${rule}`);
  lines.push("END:VEVENT", "END:VCALENDAR");
  return lines.join("\r\n");
}
