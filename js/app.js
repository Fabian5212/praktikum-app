/*
 * app.js – Router, Navigation und Start der App.
 * Routen sind Hash-basiert (#/seite/unterseite), damit es auf GitHub Pages ohne Server-Konfiguration läuft.
 */
(function (App) {
  'use strict';

  const view = document.getElementById('view');
  let cleanup = null;     // Aufräumfunktion der aktuellen Seite (z. B. Timer stoppen)
  let current = '';

  function parse() {
    const parts = (location.hash || '#/start').replace(/^#\/?/, '').split('/').filter(Boolean);
    const page = App.views[parts[0]] ? parts[0] : 'start';
    return { page, params: parts.slice(1) };
  }

  /**
   * Seite rendern.
   * keepScroll=true: gleiche Seite neu zeichnen, ohne nach oben zu springen (z. B. nach dem Speichern).
   */
  function render(keepScroll) {
    const { page, params } = parse();
    const y = window.scrollY;
    if (typeof cleanup === 'function') cleanup();
    App.router.prev = current;
    current = page;

    cleanup = App.views[page](view, params) || null;
    App.ui.hydrateIcons(view);

    // aktiven Tab markieren
    document.querySelectorAll('.tabbar a').forEach(a => {
      const on = a.dataset.tab === page;
      a.classList.toggle('active', on);
      if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });

    if (keepScroll) {
      window.scrollTo(0, y);
    } else {
      window.scrollTo(0, 0);
      view.classList.remove('enter'); void view.offsetWidth; view.classList.add('enter');
    }
  }

  App.router = {
    prev: '',
    refresh: () => render(true),
    go: hash => { location.hash = hash; }
  };

  window.addEventListener('hashchange', () => render(false));

  // Icons in der Navigation einsetzen und erste Seite zeigen
  App.ui.hydrateIcons(document.querySelector('.tabbar'));
  render(false);

  // Erster Start: Namen abfragen
  if (!App.store.get().name) setTimeout(() => App.settings(true), 250);

  // Service Worker für Offline-Nutzung (relativer Pfad → funktioniert auch unter /<repo>/)
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').then(reg => {
        // Wenn eine neue Version bereitliegt, Hinweis geben
        reg.addEventListener('updatefound', () => {
          const nw = reg.installing;
          nw && nw.addEventListener('statechange', () => {
            if (nw.state === 'installed' && navigator.serviceWorker.controller) {
              App.ui.toast('Update geladen – beim nächsten Öffnen aktiv.', 'sparkle');
            }
          });
        });
      }).catch(() => { /* offline-Funktion ist optional */ });
    });
  }
})(window.App);
