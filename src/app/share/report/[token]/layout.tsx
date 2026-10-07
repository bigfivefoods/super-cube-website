import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

// Private, consented share link: never index, and keep the token out of metadata.
export const metadata: Metadata = pageMeta({
  title: "Shared growth report",
  description: "A Super-Cube® growth report shared by a learner. Links expire and the learner can turn them off.",
  path: "/share/report",
  noIndex: true,
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
