/*
 * registry.js – Bereiche und Minispiele anmelden.
 * Jede Datei in bereiche/ ruft App.addArea({...}) auf, jedes Spiel in games/ App.addGame({...}).
 * Hier werden die Angaben geprüft und an die richtigen Stellen verteilt:
 * Akzentfarben (CSS), Wissen, Wörterbuch, Spielstand und Abzeichen.
 * Fehler landen als Warnung in der Browser-Konsole (F12), die App läuft trotzdem weiter.
 */
(function (App) {
  'use strict';

  const AREAS = App.store.AREAS;
  const GAMES = App.store.GAMES;
  const ID = /^[a-z][a-z0-9-]*$/;

  App.data.areas = {};      // id -> { title, intro, tasks, jobs } für „Wissen“
  App.data.questions = {};  // id -> [gute Fragen]
  App.data.glossary = [];   // [Begriff, Bereich, Erklärung]

  // Akzentfarben: .area-<id> bzw. .g-<id> setzen die Variable --a (siehe css/style.css)
  const style = document.createElement('style');
  style.id = 'accent-colors';
  document.head.appendChild(style);
  const accent = (cls, color) => { style.textContent += '.' + cls + ' { --a: ' + color + '; }\n'; };

  const warn = msg => console.warn('[Einblick] ' + msg);

  /** Bereich anmelden (aus bereiche/<id>.js). Felder: siehe tools/vorlagen/bereich.js */
  function addArea(a) {
    if (!a || !ID.test(a.id || '') || !a.label) return warn('Bereich ohne gültige id oder label: ' + JSON.stringify(a && a.id));
    if (!App.config.areas.includes(a.id)) return warn('Bereich „' + a.id + '“ fehlt in js/config.js (areas).');
    AREAS[a.id] = { label: a.label, short: a.short || a.label, icon: a.icon || 'dots', color: a.color || '#8A93AB', today: a.today || '' };
    accent('area-' + a.id, AREAS[a.id].color);
    if (a.intro) App.data.areas[a.id] = { title: a.label, intro: a.intro, tasks: a.tasks || [], jobs: a.jobs || [] };
    if (a.questions && a.questions.length) App.data.questions[a.id] = a.questions;
    (a.glossary || []).forEach(([term, text]) => App.data.glossary.push([term, a.id, text]));
  }

  /**
   * Minispiel anmelden (aus games/<id>.js). Felder: siehe tools/vorlagen/spiel.js
   * Pflicht: id, title, render(el). Optional: icon, area, color, topic, teaser,
   * save (eigene Felder im Spielstand), badges (Abzeichen zu diesem Spiel).
   */
  function addGame(g) {
    const conf = g && App.config.games.find(x => x.id === g.id);
    if (!conf) return warn('Spiel „' + (g && g.id) + '“ fehlt in js/config.js (games).');
    if (!g.title || typeof g.render !== 'function') return warn('Spiel „' + g.id + '“ braucht title und render(el).');
    if (App.games[g.id]) return warn('Spiel „' + g.id + '“ ist doppelt angemeldet.');
    g.icon = g.icon || 'gamepad';
    g.topic = g.topic || (AREAS[g.area] ? AREAS[g.area].label : '');
    g.img = conf.img === false ? '' : 'img/games/' + g.id + '.png';
    App.games[g.id] = g;
    GAMES.push(g.id);
    App.store.addSave(g.id, g.save);
    accent('g-' + g.id, g.color || (AREAS[g.area] ? AREAS[g.area].color : 'var(--brand)'));
    if (g.badges) App.badges.add(g.badges.map(b => Object.assign({ game: g.id }, b)));
  }

  App.addArea = addArea;
  App.addGame = addGame;
})(window.App);
