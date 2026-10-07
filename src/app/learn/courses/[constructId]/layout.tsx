import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { constructs } from "@/lib/content";
import { pageMeta } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ constructId: string }>;
}): Promise<Metadata> {
  const { constructId } = await params;
  const c = constructs.find((x) => x.id === constructId);
  const name = c?.name ?? "Construct";
  return pageMeta({
    title: `${name} course`,
    description: c
      ? `Super-Cube® ${name} course: ${c.tagline.toLowerCase()}. Sessions, practice labs and a quick check.`
      : "A Super-Cube® construct course with sessions, practice labs and checks.",
    path: `/learn/courses/${encodeURIComponent(constructId)}`,
  });
}

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ constructId: string }>;
}) {
  const { constructId } = await params;
  if (!constructs.some((x) => x.id === constructId)) notFound();
  return children;
}
