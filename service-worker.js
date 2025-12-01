
const CACHE_NAME = 'kelimapp-v7-pwa-ready';

// Core assets that must be cached immediately
// We are explicitly caching Tailwind and Fonts so the app looks "native" immediately
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Merriweather:wght@400;700&family=Courier+Prime:wght@400;700&family=Fredoka:wght@400;600&family=Orbitron:wght@400;700&family=Bangers&family=Playfair+Display:wght@400;700&family=Patrick+Hand&family=Creepster&family=Russo+One&display=swap'
];

// Domains that we want to cache at runtime (CDN libraries, Images)
const RUNTIME_CACHE_DOMAINS = [
  'aistudiocdn.com',
  'cdn-icons-png.flaticon.com',
  'fonts.gstatic.com',
  'via.placeholder.com',
  '8upload.com' // Added user image host
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Strategy for External CDNs (React, Lucide, Fonts, Images)
  // Stale-While-Revalidate: Use cache if available, but update in background
  if (RUNTIME_CACHE_DOMAINS.some(domain => url.hostname.includes(domain))) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          const fetchPromise = fetch(event.request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
                cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          }).catch(() => {
             // If offline and no cache, return nothing (or a fallback image if needed)
          });
          return cachedResponse || fetchPromise;
        });
      })
    );
    return;
  }

  // Strategy for App Shell (Local files)
  // Cache First, fall back to Network
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(event.request).then((networkResponse) => {
         // Check if valid response
         if(!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
         }
         
         // Cache new local files
         const responseToCache = networkResponse.clone();
         caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
         });
         
         return networkResponse;
      });
    })
  );
});
