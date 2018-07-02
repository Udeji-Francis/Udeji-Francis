const cacheName = "currency-converter-static";
const cacheVersion = 1;
const cacheFiles = [
    "./",
    "./index.html",
    "./css/font-awesome.min.css",
    "./css/normalise.css",
    "./css/style.css",
    "./fonts/fontawesome-webfont.eot",
    "./fonts/fontawesome-webfont.svg",
    "./fonts/fontawesome-webfont.ttf",
    "./fonts/fontawesome-webfont.woff",
    "./fonts/fontawesome-webfont.woff2",
    "./fonts/FontAwesome.etf",
    "./js/database.js",
    "./js/index.js",
    "./img/preview.png"
];

self.addEventListener('install', e => {
    e.waitUntil(caches.open(cacheName).then(cache => {
        console.log("SW -- caching files")
        return cache.addAll(cacheFiles);
    }))
});

self.addEventListener('install', e => {
    e.waitUntil(

        caches.keys().then(cacheNames => {

            return Promise.all(cacheNames.map(thisCacheName => {

                if(thisCacheName !== cacheName) {

                    console.log("sw -- removing old from")
                    return caches.delete(thisCacheName)
                }

            }))

        })

    );
});

self.addEventListener('install', e => {

    console.log("sw -- fetching ");
    caches.match(e.request).then(response => {

        if(response) {
            console.log("sw -- found in cache")

            return response;
        }

        let responseClone = e.response.clone()
        caches.open(cacheName).then(cache => {
            cache.put(e.request, requestClone)

            return response;
        })

    })

});