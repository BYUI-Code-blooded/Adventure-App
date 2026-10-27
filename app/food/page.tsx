import type { Metadata } from "next";
import ActivityDirectory from "@/components/activities/ActivityDirectory";

export const metadata: Metadata = {
  title: "Food & treats | Rexburg Adventures",
  description: "Find local restaurants, cafés, desserts, and other tasty stops around Rexburg, Idaho.",
};

export default function FoodPage() {
  return (
    <div className="flex flex-1 flex-col bg-amber-50 text-emerald-950">
      <main className="flex-1">
        <section className="bg-emerald-900 text-amber-50">
          <div className="mx-auto max-w-6xl px-4 py-10 md:py-16">
            <p className="text-sm font-semibold uppercase tracking-widest text-amber-300">Rexburg, Idaho</p>
            <h1 className="mt-3 max-w-2xl text-4xl font-extrabold leading-tight md:text-6xl">Food &amp; treats</h1>
            <p className="mt-4 max-w-xl text-lg text-emerald-100">
              Find a new favorite, grab a quick bite, or treat yourself around town.
            </p>
          </div>
        </section>
        <section className="bg-emerald-100/60">
          <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
            <h2 className="text-2xl font-extrabold md:text-3xl">Find something delicious</h2>
            <p className="mt-3 max-w-xl text-emerald-900/80">
              Browse local restaurants, cafés, and dessert spots. Open status follows posted weekly hours; check a restaurant’s listing for holiday changes.
            </p>
            <div className="mt-6">
              <ActivityDirectory category="food" />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
