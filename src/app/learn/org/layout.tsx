import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Join your school or company cohort",
  description:
    "Join a Super-Cube® cohort with the code from your school, company or facilitator. Coaches only see scores you consent to share.",
  path: "/learn/org",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
