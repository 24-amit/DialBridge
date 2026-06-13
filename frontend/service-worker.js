const CACHE_NAME = "dialbridge-v1";

const urlsToCache = [
    "/",
    "/index.html",
    "/css/style.css",

    "/js/app.js",
    "/js/auth.js",
    "/js/call.js",
    "/js/config.js",
    "/js/firebase.js",
    "/js/socket.js",

    "/icons/logo.png",

    "/offline.html"
];

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

self.addEventListener("fetch", event => {
    event.respondWith(
        fetch(event.request)
            .catch(() => caches.match(event.request))
    );
});