/*
 * sw.js – Service Worker für die Offline-Nutzung.
 * Liegt im Hauptordner, damit er die ganze App (auch unter /<repo>/) steuert.
 *
 * WICHTIG beim Weiterentwickeln: Nach Änderungen an Dateien VERSION erhöhen,
 * sonst bekommen installierte Apps die neuen Dateien erst verspätet.
 */
const VERSION = 'einblick-v1.0.0';
const FONT_CACHE = 'einblick-fonts';

// Alle Dateien der App (relativ zum Ordner des Service Workers)
const FILES = [
  './',              // = index.html
  'manifest.json',
  'css/style.css',
  'js/store.js',
  'js/ui.js',
  'js/badges.js',
  'js/app.js',
  'js/data/knowledge.js',
  'js/data/glossary.js',
  'js/views/start.js',
  'js/views/spiele.js',
  'js/views/tagebuch.js',
  'js/views/wissen.js',
  'js/views/fazit.js',
  'games/kabel.js',
  'games/tickets.js',
  'games/tickets-data.js',
  'games/phishing.js',
  'games/phishing-data.js',
  'games/pc.js',
  'icons/icon.svg',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/icon-maskable-512.png',
  'icons/apple-touch-icon.png'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

// Alte Caches aufräumen
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION && k !== FONT_CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Google Fonts: aus dem Cache, im Hintergrund aktualisieren
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(
      caches.open(FONT_CACHE).then(cache => cache.match(req).then(hit => {
        const net = fetch(req).then(res => { if (res.ok || res.type === 'opaque') cache.put(req, res.clone()); return res; }).catch(() => hit);
        return hit || net;
      }))
    );
    return;
  }

  if (url.origin !== location.origin) return;

  // Seitenaufrufe (auch …/index.html) bekommen immer das gecachte App-Gerüst.
  // So klappt der Start offline, egal ob mit oder ohne „index.html“ in der Adresse.
  if (req.mode === 'navigate') {
    event.respondWith(caches.match('./').then(hit => hit || fetch(req)));
    return;
  }

  // App-Dateien: zuerst Cache (schnell + offline), sonst Netz
  event.respondWith(
    caches.match(req, { ignoreSearch: true }).then(hit => hit || fetch(req).then(res => {
      if (res.ok) caches.open(VERSION).then(c => c.put(req, res.clone()));
      return res;
    }))
  );
});
