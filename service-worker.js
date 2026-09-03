const CACHE_PREFIX='water-tracker-';
const CACHE_NAME='water-tracker-1.9.0';
const CORE_ASSETS=[
  './',
  './index.html',
  './manifest.webmanifest',
  './icon.svg',
  './icon-180.png',
  './icon-192.png',
  './icon-512.png',
  './v1-version.txt',
  './v1/css/app.css',
  './v1/css/ui-extras.css',
  './v1/css/calendar.css',
  './v1/css/progress.css',
  './v1/css/pixel-plant.css',
  './v1/css/garden.css',
  './v1/js/config.js',
  './v1/js/storage.js',
  './v1/js/date.js',
  './v1/js/hydration.js',
  './v1/js/stats.js',
  './v1/js/plants.js',
  './v1/js/engagement.js',
  './v1/js/telemetry.js',
  './v1/js/app.js',
  './v1/js/birthday-prompt.js',
  './v1/js/pixel-plant.js',
  './v1/js/garden.js',
  './v1/js/ui-extras.js'
];

self.addEventListener('install',event=>{
  event.waitUntil((async()=>{
    const cache=await caches.open(CACHE_NAME);
    // Do not activate unless the complete application shell is available.
    await cache.addAll(CORE_ASSETS);
    // v1.9.0 is a one-time recovery release from the older destructive updater.
    // Future releases can return to user-triggered activation once 1.9.0 controls the app.
    self.skipWaiting();
  })());
});

self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(key=>key.startsWith(CACHE_PREFIX)&&key!==CACHE_NAME).map(key=>caches.delete(key)));
    await self.clients.claim();
    // Reload existing windows once so no 1.8.1 document keeps running against the 1.9.0 worker.
    const clients=await self.clients.matchAll({type:'window'});
    await Promise.all(clients.map(client=>client.navigate(client.url).catch(()=>null)));
  })());
});

self.addEventListener('message',event=>{if(event.data?.type==='SKIP_WAITING')self.skipWaiting();});

self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const request=event.request,url=new URL(request.url);
  if(url.origin!==self.location.origin)return;

  // Version checks must always reach the network and must not create a new
  // cache entry every five minutes because the request carries a timestamp.
  if(url.pathname.endsWith('/v1-version.txt')){
    event.respondWith(fetch(request,{cache:'no-store'}).catch(()=>caches.match('./v1-version.txt')));
    return;
  }

  if(request.mode==='navigate'){
    event.respondWith((async()=>{
      // Keep the HTML shell atomic with the service worker version controlling it.
      const cache=await caches.open(CACHE_NAME);
      const cached=(await cache.match('./index.html'))||(await cache.match('./'));
      if(cached)return cached;
      try{return await fetch(request,{cache:'no-store'});}catch(_){return Response.error();}
    })());
    return;
  }

  event.respondWith((async()=>{
    const cache=await caches.open(CACHE_NAME),cached=await cache.match(request);
    if(cached)return cached;
    try{
      const response=await fetch(request);
      if(response&&response.ok)cache.put(request,response.clone()).catch(()=>{});
      return response;
    }catch(_){return Response.error();}
  })());
});
