import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Get started",
  description:
    "Set up your Super-Cube® Learn profile and choose the pathway that fits your season of life.",
  path: "/learn/onboarding",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
