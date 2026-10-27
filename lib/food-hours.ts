import type { Activity } from "@/lib/types";

const WEEKDAY_KEYS: Record<string, string> = {
  Mon: "monday",
  Tue: "tuesday",
  Wed: "wednesday",
  Thu: "thursday",
  Fri: "friday",
  Sat: "saturday",
  Sun: "sunday",
};

export function getFoodOpenStatus(hours: Activity["weekly_hours"], now: Date | null) {
  if (!now || !hours) return { label: "Hours not listed", open: null as boolean | null };

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Denver",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const weekday = parts.find((part) => part.type === "weekday")?.value;
  const hour = Number(parts.find((part) => part.type === "hour")?.value);
  const minute = Number(parts.find((part) => part.type === "minute")?.value);
  const today = weekday ? hours[WEEKDAY_KEYS[weekday]] : undefined;
  if (!today) return { label: "Closed today", open: false };

  const currentMinutes = hour * 60 + minute;
  const openAt = Number(today.open.slice(0, 2)) * 60 + Number(today.open.slice(3, 5));
  const closeAt = Number(today.close.slice(0, 2)) * 60 + Number(today.close.slice(3, 5));
  if (openAt === 0 && closeAt === 0) return { label: "Open now · 24 hours", open: true };
  const isOpen = openAt <= closeAt
    ? currentMinutes >= openAt && currentMinutes < closeAt
    : currentMinutes >= openAt || currentMinutes < closeAt;
  const closeHour = Math.floor(closeAt / 60);
  const closeLabel = `${closeHour % 12 || 12}:${String(closeAt % 60).padStart(2, "0")} ${closeHour < 12 ? "AM" : "PM"}`;

  return { label: isOpen ? `Open now · closes ${closeLabel}` : "Closed now", open: isOpen };
}
