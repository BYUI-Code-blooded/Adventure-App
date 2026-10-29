import type { Metadata } from "next";
import SuggestView from "@/components/suggestions/SuggestView";

export const metadata: Metadata = {
  title: "Submit an idea | Local Adventures & Activities Guide",
};

export default function SubmitIdeasPage() {
  return <SuggestView />;
}
