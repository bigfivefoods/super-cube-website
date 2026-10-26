import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { constructs } from "@/lib/content";
import { learnMetadata } from "@/lib/i18n/lms/meta";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ constructId: string; locale?: string }>;
}): Promise<Metadata> {
  const { constructId, locale } = await params;
  const c = constructs.find((x) => x.id === constructId);
  const name = c?.name ?? "Construct";
  return learnMetadata(locale, {
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
