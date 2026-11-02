/*
 * app.js – Router, Navigation und Start der App.
 * Routen sind Hash-basiert (#/seite/unterseite), damit es auf GitHub Pages ohne Server-Konfiguration läuft.
 */
(function (App) {
  'use strict';

  const view = document.getElementById('view');
  const tabbar = document.querySelector('.tabbar');
  const TABS = ['start', 'spiele', 'tagebuch', 'wissen', 'fazit'];
  let cleanup = null;     // Aufräumfunktion der aktuellen Seite (z. B. Timer stoppen)
  let current = '';
  let last = null;        // zuletzt gezeigte Route { page, params }

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
    last = { page, params };

    cleanup = App.views[page](view, params) || null;
    App.ui.hydrateIcons(view);

    // aktiven Tab markieren; die Markierung (.tab-pill) gleitet per CSS zur neuen Position
    tabbar.style.setProperty('--tab-index', Math.max(0, TABS.indexOf(page)));
    tabbar.querySelectorAll('a').forEach(a => {
      const on = a.dataset.tab === page;
      a.classList.toggle('active', on);
      if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });

    if (keepScroll) {
      window.scrollTo(0, y);
    } else {
      window.scrollTo(0, 0);
      // Ohne View-Transition-Unterstützung (z. B. Firefox) wenigstens einblenden
      if (!App.ui.canTransition()) App.ui.replay(view, 'enter');
    }
  }

  /**
   * Art des Übergangs: Tab weiter rechts / tiefer → 'forward', zurück → 'back',
   * gleiche Ebene derselben Seite (z. B. Wissen-Reiter) → 'step'
   */
  function navKind(from, to) {
    if (!from) return 'fade';
    if (from.page !== to.page) return TABS.indexOf(to.page) > TABS.indexOf(from.page) ? 'forward' : 'back';
    // Nur bei den Spielen ist eine Unterseite wirklich „tiefer“ (Liste → Spiel)
    if (to.page === 'spiele' && to.params.length !== from.params.length) return to.params.length > from.params.length ? 'forward' : 'back';
    return 'step';
  }

  App.router = {
    prev: '',
    refresh: () => render(true),
    go: hash => { location.hash = hash; }
  };

  // Profil-Button im Seitenkopf → Einstellungen
  document.addEventListener('click', e => { if (e.target.closest('[data-avatar]')) App.settings(false); });

  window.addEventListener('hashchange', () => {
    App.ui.transition(() => render(false), navKind(last, parse()));
  });

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
