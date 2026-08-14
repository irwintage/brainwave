const CACHE = "brainwave-v4";

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

self.addEventListener("install", event => {
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE).then(async cache => {
      await Promise.all(
        ASSETS.map(async asset => {
          try {
            await cache.add(asset);
            console.log("[SW] Cached:", asset);
          } catch (error) {
            console.warn("[SW] Failed to cache:", asset, error);
          }
        })
      );
    })
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE)
          .map(key => caches.delete(key))
      )
    )
  );

  self.clients.claim();
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      return fetch(event.request).then(response => {
        if (
          response &&
          response.status === 200 &&
          event.request.method === "GET"
        ) {
          const clone = response.clone();

          caches.open(CACHE).then(cache => {
            cache.put(event.request, clone);
          });
        }

        return response;
      });
    })
  );
});
