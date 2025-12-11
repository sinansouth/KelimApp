
const CACHE_NAME = 'kelimapp-v9-offline-ready';

// Core assets that must be cached immediately
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Merriweather:wght@400;700&family=Courier+Prime:wght@400;700&family=Fredoka:wght@400;600&family=Orbitron:wght@400;700&family=Bangers&family=Playfair+Display:wght@400;700&family=Patrick+Hand&family=Creepster&family=Russo+One&display=swap',
  // App Icons & Mascots - Updated paths
  'https://8upload.com/image/24fff6d1ca0ec801/Gemini_Generated_Image_1ri1941ri1941ri1.png',
  'https://8upload.com/image/683d30980d832725/neutral.png',
  'https://8upload.com/image/c725cfc9f2eb36c7/happy.png',
  'https://8upload.com/image/a365c1b92ddaff6e/sad.png',
  'https://8upload.com/image/f78213d42d2c769f/thinking.png'
];

// Domains that we want to cache at runtime
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
        // Attempt to cache all, but do not fail installation if one fails (e.g. 404 image)
        return Promise.allSettled(PRECACHE_ASSETS.map(url => cache.add(url)));
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
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Strategy for External CDNs (React, Lucide, Fonts, Images)
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
             // Network failed, nothing to do here if no cache
          });
          return cachedResponse || fetchPromise;
        });
      })
    );
    return;
  }

  // Strategy for App Shell & Local files
  // Cache First, fall back to Network, update cache in background if network succeeds
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        // Return cached response immediately, but try to update it in background
        fetch(event.request).then((networkResponse) => {
            if(networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, networkResponse.clone());
                });
            }
        }).catch(() => {}); // Ignore errors in background update
        
        return response;
      }
      
      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return networkResponse;
      });
    })
  );
});
