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
        {/* Animated scene: the top of the screen on phones, half the screen on desktop */}
        <section className="relative h-[46svh] min-h-72 overflow-hidden bg-emerald-900 text-amber-50 md:h-auto">
          <AdventureScene />
          <div className="pointer-events-none relative z-10 max-w-xs p-6 md:max-w-sm md:p-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-amber-300 md:text-sm">
              Rexburg, Idaho
            </p>
            <h2 className="mt-2 text-2xl font-extrabold leading-tight md:mt-3 md:text-4xl">
              Every adventure starts with a pin.
            </h2>
          </div>
          <p className="pointer-events-none absolute bottom-20 left-6 z-10 text-sm font-medium text-emerald-100/80 md:bottom-6 md:left-12">
            <span className="md:hidden">Tap the map to drop a pin.</span>
            <span className="hidden md:inline">Click the map to drop a pin.</span>
          </p>
        </section>

        {/* On phones the form is a card that slides up over the bottom of the scene */}
        <section className="relative z-10 -mt-16 rounded-t-3xl bg-amber-50 px-4 pt-10 pb-12 md:mt-0 md:flex md:items-center md:rounded-none md:px-16 md:py-12">
          <div className="mx-auto w-full max-w-md">
            <LoginForm />
          </div>
        </section>
      </main>
    </div>
  );
}
