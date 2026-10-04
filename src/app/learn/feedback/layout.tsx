import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Feedback",
  description:
    "Share feedback on Super-Cube® Learn to help improve the leadership pathway.",
  path: "/learn/feedback",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
