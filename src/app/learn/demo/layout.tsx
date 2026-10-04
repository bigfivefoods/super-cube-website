import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Free demo",
  description:
    "Try Super-Cube® Learn free on this device: orient, set a six-face baseline and preview your growth report.",
  path: "/learn/demo",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
