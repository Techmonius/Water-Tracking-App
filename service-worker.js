const CACHE_NAME = 'water-tracker-2026-06-22-25';
const ASSETS = ['./','./index.html','./v18.html','./styles.css','./engagement-v22.css','./engage-plus-v23.css','./plant-plus-v24.css','./config.js','./storage.js','./date.js','./ui.js','./telemetry.js','./app.js','./app-telemetry-v18.js','./progress-v22.js','./achievements-v22.js','./plant-calendar-v23.js','./goal-celebration-v23.js','./living-plant-v24.js','./manifest.webmanifest','./icon.svg','./version.txt'];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)).catch(() => undefined));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(fetch(event.request, { cache: 'no-store' }).then(response => {
    const copy = response.clone();
    caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy)).catch(() => undefined);
    return response;
  }).catch(() => caches.match(event.request)));
});