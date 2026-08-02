/** Server-safe JSON-LD script for SEO */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function organizationJsonLd(siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Super-Cube®",
    url: siteUrl,
    logo: `${siteUrl}/brand/logo.png`,
    email: "hello@super-cube.me",
    description:
      "Empirically validated, multidimensional leadership development framework and learning system.",
    founder: {
      "@type": "Person",
      name: "Craig Ross Muller",
      alumniOf: "University of KwaZulu-Natal",
    },
    sameAs: [],
  };
}

export function courseJsonLd(siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: "Super-Cube® Learn",
    description:
      "Orient, baseline across six leadership faces, deliberate practice, re-measure, and certificate.",
    provider: {
      "@type": "Organization",
      name: "Super-Cube®",
      sameAs: siteUrl,
    },
    url: `${siteUrl}/learn`,
    educationalLevel: "Beginner to professional",
    inLanguage: ["en", "zu"],
  };
}
