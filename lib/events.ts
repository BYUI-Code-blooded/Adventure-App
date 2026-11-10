// Rules for creating an event. The database enforces the same limits (see supabase/events-migration.sql).
import { ADDRESS_MAX, MAX_DISTANCE_KM, isNearRexburg } from "@/lib/suggestions";

export const EVENT_NAME_MAX = 100;
export const EVENT_DESCRIPTION_MAX = 1000;
export const EVENT_SPOTS_MAX = 1000;

// Events happen in Rexburg, so times are entered and shown in Rexburg time wherever the visitor is.
const EVENT_TIME_ZONE = "America/Denver";
const DAY_MS = 24 * 60 * 60 * 1000;

type Point = { lat: number; lon: number };

export function newEventAtPointHref({ lat, lon }: Point) {
  return `/events/new?lat=${lat.toFixed(6)}&lon=${lon.toFixed(6)}`;
}

export function newEventForActivityHref(activityId: string) {
  return `/events/new?activity=${encodeURIComponent(activityId)}`;
}

/** Reads a pin from the form's URL. Anything unusable counts as no pin. */
export function parsePoint(lat: string | null, lon: string | null): Point | null {
  if (!lat || !lon) return null;
  const point = { lat: Number(lat), lon: Number(lon) };
  if (!Number.isFinite(point.lat) || !Number.isFinite(point.lon)) return null;
  return isNearRexburg(point.lat, point.lon) ? point : null;
}

function rexburgOffsetMs(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: EVENT_TIME_ZONE,
    hourCycle: "h23",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  }).formatToParts(date);
  const value = (type: string) => Number(parts.find((part) => part.type === type)?.value);
  const shownAsUtc = Date.UTC(value("year"), value("month") - 1, value("day"), value("hour"), value("minute"), value("second"));
  return shownAsUtc - Math.floor(date.getTime() / 1000) * 1000;
}

/** Turns a datetime-local value, read as Rexburg time, into an ISO timestamp. Returns null when it's empty or invalid. */
export function rexburgTimeToIso(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(value);
  if (!match) return null;
  const [year, month, day, hour, minute] = match.slice(1).map(Number);
  const wallClock = Date.UTC(year, month - 1, day, hour, minute);
  // The offset depends on the moment itself (daylight saving), so the second pass corrects the first guess.
  const firstGuess = wallClock - rexburgOffsetMs(new Date(wallClock));
  return new Date(wallClock - rexburgOffsetMs(new Date(firstGuess))).toISOString();
}

/** "Sat, Nov 7, 6:00 PM – 8:00 PM", with the end date added when it runs into another day. */
export function formatEventTime(startTime: string, endTime: string) {
  const day = (time: string) =>
    new Date(time).toLocaleDateString("en-US", { timeZone: EVENT_TIME_ZONE, weekday: "short", month: "short", day: "numeric" });
  const clock = (time: string) =>
    new Date(time).toLocaleTimeString("en-US", { timeZone: EVENT_TIME_ZONE, hour: "numeric", minute: "2-digit" });
  const sameDay = day(startTime) === day(endTime);
  return `${day(startTime)}, ${clock(startTime)} – ${sameDay ? "" : `${day(endTime)}, `}${clock(endTime)}`;
}

/** "3 of 10 going", or "3 going" for an unlimited event. */
export function formatSpots(going: number, maxParticipants: number | null) {
  return maxParticipants === null ? `${going} going` : `${going} of ${maxParticipants} going`;
}

export function validateEventName(value: string) {
  const name = value.trim();
  if (!name) return "Please give your event a name.";
  if (name.length > EVENT_NAME_MAX) return `Keep the name under ${EVENT_NAME_MAX} characters.`;
  return null;
}

export function validateEventDescription(value: string) {
  const description = value.trim();
  if (!description) return "Tell people what the event is about.";
  if (description.length > EVENT_DESCRIPTION_MAX) return `Keep the description under ${EVENT_DESCRIPTION_MAX} characters.`;
  return null;
}

export function validateEventStart(start: string | null, now: Date) {
  if (!start) return "Choose when your event starts.";
  const time = new Date(start).getTime();
  if (time < now.getTime()) return "Pick a start time that hasn't passed yet.";
  if (time > now.getTime() + 365 * DAY_MS) return "Events can be up to a year ahead.";
  return null;
}

export function validateEventEnd(start: string | null, end: string | null) {
  if (!end) return "Choose when your event ends.";
  if (!start) return null;
  const length = new Date(end).getTime() - new Date(start).getTime();
  if (length <= 0) return "The end time needs to be after the start time.";
  if (length > DAY_MS) return "Events can last up to 24 hours.";
  return null;
}

export function validateEventLocation(point: Point | null, address: string) {
  const text = address.trim();
  if (!point && !text) return "Drop a pin on the map or enter an address.";
  if (point && !isNearRexburg(point.lat, point.lon)) return `Pick a spot within ${MAX_DISTANCE_KM} km of Rexburg.`;
  if (text.length > ADDRESS_MAX) return `Keep the address under ${ADDRESS_MAX} characters.`;
  return null;
}

export function validateSpots(value: string) {
  const spots = Number(value);
  if (!value.trim() || !Number.isInteger(spots) || spots < 1 || spots > EVENT_SPOTS_MAX) {
    return `Enter a whole number from 1 to ${EVENT_SPOTS_MAX}, or choose unlimited.`;
  }
  return null;
}
