// Owner: HTML teammate
import Link from "next/link";

const steps = [
  {
    title: "Explore the guide",
    text: "Read up on outdoor trips, indoor spots, food and treats, and what's on this weekend.",
  },
  {
    title: "Open the map",
    text: "See upcoming events around Rexburg and filter them by day.",
  },
  {
    title: "Start or join an event",
    text: "Tap the map to set a place, activity and time. Others can join, and everyone sees the headcount.",
  },
];

const pins = [
  { pos: "top-[22%] left-[28%]", label: "Porter Park", count: 6 },
  { pos: "top-[55%] left-[62%]", label: "Teton River", count: 11 },
  { pos: "top-[70%] left-[20%]", label: "Campus", count: 3 },
];

export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col bg-stone-50 text-stone-900">
      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto grid max-w-6xl gap-10 px-4 py-10 md:grid-cols-[1.2fr_1fr] md:items-center md:py-20">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-700">
              Things to do · Rexburg, Idaho
            </p>
            <h1 className="mt-4 font-serif text-5xl leading-[1.05] md:text-7xl">
              Get out there.
              <br />
              <span className="italic text-orange-700">Together.</span>
            </h1>
            <p className="mt-6 max-w-md text-lg text-stone-600">
              A guide to the places worth going in Rexburg, and a shared map for making plans with
              other people.
            </p>
            <Link
              href="/map"
              className="mt-8 inline-flex items-center gap-2 bg-stone-900 px-6 py-3 font-semibold text-stone-50 hover:bg-orange-700"
            >
              Explore the map <span aria-hidden="true">→</span>
            </Link>
          </div>

          {/* Mini map preview */}
          <Link
            href="/map"
            aria-label="Open the map"
            className="relative block aspect-[4/3] overflow-hidden border border-stone-300 bg-[#e8e4d8]"
          >
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#d6d0bf_1px,transparent_1px),linear-gradient(to_bottom,#d6d0bf_1px,transparent_1px)] bg-[size:32px_32px]" />
            <div className="absolute top-0 bottom-0 left-[45%] w-3 -skew-x-12 bg-sky-300/70" />
            <div className="absolute top-[40%] right-0 left-0 h-1.5 bg-white" />
            <div className="absolute top-0 bottom-0 left-[70%] w-1.5 bg-white" />
            {pins.map((p) => (
              <div
                key={p.label}
                className={`absolute flex -translate-x-1/2 -translate-y-full flex-col items-center ${p.pos}`}
              >
                <span className="whitespace-nowrap bg-stone-900 px-2 py-1 text-xs font-semibold text-stone-50">
                  {p.label} · {p.count} going
                </span>
                <span className="size-3 rotate-45 -translate-y-1.5 bg-stone-900" />
                <span className="size-3 rounded-full border-2 border-stone-50 bg-orange-600" />
              </div>
            ))}
          </Link>
        </section>

        {/* About */}
        <section className="border-y border-stone-300 bg-white">
          <div className="mx-auto max-w-6xl px-4 py-12 md:grid md:grid-cols-[1fr_2fr] md:gap-12 md:py-16">
            <h2 className="font-serif text-3xl">What this is</h2>
            <p className="mt-4 text-lg leading-relaxed text-stone-700 md:mt-0">
              Made by BYU-Idaho students, the Field Guide gathers the best outdoor, indoor, food
              and weekend activities in and around Rexburg in one place. When you find something
              you want to do, put it on the map and see who wants to come along.
            </p>
          </div>
        </section>

        {/* How it works */}
        <section className="mx-auto max-w-6xl px-4 py-12 md:py-16">
          <h2 className="font-serif text-3xl">How to use it</h2>
          <ol className="mt-8 grid gap-8 md:grid-cols-3">
            {steps.map((s, i) => (
              <li key={s.title} className="border-t-2 border-stone-900 pt-4">
                <span className="font-serif text-4xl text-orange-700">0{i + 1}</span>
                <h3 className="mt-2 text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-stone-600">{s.text}</p>
              </li>
            ))}
          </ol>
          <p className="mt-12 text-stone-600">
            Know a place we missed?{" "}
            <Link
              href="/submit-ideas"
              className="font-semibold text-stone-900 underline decoration-orange-600 decoration-2 underline-offset-4 hover:text-orange-700"
            >
              Submit an idea
            </Link>
            .
          </p>
        </section>
      </main>
    </div>
  );
}
