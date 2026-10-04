import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Your growth report",
  description:
    "Your Super-Cube® pre → post growth report: dual radar across six faces, downloadable PDF and certificate with verify ID.",
  path: "/learn/report",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
