import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const certId = decodeURIComponent(String(id || "")).trim().toUpperCase();
  return pageMeta({
    title: `Verify certificate ${certId}`,
    description: `Check that Super-Cube® growth certificate ${certId} is genuine: learner, programme, pre → post scores and issue date.`,
    path: `/verify/${encodeURIComponent(certId)}`,
  });
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
