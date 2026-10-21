"use client";

// Magic-link sign in: type your email, get a link, click it, and you come back here signed in.
import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type Status = "idle" | "sending" | "sent" | "error";

const RESEND_SECONDS = 60;

function friendlyError(message: string, status?: number) {
  const text = message.toLowerCase();
  if (text.includes("not authorized")) {
    return "That email can't sign in yet. For now, only team members can.";
  }
  if (status === 429 || text.includes("rate limit")) {
    return "Too many emails have been sent. Wait a little while and try again.";
  }
  return "Something went wrong sending your link. Please try again.";
}

const inputClass =
  "w-full rounded-full border-2 border-emerald-900 bg-amber-50 px-5 py-3 text-emerald-950 placeholder:text-emerald-900/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700";
const primaryClass =
  "w-full rounded-full bg-emerald-900 px-6 py-3 text-center font-bold text-amber-50 hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60";
const secondaryClass =
  "w-full rounded-full border-2 border-emerald-900 px-6 py-3 text-center font-semibold hover:bg-emerald-900 hover:text-amber-50 disabled:cursor-not-allowed disabled:opacity-60";

export default function LoginForm() {
  const [session, setSession] = useState<Session | null>(null);
  const [checking, setChecking] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [cooldown, setCooldown] = useState(0);

  // Picks up the session when the magic link brings you back to this page.
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setChecking(false);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => data.subscription.unsubscribe();
  }, []);

  const userId = session?.user.id;
  useEffect(() => {
    if (!userId) return;
    supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .maybeSingle()
      .then(({ data }) => setRole(data?.role ?? null));
  }, [userId]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((seconds) => seconds - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  async function sendLink(event?: FormEvent) {
    event?.preventDefault();
    const clean = email.trim().toLowerCase();
    if (!clean || status === "sending") return;
    setStatus("sending");
    setMessage("");
    const { error } = await supabase.auth.signInWithOtp({
      email: clean,
      options: { emailRedirectTo: `${window.location.origin}/login` },
    });
    if (error) {
      setStatus("error");
      setMessage(friendlyError(error.message, error.status));
      return;
    }
    setEmail(clean);
    setStatus("sent");
    setCooldown(RESEND_SECONDS);
  }

  if (checking) {
    return <p className="text-emerald-900/80">Checking your session…</p>;
  }

  if (session) {
    return (
      <div>
        <p className="text-sm font-semibold uppercase tracking-widest text-emerald-700">
          You&apos;re in
        </p>
        <h1 className="mt-3 text-4xl font-extrabold leading-tight">Welcome back.</h1>
        <p className="mt-4 text-emerald-900/80">
          Signed in as <span className="font-bold text-emerald-950">{session.user.email}</span>
          {role && role !== "user" ? <> · {role}</> : null}
        </p>
        <div className="mt-8 flex flex-col gap-3">
          <Link href="/map" className={primaryClass}>
            Open the map
          </Link>
          <button type="button" className={secondaryClass} onClick={() => supabase.auth.signOut()}>
            Sign out
          </button>
        </div>
      </div>
    );
  }

  if (status === "sent") {
    return (
      <div>
        <p className="text-sm font-semibold uppercase tracking-widest text-emerald-700">
          Link on its way
        </p>
        <h1 className="mt-3 text-4xl font-extrabold leading-tight">Check your inbox.</h1>
        <p className="mt-4 text-emerald-900/80" role="status">
          We sent a sign-in link to <span className="font-bold text-emerald-950">{email}</span>.
          Open it on this device and you&apos;ll land back here, signed in. If you can&apos;t see
          it, check your spam folder.
        </p>
        <div className="mt-8 flex flex-col gap-3">
          <button type="button" className={primaryClass} onClick={() => sendLink()} disabled={cooldown > 0}>
            {cooldown > 0 ? `Send again in ${cooldown}s` : "Send the link again"}
          </button>
          <button
            type="button"
            className={secondaryClass}
            onClick={() => {
              setStatus("idle");
              setCooldown(0);
            }}
          >
            Use a different email
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={sendLink}>
      <p className="text-sm font-semibold uppercase tracking-widest text-emerald-700">
        Join the trail
      </p>
      <h1 className="mt-3 text-4xl font-extrabold leading-tight">Sign in to plan outings.</h1>
      <p className="mt-4 text-emerald-900/80">
        Enter your email and we&apos;ll send you a link. No password to remember. New here? Your
        account is created the first time you sign in.
      </p>

      <label htmlFor="email" className="mt-8 block text-sm font-bold">
        Email
      </label>
      <input
        id="email"
        name="email"
        type="email"
        inputMode="email"
        autoComplete="email"
        required
        placeholder="you@example.com"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        className={`mt-2 ${inputClass}`}
      />

      {status === "error" && (
        <p role="alert" className="mt-4 rounded-2xl bg-amber-100 p-4 font-semibold">
          {message}
        </p>
      )}

      <button type="submit" className={`mt-6 ${primaryClass}`} disabled={status === "sending"}>
        {status === "sending" ? "Sending…" : "Email me a link"}
      </button>
    </form>
  );
}
