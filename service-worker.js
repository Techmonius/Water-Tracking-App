const CACHE_PREFIX = "water-tracker-";
const CACHE_NAME = "water-tracker-1.9.2";
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon.svg",
  "./icon-180.png",
  "./icon-192.png",
  "./icon-512.png",
  "./v1-version.txt",
  "./v1/css/app.css",
  "./v1/css/ui-extras.css",
  "./v1/css/calendar.css",
  "./v1/css/progress.css",
  "./v1/css/pixel-plant.css",
  "./v1/css/garden.css",
  "./v1/js/config.js",
  "./v1/js/storage.js",
  "./v1/js/date.js",
  "./v1/js/hydration.js",
  "./v1/js/stats.js",
  "./v1/js/artwork.js",
  "./v1/js/plants.js",
  "./v1/assets/plants/approved/sunflower.jpeg",
  "./v1/assets/plants/approved/plants-3-8.jpeg",
  "./v1/js/engagement.js",
  "./v1/js/telemetry.js",
  "./v1/js/app.js",
  "./v1/js/birthday-prompt.js",
  "./v1/js/pixel-plant.js",
  "./v1/js/garden.js",
  "./v1/js/ui-extras.js",
  "./v1/assets/plants/overlays/stage-8-flower-1.webp",
  "./v1/assets/plants/overlays/stage-8-flower-2.webp",
  "./v1/assets/plants/overlays/stage-8-flower-3.webp",
  "./v1/assets/plants/overlays/stage-8-flower-5.webp",
  "./v1/assets/plants/stage-1.webp",
  "./v1/assets/plants/stage-2.webp",
  "./v1/assets/plants/stage-3.webp",
  "./v1/assets/plants/stage-4.webp",
  "./v1/assets/plants/stage-5.webp",
  "./v1/assets/plants/stage-6.webp",
  "./v1/assets/plants/stage-7.webp",
  "./v1/assets/plants/stage-8.webp",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      // Do not activate unless the complete application shell is available.
      await cache.addAll(CORE_ASSETS);
      // Existing clients keep their complete version until Update is selected.
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
          .map((key) => caches.delete(key)),
      );
      await self.clients.claim();
      // After explicit activation, move every open app window to the same shell.
      const clients = await self.clients.matchAll({ type: "window" });
      await Promise.all(
        clients.map((client) => client.navigate(client.url).catch(() => null)),
      );
    })(),
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const request = event.request,
    url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Version checks must always reach the network and must not create a new
  // cache entry every five minutes because the request carries a timestamp.
  if (url.pathname.endsWith("/v1-version.txt")) {
    event.respondWith(
      fetch(request, { cache: "no-store" }).catch(() =>
        caches.match("./v1-version.txt"),
      ),
    );
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        // Keep the HTML shell atomic with the service worker version controlling it.
        const cache = await caches.open(CACHE_NAME);
        const cached =
          (await cache.match("./index.html")) || (await cache.match("./"));
        if (cached) return cached;
        try {
          return await fetch(request, { cache: "no-store" });
        } catch (_) {
          return Response.error();
        }
      })(),
    );
    return;
  }

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME),
        cached = await cache.match(request);
      if (cached) return cached;
      try {
        const response = await fetch(request);
        if (response && response.ok)
          cache.put(request, response.clone()).catch(() => {});
        return response;
      } catch (_) {
        return Response.error();
      }
    })(),
  );
});
