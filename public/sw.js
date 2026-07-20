const CACHE_NAME = "lankawa-offline-v5";
const OFFLINE_ASSETS = [
  "/geo/districts.geojson",
  "/favicon.svg",
  "/manifest.json",
  "/api/v1/pulse",
  "/api/v1/districts",
  "/api/v1/brief?locale=en",
  "/api/v1/brief?locale=si",
  "/api/v1/brief?locale=ta",
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

self.addEventListener("message", (event) => {
  const data = event.data;
  if (!data || data.type !== "lankawa:cache-home-services") {
    return;
  }
  const slug = typeof data.districtSlug === "string" ? data.districtSlug : "";
  if (!slug || !DISTRICT_SLUGS.includes(slug)) {
    return;
  }

  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      const urls = [
        `/api/v1/services?district=${slug}`,
        `/api/v1/districts/${slug}`,
        `/en/services?district=${slug}`,
        `/si/services?district=${slug}`,
        `/ta/services?district=${slug}`,
      ];
      await Promise.all(
        urls.map(async (url) => {
          try {
            const response = await fetch(url, { credentials: "same-origin" });
            if (response.ok) {
              await cache.put(url, response.clone());
            }
          } catch {
            // Best-effort offline pack.
          }
        }),
      );
    }),
  );
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
    url.pathname.startsWith("/api/v1/services") ||
    url.pathname === "/api/v1/pulse" ||
    url.pathname === "/api/v1/brief" ||
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
        if (url.pathname === "/api/v1/brief") {
          const locale = url.searchParams.get("locale") ?? "en";
          const briefCached = await cache.match(`/api/v1/brief?locale=${locale}`);
          if (briefCached) {
            return briefCached;
          }
        }
        if (url.pathname.startsWith("/api/v1/services")) {
          const district = url.searchParams.get("district");
          if (district) {
            const servicesCached = await cache.match(
              `/api/v1/services?district=${district}`,
            );
            if (servicesCached) {
              return servicesCached;
            }
          }
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
        const pulse = await cache.match("/api/v1/pulse");
        if (pulse) {
          return pulse;
        }
        throw new Error("Offline and no cached response");
      }
    }),
  );
});
