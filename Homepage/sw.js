self.addEventListener('install', e => {
  e.waitUntil(
    caches.open('psychological-power-v1').then(cache => {
      return cache.addAll([
        './',
        './index.html',
        './media/psypowerrr.JPEG',
        './media/icon-192.png',
        './media/icon-512.png'
      ]);
    })
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(response => {
      return response || fetch(e.request);
    })
  );
});
