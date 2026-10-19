import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Organisation results",
  description:
    "Super-Cube® organisation results for org admins: cohort before and after by face, completion, engagement and CSV export. Aggregates only.",
  path: "/learn/org/results",
  noIndex: true,
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
