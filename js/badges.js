/*
 * badges.js – Abzeichen für Meilensteine.
 * Neues Abzeichen: Eintrag in LIST ergänzen. test(state) entscheidet, ob es freigeschaltet ist.
 */
(function (App) {
  'use strict';

  const LIST = [
    { id: 'start',      name: 'Eingecheckt',      icon: 'sparkle', desc: 'Du hast die App eingerichtet.',
      test: s => !!s.name },
    { id: 'netzwerk',   name: 'Netzwerk-Profi',   icon: 'network', desc: 'Alle 5 Level in Kabel-Salat geschafft.',
      test: s => s.games.kabel.levels.every(x => x > 0) },
    { id: 'ticket',     name: 'Support-Held',     icon: 'ticket',  desc: 'Mindestens 10 von 12 Tickets richtig gelöst.',
      test: s => s.games.tickets.bestPct >= 83 },
    { id: 'combo',      name: 'Combo-König',      icon: 'flame',   desc: '6 Tickets hintereinander richtig.',
      test: s => s.games.tickets.bestCombo >= 6 },
    { id: 'phishing',   name: 'Phishing-Jäger',   icon: 'shield',  desc: 'Mindestens 9 von 10 Nachrichten richtig erkannt.',
      test: s => s.games.phishing.bestPct >= 90 },
    { id: 'schrauber',  name: 'Schrauber',        icon: 'cpu',     desc: 'Deinen ersten PC zusammengebaut.',
      test: s => s.games.pc.plays > 0 },
    { id: 'perfekt',    name: 'Ohne Fehler',      icon: 'star',    desc: 'Einen PC ganz ohne Fehler gebaut.',
      test: s => s.games.pc.perfect },
    { id: 'tonmeister', name: 'Tonmeister',       icon: 'sliders', desc: 'Mindestens 10 von 12 Live-Momenten richtig gemischt.',
      test: s => s.games.tonregie.bestPct >= 83 },
    { id: 'allrounder', name: 'Allrounder',       icon: 'gamepad', desc: 'Alle Spiele mindestens einmal gespielt.',
      test: s => App.store.GAMES.every(k => s.games[k].plays > 0) },
    { id: 'schreiber',  name: 'Schreiberling',    icon: 'edit',    desc: 'Drei Tage im Tagebuch festgehalten.',
      test: s => filledDays(s) >= 3 },
    { id: 'chronist',   name: 'Wochen-Chronist',  icon: 'book',    desc: 'Alle fünf Tage dokumentiert.',
      test: s => filledDays(s) >= 5 },
    { id: 'neugierig',  name: 'Neugierig',        icon: 'help',    desc: '5 Fragen auf deine Liste geschrieben.',
      test: s => s.questions.length >= 5 },
    { id: 'fazit',      name: 'Auf den Punkt',    icon: 'flag',    desc: 'Dein persönliches Fazit geschrieben.',
      test: s => s.conclusions.join('').trim().length >= 40 }
  ];

  /** Ein Tag zählt als dokumentiert, wenn mindestens „Was habe ich gemacht?“ ausgefüllt ist */
  function filledDays(s) {
    return Object.values(s.diary).filter(d => d && d.did && d.did.trim()).length;
  }

  /** Prüft alle Abzeichen und zeigt für neue einen Toast. Nach jeder Änderung aufrufen. */
  function check() {
    const s = App.store.get();
    const fresh = LIST.filter(b => !s.badges[b.id] && b.test(s));
    if (!fresh.length) return;
    App.store.update(st => { fresh.forEach(b => { st.badges[b.id] = App.store.toISO(new Date()); }); });
    fresh.forEach((b, i) => setTimeout(() => App.ui.toast('Abzeichen freigeschaltet: ' + b.name, 'trophy'), 400 + i * 700));
    App.ui.confetti();
  }

  App.badges = { LIST, check, filledDays };
})(window.App);
