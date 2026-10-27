import type { Metadata } from "next";
import ReviewQueue from "@/components/admin/ReviewQueue";

export const metadata: Metadata = {
  title: "Review ideas | Local Adventures & Activities Guide",
  robots: { index: false },
};

export default function AdminPage() {
  return <ReviewQueue />;
}
