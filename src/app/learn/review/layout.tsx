import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Spaced review",
  description:
    "Short Day 3, 7 and 21 reviews that mix questions from all six Super-Cube® faces, plus a capstone that brings them together.",
  path: "/learn/review",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
