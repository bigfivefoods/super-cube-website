import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Team cube: cohort leadership view",
  description:
    "Light a shared Super-Cube® from consented cohort mean scores to show team and network leadership capacity, never individual rankings.",
  path: "/team",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
