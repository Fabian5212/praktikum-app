/*
 * badges.js – Abzeichen für Meilensteine.
 * Allgemeine Abzeichen stehen hier in LIST, Abzeichen zu einem Spiel in dessen Datei (App.addGame({ badges })).
 * test(state) entscheidet, ob ein Abzeichen freigeschaltet ist.
 */
(function (App) {
  'use strict';

  const LIST = [
    { id: 'start',      name: 'Eingecheckt',      icon: 'sparkle', desc: 'Du hast die App eingerichtet.',
      test: s => !!s.name },
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

  /** Abzeichen eines Spiels ergänzen – sie erscheinen vor „Allrounder“ (aufgerufen von App.addGame) */
  function add(list) {
    const at = LIST.findIndex(b => b.id === 'allrounder');
    LIST.splice(at < 0 ? LIST.length : at, 0, ...list.filter(b => !LIST.some(x => x.id === b.id)));
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

  App.badges = { LIST, add, check, filledDays };
})(window.App);
