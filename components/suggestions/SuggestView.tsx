"use client";

// "Suggest an idea": a signed-in member proposes an activity. Staff review it in /admin before it shows on the map.
import dynamic from "next/dynamic";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  ADDRESS_MAX,
  DESCRIPTION_MAX,
  MAX_DISTANCE_KM,
  MAX_PENDING,
  NAME_MAX,
  categoryOptions,
  validateActivityName,
  validateAddress,
  validateDescription,
  validateLocation,
  validateUrl,
} from "@/lib/suggestions";
import type { ActivityCategory, ActivityStatus } from "@/lib/types";
import { useAuthProfile } from "@/components/auth/useAuthProfile";
import { errorClass, inputClass, primaryClass, secondaryClass } from "@/components/auth/styles";
import StatusBadge from "@/components/suggestions/StatusBadge";
import type { Point } from "@/components/suggestions/LocationPicker";

const LocationPicker = dynamic(() => import("@/components/suggestions/LocationPicker"), {
  ssr: false,
  loading: () => (
    <div className="grid h-72 place-items-center bg-emerald-900 text-amber-100 md:h-96" role="status">
      Loading the map…
    </div>
  ),
});

type MySuggestion = {
  id: string;
  name: string;
  category: ActivityCategory;
  status: ActivityStatus;
  rejection_reason: string | null;
  created_at: string;
};

type Errors = Partial<Record<"name" | "description" | "address" | "website" | "photo" | "location", string>>;

const categoryLabel = Object.fromEntries(categoryOptions.map((option) => [option.value, option.label]));

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col bg-amber-50 text-emerald-950">
      <main className="flex-1">{children}</main>
    </div>
  );
}

function Hero() {
  return (
    <section className="bg-emerald-900 text-amber-50">
      <div className="mx-auto max-w-6xl px-4 py-10 md:py-16">
        <p className="text-sm font-semibold uppercase tracking-widest text-amber-300">Submit an idea</p>
        <h1 className="mt-3 max-w-2xl text-4xl font-extrabold leading-tight md:text-6xl">Know a hidden gem?</h1>
        <p className="mt-4 max-w-xl text-lg text-emerald-100">
          Tell us about a place or activity around Rexburg. We review every idea before it shows up on the map.
        </p>
      </div>
    </section>
  );
}

