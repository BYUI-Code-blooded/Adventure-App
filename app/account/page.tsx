// Owner: Tech lead
import type { Metadata } from "next";
import AccountView from "@/components/account/AccountView";

export const metadata: Metadata = {
  title: "Your account | Local Adventures & Activities Guide",
};

export default function AccountPage() {
  return <AccountView />;
}
