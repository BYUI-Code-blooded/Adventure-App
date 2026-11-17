"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthProfile } from "@/components/auth/useAuthProfile";

type Report = {
  id: string;
  event_id: string;
  reason: string;
  details: string | null;
  created_at: string;
  reviewed_at: string | null;
  events: { id: string; start_time: string; name: string } | null;
};

export default function EventReportQueue() {
  const { checking, profile } = useAuthProfile();
  const [reports, setReports] = useState<Report[]>([]);
  const [message, setMessage] = useState("");

  async function load() {
    const { data } = await supabase.from("event_reports").select("id, event_id, reason, details, created_at, reviewed_at, events(id, start_time, name)").is("reviewed_at", null).order("created_at", { ascending: false });
    if (data) setReports(data as unknown as Report[]);
  }
  useEffect(() => { const timer = window.setTimeout(() => { void load(); }, 0); return () => window.clearTimeout(timer); }, []);

  async function review(report: Report, removeEvent: boolean) {
    if (removeEvent) {
      const { error } = await supabase.from("events").delete().eq("id", report.event_id);
      if (error) { setMessage("The event could not be removed."); return; }
    }
    await supabase.from("event_reports").update({ reviewed_at: new Date().toISOString(), reviewed_by: (await supabase.auth.getUser()).data.user?.id }).eq("id", report.id);
    setMessage(removeEvent ? "Event removed and report closed." : "Report dismissed.");
    void load();
  }

  if (checking || profile?.role !== "admin" && profile?.role !== "developer") return null;
  return <section className="bg-amber-50 px-4 py-10 text-emerald-950"><div className="mx-auto max-w-6xl"><h2 className="text-2xl font-extrabold">Reported events</h2><p className="mt-2 text-emerald-900/75">Review community reports and remove events that violate the guidelines.</p>{message && <p className="mt-3 font-semibold" role="status">{message}</p>}<div className="mt-5 space-y-4">{reports.length === 0 ? <p className="rounded-2xl bg-white p-5 text-emerald-900/75">No open event reports.</p> : reports.map((report) => <article key={report.id} className="rounded-2xl bg-white p-5 shadow-sm"><h3 className="font-bold">{report.events?.name ?? "Removed event"}</h3><p className="mt-1 text-sm">Reason: <strong>{report.reason}</strong> · {report.events ? new Date(report.events.start_time).toLocaleString() : "Event unavailable"}</p>{report.details && <p className="mt-2 text-sm text-emerald-900/75">{report.details}</p>}<div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={() => void review(report, false)} className="rounded-full border border-emerald-900 px-4 py-2 font-bold">Dismiss</button><button type="button" onClick={() => void review(report, true)} className="rounded-full bg-red-800 px-4 py-2 font-bold text-white">Remove event</button></div></article>)}</div></div></section>;
}
