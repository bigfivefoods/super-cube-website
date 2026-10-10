/**
 * The downloadable Super-Cube® company profile (public/super-cube-company-profile.pdf,
 * built by scripts/company-profile/build.mjs). One place for the link and its size hint,
 * used by the home hero and the footer. Keep `pages` and `size` in step with the PDF
 * (tests/unit/company-profile.spec.ts checks them).
 */
export const COMPANY_PROFILE = {
  href: "/super-cube-company-profile.pdf",
  pages: 15,
  size: "1.0 MB",
} as const;
