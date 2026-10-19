// Service worker della mini-app: tiene in memoria solo il "guscio" (icone, emblema, pagina d'avvio)
// così l'app si apre subito. I dati dell'assemblea arrivano sempre da Google, mai dalla cache.
var CACHE = 'assemblea-v1';
var SHELL = ['./', 'index.html', 'manifest.webmanifest', 'emblema-bianco.svg',
  'icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'apple-touch-icon.png', 'favicon-32.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(SHELL); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener('fetch', function (e) {
  var url = new URL(e.request.url);
  if (url.origin !== self.location.origin || e.request.method !== 'GET') return; // Google: sempre dalla rete
  // Prima la rete (così gli aggiornamenti arrivano subito), la cache solo se manca la connessione
  e.respondWith(fetch(e.request).then(function (r) {
    var copy = r.clone();
    caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
    return r;
  }).catch(function () { return caches.match(e.request); }));
});
