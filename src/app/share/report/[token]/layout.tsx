import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}): Promise<Metadata> {
  const { token } = await params;
  // Private, consented share link: never index.
  return pageMeta({
    title: "Shared growth report",
    description:
      "A Super-Cube® growth report shared with consent by a learner with their coach.",
    path: `/share/report/${encodeURIComponent(token)}`,
    noIndex: true,
  });
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
