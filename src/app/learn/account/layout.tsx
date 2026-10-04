import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Your account",
  description:
    "Manage your Super-Cube® Learn account, sync and privacy settings.",
  path: "/learn/account",
  noIndex: true,
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
