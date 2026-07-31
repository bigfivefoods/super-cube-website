"use client";

import { useEffect } from "react";

/** Registers the Super-Cube Learn service worker for installable PWA. */
export function PwaRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    // Avoid SW noise in local dev unless explicitly testing PWA
    if (
      process.env.NODE_ENV === "development" &&
      process.env.NEXT_PUBLIC_PWA_DEV !== "true"
    ) {
      return;
    }

    const onLoad = () => {
      navigator.serviceWorker.register("/sw.js").catch((err) => {
        console.warn("Service worker registration failed", err);
      });
    };

    if (document.readyState === "complete") onLoad();
    else window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);

  return null;
}
