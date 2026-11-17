import { Suspense } from "react";
import type { Metadata } from "next";
import EventForm from "@/components/events/EventForm";

export const metadata: Metadata = {
  title: "Edit your event | Rexburg Adventures",
  description: "Update an event you organized around Rexburg.",
};

export default function EditEventPage() {
  return (
    <Suspense fallback={<p className="mx-auto w-full max-w-6xl flex-1 px-4 py-12 text-emerald-900/80">Loading…</p>}>
      <EventForm />
    </Suspense>
  );
}
