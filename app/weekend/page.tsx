import type { Metadata } from "next";
import ActivityDirectory from "@/components/activities/ActivityDirectory";

export const metadata: Metadata = {
  title: "Weekend Events | Rexburg Adventures",
  description: "Browse weekend activities and events around Rexburg, Idaho.",
};

export default function WeekendPage() {
  return (
    <div className="flex flex-1 flex-col bg-amber-50 text-emerald-950">
      <main className="flex-1">
        <section className="bg-emerald-900 text-amber-50">
          <div className="mx-auto max-w-6xl px-4 py-10 md:py-16">
            <p className="text-sm font-semibold uppercase tracking-widest text-amber-300">Rexburg, Idaho</p>
            <h1 className="mt-3 max-w-2xl text-4xl font-extrabold leading-tight md:text-6xl">Weekend Events</h1>
            <p className="mt-4 max-w-xl text-lg text-emerald-100">
              Find a fun way to spend your weekend, from a relaxed meetup to an outdoor adventure.
            </p>
          </div>
        </section>
        <section className="bg-emerald-100/60">
          <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
            <h2 className="text-2xl font-extrabold md:text-3xl">See what’s happening</h2>
            <p className="mt-3 max-w-xl text-emerald-900/80">
              The TEST listings below are examples for checking this page. They are not scheduled events.
            </p>
            <div className="mt-6">
              <ActivityDirectory category="weekend" />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
