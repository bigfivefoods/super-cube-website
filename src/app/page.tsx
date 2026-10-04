import type { Metadata } from "next";
import { HomeLanding } from "@/components/home/HomeLanding";
import { courseJsonLd, JsonLd, organizationJsonLd } from "@/components/JsonLd";
import { site } from "@/lib/content";
import { absoluteUrl, pageLanguages } from "@/lib/seo";

const homeUrl = absoluteUrl("/");

export const metadata: Metadata = {
  alternates: {
    canonical: homeUrl,
    languages: pageLanguages(homeUrl),
  },
};

export default function HomePage() {
  return (
    <>
      <JsonLd data={organizationJsonLd(site.url)} />
      <JsonLd data={courseJsonLd(site.url)} />
      <HomeLanding />
    </>
  );
}
