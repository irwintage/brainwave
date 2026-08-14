const CACHE = "brainwave-v2";

const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./cinzel-v26-latin-regular.woff2",
  "./cinzel-v26-latin-500.woff2",
  "./inter-v20-latin-300.woff2",
  "./inter-v20-latin-regular.woff2",
  "./inter-v20-latin-500.woff2",
  "./icon-192.png",
  "./icon-512.PNG"
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE)
          .map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});
