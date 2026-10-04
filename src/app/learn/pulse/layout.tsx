import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Weekly pulse check",
  description:
    "A quick weekly Super-Cube® pulse check to track how each face of your leadership is moving.",
  path: "/learn/pulse",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
