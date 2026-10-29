import type { Metadata } from "next";
import MapView from "@/components/map/MapView";

export const metadata: Metadata = {
  title: "Activity map | Rexburg Adventures",
  description: "Explore local activities around Rexburg on an interactive map.",
};

export default function MapPage() {
  return (
    <div className="flex flex-1 flex-col bg-amber-50 text-emerald-950">
      <main className="flex-1">
        <section className="bg-emerald-900 text-amber-50">
          <div className="mx-auto max-w-6xl px-4 py-10 md:py-16">
            <p className="text-sm font-semibold uppercase tracking-widest text-amber-300">Rexburg, Idaho</p>
            <h1 className="mt-3 max-w-2xl text-4xl font-extrabold leading-tight md:text-6xl">Find something nearby</h1>
            <p className="mt-4 max-w-xl text-lg text-emerald-100">
              Explore the activities in our guide on one map. Search by name or narrow the map by category.
            </p>
          </div>
        </section>
        <section className="bg-emerald-100/60">
          <div className="mx-auto max-w-6xl px-4 py-8 md:py-12">
            <MapView />
          </div>
        </section>
      </main>
    </div>
  );
}
