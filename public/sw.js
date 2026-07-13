const CACHE_NAME = 'studyos-v2';

// Assets to cache on install
const PRECACHE_ASSETS = [
  '/',
  '/dashboard',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// Install: pre-cache core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_ASSETS))
  );
  self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: cache-first for static assets, bypass for everything else
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET requests and cross-origin requests
  if (event.request.method !== 'GET' || !url.origin.includes(self.location.origin)) {
    return;
  }

  // Bypass service worker caching entirely in local development (localhost / LAN IP)
  // This prevents Turbopack/Next.js dev chunks from getting stale in the SW cache.
  const isLocalDev =
    self.location.hostname === 'localhost' ||
    self.location.hostname === '127.0.0.1' ||
    self.location.hostname.startsWith('10.') ||
    self.location.hostname.startsWith('100.') ||
    self.location.hostname.startsWith('172.') ||
    self.location.hostname.startsWith('192.168.') ||
    self.location.hostname.endsWith('.local');

  if (isLocalDev) {
    return;
  }

  // Only intercept static assets (images, icons, Next.js static chunks)
  if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname === '/manifest.json' ||
    url.pathname === '/logo.png' ||
    url.pathname === '/apple-touch-icon.png'
  ) {
    event.respondWith(
      caches.match(event.request).then(
        (cached) => cached || fetch(event.request).then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
      )
    );
    return;
  }

  // For all other requests (HTML pages, API, auth, redirects), let the browser handle it natively.
  // This prevents the "redirected response was used for a request whose redirect mode is not 'follow'" error.
  return;
});

