const CACHE_PREFIX='water-tracker-';
const CACHE_NAME='water-tracker-1.9.0';
const LEGACY_RECOVERY_CACHE='water-tracker-1.8.1';
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
    await cache.addAll(CORE_ASSETS);
    // v1.8.1 had a destructive in-app updater. Only that upgrade is forced
    // through immediately; normal future releases wait for the user to update.
    const keys=await caches.keys();
    if(keys.includes(LEGACY_RECOVERY_CACHE))self.skipWaiting();
  })());
});

self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys(),recovering=keys.includes(LEGACY_RECOVERY_CACHE);
    await Promise.all(keys.filter(key=>key.startsWith(CACHE_PREFIX)&&key!==CACHE_NAME).map(key=>caches.delete(key)));
    await self.clients.claim();
    if(recovering){
      const clients=await self.clients.matchAll({type:'window'});
      await Promise.all(clients.map(client=>client.navigate(client.url).catch(()=>null)));
    }
  })());
});

self.addEventListener('message',event=>{if(event.data?.type==='SKIP_WAITING')self.skipWaiting();});

self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const request=event.request,url=new URL(request.url);
  if(url.origin!==self.location.origin)return;

  if(request.mode==='navigate'){
    event.respondWith((async()=>{
      // Keep the HTML shell atomic with the service worker version controlling it.
      // A new worker pre-caches its complete shell before activation.
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
