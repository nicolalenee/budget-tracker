// define which files we'd like to cache
const FILES_TO_CACHE = [
  "./index.html",
  "./css/styles.css",
  "./js/index.js",
  "./manifest.json",
  "./icons/icon-72x72.png",
  "./icons/icon-96x96.png",
  "./icons/icon-128x128.png",
  "./icons/icon-144x144.png",
  "./icons/icon-152x152.png",
  "./icons/icon-192x192.png",
  "./icons/icon-384x384.png",
  "./icons/icon-512x512.png"
];
// global constants
const APP_PREFIX = 'BudgetTracker-';
const VERSION = 'version_01';
const CACHE_NAME = APP_PREFIX + VERSION;

// install the service worker and add files to the precache
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      console.log('installing cache : ' + CACHE_NAME)
      return cache.addAll(FILES_TO_CACHE)
    })
  )
});

// activate the service worker: clear out any old data from the cache
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function (keyList) {
      let cacheKeepList = keyList.filter(function(key) {
        return key.indexOf(APP_PREFIX)
      })
      cacheKeepList.push(CACHE_NAME);

      return Promise.all(keyList.map(function (key, i) {
        if (cacheKeepList.indexOf(key) === -1) {
          console.log('deleting cache : ' + keyList[i] );
          return caches.delete(keyList[i]);
        }
      }));
    })
  )
});

// retrieve information from the cache
self.addEventListener('fetch', function(e) {
  console.log('fetch request : ' + e.request.url)
  e.respondWith(
    // determine if the resource already exists in caches
    // if not, allow resource to be retrieved from the online network as usual
    caches.match(e.request).then(function (request) {
      if (request) {
        console.log('responding with cache : ' + e.request.url)
        return request;
      } else {
        console.log('file is not cached, fetchinig : ' + e.request.url)
        return fetch(e.request)
      }
    })
     
  )
})
