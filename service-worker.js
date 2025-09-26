const CACHE_NAME = 'psychological-studio-v1';
const urlsToCache = [
    './',
    './index.html',
    './NewRelease/style.css',
    './PsychologicalStudio/style.css',
    './NewRelease/script.js',
    './PsychologicalStudio/script.js',
    './mykicks/', // This should contain all your audio samples
    './icon.png', // You'll need to add an app icon
    './manifest.json'
];

// Install the service worker and cache resources
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(urlsToCache);
            })
    );
});

// Serve cached content when offline
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Cache hit - return response
                if (response) {
                    return response;
                }
                // Not in cache, fetch from network
                return fetch(event.request);
            })
    );
});

// Update the service worker
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});