import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Create your account",
  description:
    "Create a free Super-Cube® Learn account to save your six-face baseline, practice plan and certificate across devices.",
  path: "/signup",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
