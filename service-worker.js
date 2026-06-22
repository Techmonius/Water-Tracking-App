const CACHE_NAME = 'water-tracker-2026-06-22-11';
const ASSETS = [
  './',
  './index.html',
  './style.css?v=2026-06-22-10',
  './fix-v11.css?v=2026-06-22-11',
  './app.js?v=2026-06-22-10',
  './update-fix.js?v=2026-06-22-11',
  './manifest.webmanifest',
  './icon.svg',
  './version.txt'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)).catch(() => undefined));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  event.respondWith(
    fetch(request, { cache: 'no-store' })
      .then(response => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(request, copy)).catch(() => undefined);
        return response;
      })
      .catch(() => caches.match(request))
  );
});
