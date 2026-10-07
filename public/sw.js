/* Super-Cube® Learn — lightweight service worker for PWA install + offline shell */
const CACHE = "supercube-learn-v2";
const PRECACHE = [
  "/learn",
  "/learn/courses",
  "/learn/report",
  "/learn/account",
  "/learn/demo",
  "/learn/org",
  "/learn/coach",
  "/learn/programmes",
  "/learn/assessment",
  "/learn/assessment/orientation",
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/apple-touch-icon.png",
  "/brand/logo-mark.png",
  "/brand/logo.png",
  "/favicon.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE).catch(() => undefined))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

/**
 * Network-first for navigations (fresh LMS UI).
 * Cache-first for static icons/brand.
 */
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  const isStatic =
    url.pathname.startsWith("/icons/") ||
    url.pathname.startsWith("/brand/") ||
    url.pathname.startsWith("/images/") ||
    url.pathname === "/favicon.svg" ||
    url.pathname.endsWith(".css") ||
    url.pathname.endsWith(".woff2");

  if (isStatic) {
    event.respondWith(
      caches.match(req).then(
        (hit) =>
          hit ||
          fetch(req).then((res) => {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
            return res;
          })
      )
    );
    return;
  }

  // Learn navigations: try network, fall back to cache, then /learn shell
  if (req.mode === "navigate" && url.pathname.startsWith("/learn")) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
          return res;
        })
        .catch(async () => {
          const cached = await caches.match(req);
          if (cached) return cached;
          return (
            (await caches.match("/learn")) ||
            new Response("You are offline. Open Super-Cube Learn when back online.", {
              status: 503,
              headers: { "Content-Type": "text/plain" },
            })
          );
        })
    );
  }
});

/* Web Push (Phase 1 · stage 5). Only fires once push is configured on the server. */
self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { body: event.data ? event.data.text() : "" };
  }
  const title = data.title || "Super-Cube";
  const url = typeof data.url === "string" && data.url.startsWith("/") ? data.url : "/learn";
  event.waitUntil(
    self.registration.showNotification(title, {
      body: data.body || "Two minutes for your six faces today.",
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      tag: data.tag || "sc-reminder",
      data: { url },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/learn";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const c of list) {
        if (new URL(c.url).pathname.startsWith("/learn") && "focus" in c) {
          c.navigate(url);
          return c.focus();
        }
      }
      return self.clients.openWindow(url);
    })
  );
});
