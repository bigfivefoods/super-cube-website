import type { MetadataRoute } from "next";

/**
 * Web App Manifest — Super-Cube® Learn as installable PWA.
 * start_url opens the LMS pathway directly.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/learn",
    name: "Super-Cube® Learn",
    short_name: "Super-Cube",
    description:
      "Human-centric leadership development—orient, assess, learn the six faces, re-measure, and download your growth report.",
    start_url: "/learn",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#ffffff",
    theme_color: "#0a0a0a",
    lang: "en",
    categories: ["education", "productivity"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Continue learning",
        short_name: "Learn",
        description: "Open your Super-Cube® pathway",
        url: "/learn",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
      },
      {
        name: "Courses",
        short_name: "Courses",
        url: "/learn/courses",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
      },
      {
        name: "My report",
        short_name: "Report",
        url: "/learn/report",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
      },
    ],
  };
}