export default function SuggestView() {
  const { session, checking } = useAuthProfile();
  const userId = session?.user.id;
  const signedIn = Boolean(session) && !session?.user.is_anonymous;

  const [name, setName] = useState("");
  const [category, setCategory] = useState<ActivityCategory>("outdoor");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [website, setWebsite] = useState("");
  const [photo, setPhoto] = useState("");
  const [location, setLocation] = useState<Point | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [submitError, setSubmitError] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const [mine, setMine] = useState<MySuggestion[] | null>(null);
  const [listError, setListError] = useState(false);

  const loadMine = useCallback(async () => {
    if (!userId) return;
    const { data, error } = await supabase
      .from("activities")
      .select("id, name, category, status, rejection_reason, created_at")
      .eq("created_by", userId)
      .neq("status", "approved")
      .order("created_at", { ascending: false });
    if (error) {
      setListError(true);
      return;
    }
    setListError(false);
    setMine((data ?? []) as MySuggestion[]);
  }, [userId]);

  useEffect(() => {
    if (!signedIn) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loads the author's own suggestions once the session is known
    void loadMine();
  }, [signedIn, loadMine]);

  if (checking) {
    return (
      <Shell>
        <p className="mx-auto max-w-6xl px-4 py-12 text-emerald-900/80">Loading…</p>
      </Shell>
    );
  }

  if (!signedIn) {
    return (
      <Shell>
        <Hero />
        <section className="mx-auto max-w-6xl px-4 py-12 md:py-16">
          <div className="max-w-xl rounded-2xl bg-emerald-100/60 p-6">
            <h2 className="text-lg font-bold">Sign in to suggest an idea</h2>
            <p className="mt-2 text-emerald-900/80">
              It only takes your email. We send you a code, no password needed.
            </p>
            <Link href="/login" className={`mt-6 inline-block ${primaryClass} sm:w-auto`}>
              Sign in
            </Link>
          </div>
        </section>
      </Shell>
    );
  }

  const pendingCount = (mine ?? []).filter((item) => item.status === "pending").length;
  const atLimit = pendingCount >= MAX_PENDING;

  function check(): Errors {
    const next: Errors = {};
    const nameProblem = validateActivityName(name);
    const descriptionProblem = validateDescription(description);
    const addressProblem = validateAddress(address);
    const websiteProblem = validateUrl(website);
    const photoProblem = validateUrl(photo, true);
    const locationProblem = validateLocation(location);
    if (nameProblem) next.name = nameProblem;
    if (descriptionProblem) next.description = descriptionProblem;
    if (addressProblem) next.address = addressProblem;
    if (websiteProblem) next.website = websiteProblem;
    if (photoProblem) next.photo = photoProblem;
    if (locationProblem) next.location = locationProblem;
    return next;
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (sending || atLimit || !location) {
      if (!location) setErrors((current) => ({ ...current, location: validateLocation(null) ?? "" }));
      return;
    }
    const found = check();
    setErrors(found);
    setSent(false);
    if (Object.keys(found).length > 0) return;

    setSending(true);
    setSubmitError("");
    const { error } = await supabase.from("activities").insert({
      name: name.trim(),
      category,
      description: description.trim() || null,
      address: address.trim() || null,
      website_url: website.trim() || null,
      photo_url: photo.trim() || null,
      lat: location.lat,
      lon: location.lon,
      status: "pending",
    });
    setSending(false);
    if (error) {
      setSubmitError(
        /pending suggestions/i.test(error.message)
          ? `You already have ${MAX_PENDING} ideas waiting for review. Wait for a review or delete one.`
          : "We couldn't send your idea. Please try again.",
      );
      return;
    }
    setName("");
    setDescription("");
    setAddress("");
    setWebsite("");
    setPhoto("");
    setLocation(null);
    setSent(true);
    void loadMine();
  }

  async function withdraw(id: string) {
    const { error } = await supabase.from("activities").delete().eq("id", id).eq("status", "pending");
    if (error) setListError(true);
    else void loadMine();
  }

  return (
    <Shell>
      <Hero />

      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:py-16 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <form onSubmit={submit} noValidate>
          <h2 className="text-2xl font-extrabold md:text-3xl">Tell us about it</h2>

          <label htmlFor="s-name" className="mt-6 block text-sm font-bold">Name</label>
          <input id="s-name" type="text" maxLength={NAME_MAX} value={name} onChange={(e) => setName(e.target.value)}
            placeholder="Teton Dam overlook" aria-invalid={Boolean(errors.name)} className={`mt-2 ${inputClass}`} />
          {errors.name && <p role="alert" className={errorClass}>{errors.name}</p>}

          <label htmlFor="s-category" className="mt-5 block text-sm font-bold">Category</label>
          <select id="s-category" value={category} onChange={(e) => setCategory(e.target.value as ActivityCategory)} className={`mt-2 ${inputClass}`}>
            {categoryOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>

          <label htmlFor="s-description" className="mt-5 block text-sm font-bold">
            Description <span className="font-normal text-emerald-900/80">(optional)</span>
          </label>
          <textarea id="s-description" rows={4} maxLength={DESCRIPTION_MAX} value={description} onChange={(e) => setDescription(e.target.value)}
            placeholder="What makes it worth a visit?" aria-invalid={Boolean(errors.description)}
            className="mt-2 w-full rounded-2xl border-2 border-emerald-900 bg-amber-50 px-5 py-3 text-emerald-950 placeholder:text-emerald-900/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700" />
          {errors.description && <p role="alert" className={errorClass}>{errors.description}</p>}

          <label htmlFor="s-address" className="mt-5 block text-sm font-bold">
            Address <span className="font-normal text-emerald-900/80">(optional)</span>
          </label>
          <input id="s-address" type="text" maxLength={ADDRESS_MAX} value={address} onChange={(e) => setAddress(e.target.value)}
            placeholder="123 Main St, Rexburg" aria-invalid={Boolean(errors.address)} className={`mt-2 ${inputClass}`} />
          {errors.address && <p role="alert" className={errorClass}>{errors.address}</p>}

          <label htmlFor="s-website" className="mt-5 block text-sm font-bold">
            Website <span className="font-normal text-emerald-900/80">(optional)</span>
          </label>
          <input id="s-website" type="url" value={website} onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://example.com" aria-invalid={Boolean(errors.website)} className={`mt-2 ${inputClass}`} />
          {errors.website && <p role="alert" className={errorClass}>{errors.website}</p>}

          <label htmlFor="s-photo" className="mt-5 block text-sm font-bold">
            Photo link <span className="font-normal text-emerald-900/80">(optional)</span>
          </label>
          <input id="s-photo" type="url" value={photo} onChange={(e) => setPhoto(e.target.value)}
            placeholder="https://example.com/photo.jpg" aria-invalid={Boolean(errors.photo)} className={`mt-2 ${inputClass}`} />
          {errors.photo && <p role="alert" className={errorClass}>{errors.photo}</p>}

          <p className="mt-5 text-sm font-bold">Where is it?</p>
          <p className="mt-1 text-sm text-emerald-900/80">Tap the map to drop a pin. Tap again to move it (within {MAX_DISTANCE_KM} km of Rexburg).</p>
          <div className="mt-3 overflow-hidden rounded-2xl border-2 border-emerald-900 bg-emerald-900">
            <LocationPicker value={location} onChange={(point) => { setLocation(point); setErrors((c) => ({ ...c, location: undefined })); }} />
          </div>
          {errors.location && <p role="alert" className={errorClass}>{errors.location}</p>}

          {submitError && <p role="alert" className={errorClass}>{submitError}</p>}
          {atLimit && (
            <p role="status" className={errorClass}>
              You have {MAX_PENDING} ideas waiting for review. You can send more once we review them.
            </p>
          )}

          <button type="submit" className={`mt-6 ${primaryClass} sm:w-auto`} disabled={sending || atLimit}>
            {sending ? "Sending…" : "Submit this idea"}
          </button>
          {sent && (
            <p role="status" className="mt-3 text-sm font-semibold text-emerald-700">
              Thanks! Your idea is waiting for review.
            </p>
          )}
        </form>

        <aside>
          <h2 className="text-2xl font-extrabold md:text-3xl">Your ideas</h2>
          {listError && (
            <p role="alert" className={errorClass}>We couldn&apos;t load your ideas right now.</p>
          )}
          {mine === null && !listError && <p className="mt-4 text-emerald-900/80">Loading…</p>}
          {mine && mine.length === 0 && (
            <p className="mt-4 text-emerald-900/80">
              Ideas you send show up here while we review them. Approved ideas move to the map.
            </p>
          )}
          {mine && mine.length > 0 && (
            <ul className="mt-6 space-y-4">
              {mine.map((item) => (
                <li key={item.id} className="rounded-2xl bg-emerald-100/60 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-lg font-bold">{item.name}</h3>
                    <StatusBadge status={item.status} />
                  </div>
                  <p className="mt-1 text-sm font-semibold text-emerald-700">{categoryLabel[item.category]}</p>
                  {item.status === "rejected" && item.rejection_reason && (
                    <p className="mt-2 text-emerald-900/80">Reason: {item.rejection_reason}</p>
                  )}
                  {item.status === "pending" && (
                    <button type="button" onClick={() => withdraw(item.id)} className={`mt-4 ${secondaryClass} sm:w-auto`}>
                      Withdraw
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </aside>
      </section>
    </Shell>
  );
}
