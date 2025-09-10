const CACHE_NAME = 'air-bill-cache-v2';
const ASSETS = [
  '/', '/index.html', '/styles.css', '/app.js', '/manifest.webmanifest',
  '/icons/icon-192.png', '/icons/icon-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const { request } = e;
  // Network-first for API; cache-first for others
  if (request.url.includes('/api/')) {
    e.respondWith(
      fetch(request).then(res => {
        return res;
      }).catch(() => new Response(JSON.stringify({ ok:false, offline:true, message:'offline' }), { headers:{'Content-Type':'application/json'}}))
    );
    return;
  }
  e.respondWith(
    caches.match(request).then(cached => cached || fetch(request))
  );
});
