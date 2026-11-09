import Link from "next/link";
import team from "@/content/team.json";
import TeamCard from "@/components/about/TeamCard";

export default function AboutPage() {
  return (
    <div className="flex flex-1 flex-col bg-amber-50 text-emerald-950">
      <main className="flex-1">
        <section className="bg-emerald-900 text-amber-50">
          <div className="mx-auto max-w-6xl px-4 py-10 md:py-16">
            <p className="text-sm font-semibold uppercase tracking-widest text-amber-300">
              About Rexburg Adventures
            </p>
            <h1 className="mt-3 max-w-2xl text-4xl font-extrabold leading-tight md:text-6xl">
              Meet the team behind your next adventure.
            </h1>
            <p className="mt-4 max-w-xl text-lg text-emerald-100">
              We&apos;re students building a friendly guide to places, events and people to explore
              with around Rexburg.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-12 md:py-16">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-extrabold md:text-3xl">A little about us</h2>
            <p className="mt-4 text-emerald-900/80">
              Rexburg Adventures is a student-built local guide for finding things to do, from
              outdoor trips and cozy hangouts to good food and weekend events. We made it to help
              you discover a new favorite place and make plans with other people.
            </p>
          </div>
        </section>

        <section className="bg-emerald-100/60">
          <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
            <h2 className="text-2xl font-extrabold md:text-3xl">The people who made it</h2>
            <p className="mt-3 max-w-xl text-emerald-900/80">
              Meet the four students who built this guide, and see where we like to go around town.
            </p>
            <ul className="mt-8 grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {team.map((member) => (
                <TeamCard key={member.name} member={member} />
              ))}
            </ul>
            <div className="mt-12">
              <p className="text-sm font-semibold uppercase tracking-widest text-emerald-700">
                Team quick facts
              </p>
              <h3 className="mt-2 text-xl font-extrabold md:text-2xl">A few things we share</h3>
              <ul className="mt-6 grid gap-4 sm:grid-cols-3">
                <li className="rounded-2xl bg-amber-50 p-5 shadow-sm">
                  <p className="text-sm font-bold text-emerald-700">Our home base</p>
                  <p className="mt-2 text-lg font-extrabold">Rexburg, Idaho</p>
                </li>
                <li className="rounded-2xl bg-amber-50 p-5 shadow-sm">
                  <p className="text-sm font-bold text-emerald-700">Made by</p>
                  <p className="mt-2 text-lg font-extrabold">BYU-Idaho students (CSE 170)</p>
                </li>
                <li className="rounded-2xl bg-amber-50 p-5 shadow-sm">
                  <p className="text-sm font-bold text-emerald-700">Places in the guide</p>
                  <p className="mt-2 text-lg font-extrabold">Indoor, Outdoor and Food</p>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-12 md:py-16">
          <h2 className="text-2xl font-extrabold md:text-3xl">Frequently asked questions</h2>
          <div className="mt-8 grid gap-4">
            <details className="rounded-2xl bg-amber-50 p-6 shadow-sm">
              <summary className="cursor-pointer font-bold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-700">
                Is it free to use?
              </summary>
              <p className="mt-3 text-emerald-900/80">Yes, it&apos;s completely free.</p>
            </details>
            <details className="rounded-2xl bg-amber-50 p-6 shadow-sm">
              <summary className="cursor-pointer font-bold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-700">
                Do I need an account?
              </summary>
              <p className="mt-3 text-emerald-900/80">
                Not to browse or use the map. Sign in to suggest a place.
              </p>
            </details>
            <details className="rounded-2xl bg-amber-50 p-6 shadow-sm">
              <summary className="cursor-pointer font-bold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-700">
                How do I suggest a place?
              </summary>
              <p className="mt-3 text-emerald-900/80">
                Sign in, then use Suggest. Our team reviews every idea before it shows up.
              </p>
            </details>
            <details className="rounded-2xl bg-amber-50 p-6 shadow-sm">
              <summary className="cursor-pointer font-bold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-700">
                Who checks the suggestions?
              </summary>
              <p className="mt-3 text-emerald-900/80">Our team&apos;s staff reviewers.</p>
            </details>
            <details className="rounded-2xl bg-amber-50 p-6 shadow-sm">
              <summary className="cursor-pointer font-bold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-700">
                Is this an official BYU-Idaho site?
              </summary>
              <p className="mt-3 text-emerald-900/80">No, it&apos;s a student class project.</p>
            </details>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-12 md:py-16">
          <div className="rounded-3xl bg-amber-300 p-8 md:flex md:items-center md:justify-between md:gap-8">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-emerald-700">
                Get in touch
              </p>
              <h2 className="mt-3 text-2xl font-extrabold md:text-3xl">Help us make the guide better.</h2>
              <p className="mt-2 max-w-xl text-emerald-950/80">
                Have a question or a place we should add? Send the team an idea and help more
                people find something fun to do.
              </p>
            </div>
            <Link
              href="/submit-ideas"
              className="mt-6 inline-block rounded-full bg-emerald-900 px-6 py-3 text-center font-bold text-amber-50 hover:bg-emerald-800 md:mt-0"
            >
              Contact us with an idea
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
