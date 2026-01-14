// Nama cache
const CACHE_NAME = 'hafalan-retyping-v9';

// Fail yang diprecache (shell app) — ikut base path GitHub Pages
const PRECACHE = [
  '/hafalan-retyping/',
  '/hafalan-retyping/index.html',
  '/hafalan-retyping/manifest.webmanifest',
  '/hafalan-retyping/icon-192.png',
  '/hafalan-retyping/icon-512.png'
];

// Install event: cache fail asas
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE))
  );
  self.skipWaiting();
});

// Activate event: buang cache lama
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((k) => {
          if (k !== CACHE_NAME) {
            return caches.delete(k);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// Fetch event: network-first untuk dokumen, cache-first untuk aset
self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.destination === 'document') {
    // Network-first untuk HTML
    event.respondWith(
      fetch(request)
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(request, clone));
          return res;
        })
        .catch(() => caches.match(request))
    );
  } else {
    // Cache-first untuk CSS, JS, ikon, dll
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((res) => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(request, clone));
          return res;
        });
      })
    );
  }
});
