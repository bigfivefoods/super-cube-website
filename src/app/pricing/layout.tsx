import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Pricing: free baseline, R99 programmes and seat packs",
  description:
    "Start free, then unlock a full Super-Cube® programme for kids, teens or adults with one R99 payment. Seat packs for schools and companies. No subscription.",
  path: "/pricing",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
