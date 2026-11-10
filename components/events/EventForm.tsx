"use client";

// "Create an event": reached from a pin dropped on the map (?lat=&lon=) or from an activity (?activity=).
import dynamic from "next/dynamic";
import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { Session } from "@supabase/supabase-js";
import { useAuthProfile } from "@/components/auth/useAuthProfile";
import { errorClass, inputClass, primaryClass, secondaryClass } from "@/components/auth/styles";
import type { Point } from "@/components/suggestions/LocationPicker";
import {
  EVENT_DESCRIPTION_MAX,
  EVENT_NAME_MAX,
  EVENT_SPOTS_MAX,
  parsePoint,
  rexburgTimeToIso,
  validateEventDescription,
  validateEventEnd,
  validateEventLocation,
  validateEventName,
  validateEventStart,
  validateSpots,
} from "@/lib/events";
import { ADDRESS_MAX, MAX_DISTANCE_KM } from "@/lib/suggestions";
import { supabase } from "@/lib/supabase";
import type { Activity, Profile } from "@/lib/types";

const LocationPicker = dynamic(() => import("@/components/suggestions/LocationPicker"), {
  ssr: false,
  loading: () => (
    <div className="grid h-72 place-items-center bg-emerald-900 text-amber-100 md:h-96" role="status">
      Loading the map…
    </div>
  ),
});

type LinkedActivity = Pick<Activity, "id" | "name" | "address" | "lat" | "lon">;
type Errors = Partial<Record<"name" | "description" | "start" | "end" | "location" | "spots", string>>;

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col bg-amber-50 text-emerald-950">
      <main className="flex-1">
        <section className="bg-emerald-900 text-amber-50">
          <div className="mx-auto max-w-6xl px-4 py-10 md:py-16">
            <p className="text-sm font-semibold uppercase tracking-widest text-amber-300">Plan an event</p>
            <h1 className="mt-3 max-w-2xl text-4xl font-extrabold leading-tight md:text-6xl">Get people together</h1>
            <p className="mt-4 max-w-xl text-lg text-emerald-100">
              Share what you&apos;re doing, when and where. Anyone can see it on the map and join you.
            </p>
          </div>
        </section>
        {children}
      </main>
    </div>
  );
}

function Notice({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12 md:py-16">
      <div className="max-w-xl rounded-2xl bg-emerald-100/60 p-6">
        <h2 className="text-lg font-bold">{title}</h2>
        {children}
      </div>
    </section>
  );
}

export default function EventForm() {
  const params = useSearchParams();
  const activityId = params.get("activity");
  const { session, checking, profile } = useAuthProfile();
  const signedIn = Boolean(session) && !session?.user.is_anonymous;

  // undefined while loading, null if there is no such activity
  const [activity, setActivity] = useState<LinkedActivity | null | undefined>(activityId ? undefined : null);

  useEffect(() => {
    if (!activityId) return;
    let active = true;
    supabase
      .from("activities")
      .select("id, name, address, lat, lon")
      .eq("id", activityId)
      .eq("status", "approved")
      .maybeSingle()
      .then(({ data }) => {
        if (active) setActivity(data as LinkedActivity | null);
      });
    return () => {
      active = false;
    };
  }, [activityId]);

  if (checking || (signedIn && profile === undefined) || activity === undefined) {
    return (
      <Shell>
        <p className="mx-auto max-w-6xl px-4 py-12 text-emerald-900/80">Loading…</p>
      </Shell>
    );
  }

  if (!signedIn || !session) {
    return (
      <Shell>
        <Notice title="Sign in to create an event">
          <p className="mt-2 text-emerald-900/80">It only takes your email. We send you a code, no password needed.</p>
          <Link href="/login" className={`mt-6 inline-block ${primaryClass} sm:w-auto`}>
            Sign in
          </Link>
        </Notice>
      </Shell>
    );
  }

  if (!profile?.name) {
    return (
      <Shell>
        <Notice title="Add your name first">
          <p className="mt-2 text-emerald-900/80">People need to know who is organizing, so add a name to your profile.</p>
          <Link href="/account" className={`mt-6 inline-block ${primaryClass} sm:w-auto`}>Go to your account</Link>
        </Notice>
      </Shell>
    );
  }

  return (
    <Shell>
      <EventFields
        activity={activity}
        activityMissing={Boolean(activityId) && !activity}
        pin={parsePoint(params.get("lat"), params.get("lon"))}
        session={session}
        profile={profile}
      />
    </Shell>
  );
}

