const CACHE_NAME = "lankawa-offline-v3";
const OFFLINE_ASSETS = [
  "/geo/districts.geojson",
  "/favicon.svg",
  "/manifest.json",
  "/api/v1/pulse",
  "/api/v1/districts",
  "/en",
  "/si",
  "/ta",
];

const DISTRICT_SLUGS = [
  "colombo",
  "gampaha",
  "kalutara",
  "kandy",
  "matale",
  "nuwara-eliya",
  "galle",
  "matara",
  "hambantota",
  "jaffna",
  "kilinochchi",
  "mannar",
  "vavuniya",
  "mullaitivu",
  "batticaloa",
  "ampara",
  "trincomalee",
  "kurunegala",
  "puttalam",
  "anuradhapura",
  "polonnaruwa",
  "badulla",
  "monaragala",
  "ratnapura",
  "kegalle",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll([
        ...OFFLINE_ASSETS,
        ...DISTRICT_SLUGS.map((slug) => `/api/v1/districts/${slug}`),
      ]),
    ),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key)),
      ),
    ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== "GET") {
    return;
  }

  const isDocument = request.mode === "navigate" || request.destination === "document";
  const cacheable =
    isDocument ||
    url.pathname.startsWith("/geo/") ||
    url.pathname.startsWith("/districts/") ||
    url.pathname.startsWith("/api/v1/districts") ||
    url.pathname === "/api/v1/pulse" ||
    url.pathname === "/en" ||
    url.pathname === "/si" ||
    url.pathname === "/ta" ||
    url.pathname.startsWith("/en/") ||
    url.pathname.startsWith("/si/") ||
    url.pathname.startsWith("/ta/");

  if (!cacheable) {
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      try {
        const response = await fetch(request);
        if (response.ok) {
          cache.put(request, response.clone());
        }
        return response;
      } catch {
        const cached = await cache.match(request);
        if (cached) {
          return cached;
        }
        if (isDocument) {
          const localeShell =
            (await cache.match("/en")) ||
            (await cache.match("/si")) ||
            (await cache.match("/ta"));
          if (localeShell) {
            return localeShell;
          }
        }
        const fallback = await cache.match("/geo/districts.geojson");
        if (fallback) {
          return fallback;
        }
        throw new Error("Offline and no cached response");
      }
    }),
  );
});
