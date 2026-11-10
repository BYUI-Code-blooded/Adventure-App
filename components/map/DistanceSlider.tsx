"use client";

// Two-handle slider: drag the left handle for the minimum distance and the right one for the maximum.
// Built from two overlapping native range inputs, so it works with keyboard and touch without extra packages.
import { useId } from "react";

export const DISTANCE_MAX = 10; // miles; the right end of the slider means "no upper limit"
export const DISTANCE_STEP = 0.5;

type Props = {
  min: number;
  max: number;
  onChange: (range: { min: number; max: number }) => void;
};

const thumb =
  "[&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:size-6 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-emerald-900 [&::-webkit-slider-thumb]:bg-amber-300 " +
  "[&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:size-6 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-emerald-900 [&::-moz-range-thumb]:bg-amber-300";

const inputClass = `pointer-events-none absolute inset-0 h-6 w-full appearance-none bg-transparent focus-visible:outline-none [&:focus-visible::-webkit-slider-thumb]:outline-2 [&:focus-visible::-webkit-slider-thumb]:outline-offset-2 [&:focus-visible::-webkit-slider-thumb]:outline-emerald-700 ${thumb}`;

export function formatMiles(value: number) {
  return `${Number.isInteger(value) ? value : value.toFixed(1)} mi`;
}

export function formatRange(min: number, max: number) {
  return `${formatMiles(min)} to ${max >= DISTANCE_MAX ? `${DISTANCE_MAX}+ mi` : formatMiles(max)}`;
}

export default function DistanceSlider({ min, max, onChange }: Props) {
  const id = useId();
  const percent = (value: number) => (value / DISTANCE_MAX) * 100;

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={`${id}-min`} className="text-sm font-bold text-emerald-700">Distance</label>
        <output className="text-sm font-semibold text-emerald-950" aria-live="polite">{formatRange(min, max)}</output>
      </div>
      <div className="relative mt-2 h-6">
        <div className="absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-emerald-900/20" />
        <div
          className="absolute top-1/2 h-2 -translate-y-1/2 rounded-full bg-emerald-900"
          style={{ left: `${percent(min)}%`, right: `${100 - percent(max)}%` }}
        />
        <input
          id={`${id}-min`}
          type="range"
          aria-label="Minimum distance in miles"
          min={0}
          max={DISTANCE_MAX}
          step={DISTANCE_STEP}
          value={min}
          onChange={(event) => onChange({ min: Math.min(Number(event.target.value), max - DISTANCE_STEP), max })}
          className={`${inputClass} ${min > DISTANCE_MAX / 2 ? "z-10" : ""}`}
        />
        <input
          type="range"
          aria-label="Maximum distance in miles"
          min={0}
          max={DISTANCE_MAX}
          step={DISTANCE_STEP}
          value={max}
          onChange={(event) => onChange({ min, max: Math.max(Number(event.target.value), min + DISTANCE_STEP) })}
          className={inputClass}
        />
      </div>
    </div>
  );
}
