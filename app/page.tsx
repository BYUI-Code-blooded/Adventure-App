// Owner: HTML teammate
import Link from "next/link";
import { PinIcon, UsersIcon, SearchIcon } from "@/components/icons";

const steps = [
  {
    Icon: SearchIcon,
    title: "Find something to do",
    text: "Browse outdoor trips, indoor hangouts, food spots and weekend events around Rexburg.",
  },
  {
    Icon: PinIcon,
    title: "Drop a pin",
    text: "Tap the map to create an event. Pick the place, the activity and a day and time.",
  },
  {
    Icon: UsersIcon,
    title: "Bring people along",
    text: "Others can join your event, and you can see how many are going before you head out.",
  },
];

const categories = [
  { href: "/outdoor", label: "Outdoor" },
  { href: "/indoor", label: "Indoor" },
  { href: "/food", label: "Food & Treats" },
  { href: "/weekend", label: "Weekend Events" },
];

export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col bg-amber-50 text-emerald-950">
      <main className="flex-1">
        {/* Hero */}
        <section className="relative bg-emerald-900 text-amber-50">
          <div className="mx-auto max-w-6xl px-4 pt-10 pb-28 md:pt-20 md:pb-40">
            <p className="text-sm font-semibold uppercase tracking-widest text-amber-300">
              Rexburg, Idaho
            </p>
            <h1 className="mt-3 max-w-2xl text-4xl font-extrabold leading-tight md:text-6xl">
              Find your next adventure, and someone to go with.
            </h1>
            <p className="mt-4 max-w-xl text-lg text-emerald-100">
              A local guide to fun things to do around town, plus a live map where you can plan
              outings and see who&apos;s coming.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/map"
                className="rounded-full bg-amber-300 px-6 py-3 text-center font-bold text-emerald-950 hover:bg-amber-200"
              >
                Open the map
              </Link>
              <Link
                href="/submit-ideas"
                className="rounded-full border border-amber-100/40 px-6 py-3 text-center font-semibold hover:bg-emerald-800"
              >
                Suggest an idea
              </Link>
            </div>
          </div>
          {/* Mountain silhouette */}
          <svg
            viewBox="0 0 1440 120"
            preserveAspectRatio="none"
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-16 w-full md:h-28"
          >
            <path
              d="M0 120V80l120-30 90 25 160-65 140 55 110-30 180 50 150-70 170 60 120-35 200 45v35Z"
              className="fill-emerald-700"
            />
            <path
              d="M0 120V95l180-25 140 30 200-40 160 35 220-30 180 25 160-35 200 40v25Z"
              className="fill-amber-50"
            />
          </svg>
        </section>

        <section className="bg-emerald-100/60">
          <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
            <h2 className="text-2xl font-extrabold md:text-3xl">
              Pick your kind of adventure
            </h2>
            <p className="mt-3 max-w-xl text-emerald-900/80">
              Find a cozy indoor plan or get out and explore the places around Rexburg.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <Link
                href="/indoor"
                className="rounded-2xl bg-amber-50 p-6 shadow-sm hover:bg-amber-100 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-700"
              >
                <h3 className="text-lg font-bold">Indoor Activities</h3>
                <p className="mt-2 text-emerald-900/80">
                  Find a warm place to unwind, get creative, or have fun with friends.
                </p>
              </Link>
              <Link
                href="/outdoor"
                className="rounded-2xl bg-amber-50 p-6 shadow-sm hover:bg-amber-100 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-700"
              >
                <h3 className="text-lg font-bold">Outdoor Activities</h3>
                <p className="mt-2 text-emerald-900/80">
                  Explore local parks, rivers, and wide-open Idaho scenery.
                </p>
              </Link>
            </div>
          </div>
        </section>

        {/* What is this */}
        <section className="mx-auto max-w-6xl px-4 py-12 md:py-16">
          <div className="grid gap-8 md:grid-cols-2 md:items-center">
            <div>
              <h2 className="text-2xl font-extrabold md:text-3xl">What is this site?</h2>
              <p className="mt-4 text-emerald-900/80">
                Rexburg Adventures collects the best places to explore, eat and hang out in and
                around Rexburg, from Porter Park to the St. Anthony Sand Dunes. It&apos;s built by
                students, for anyone looking for something to do this week.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <Link
                  key={c.href}
                  href={c.href}
                  className="rounded-full border-2 border-emerald-900 px-4 py-2 font-semibold hover:bg-emerald-900 hover:text-amber-50"
                >
                  {c.label}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="bg-emerald-100/60">
          <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
            <h2 className="text-2xl font-extrabold md:text-3xl">How it works</h2>
            <ol className="mt-8 grid gap-4 md:grid-cols-3">
              {steps.map(({ Icon, title, text }, i) => (
                <li key={title} className="rounded-2xl bg-amber-50 p-6 shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="grid size-10 place-items-center rounded-full bg-emerald-900 text-amber-300">
                      <Icon className="size-5" />
                    </span>
                    <span className="text-sm font-bold text-emerald-700">Step {i + 1}</span>
                  </div>
                  <h3 className="mt-4 text-lg font-bold">{title}</h3>
                  <p className="mt-2 text-emerald-900/80">{text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Submit CTA */}
        <section className="mx-auto max-w-6xl px-4 py-12 md:py-16">
          <div className="rounded-3xl bg-amber-300 p-8 md:flex md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-extrabold">Know a hidden gem?</h2>
              <p className="mt-2 text-emerald-950/80">Share it and help others find it too.</p>
            </div>
            <Link
              href="/submit-ideas"
              className="mt-6 inline-block rounded-full bg-emerald-900 px-6 py-3 font-bold text-amber-50 hover:bg-emerald-800 md:mt-0"
            >
              Submit an idea
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
