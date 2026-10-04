import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Six-face leadership assessment",
  description:
    "Measure your leadership capacity across the six Super-Cube® faces: Choices, Principles, Mental, Emotional, Physical and Spiritual.",
  path: "/learn/assessment",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
