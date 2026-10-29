"use client";

// Staff-only page: review the ideas members suggest. Approving publishes the activity on the map.
// The role check below only hides the page. The real protection is the RLS policies on public.activities.
import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  ADDRESS_MAX,
  DESCRIPTION_MAX,
  NAME_MAX,
  REASON_MAX,
  categoryOptions,
  validateActivityName,
  validateAddress,
  validateDescription,
  validateUrl,
} from "@/lib/suggestions";
import type { Activity, ActivityCategory, ActivityStatus } from "@/lib/types";
import { useAuthProfile } from "@/components/auth/useAuthProfile";
import { errorClass, inputClass, primaryClass, secondaryClass } from "@/components/auth/styles";
import StatusBadge from "@/components/suggestions/StatusBadge";

type Row = Pick<
  Activity,
  "id" | "name" | "description" | "address" | "lat" | "lon" | "website_url" | "photo_url" | "category" | "status" | "rejection_reason" | "created_by" | "created_at"
>;

const tabs: Array<{ value: ActivityStatus; label: string }> = [
  { value: "pending", label: "Waiting" },
  { value: "rejected", label: "Rejected" },
  { value: "approved", label: "Approved" },
];

const categoryLabel = Object.fromEntries(categoryOptions.map((option) => [option.value, option.label]));

const textareaClass =
  "mt-2 w-full rounded-2xl border-2 border-emerald-900 bg-amber-50 px-5 py-3 text-emerald-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700";

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col bg-amber-50 text-emerald-950">
      <main className="flex-1">{children}</main>
    </div>
  );
}

function safeLink(value?: string | null) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}

