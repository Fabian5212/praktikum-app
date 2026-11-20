/*
 * __ID__.js – Quiz „__NAME__“
 * Ein Quiz braucht keine eigene Spiel-Logik, nur Fragen – den Rest macht js/quiz.js.
 * Angemeldet wird es in js/config.js (games). Danach: npm run check
 *
 * Format einer Frage: { q: Frage, ok: richtige Antwort, wrong: [falsche Antworten], why: Erklärung }
 * Die Antworten werden im Spiel gemischt. Gute falsche Antworten sind glaubwürdig, aber eindeutig falsch.
 */
App.addQuiz({
  id: '__ID__',
  title: '__NAME__',
  area: '__AREA__',               // Bereich aus js/config.js – bestimmt die Farbe
  icon: 'help',                   // Symbol aus js/ui.js
  topic: '__NAME__',              // kleines Schild über dem Titel in der Spieleliste
  teaser: 'Ein Satz für die Spieleliste.',
  lead: 'Einleitung vor dem Start: Worum geht es?',
  learn: 'Was man in diesem Quiz lernt.',
  // round: 8,                    // optional: so viele zufällige Fragen pro Runde (sonst alle)
  badge: { name: '__NAME__-Profi', desc: 'Alle Fragen in „__NAME__“ richtig beantwortet.', pct: 100 },   // optional

  questions: [
    { q: 'Erste Frage?',
      ok: 'Richtige Antwort',
      wrong: ['Falsche Antwort 1', 'Falsche Antwort 2', 'Falsche Antwort 3'],
      why: 'Warum ist das so? Die Erklärung sehen die Praktikanten nach jeder Antwort.' },
    { q: 'Zweite Frage?',
      ok: 'Richtige Antwort',
      wrong: ['Falsche Antwort 1', 'Falsche Antwort 2', 'Falsche Antwort 3'],
      why: 'Erklärung.' },
    { q: 'Dritte Frage?',
      ok: 'Richtige Antwort',
      wrong: ['Falsche Antwort 1', 'Falsche Antwort 2', 'Falsche Antwort 3'],
      why: 'Erklärung.' }
  ]
});
