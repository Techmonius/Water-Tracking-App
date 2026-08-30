const CACHE_NAME='water-tracker-1.8.1';
const CORE_ASSETS=[
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
  './v1/css/pixel-plant.css',
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
  './v1/js/parity.js',
  './v1/js/pixel-plant.js',
  './v1/js/garden.js'
];

self.addEventListener('install',event=>{
  event.waitUntil((async()=>{
    const cache=await caches.open(CACHE_NAME);
    await cache.addAll(CORE_ASSETS);
    self.skipWaiting();
  })());
});

self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(key=>key!==CACHE_NAME).map(key=>caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const request=event.request;

  if(request.mode==='navigate'){
    event.respondWith((async()=>{
      try{
        const response=await fetch(request,{cache:'no-store'});
        if(response&&response.ok){
          const cache=await caches.open(CACHE_NAME);
          cache.put('./index.html',response.clone()).catch(()=>{});
        }
        return response;
      }catch(_){
        return (await caches.match('./index.html'))||(await caches.match('./'));
      }
    })());
    return;
  }

  event.respondWith((async()=>{
    const cached=await caches.match(request);
    if(cached)return cached;
    try{
      const response=await fetch(request);
      if(response&&response.ok){
        const cache=await caches.open(CACHE_NAME);
        cache.put(request,response.clone()).catch(()=>{});
      }
      return response;
    }catch(_){
      return Response.error();
    }
  })());
});