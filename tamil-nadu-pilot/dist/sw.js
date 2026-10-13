const CACHE='wims-tn-v4';
const SHELL=['./','./index.html','./style.css','./app.js','./geo.js','./vendor/leaflet.js','./vendor/leaflet.css','./data/stops.json','./data/boundary.json','./data/routes.json','./icon.svg','./icon-192.png','./icon-512.png','./manifest.webmanifest'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('wims-tn-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET'||new URL(e.request.url).origin!==self.location.origin)return;
  e.respondWith(fetch(e.request).then(async response=>{if(response.ok){const cache=await caches.open(CACHE);await cache.put(e.request,response.clone());}return response;}).catch(()=>caches.match(e.request).then(r=>r||new Response('Offline: open the app once while connected.',{status:503}))));
});
self.addEventListener('notificationclick',e=>{e.notification.close();e.waitUntil(self.clients.matchAll({type:'window'}).then(clients=>{const client=clients.find(c=>c.url.startsWith(self.registration.scope));return client?client.focus():self.clients.openWindow('./');}));});
