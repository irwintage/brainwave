const CACHE = "brainwave-v5";

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

/* INSTALL */
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

/* ACTIVATE */
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

/* FETCH */
self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);

  // Ignore chrome-extension://, blob:, data:, etc.
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return;
  }

  // Only cache GET requests
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) {
        return cached;
      }

      return fetch(event.request).then(response => {
        if (response && response.status === 200) {
          const clone = response.clone();

          caches.open(CACHE).then(cache => {
            cache.put(event.request, clone).catch(error => {
              console.warn(
                "[SW] Cache put failed:",
                event.request.url,
                error
              );
            });
          });
        }

        return response;
      });
    })
  );
});
