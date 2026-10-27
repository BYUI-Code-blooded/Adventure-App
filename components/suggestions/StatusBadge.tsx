import type { ActivityStatus } from "@/lib/types";

const labels: Record<ActivityStatus, string> = {
  pending: "Waiting for review",
  approved: "Approved",
  rejected: "Not approved",
};

const styles: Record<ActivityStatus, string> = {
  pending: "bg-amber-300 text-emerald-950",
  approved: "bg-emerald-900 text-amber-50",
  rejected: "border-2 border-emerald-900 text-emerald-950",
};

export default function StatusBadge({ status }: { status: ActivityStatus }) {
  return <span className={`rounded-full px-3 py-1 text-sm font-bold ${styles[status]}`}>{labels[status]}</span>;
}
