"use client";

// Row of day buttons: "All days", then Mon to Sun. One day at a time. Shared by events and activities.
import { WEEKDAYS, type Weekday } from "@/lib/events";

const base =
  "min-h-11 rounded-full border-2 border-emerald-900 px-4 py-2 font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700";
const idle = "bg-amber-50 text-emerald-950 hover:bg-emerald-900 hover:text-amber-50";
const selected = "bg-amber-300 text-emerald-950 hover:bg-amber-200";

export default function DayFilter({ id, value, onChange }: {
  id: string;
  value: Weekday | null;
  onChange: (day: Weekday | null) => void;
}) {
  return (
    <div>
      <p id={`${id}-label`} className="mb-2 text-sm font-bold text-emerald-700">Filter by day</p>
      <div role="group" aria-labelledby={`${id}-label`} className="flex flex-wrap gap-2">
        <button type="button" aria-pressed={value === null} onClick={() => onChange(null)} className={`${base} ${value === null ? selected : idle}`}>
          All days
        </button>
        {WEEKDAYS.map((day) => (
          <button
            key={day.value}
            type="button"
            aria-pressed={value === day.value}
            aria-label={day.label}
            onClick={() => onChange(day.value)}
            className={`${base} ${value === day.value ? selected : idle}`}
          >
            {day.value}
          </button>
        ))}
      </div>
    </div>
  );
}
