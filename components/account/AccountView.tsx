"use client";

// The signed-in account page: who you are, your public profile (editable) and sign out.
import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { NAME_MAX, validateName, validatePhone } from "@/lib/validation";
import type { Role } from "@/lib/types";
import { useAuthProfile } from "@/components/auth/useAuthProfile";
import { errorClass, inputClass, primaryClass, secondaryClass } from "@/components/auth/styles";

const roleLabels: Record<Role, string> = {
  user: "Member",
  developer: "Developer",
  admin: "Admin",
};

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col bg-amber-50 text-emerald-950">
      <main className="flex-1">{children}</main>
    </div>
  );
}

export default function AccountView() {
  const router = useRouter();
  const { session, checking, profile, setProfile } = useAuthProfile();

  const [name, setName] = useState<string | null>(null);
  const [phone, setPhone] = useState<string | null>(null);
  const [nameError, setNameError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!checking && !session) router.replace("/login");
  }, [checking, session, router]);

  if (checking || (session && profile === undefined)) {
    return (
      <Shell>
        <p className="mx-auto max-w-6xl px-4 py-12 text-emerald-900/80">Loading your account…</p>
      </Shell>
    );
  }

  if (!session) {
    return (
      <Shell>
        <div className="mx-auto max-w-6xl px-4 py-12">
          <p className="text-emerald-900/80">You&apos;re not signed in.</p>
          <Link href="/login" className={`mt-4 inline-block ${primaryClass} sm:w-auto`}>
            Sign in
          </Link>
        </div>
      </Shell>
    );
  }

  const savedName = profile?.name ?? "";
  const savedPhone = profile?.phone ?? "";
  const nameValue = name ?? savedName;
  const phoneValue = phone ?? savedPhone;
  const dirty = nameValue.trim() !== savedName || phoneValue.trim() !== savedPhone;
  const role: Role = profile?.role ?? "user";
  const joined = new Date(session.user.created_at).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  async function saveProfile(event: FormEvent) {
    event.preventDefault();
    if (!session || saving) return;
    const nameProblem = validateName(nameValue);
    const phoneProblem = validatePhone(phoneValue);
    setNameError(nameProblem ?? "");
    setPhoneError(phoneProblem ?? "");
    setSaved(false);
    if (nameProblem || phoneProblem) return;

    setSaving(true);
    setSaveError("");
    const { data, error } = await supabase
      .from("profiles")
      .update({ name: nameValue.trim(), phone: phoneValue.trim() || null })
      .eq("id", session.user.id)
      .select("id, name, phone, role")
      .single();
    setSaving(false);
    if (error) {
      setSaveError("We couldn't save your changes. Please try again.");
      return;
    }
    setProfile(data);
    setName(null);
    setPhone(null);
    setSaved(true);
  }

  return (
    <Shell>
      <section className="bg-emerald-900 text-amber-50">
        <div className="mx-auto max-w-6xl px-4 py-10 md:py-16">
          <p className="text-sm font-semibold uppercase tracking-widest text-amber-300">Your account</p>
          <h1 className="mt-3 max-w-2xl text-4xl font-extrabold leading-tight md:text-6xl">
            Hi, {savedName || "explorer"}.
          </h1>
          <p className="mt-4 flex flex-wrap items-center gap-3 text-lg text-emerald-100">
            <span>{session.user.email}</span>
            {role !== "user" && (
              <span className="rounded-full bg-amber-300 px-3 py-1 text-sm font-bold text-emerald-950">
                {roleLabels[role]}
              </span>
            )}
          </p>
        </div>
      </section>

      <section className="bg-emerald-100/60">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-12 md:grid-cols-2 md:py-16">
          <form onSubmit={saveProfile} noValidate className="rounded-2xl bg-amber-50 p-6 shadow-sm">
            <h2 className="text-lg font-bold">Your profile</h2>
            <p className="mt-2 text-emerald-900/80">
              Your public name shows next to the events you organize. Your phone is private.
            </p>

            <label htmlFor="name" className="mt-6 block text-sm font-bold">
              Public name
            </label>
            <input
              id="name"
              type="text"
              autoComplete="nickname"
              maxLength={NAME_MAX}
              placeholder="Alex R."
              value={nameValue}
              onChange={(event) => {
                setName(event.target.value);
                setSaved(false);
              }}
              aria-invalid={Boolean(nameError)}
              className={`mt-2 ${inputClass}`}
            />
            {nameError && (
              <p role="alert" className={errorClass}>
                {nameError}
              </p>
            )}

            <label htmlFor="phone" className="mt-5 block text-sm font-bold">
              Phone <span className="font-normal text-emerald-900/80">(optional)</span>
            </label>
            <input
              id="phone"
              type="tel"
              autoComplete="tel"
              placeholder="+1 208 555 0123"
              value={phoneValue}
              onChange={(event) => {
                setPhone(event.target.value);
                setSaved(false);
              }}
              aria-invalid={Boolean(phoneError)}
              className={`mt-2 ${inputClass}`}
            />
            {phoneError && (
              <p role="alert" className={errorClass}>
                {phoneError}
              </p>
            )}

            {saveError && (
              <p role="alert" className={errorClass}>
                {saveError}
              </p>
            )}

            <button type="submit" className={`mt-6 ${primaryClass}`} disabled={saving || !dirty}>
              {saving ? "Saving…" : "Save changes"}
            </button>
            {saved && (
              <p role="status" className="mt-3 text-center text-sm font-semibold text-emerald-700">
                Saved.
              </p>
            )}
          </form>

          <div className="rounded-2xl bg-amber-50 p-6 shadow-sm">
            <h2 className="text-lg font-bold">Account details</h2>
            <dl className="mt-6 space-y-4">
              <div>
                <dt className="text-sm font-bold text-emerald-700">Email</dt>
                <dd className="mt-1 break-all">{session.user.email}</dd>
              </div>
              <div>
                <dt className="text-sm font-bold text-emerald-700">Role</dt>
                <dd className="mt-1">{roleLabels[role]}</dd>
              </div>
              <div>
                <dt className="text-sm font-bold text-emerald-700">Member since</dt>
                <dd className="mt-1">{joined}</dd>
              </div>
            </dl>
            <button type="button" className={`mt-8 ${secondaryClass}`} onClick={() => supabase.auth.signOut()}>
              Sign out
            </button>
          </div>
        </div>
      </section>
    </Shell>
  );
}
