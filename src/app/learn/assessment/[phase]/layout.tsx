import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

const PHASE_LABEL: Record<string, string> = {
  pre: "Pre-assessment baseline",
  mid: "Mid-point check-in",
  post: "Post-assessment",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ phase: string }>;
}): Promise<Metadata> {
  const { phase } = await params;
  const key = phase === "post" ? "post" : phase === "mid" ? "mid" : "pre";
  return pageMeta({
    title: PHASE_LABEL[key],
    description: `Super-Cube® ${PHASE_LABEL[key].toLowerCase()}: rate yourself across the six leadership faces to see where you are growing.`,
    path: `/learn/assessment/${encodeURIComponent(phase)}`,
  });
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
