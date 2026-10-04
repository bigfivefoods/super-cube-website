import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Learning analytics",
  description:
    "Track your Super-Cube® practice streaks, session completion and face-by-face growth over time.",
  path: "/learn/analytics",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
