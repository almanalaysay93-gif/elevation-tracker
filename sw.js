/* Elevation service worker. Offline shell for the app.
   Navigations: network first. The app's own pages are cached under their request URL.
   /intro/ is never cached or intercepted, so it cannot overwrite the app shell.
   Same-origin static files: cache first. Cross-origin (Apps Script, fonts) is never cached. */
const VERSION = 'elevation-v3-7';
const SHELL = VERSION + '-shell';
const PRECACHE = [
  './',
  './index.html',
  './styles.css',
  './tokens.css',
  './app.js',
  './equipment.js',
  './manifest.webmanifest',
  './icons/app-icon.svg',
];
// Marketing/intro pages sit outside the app shell. Let the browser handle them.
const PASSTHROUGH = /\/intro(\/|\.html|$)/;

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(SHELL).then(c => c.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith('elevation-') && k !== SHELL).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // Apps Script and fonts go straight to the network

  if (req.mode === 'navigate') {
    if (PASSTHROUGH.test(url.pathname)) return; // no respondWith, no cache write
    event.respondWith(
      fetch(req)
        .then(res => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(SHELL).then(c => c.put(req, copy)).catch(() => {});
          }
          return res;
        })
        .catch(() => caches.match(req)
          .then(r => r || caches.match('./index.html'))
          .then(r => r || caches.match('./')))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(res => {
      if (res.ok) {
        const copy = res.clone();
        caches.open(SHELL).then(c => c.put(req, copy)).catch(() => {});
      }
      return res;
    }))
  );
});
