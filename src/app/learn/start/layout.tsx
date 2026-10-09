import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Start your free baseline",
  description:
    "Start your free Super-Cube® leadership baseline in about 5 minutes, no payment needed.",
  path: "/learn/start",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
