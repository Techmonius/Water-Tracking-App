const CACHE_NAME = 'water-tracker-1.2.1';
const ASSETS = [
  './',
  './index.html',
  './v1.html',
  './manifest.webmanifest',
  './icon.svg',
  './v1-version.txt',
  './v1/css/app.css',
  './v1/css/refinements.css',
  './v1/css/parity.css',
  './v1/css/calendar-parity.css',
  './v1/css/progress-parity.css',
  './v1/css/soft-cartoon-plant.css',
  './v1/js/config.js',
  './v1/js/storage.js',
  './v1/js/date.js',
  './v1/js/hydration.js',
  './v1/js/stats.js',
  './v1/js/engagement.js',
  './v1/js/telemetry.js',
  './v1/js/app.js',
  './v1/js/parity.js',
  './v1/js/calendar-parity.js',
  './v1/js/progress-parity.js',
  './v1/js/soft-cartoon-plant.js'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .catch(() => undefined)
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request, { cache: 'no-store' })
      .then(response => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy)).catch(() => undefined);
        return response;
      })
      .catch(() => caches.match(event.request).then(response => response || caches.match('./index.html')))
  );
});