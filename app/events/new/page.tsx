import { Suspense } from "react";
import type { Metadata } from "next";
import EventForm from "@/components/events/EventForm";

export const metadata: Metadata = {
  title: "Create an event | Rexburg Adventures",
  description: "Plan an event around Rexburg and invite others to join you.",
};

// EventForm reads the URL, which a static export only knows in the browser, so it needs a Suspense boundary.
export default function NewEventPage() {
  return (
    <Suspense fallback={<p className="mx-auto w-full max-w-6xl flex-1 px-4 py-12 text-emerald-900/80">Loading…</p>}>
      <EventForm />
    </Suspense>
  );
}
