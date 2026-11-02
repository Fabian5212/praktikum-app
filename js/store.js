/*
 * store.js – Datenhaltung
 * Alle Daten liegen nur lokal im Browser (localStorage). Es gibt keinen Server.
 * Zugriff überall über App.store.get() / App.store.update(fn).
 */
window.App = window.App || { views: {}, games: {}, data: {} };

(function (App) {
  'use strict';

  const KEY = 'einblick-v1';
  // Grobe Obergrenze von localStorage in den meisten Browsern (ca. 5 MB, als UTF-16 gezählt)
  const LIMIT_BYTES = 5 * 1024 * 1024;

  /** Bereiche der Praktikumswoche – Farbe kommt aus dem CSS (--it, --synchro …) */
  const AREAS = {
    it:      { label: 'IT-Service',      short: 'IT',      icon: 'monitor' },
    synchro: { label: 'Synchronisation', short: 'Synchro', icon: 'mic' },
    schnitt: { label: 'Schnitt',         short: 'Schnitt', icon: 'film' },
    anderes: { label: 'Anderes',         short: 'Anderes', icon: 'dots' }
  };

  /** Leerer Anfangszustand. Neue Felder hier ergänzen – merge() füllt sie bei alten Daten auf. */
  function defaults() {
    return {
      version: 1,
      name: '',
      startDate: '',                 // Montag der Praktikumswoche (JJJJ-MM-TT)
      plan: ['', '', '', '', ''],    // Bereich pro Tag Mo–Fr
      games: {
        kabel:    { plays: 0, best: 0, bestPct: 0, levels: [0, 0, 0, 0, 0] },
        tickets:  { plays: 0, best: 0, bestPct: 0, bestCombo: 0 },
        phishing: { plays: 0, best: 0, bestPct: 0 },
        pc:       { plays: 0, best: 0, bestPct: 0, perfect: false }
      },
      badges: {},                    // id -> Datum der Freischaltung
      diary: {},                     // "0".."4" -> Eintrag (siehe tagebuch.js)
      notes: '',
      questions: [],                 // { id, text, done }
      conclusion: ''
    };
  }

  /** Füllt fehlende Felder aus den Defaults auf (wichtig nach Updates oder beim Import). */
  function merge(base, data) {
    if (Array.isArray(base)) return Array.isArray(data) ? data : base;
    if (base && typeof base === 'object') {
      const out = {};
      const src = data && typeof data === 'object' && !Array.isArray(data) ? data : {};
      Object.keys(base).forEach(k => { out[k] = merge(base[k], src[k]); });
      // Freie Objekte (diary, badges) dürfen zusätzliche Schlüssel haben
      Object.keys(src).forEach(k => { if (!(k in out)) out[k] = src[k]; });
      return out;
    }
    return data === undefined || data === null || typeof data !== typeof base ? base : data;
  }

  let state = load();

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      return merge(defaults(), raw ? JSON.parse(raw) : {});
    } catch (e) {
      return defaults();
    }
  }

  /** Speichert. Gibt false zurück, wenn der Speicher voll ist. */
  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
      return true;
    } catch (e) {
      return false;
    }
  }

  const listeners = new Set();

  App.store = {
    AREAS,
    LIMIT_BYTES,

    get: () => state,

    /**
     * Ändert den Zustand über eine Funktion und speichert.
     * Klappt das Speichern nicht (Speicher voll), wird die Änderung zurückgenommen.
     */
    update(fn) {
      const backup = JSON.stringify(state);
      fn(state);
      if (!save()) {
        state = JSON.parse(backup);
        App.ui && App.ui.toast('Speicher voll – das konnte nicht gespeichert werden. Lösche z. B. ein Foto.', 'alert');
        return false;
      }
      listeners.forEach(l => l(state));
      return true;
    },

    onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); },

    /** Ungefährer Speicherverbrauch in Bytes (Zeichen × 2, wie Browser zählen) */
    usage() {
      try { return (localStorage.getItem(KEY) || '').length * 2; } catch (e) { return 0; }
    },

    /** Ersetzt alle Daten (Import). Prüft grob die Struktur. */
    replaceAll(data) {
      if (!data || typeof data !== 'object' || !('games' in data || 'diary' in data || 'name' in data)) {
        throw new Error('Das sieht nicht nach einer Einblick-Datei aus.');
      }
      const backup = state;
      state = merge(defaults(), data);
      if (!save()) { state = backup; throw new Error('Die Datei ist zu groß für den Speicher.'); }
      listeners.forEach(l => l(state));
    },

    reset() {
      state = defaults();
      try { localStorage.removeItem(KEY); } catch (e) { /* egal */ }
      listeners.forEach(l => l(state));
    },

    /* ---------- Hilfen rund um die Praktikumswoche ---------- */

    /** Datum (JJJJ-MM-TT) für Tag 0–4 der Woche, falls ein Startdatum gesetzt ist */
    dayDate(i) {
      if (!state.startDate) return '';
      const d = new Date(state.startDate + 'T12:00:00');
      d.setDate(d.getDate() + i);
      return toISO(d);
    },

    /**
     * Welcher Praktikumstag ist heute?
     * Liefert { phase: 'none'|'before'|'during'|'after'|'weekend', index, daysUntil }
     */
    today() {
      if (!state.startDate) return { phase: 'none' };
      const start = new Date(state.startDate + 'T00:00:00');
      const now = new Date(); now.setHours(0, 0, 0, 0);
      const diff = Math.round((now - start) / 86400000);
      if (diff < 0) return { phase: 'before', daysUntil: -diff };
      if (diff <= 4) return { phase: 'during', index: diff };
      if (diff <= 6) return { phase: 'weekend' };
      return { phase: 'after' };
    }
  };

  function toISO(d) {
    const p = n => String(n).padStart(2, '0');
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
  }
  App.store.toISO = toISO;
})(window.App);
