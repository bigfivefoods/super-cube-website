import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Live cohorts",
  description:
    "Super-Cube® live cohorts: scheduled sessions, attendance and discussion for members, facilitators and organisation admins.",
  path: "/learn/cohorts",
  noIndex: true,
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
