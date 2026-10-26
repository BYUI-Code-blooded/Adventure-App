import type { Metadata } from "next";
import ActivityDirectory from "@/components/activities/ActivityDirectory";

export const metadata: Metadata = {
  title: "Outdoor activities | Rexburg Adventures",
  description: "Explore parks, rivers, trails, and seasonal adventures around Rexburg, Idaho.",
};

export default function OutdoorPage() {
  return (
    <div className="flex flex-1 flex-col bg-amber-50 text-emerald-950">
      <main className="flex-1">
        <section className="bg-emerald-900 text-amber-50">
          <div className="mx-auto max-w-6xl px-4 py-10 md:py-16">
            <p className="text-sm font-semibold uppercase tracking-widest text-amber-300">Rexburg, Idaho</p>
            <h1 className="mt-3 max-w-2xl text-4xl font-extrabold leading-tight md:text-6xl">Outdoor activities</h1>
            <p className="mt-4 max-w-xl text-lg text-emerald-100">
              Get outside for a quick walk, a river afternoon, or a day trip into Idaho’s wide-open spaces.
            </p>
          </div>
        </section>
        <section className="bg-emerald-100/60">
          <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
            <h2 className="text-2xl font-extrabold md:text-3xl">Find your next outing</h2>
            <p className="mt-3 max-w-xl text-emerald-900/80">Choose a category and find a little fresh air around Rexburg.</p>
            <div className="mt-6">
              <ActivityDirectory category="outdoor" />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
