/* InvoiceMaster service worker.
   - Network-first for HTML so version-stamped pages always update when online,
     fall back to cache when offline.
   - Cache-first for static assets (CSS/JS/SVG) — the ?v= cache-busters mean
     each new build produces new URLs, so old cached versions are naturally
     superseded; old cache versions are pruned in `activate`.

   The VERSION constant is bumped by bust-cache.mjs so a single command
   invalidates every entry. */

const VERSION = '1778786723368';
const CACHE = `invoicemaster-${VERSION}`;

const PRECACHE = [
  '/',
  '/index.html',
  '/css/styles.css',
  '/css/print.css',
  '/favicon-32x32.png',
  '/android-icon-192x192.png',
  '/apple-icon-180x180.png',
  '/manifest.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k.startsWith('invoicemaster-') && k !== CACHE)
          .map((k) => caches.delete(k)),
      ),
    ).then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Network-first for HTML pages — keep the version stamp fresh when online,
  // fall back to cache when offline.
  if (req.mode === 'navigate' || req.destination === 'document') {
    event.respondWith(
      fetch(req)
        .then((resp) => {
          if (resp.ok) {
            const copy = resp.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return resp;
        })
        .catch(() => caches.match(req).then((cached) => cached || caches.match('/'))),
    );
    return;
  }

  // Cache-first for everything else (CSS/JS/SVG). Network fills the cache on
  // miss; failures fall through to whatever cached version exists.
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req)
        .then((resp) => {
          if (resp.ok) {
            const copy = resp.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return resp;
        })
        .catch(() => cached);
    }),
  );
});
