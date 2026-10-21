"use client";

// Email code sign in: type your email, get a code, type it here, and you are signed in.
// First time only: a short step asks for a public name (and an optional phone number).
import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { CODE_LENGTH, NAME_MAX, cleanCode, isCodeComplete, validateName, validatePhone } from "@/lib/validation";
import { useAuthProfile } from "@/components/auth/useAuthProfile";
import { errorClass, inputClass, primaryClass, secondaryClass } from "@/components/auth/styles";

type Status = "idle" | "sending" | "sent" | "error";

const RESEND_SECONDS = 60;

// Read at import time, before supabase-js clears the URL, so a failed old-style link can be explained.
const landingParams =
  typeof window === "undefined"
    ? null
    : new URLSearchParams(window.location.hash.replace(/^#/, "") || window.location.search);
const landingError = landingParams?.get("error_description") ?? landingParams?.get("error") ?? null;

function friendlyError(message: string, status?: number) {
  const text = message.toLowerCase();
  if (text.includes("not authorized")) {
    return "That email can't sign in yet. For now, only team members can.";
  }
  if (status === 429 || text.includes("rate limit")) {
    return "Too many emails have been sent. Wait a little while and try again.";
  }
  if (text.includes("invalid") && text.includes("email")) {
    return "That doesn't look like a valid email address.";
  }
  return "Something went wrong sending your code. Please try again.";
}

export default function LoginForm() {
  const router = useRouter();
  const { session, checking, profile, setProfile } = useAuthProfile();

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [cooldown, setCooldown] = useState(0);

  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [codeError, setCodeError] = useState("");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [nameError, setNameError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [saveError, setSaveError] = useState("");

  const [linkError, setLinkError] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => setLinkError(landingError ? "That sign-in link didn't work. Request a new code instead." : ""), 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((seconds) => seconds - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  // Once you are in and have a name, the account page is where you land.
  const needsName = Boolean(session) && profile !== undefined && profile !== null && !profile.name;
  useEffect(() => {
    if (session && profile !== undefined && !needsName) router.replace("/account");
  }, [session, profile, needsName, router]);

  async function sendCode(event?: FormEvent) {
    event?.preventDefault();
    const clean = email.trim().toLowerCase();
    if (!clean || status === "sending") return;
    setStatus("sending");
    setMessage("");
    setCodeError("");
    setCode("");
    const { error } = await supabase.auth.signInWithOtp({ email: clean });
    if (error) {
      setStatus("error");
      setMessage(friendlyError(error.message, error.status));
      return;
    }
    setEmail(clean);
    setStatus("sent");
    setCooldown(RESEND_SECONDS);
  }

  async function verify(token: string) {
    if (verifying || !isCodeComplete(token)) return;
    setVerifying(true);
    setCodeError("");
    const { error } = await supabase.auth.verifyOtp({ email, token, type: "email" });
    setVerifying(false);
    if (error) {
      setCodeError("That code is wrong or has expired. Check it, or send a new one.");
    }
  }

  function handleCodeChange(value: string) {
    const next = cleanCode(value);
    setCode(next);
    if (isCodeComplete(next)) verify(next);
  }

  async function saveProfile(event: FormEvent) {
    event.preventDefault();
    if (!session || saving) return;
    const nameProblem = validateName(name);
    const phoneProblem = validatePhone(phone);
    setNameError(nameProblem ?? "");
    setPhoneError(phoneProblem ?? "");
    if (nameProblem || phoneProblem) return;

    setSaving(true);
    setSaveError("");
    const { data, error } = await supabase
      .from("profiles")
      .update({ name: name.trim(), phone: phone.trim() || null })
      .eq("id", session.user.id)
      .select("id, name, phone, role")
      .single();
    setSaving(false);
    if (error) {
      setSaveError("We couldn't save your details. Please try again.");
      return;
    }
    setProfile(data);
  }

  if (checking) {
    return <p className="text-emerald-900/80">Checking your session…</p>;
  }

  if (session && profile === undefined) {
    return <p className="text-emerald-900/80">Loading your profile…</p>;
  }

  if (session && needsName) {
    return (
      <form onSubmit={saveProfile} noValidate>
        <p className="text-sm font-semibold uppercase tracking-widest text-emerald-700">One last step</p>
        <h1 className="mt-3 text-4xl font-extrabold leading-tight">What should we call you?</h1>
        <p className="mt-4 text-emerald-900/80">
          Your name shows next to the events you organize. Your first name and last initial is
          perfect, like &quot;Alex R.&quot;. Your phone number is optional and only you can see it.
        </p>

        <label htmlFor="name" className="mt-8 block text-sm font-bold">
          Public name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="nickname"
          maxLength={NAME_MAX}
          placeholder="Alex R."
          value={name}
          onChange={(event) => setName(event.target.value)}
          aria-invalid={Boolean(nameError)}
          aria-describedby={nameError ? "name-error" : undefined}
          className={`mt-2 ${inputClass}`}
        />
        {nameError && (
          <p id="name-error" role="alert" className={errorClass}>
            {nameError}
          </p>
        )}

        <label htmlFor="phone" className="mt-5 block text-sm font-bold">
          Phone <span className="font-normal text-emerald-900/80">(optional)</span>
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          placeholder="+1 208 555 0123"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          aria-invalid={Boolean(phoneError)}
          aria-describedby={phoneError ? "phone-error" : undefined}
          className={`mt-2 ${inputClass}`}
        />
        {phoneError && (
          <p id="phone-error" role="alert" className={errorClass}>
            {phoneError}
          </p>
        )}

        {saveError && (
          <p role="alert" className={errorClass}>
            {saveError}
          </p>
        )}

        <button type="submit" className={`mt-6 ${primaryClass}`} disabled={saving}>
          {saving ? "Saving…" : "Save and continue"}
        </button>
      </form>
    );
  }

  if (session) {
    return <p className="text-emerald-900/80">Taking you to your account…</p>;
  }

  if (status === "sent") {
    return (
      <div>
        <p className="text-sm font-semibold uppercase tracking-widest text-emerald-700">Code on its way</p>
        <h1 className="mt-3 text-4xl font-extrabold leading-tight">Check your inbox.</h1>
        <p className="mt-4 text-emerald-900/80" role="status">
          We sent an {CODE_LENGTH}-digit code to{" "}
          <span className="font-bold text-emerald-950">{email}</span>. If you can&apos;t see the
          email, check your spam folder.
        </p>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            verify(code);
          }}
          className="mt-8"
        >
          <label htmlFor="code" className="block text-sm font-bold">
            {CODE_LENGTH}-digit code
          </label>
          <input
            id="code"
            name="code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern={`\\d{${CODE_LENGTH}}`}
            maxLength={CODE_LENGTH}
            placeholder={"0".repeat(CODE_LENGTH)}
            value={code}
            onChange={(event) => handleCodeChange(event.target.value)}
            aria-describedby="code-hint"
            className={`mt-2 text-center text-2xl font-bold tracking-[0.4em] ${inputClass}`}
          />
          <p id="code-hint" className="mt-2 text-sm text-emerald-900/80">
            {code.length}/{CODE_LENGTH} digits. It signs you in as soon as it&apos;s complete.
          </p>
          {codeError && (
            <p role="alert" className={errorClass}>
              {codeError}
            </p>
          )}
          <button
            type="submit"
            className={`mt-4 ${primaryClass}`}
            disabled={verifying || !isCodeComplete(code)}
          >
            {verifying ? "Checking…" : "Sign in"}
          </button>
        </form>

        <div className="mt-6 flex flex-col gap-3">
          <button type="button" className={secondaryClass} onClick={() => sendCode()} disabled={cooldown > 0}>
            {cooldown > 0 ? `Send a new code in ${cooldown}s` : "Send a new code"}
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
    <form onSubmit={sendCode}>
      <p className="text-sm font-semibold uppercase tracking-widest text-emerald-700">Join the trail</p>
      <h1 className="mt-3 text-4xl font-extrabold leading-tight">Sign in to plan outings.</h1>
      <p className="mt-4 text-emerald-900/80">
        Enter your email and we&apos;ll send you a {CODE_LENGTH}-digit code. No password to
        remember. New here? Your account is created the first time you sign in.
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

      {(status === "error" || linkError) && (
        <p role="alert" className={errorClass}>
          {status === "error" ? message : linkError}
        </p>
      )}

      <button type="submit" className={`mt-6 ${primaryClass}`} disabled={status === "sending"}>
        {status === "sending" ? "Sending…" : "Email me a code"}
      </button>
    </form>
  );
}
