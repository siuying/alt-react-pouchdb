const APP_ID = 'todo'
const VERSION = '1'
const CACHE_NAME = APP_ID + '-' + VERSION
const URLS_TO_CACHE = [
  '/alt-todo-pouchdb/',
  '/alt-todo-pouchdb/index.html',
  '/alt-todo-pouchdb/css/bootstrap.min.css',
  '/alt-todo-pouchdb/css/styles.css',
  '/alt-todo-pouchdb/js/bundle.js'
]

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache
        .addAll(URLS_TO_CACHE)
        .then(() => self.skipWaiting())
    })
  )
})

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName != CACHE_NAME) {
            return caches.delete(cacheName)
          }
        })
      )
    })
  ).then(self.clients.claim())
})

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request)
    })
  )
})
