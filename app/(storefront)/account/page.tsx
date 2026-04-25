import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/constants";
import { AccountPageContent } from "@/components/pages/AccountPageContent";

export const metadata: Metadata = {
  title: "Account",
  description: "Manage your account",
  openGraph: {
    title: `Account | ${SITE_NAME}`,
    description: "Manage your account",
  },
};

export default function AccountPage() {
  return <AccountPageContent />;
}
