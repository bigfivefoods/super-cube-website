import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Deliberate practice",
  description:
    "Your weekly Super-Cube® deliberate practice plan, focused on your weakest faces.",
  path: "/learn/practice",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