function EventFields({ activity, activityMissing, pin, session, profile }: {
  activity: LinkedActivity | null;
  activityMissing: boolean;
  pin: Point | null;
  session: Session;
  profile: Profile;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [location, setLocation] = useState<Point | null>(activity ? { lat: activity.lat, lon: activity.lon } : pin);
  const [address, setAddress] = useState(activity?.address ?? "");
  const [spots, setSpots] = useState("");
  const [unlimited, setUnlimited] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [submitError, setSubmitError] = useState("");
  const [sending, setSending] = useState(false);
  const [created, setCreated] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (sending) return;
    const startIso = rexburgTimeToIso(start);
    const endIso = rexburgTimeToIso(end);
    const problems: Errors = {
      name: validateEventName(name) ?? undefined,
      description: validateEventDescription(description) ?? undefined,
      start: validateEventStart(startIso, new Date()) ?? undefined,
      end: validateEventEnd(startIso, endIso) ?? undefined,
      location: validateEventLocation(location, address) ?? undefined,
      spots: (unlimited ? null : validateSpots(spots)) ?? undefined,
    };
    setErrors(problems);
    if (Object.values(problems).some(Boolean)) return;

    setSending(true);
    setSubmitError("");
    // The organizer is creator_id, which the database sets to the signed-in user.
    const { error } = await supabase.from("events").insert({
      activity_id: activity?.id ?? null,
      name: name.trim(),
      description: description.trim(),
      address: address.trim() || null,
      lat: location?.lat ?? null,
      lon: location?.lon ?? null,
      start_time: startIso,
      end_time: endIso,
      max_participants: unlimited ? null : Number(spots),
    });
    setSending(false);
    if (error) {
      setSubmitError("We couldn't create your event. Please try again.");
      return;
    }
    setCreated(true);
  }

  if (created) {
    return (
      <Notice title="Your event is live!">
        <p className="mt-2 text-emerald-900/80">People can now find it on the map and join you.</p>
        <Link href="/map" className={`mt-6 inline-block ${primaryClass} sm:w-auto`}>See it on the map</Link>
      </Notice>
    );
  }

  return (
    <section className="mx-auto max-w-2xl px-4 py-12 md:py-16">
      <form onSubmit={submit} noValidate>
        <h2 className="text-2xl font-extrabold md:text-3xl">Tell people about it</h2>
        {activity && <p className="mt-2 font-semibold text-emerald-700">At {activity.name}</p>}
        {activityMissing && (
          <p role="status" className={errorClass}>We couldn&apos;t find that activity, but you can still create your event here.</p>
        )}

        <label htmlFor="e-name" className="mt-6 block text-sm font-bold">Event name</label>
        <input id="e-name" type="text" maxLength={EVENT_NAME_MAX} value={name} onChange={(e) => setName(e.target.value)}
          placeholder="Saturday morning hike" aria-invalid={Boolean(errors.name)} className={`mt-2 ${inputClass}`} />
        {errors.name && <p role="alert" className={errorClass}>{errors.name}</p>}

        <label htmlFor="e-description" className="mt-5 block text-sm font-bold">Description</label>
        <textarea id="e-description" rows={4} maxLength={EVENT_DESCRIPTION_MAX} value={description} onChange={(e) => setDescription(e.target.value)}
          placeholder="What's the plan? What should people bring?" aria-invalid={Boolean(errors.description)}
          className="mt-2 w-full rounded-2xl border-2 border-emerald-900 bg-amber-50 px-5 py-3 text-emerald-950 placeholder:text-emerald-900/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700" />
        {errors.description && <p role="alert" className={errorClass}>{errors.description}</p>}

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="e-start" className="block text-sm font-bold">Starts <span className="font-normal text-emerald-900/80">(Rexburg time)</span></label>
            <input id="e-start" type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)}
              aria-invalid={Boolean(errors.start)} className={`mt-2 ${inputClass}`} />
            {errors.start && <p role="alert" className={errorClass}>{errors.start}</p>}
          </div>
          <div>
            <label htmlFor="e-end" className="block text-sm font-bold">Ends <span className="font-normal text-emerald-900/80">(Rexburg time)</span></label>
            <input id="e-end" type="datetime-local" value={end} min={start || undefined} onChange={(e) => setEnd(e.target.value)}
              aria-invalid={Boolean(errors.end)} className={`mt-2 ${inputClass}`} />
            {errors.end && <p role="alert" className={errorClass}>{errors.end}</p>}
          </div>
        </div>

        <p className="mt-5 text-sm font-bold">Where is it?</p>
        <p className="mt-1 text-sm text-emerald-900/80">
          Add a pin, an address, or both. Tap the map to place the pin (within {MAX_DISTANCE_KM} km of Rexburg).
        </p>
        <div className="mt-3 overflow-hidden rounded-2xl border-2 border-emerald-900 bg-emerald-900">
          <LocationPicker value={location} centerOnValue onChange={(point) => { setLocation(point); setErrors((c) => ({ ...c, location: undefined })); }} />
        </div>
        {location && (
          <button type="button" onClick={() => setLocation(null)} className={`mt-3 ${secondaryClass} sm:w-auto`}>Remove pin</button>
        )}

        <label htmlFor="e-address" className="mt-5 block text-sm font-bold">Address</label>
        <input id="e-address" type="text" maxLength={ADDRESS_MAX} value={address} onChange={(e) => setAddress(e.target.value)}
          placeholder="123 Main St, Rexburg" aria-invalid={Boolean(errors.location)} className={`mt-2 ${inputClass}`} />
        {errors.location && <p role="alert" className={errorClass}>{errors.location}</p>}

        <label htmlFor="e-spots" className="mt-5 block text-sm font-bold">How many people can join?</label>
        <input id="e-spots" type="number" inputMode="numeric" min={1} max={EVENT_SPOTS_MAX} step={1} value={unlimited ? "" : spots} disabled={unlimited}
          onChange={(e) => setSpots(e.target.value)} placeholder="10" aria-invalid={Boolean(errors.spots)}
          className={`mt-2 ${inputClass} disabled:cursor-not-allowed disabled:opacity-60`} />
        <label className="mt-3 flex min-h-11 items-center gap-3 font-semibold">
          <input type="checkbox" checked={unlimited} className="size-5 accent-emerald-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
            onChange={(e) => { setUnlimited(e.target.checked); setErrors((c) => ({ ...c, spots: undefined })); }} />
          Unlimited
        </label>
        {errors.spots && <p role="alert" className={errorClass}>{errors.spots}</p>}

        <div className="mt-5 rounded-2xl bg-emerald-100/60 p-5">
          <h3 className="text-lg font-bold">Organized by</h3>
          <dl className="mt-3 space-y-2">
            <div>
              <dt className="text-sm font-bold text-emerald-700">Name</dt>
              <dd>{profile.name}</dd>
            </div>
            <div>
              <dt className="text-sm font-bold text-emerald-700">Email</dt>
              <dd className="break-all">{session.user.email}</dd>
            </div>
            <div>
              <dt className="text-sm font-bold text-emerald-700">Phone</dt>
              <dd>{profile.phone || "Not added"}</dd>
            </div>
          </dl>
          <p className="mt-3 text-sm text-emerald-900/80">
            This comes from your profile. Everyone can see your name, and signed-in members can see your email and phone so they can reach you.{" "}
            <Link href="/account" className="font-semibold text-emerald-700 underline">Update your profile</Link>
          </p>
        </div>

        {submitError && <p role="alert" className={errorClass}>{submitError}</p>}

        <button type="submit" className={`mt-6 ${primaryClass} sm:w-auto`} disabled={sending}>
          {sending ? "Creating…" : "Create event"}
        </button>
      </form>
    </section>
  );
}
