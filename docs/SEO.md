# SEO — help people find Super-Cube®

## Already in the product

| Item | Where |
|------|--------|
| Sitemap | `https://www.super-cube.me/sitemap.xml` |
| Robots | `https://www.super-cube.me/robots.txt` |
| Canonical + Open Graph | `src/lib/seo.ts` → flagship pages |
| JSON-LD Organization + Course | Homepage |
| Keyword-rich titles/descriptions | Model, constructs, programmes, research, why, pilot pack |
| Insights blog | `/insights` + posts (content marketing) |
| FAQ + FAQPage JSON-LD | `/faq` |
| hreflang (en / zu / af / x-default) | `src/lib/seo.ts` + root layout |

## Google Search Console (you)

1. [search.google.com/search-console](https://search.google.com/search-console)
2. Add property: `https://www.super-cube.me`
3. Verify via DNS or HTML meta (or Vercel domain)
4. Submit sitemap: `https://www.super-cube.me/sitemap.xml`
5. Request indexing for home, `/the-model`, `/constructs`, `/what`, `/learn/start`

## Ongoing content (highest SEO ROI)

- One insight post per month (`src/lib/insights.ts`)
- Real case stories on `/impact`
- Backlinks: UKZN, school partners, LinkedIn articles linking to super-cube.me

## Technical checklist

- [ ] `NEXT_PUBLIC_GA_ID` live (measure organic traffic)
- [ ] Compress hero images if Lighthouse flags LCP
- [ ] Unique OG image per flagship page (already path-based)
- [ ] Avoid thin duplicate pages; prefer one canonical URL (`/why` → `/why-leadership`)
