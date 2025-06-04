var cacheName = 'FoxitPDFSDKForWeb';

self.addEventListener('install', function (event) {
    event.waitUntil(self.skipWaiting());
});
self.addEventListener('fetch', function (event) {
    var url = event.request.url;
    //if (/\.brotli$/.test(url) || /\/gsdk\.js\?h=/.test(url) || /\/gsdk\.wasm\?h=/.test(url)) {
        event.respondWith(
            caches.match(event.request).then(function (response) {
                if (response) {
                    return response;
                }
                var requestToCache = event.request.clone();

                return fetch(requestToCache).then(function (response) {
                    if (!response || response.status !== 200) {
                        return response;
                    }
                    var responseToClone = response.clone();
                    caches.open(cacheName).then(function (cache) {
                        cache.put(requestToCache, responseToClone);
                    });
                    return response;
                })

            })
        )
    //}
})