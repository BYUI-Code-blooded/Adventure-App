import Link from "next/link";

const team = [
  {
    name: "Team member name",
    role: "Project team",
    bio: "Add a short introduction here: what you worked on and what you enjoy doing around Rexburg.",
    favorite: "Add a favorite Rexburg spot",
    location: "",
    initials: "01",
  },
  {
    name: "Team member name",
    role: "Project team",
    bio: "Share a little about yourself, your part in the project and a local activity you recommend.",
    favorite: "Add a favorite Rexburg spot",
    location: "",
    initials: "02",
  },
  {
    name: "Team member name",
    role: "Project team",
    bio: "Tell visitors what you helped create and where you like to go when you have free time.",
    favorite: "Add a favorite Rexburg spot",
    location: "",
    initials: "03",
  },
  {
    name: "Team member name",
    role: "Project team",
    bio: "Introduce yourself, share what you contributed and mention a Rexburg adventure you enjoy.",
    favorite: "Add a favorite Rexburg spot",
    location: "",
    initials: "04",
  },
];

const mapsEmbedKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_API_KEY;

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
              Get to know the people building the guide. Add a photo, name and personal details
              for each teammate.
            </p>
            <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {team.map((member) => (
                <li key={member.initials} className="overflow-hidden rounded-2xl bg-amber-50 shadow-sm">
                  <div
                    role="img"
                    aria-label={`Photo placeholder for ${member.name.toLowerCase()}`}
                    className="grid aspect-[4/3] place-items-center bg-emerald-900 text-amber-300"
                  >
                    <div className="text-center">
                      <span className="mx-auto grid size-16 place-items-center rounded-full border-2 border-amber-300 text-xl font-extrabold">
                        {member.initials}
                      </span>
                      <span className="mt-3 block text-sm font-semibold text-emerald-100">
                        Photo placeholder
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="text-sm font-bold text-emerald-700">{member.role}</p>
                    <h3 className="mt-2 text-lg font-bold">{member.name}</h3>
                    <p className="mt-2 text-emerald-900/80">{member.bio}</p>
                    <div className="mt-5 rounded-2xl bg-emerald-100/60 p-4">
                      <p className="text-sm font-bold text-emerald-700">Favorite Rexburg spot</p>
                      <p className="mt-1 font-bold text-emerald-950">{member.favorite}</p>
                      <p className="mt-2 text-sm text-emerald-900/80">
                        Add a sentence about why they recommend this place.
                      </p>
                    </div>
                    {member.location && mapsEmbedKey ? (
                      <iframe
                        title={`Street View of ${member.favorite}`}
                        src={`https://www.google.com/maps/embed/v1/streetview?key=${encodeURIComponent(mapsEmbedKey)}&location=${encodeURIComponent(member.location)}`}
                        className="mt-4 aspect-video w-full rounded-2xl border-0"
                        loading="lazy"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen
                      />
                    ) : (
                      <div className="mt-4 grid aspect-video place-items-center rounded-2xl border-2 border-dashed border-emerald-700/40 bg-amber-50 p-4 text-center text-sm text-emerald-900/80">
                        Street View preview appears when a spot and Maps API key are added.
                      </div>
                    )}
                  </div>
                </li>
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
                  <p className="mt-2 text-lg font-extrabold">Local students</p>
                </li>
                <li className="rounded-2xl bg-amber-50 p-5 shadow-sm">
                  <p className="text-sm font-bold text-emerald-700">Here for</p>
                  <p className="mt-2 text-lg font-extrabold">More shared adventures</p>
                </li>
              </ul>
            </div>
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
