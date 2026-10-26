import type { Metadata } from "next";
import { learnMetadata } from "@/lib/i18n/lms/meta";

const META = {
  title: "Your account",
  description:
    "Manage your Super-Cube® Learn account, sync and privacy settings.",
  path: "/learn/account",
  noIndex: true,
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale?: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return learnMetadata(locale, META);
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
