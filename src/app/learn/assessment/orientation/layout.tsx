import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Assessment orientation",
  description:
    "Get oriented before your Super-Cube® baseline: what the six faces measure and how to answer honestly, in about 2 minutes.",
  path: "/learn/assessment/orientation",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
