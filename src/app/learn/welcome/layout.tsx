import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Welcome",
  description:
    "Welcome to Super-Cube® Learn: orient, baseline, practise deliberately and re-measure your leadership growth.",
  path: "/learn/welcome",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
