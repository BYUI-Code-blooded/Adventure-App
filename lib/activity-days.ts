// Works out which weekdays an activity is available. Activities have no date column, so this reads
// weekly_hours first, then the "When:" line in the description. null means "no day info": any day.
import { WEEKDAYS, getEventWeekday, rexburgDayKey, rexburgTimeToIso, type Weekday } from "@/lib/events";
import type { Activity } from "@/lib/types";

type DayInfo = Pick<Activity, "weekly_hours" | "description">;

const HOURS_KEYS: Record<Weekday, string> = {
  Mon: "monday", Tue: "tuesday", Wed: "wednesday", Thu: "thursday", Fri: "friday", Sat: "saturday", Sun: "sunday",
};

const MONTHS = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];

function daysFromHours(hours: Activity["weekly_hours"]): Weekday[] | null {
  if (!hours) return null;
  if (!WEEKDAYS.some(({ value }) => HOURS_KEYS[value] in hours)) return null;
  return WEEKDAYS.filter(({ value }) => hours[HOURS_KEYS[value]]).map(({ value }) => value);
}

function whenLine(description: string | null | undefined) {
  return /^\s*When:\s*(.+)$/im.exec(description ?? "")?.[1] ?? null;
}

/** A date like "November 15, 2026" in a When line, as "YYYY-MM-DD", or null. */
function dateFromWhen(when: string) {
  const date = /\b([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})\b/.exec(when);
  const month = date ? MONTHS.indexOf(date[1].toLowerCase()) : -1;
  if (!date || month < 0) return null;
  return `${date[3]}-${String(month + 1).padStart(2, "0")}-${date[2].padStart(2, "0")}`;
}

function namedWeekdays(when: string) {
  return WEEKDAYS.filter(({ label }) => new RegExp(`\b${label}s?\b`, "i").test(when)).map(({ value }) => value);
}

function daysFromWhen(description: string | null | undefined): Weekday[] | null {
  const when = whenLine(description);
  if (!when) return null;

  const named = namedWeekdays(when);
  if (named.length > 0) return named;

  // A one-time date like "November 15, 2026 at 5pm": find its weekday in Rexburg time.
  const day = dateFromWhen(when);
  const iso = day && rexburgTimeToIso(`${day}T12:00`);
  return iso ? [getEventWeekday(iso)] : null;
}

/** The one-time date ("YYYY-MM-DD") from the When line, or null when it repeats or has no date. */
export function getOneTimeDate(description: string | null | undefined) {
  const when = whenLine(description);
  if (!when || /\b(weekly|repeats?|every)\b/i.test(when) || namedWeekdays(when).length > 0) return null;
  return dateFromWhen(when);
}

/** False only when the listing's one-time date is before today in Rexburg time. */
export function activityIsCurrent(activity: Pick<Activity, "description">, now: Date = new Date()) {
  const date = getOneTimeDate(activity.description);
  return date === null || date >= rexburgDayKey(now);
}

/** The weekdays an activity is available, or null when we have no day info (it then counts as any day). */
export function getActivityDays(activity: DayInfo): Weekday[] | null {
  return daysFromHours(activity.weekly_hours) ?? daysFromWhen(activity.description);
}

export function activityIsOnDay(activity: DayInfo, day: Weekday) {
  const days = getActivityDays(activity);
  return days === null || days.includes(day);
}
