/*
 * config.js – DIE zentrale Stelle der App.
 * Hier steht, welche Bereiche und Minispiele es gibt und in welcher Reihenfolge sie erscheinen.
 * index.html lädt alle Skripte über diese Liste, der Service Worker (sw.js) speichert damit alles für offline.
 * Neue Dateien müssen also NUR hier eingetragen werden – nirgendwo sonst.
 *
 * Nach jeder Änderung an der App die version erhöhen (npm run bump),
 * sonst zeigen bereits installierte Apps weiter die alten Dateien.
 */
(function (root) {
  'use strict';

  const config = {
    version: '2.5.0',

    // Bereiche der Praktikumswoche: je eine Datei bereiche/<id>.js
    // Reihenfolge = Reihenfolge in der App. Bereich entfernen: Zeile löschen.
    areas: [
      'it',
      'synchro',
      'schnitt',
      'tonregie',
      'anderes'
    ],

    // Minispiele: je eine Datei games/<id>.js
    //   img: false  → kein Bild img/games/<id>.png, stattdessen das Symbol des Spiels
    //   data: true  → zusätzliche Inhaltsdatei games/<id>-data.js (wird vor dem Spiel geladen)
    //   css: true   → eigenes Stylesheet games/<id>.css
    // Reihenfolge = Reihenfolge in der App. Spiel entfernen: Zeile löschen.
    games: [
      { id: 'kabel' },
      { id: 'tickets', data: true },
      { id: 'phishing', data: true },
      { id: 'pc' },
      { id: 'tonregie' },
      { id: 'schnitt-quiz', img: false }
    ]
  };

  /* ---------- Ab hier muss normalerweise nichts geändert werden ---------- */

  // Grundgerüst, wird vor den Bereichen und Spielen geladen
  const CORE = ['js/store.js', 'js/ui.js', 'js/badges.js', 'js/registry.js', 'js/quiz.js'];
  // Seiten und Start, werden danach geladen
  const PAGES = ['js/views/start.js', 'js/views/spiele.js', 'js/views/tagebuch.js', 'js/views/wissen.js',
    'js/views/fazit.js', 'js/mindmap.js', 'js/views/mindmap.js', 'js/app.js'];
  const STATIC = ['./', 'manifest.json', 'css/style.css', 'js/config.js', 'icons/logo.svg', 'icons/icon.svg',
    'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png', 'icons/apple-touch-icon.png'];

  /** Alle Skripte in Lade-Reihenfolge */
  config.scripts = () => CORE
    .concat(config.areas.map(id => 'bereiche/' + id + '.js'))
    .concat(...config.games.map(g => (g.data ? ['games/' + g.id + '-data.js'] : []).concat('games/' + g.id + '.js')))
    .concat(PAGES);

  /** Eigene Stylesheets der Spiele */
  config.styles = () => config.games.filter(g => g.css).map(g => 'games/' + g.id + '.css');

  /** Alle Dateien, die der Service Worker für offline speichert */
  config.files = () => STATIC
    .concat(config.scripts(), config.styles())
    .concat(config.games.filter(g => g.img !== false).map(g => 'img/games/' + g.id + '.png'));

  root.App = root.App || { views: {}, games: {}, data: {} };
  root.App.config = config;

  // Im Browser: Stylesheets und Skripte nacheinander laden (async = false hält die Reihenfolge ein).
  // Im Service Worker gibt es kein document – dort wird nur config.files() gebraucht.
  if (root.document) {
    config.styles().forEach(href => {
      const l = document.createElement('link');
      l.rel = 'stylesheet';
      l.href = href;
      document.head.appendChild(l);
    });
    config.scripts().forEach(src => {
      const s = document.createElement('script');
      s.src = src;
      s.async = false;
      document.body.appendChild(s);
    });
  }
})(self);