function ReviewCard({ row, author, onChanged }: { row: Row; author: string; onChanged: () => void }) {
  const [mode, setMode] = useState<"view" | "edit" | "reject">("view");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState(row.name);
  const [category, setCategory] = useState<ActivityCategory>(row.category);
  const [description, setDescription] = useState(row.description ?? "");
  const [address, setAddress] = useState(row.address ?? "");
  const [website, setWebsite] = useState(row.website_url ?? "");
  const [reason, setReason] = useState("");

  const websiteLink = safeLink(row.website_url);
  const photoLink = safeLink(row.photo_url);
  const mapUrl = `https://www.openstreetmap.org/?mlat=${row.lat}&mlon=${row.lon}#map=17/${row.lat}/${row.lon}`;

  async function change(values: Record<string, unknown>) {
    setBusy(true);
    setError("");
    const { data, error: updateError } = await supabase
      .from("activities")
      .update(values)
      .eq("id", row.id)
      .select("id");
    setBusy(false);
    if (updateError || !data || data.length === 0) {
      setError("That didn't work. You may not have permission, or the idea was removed.");
      return;
    }
    setMode("view");
    onChanged();
  }

  function saveEdit(event: FormEvent) {
    event.preventDefault();
    const problem =
      validateActivityName(name) ?? validateDescription(description) ?? validateAddress(address) ?? validateUrl(website);
    if (problem) {
      setError(problem);
      return;
    }
    void change({
      name: name.trim(),
      category,
      description: description.trim() || null,
      address: address.trim() || null,
      website_url: website.trim() || null,
    });
  }

  function reject(event: FormEvent) {
    event.preventDefault();
    void change({ status: "rejected", rejection_reason: reason.trim() || null });
  }

  const status = row.status ?? "pending";

  return (
    <li className="rounded-2xl bg-amber-50 p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-bold">{row.name}</h2>
        <StatusBadge status={status} />
      </div>
      <p className="mt-1 text-sm font-semibold text-emerald-700">
        {categoryLabel[row.category]} · suggested by {author} · {new Date(row.created_at).toLocaleDateString("en-US")}
      </p>

      {mode === "edit" ? (
        <form onSubmit={saveEdit} noValidate className="mt-4">
          <label htmlFor={`n-${row.id}`} className="block text-sm font-bold">Name</label>
          <input id={`n-${row.id}`} value={name} maxLength={NAME_MAX} onChange={(e) => setName(e.target.value)} className={`mt-2 ${inputClass}`} />
          <label htmlFor={`c-${row.id}`} className="mt-4 block text-sm font-bold">Category</label>
          <select id={`c-${row.id}`} value={category} onChange={(e) => setCategory(e.target.value as ActivityCategory)} className={`mt-2 ${inputClass}`}>
            {categoryOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
          <label htmlFor={`d-${row.id}`} className="mt-4 block text-sm font-bold">Description</label>
          <textarea id={`d-${row.id}`} rows={4} value={description} maxLength={DESCRIPTION_MAX} onChange={(e) => setDescription(e.target.value)} className={textareaClass} />
          <label htmlFor={`a-${row.id}`} className="mt-4 block text-sm font-bold">Address</label>
          <input id={`a-${row.id}`} value={address} maxLength={ADDRESS_MAX} onChange={(e) => setAddress(e.target.value)} className={`mt-2 ${inputClass}`} />
          <label htmlFor={`w-${row.id}`} className="mt-4 block text-sm font-bold">Website</label>
          <input id={`w-${row.id}`} value={website} onChange={(e) => setWebsite(e.target.value)} className={`mt-2 ${inputClass}`} />
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <button type="submit" className={`${primaryClass} sm:w-auto`} disabled={busy}>{busy ? "Saving…" : "Save changes"}</button>
            <button type="button" className={`${secondaryClass} sm:w-auto`} onClick={() => { setMode("view"); setError(""); }}>Cancel</button>
          </div>
        </form>
      ) : (
        <>
          {row.description && <p className="mt-3 whitespace-pre-line text-emerald-900/80">{row.description}</p>}
          <dl className="mt-3 space-y-1 text-sm">
            {row.address && <div><dt className="inline font-bold text-emerald-700">Address: </dt><dd className="inline">{row.address}</dd></div>}
            {websiteLink && <div><dt className="inline font-bold text-emerald-700">Website: </dt><dd className="inline break-all"><a className="font-semibold underline" href={websiteLink} target="_blank" rel="noopener noreferrer">{websiteLink}</a></dd></div>}
            {photoLink && <div><dt className="inline font-bold text-emerald-700">Photo: </dt><dd className="inline break-all"><a className="font-semibold underline" href={photoLink} target="_blank" rel="noopener noreferrer">{photoLink}</a></dd></div>}
            <div><dt className="inline font-bold text-emerald-700">Pin: </dt><dd className="inline"><a className="font-semibold underline" href={mapUrl} target="_blank" rel="noopener noreferrer">View on OpenStreetMap</a></dd></div>
            {status === "rejected" && row.rejection_reason && <div><dt className="inline font-bold text-emerald-700">Reason: </dt><dd className="inline">{row.rejection_reason}</dd></div>}
          </dl>
        </>
      )}

      {mode === "reject" && (
        <form onSubmit={reject} noValidate className="mt-4">
          <label htmlFor={`r-${row.id}`} className="block text-sm font-bold">
            Reason <span className="font-normal text-emerald-900/80">(optional, the author sees it)</span>
          </label>
          <input id={`r-${row.id}`} value={reason} maxLength={REASON_MAX} onChange={(e) => setReason(e.target.value)} className={`mt-2 ${inputClass}`} />
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <button type="submit" className={`${primaryClass} sm:w-auto`} disabled={busy}>{busy ? "Rejecting…" : "Reject idea"}</button>
            <button type="button" className={`${secondaryClass} sm:w-auto`} onClick={() => { setMode("view"); setError(""); }}>Cancel</button>
          </div>
        </form>
      )}

      {error && <p role="alert" className={errorClass}>{error}</p>}

      {mode === "view" && (
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          {status !== "approved" && (
            <button type="button" className={`${primaryClass} sm:w-auto`} disabled={busy} onClick={() => void change({ status: "approved" })}>
              {busy ? "Working…" : "Approve and publish"}
            </button>
          )}
          {status === "pending" && (
            <button type="button" className={`${secondaryClass} sm:w-auto`} onClick={() => setMode("reject")}>Reject</button>
          )}
          {status === "approved" && (
            <button type="button" className={`${secondaryClass} sm:w-auto`} disabled={busy} onClick={() => void change({ status: "pending" })}>Unpublish</button>
          )}
          <button type="button" className={`${secondaryClass} sm:w-auto`} onClick={() => { setMode("edit"); setError(""); }}>Edit</button>
        </div>
      )}
    </li>
  );
}

export default function ReviewQueue() {
  const router = useRouter();
  const { session, checking, profile } = useAuthProfile();
  const [tab, setTab] = useState<ActivityStatus>("pending");
  const [rows, setRows] = useState<Row[] | null>(null);
  const [authors, setAuthors] = useState<Record<string, string>>({});
  const [error, setError] = useState(false);

  const isStaff = profile?.role === "admin" || profile?.role === "developer";

  useEffect(() => {
    if (!checking && !session) router.replace("/login");
  }, [checking, session, router]);

  const load = useCallback(async () => {
    const { data, error: queryError } = await supabase
      .from("activities")
      .select("id, name, description, address, lat, lon, website_url, photo_url, category, status, rejection_reason, created_by, created_at")
      .eq("status", tab)
      .order("created_at", { ascending: false });
    if (queryError) {
      setError(true);
      return;
    }
    const list = (data ?? []) as Row[];
    const ids = [...new Set(list.map((row) => row.created_by).filter((id): id is string => Boolean(id)))];
    if (ids.length > 0) {
      const { data: people } = await supabase.from("public_profiles").select("id, name").in("id", ids);
      setAuthors(Object.fromEntries((people ?? []).map((person) => [person.id, person.name ?? ""])));
    }
    setError(false);
    setRows(list);
  }, [tab]);

  useEffect(() => {
    if (!isStaff) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loads the list for the selected tab
    void load();
  }, [isStaff, load]);

  if (checking || (session && profile === undefined)) {
    return (
      <Shell>
        <p className="mx-auto max-w-6xl px-4 py-12 text-emerald-900/80">Loading…</p>
      </Shell>
    );
  }

  if (!session || !isStaff) {
    return (
      <Shell>
        <div className="mx-auto max-w-6xl px-4 py-12">
          <h1 className="text-2xl font-extrabold">Staff only</h1>
          <p className="mt-3 text-emerald-900/80">This page is for the project team.</p>
          <Link href="/" className={`mt-6 inline-block ${primaryClass} sm:w-auto`}>Back to home</Link>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <section className="bg-emerald-900 text-amber-50">
        <div className="mx-auto max-w-6xl px-4 py-10 md:py-16">
          <p className="text-sm font-semibold uppercase tracking-widest text-amber-300">Staff</p>
          <h1 className="mt-3 max-w-2xl text-4xl font-extrabold leading-tight md:text-6xl">Review ideas</h1>
          <p className="mt-4 max-w-xl text-lg text-emerald-100">
            Approve an idea and it shows up on the map right away. Reject it and the author sees your reason.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 md:py-16">
        <div role="tablist" aria-label="Idea status" className="flex flex-wrap gap-2">
          {tabs.map((item) => (
            <button
              key={item.value}
              type="button"
              role="tab"
              aria-selected={tab === item.value}
              onClick={() => { setRows(null); setTab(item.value); }}
              className="rounded-full border-2 border-emerald-900 px-4 py-2 font-semibold hover:bg-emerald-900 hover:text-amber-50 aria-selected:bg-emerald-900 aria-selected:text-amber-50"
            >
              {item.label}
            </button>
          ))}
        </div>

        {error && <p role="alert" className={errorClass}>We couldn&apos;t load the ideas. Please refresh.</p>}
        {!error && rows === null && <p className="mt-6 text-emerald-900/80">Loading…</p>}
        {rows && rows.length === 0 && <p className="mt-6 text-emerald-900/80">Nothing here.</p>}
        {rows && rows.length > 0 && (
          <ul className="mt-6 grid gap-4 lg:grid-cols-2">
            {rows.map((row) => (
              <ReviewCard
                key={row.id}
                row={row}
                author={(row.created_by && authors[row.created_by]) || "a member"}
                onChanged={() => void load()}
              />
            ))}
          </ul>
        )}
      </section>
    </Shell>
  );
}
