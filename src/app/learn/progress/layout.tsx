import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Your progress",
  description: "Your Super-Cube® lighting up face by face: points, levels, weekly goal, streak, spaced reviews and badges.",
  path: "/learn/progress",
  noIndex: true,
});

export default function ProgressLayout({ children }: { children: React.ReactNode }) {
  return children;
}
