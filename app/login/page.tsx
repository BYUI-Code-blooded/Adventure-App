// Owner: Tech lead
import type { Metadata } from "next";
import AdventureScene from "@/components/login/AdventureScene";
import LoginForm from "@/components/login/LoginForm";

export const metadata: Metadata = {
  title: "Sign in | Local Adventures & Activities Guide",
};

export default function LoginPage() {
  return (
    <div className="flex flex-1 flex-col bg-amber-50 text-emerald-950">
      <main className="flex flex-1 flex-col md:grid md:grid-cols-2">
        {/* Animated scene: a banner on phones, half the screen on desktop */}
        <section className="relative h-52 overflow-hidden bg-emerald-900 text-amber-50 sm:h-64 md:h-auto">
          <AdventureScene />
          <div className="pointer-events-none relative z-10 hidden max-w-sm p-12 md:block">
            <p className="text-sm font-semibold uppercase tracking-widest text-amber-300">
              Rexburg, Idaho
            </p>
            <h2 className="mt-3 text-4xl font-extrabold leading-tight">
              Every adventure starts with a pin.
            </h2>
          </div>
          <p className="pointer-events-none absolute bottom-6 left-12 z-10 hidden text-sm font-medium text-emerald-100/80 md:block">
            Click the map to drop a pin.
          </p>
        </section>

        <section className="flex items-center px-4 py-12 md:px-16">
          <div className="mx-auto w-full max-w-md">
            <LoginForm />
          </div>
        </section>
      </main>
    </div>
  );
}
