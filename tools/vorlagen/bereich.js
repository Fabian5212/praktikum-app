/*
 * Bereich „__NAME__“ – alles, was die App über diesen Bereich weiß.
 * Angemeldet wird der Bereich in js/config.js (areas). Danach: npm run check
 *
 * Pflicht:  id, label, color
 * Optional: alles andere. Ohne intro erscheint der Bereich nicht unter „Wissen“,
 *           ohne glossary hat er keine Begriffe im Wörterbuch.
 */
App.addArea({
  id: '__ID__',                   // wie der Dateiname, nur a–z, 0–9 und -
  label: '__NAME__',              // voller Name, z. B. in der Wochenplanung
  short: '__NAME__',              // kurzer Name für enge Stellen (max. ~10 Zeichen)
  icon: 'dots',                   // Symbol aus js/ui.js, z. B. monitor, mic, film, camera, music, globe
  color: '#2DD4AE',               // Akzentfarbe (hell genug für den dunklen Hintergrund)
  today: 'Heute bist du bei __NAME__: …',   // Satz auf der Startseite, wenn man an dem Tag hier ist

  // Seite „Wissen“
  intro: 'Was passiert in diesem Bereich? Zwei, drei Sätze in einfacher Sprache für Schülerinnen und Schüler.',
  tasks: [
    'Typische Aufgabe 1',
    'Typische Aufgabe 2',
    'Typische Aufgabe 3'
  ],
  jobs: [
    { name: 'Passender Beruf', info: 'Ausbildung, 3 Jahre – worum es geht' }
  ],

  // „Gute Fragen zum Stellen“ – die Praktikanten können sie auf ihre Fragenliste setzen
  questions: [
    'Eine Frage, die man hier vor Ort stellen kann?'
  ],

  // Wörterbuch: [Begriff, Erklärung in einfacher Sprache]
  glossary: [
    ['Fachbegriff', 'Erklärung so, dass sie jemand aus der 9. Klasse versteht.']
  ]
});
