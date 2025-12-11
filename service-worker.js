

const CACHE_NAME = 'kelimapp-v8-offline-ready';

// Core assets that must be cached immediately
// We are explicitly caching Tailwind, Fonts, and ALL Used Images so the app looks "native" immediately
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Merriweather:wght@400;700&family=Courier+Prime:wght@400;700&family=Fredoka:wght@400;600&family=Orbitron:wght@400;700&family=Bangers&family=Playfair+Display:wght@400;700&family=Patrick+Hand&family=Creepster&family=Russo+One&display=swap',

  // FIX: Updated mascot URLs from GIF to PNG to match the new assets used in the Mascot component.
  // App Icons & Mascots
  'https://8upload.com/image/24fff6d1ca0ec801/Gemini_Generated_Image_1ri1941ri1941ri1.png',
  'https://8upload.com/image/683d30980d832725/neutral.png',
  'https://8upload.com/image/c725cfc9f2eb36c7/happy.png',
  'https://8upload.com/image/a365c1b92ddaff6e/sad.png',
  'https://8upload.com/image/f78213d42d2c769f/thinking.png'
];

// Domains that we want to cache at runtime (CDN libraries, Images)
const RUNTIME_CACHE_DOMAINS = [
  'aistudiocdn.com',
  'cdn-icons-png.flaticon.com',
  'fonts.gstatic.com',
  'via.placeholder.com',
  '8upload.com'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        // Service Worker: Precaching assets
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
            // Service Worker: Deleting old cache
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
            // If offline and no cache, allow it to fail gracefully or return placeholder
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
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
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