import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Sign in",
  description:
    "Sign in to Super-Cube® Learn to resume your leadership pathway, assessments and growth report on any device.",
  path: "/login",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
