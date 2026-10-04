import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Coach tools",
  description:
    "Super-Cube® coach tools: cohort codes, consented progress snapshots and share links. Learner journals always stay private.",
  path: "/learn/coach",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
