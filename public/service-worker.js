const CACHE_NAME = 'goal-genius-cache';
const urlsToCache = [
    '/',
    '/index.html',
    '/manifest.json',
    '*'
];


// Install event: Cache specified resources
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(urlsToCache);
        }).then(() => self.skipWaiting())
    );
});

// Activate event: Claim clients immediately
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch event: Serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    // Only handle GET requests
    if (event.request.method !== 'GET') {
        return;
    }

    event.respondWith(
        caches.match(event.request).then((response) => {
            if (response) {
                // Serve from cache
                return response;
            }

            // Fetch from network and cache the response
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
        }).catch(() => {
            // Optional: Provide offline fallback for failed requests
            return //caches.match('/fallback.html');
        })
    );
});


// Notification click handler (optional)
self.addEventListener('notificationclick', (event) => {
    event.notification.close(); // Close the notification
    event.waitUntil(
        self.clients.matchAll({ type: 'window' }).then((clientList) => {
            // Check if the app is already open in a window
            for (let client of clientList) {
                if (client.url === '/' && 'focus' in client) {
                    return client.focus();
                }
            }
            // If not open, open a new window
            if (self.clients.openWindow) {
                return self.clients.openWindow('/');
            }
        })
    );
});

// Push event handler (optional for push notifications)
self.addEventListener('push', (event) => {
    const data = event.data ? event.data.text() : 'Default notification content';
    const options = {
        body: data,
        icon: '/logo512.png',
        badge: '/logo128.png'
    };
    event.waitUntil(self.registration.showNotification("Goal Kings", options));
});