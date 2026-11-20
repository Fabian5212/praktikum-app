/*
 * Bereich „Synchronisation“ – alles, was die App über diesen Bereich weiß.
 * Was die Felder bedeuten, steht in tools/vorlagen/bereich.js. Angemeldet wird der Bereich in js/config.js.
 */
App.addArea({
  id: 'synchro',
  label: 'Synchronisation',
  short: 'Synchro',
  icon: 'mic',
  color: '#9B7BFF',
  today: 'Heute geht\'s ins Tonstudio: Hier bekommen Filme ihre deutschen Stimmen.',

  intro: 'In der Synchronisation bekommen Filme und Serien eine deutsche Tonspur. Sprecherinnen und Sprecher stehen im Tonstudio und sprechen die Rollen so, dass es genau zu den Lippenbewegungen im Bild passt.',
  tasks: [
    'Dialogbuch schreiben: den Text übersetzen und lippensynchron anpassen',
    'Aufnahmen im Studio – Satz für Satz, in sogenannten Takes',
    'Regie führen: Sprecher anleiten, wie eine Szene klingen soll',
    'Tontechnik: Mikrofone einstellen, aufnehmen, Fehler hören',
    'Mischung: Stimmen, Musik und Geräusche zu einem fertigen Ton zusammenbauen'
  ],
  jobs: [
    { name: 'Mediengestalter/in Bild und Ton', info: 'Ausbildung, 3 Jahre – Aufnahme, Ton, Bearbeitung' },
    { name: 'Tonmeister/in / Audio-Engineer', info: 'meist Studium – Aufnahme und Mischung auf hohem Niveau' },
    { name: 'Synchronsprecher/in', info: 'meist Schauspiel- oder Sprechausbildung' },
    { name: 'Dialogbuchautor/in & Synchronregie', info: 'oft Quereinstieg mit Sprachen- oder Medien-Hintergrund' }
  ],

  // „Gute Fragen zum Stellen“
  questions: [
    'Wie lange dauert es, einen ganzen Film zu synchronisieren?',
    'Wie wird ausgesucht, wer welche Rolle spricht?',
    'Was macht ihr, wenn ein Satz nicht zu den Lippen passt?',
    'Welche Technik braucht man für ein Tonstudio?',
    'Wie viele Takes braucht ein Sprecher für einen Satz?',
    'Wie seid ihr zu diesem Beruf gekommen?'
  ],

  // Wörterbuch: [Begriff, Erklärung in einfacher Sprache]
  glossary: [
    ['Take', 'Eine einzelne Aufnahme. Ein Satz wird oft in mehreren Takes aufgenommen, bis er perfekt sitzt.'],
    ['Timecode', 'Eine genaue Zeitangabe im Film (Stunde:Minute:Sekunde:Bild). So findet jeder sofort dieselbe Stelle.'],
    ['Atmo', 'Kurz für Atmosphäre: Hintergrundgeräusche wie Straßenlärm, Vogelzwitschern oder Stimmengewirr.'],
    ['Mischung', 'Das Zusammenführen aller Tonspuren (Stimmen, Musik, Geräusche) zu einem fertigen, ausgewogenen Ton.'],
    ['Lippensynchron', 'Der deutsche Text passt so genau zu den Mundbewegungen im Bild, dass es echt wirkt.'],
    ['Dialogbuch', 'Der übersetzte und angepasste Text für die Synchronisation. Darin steht, wer wann was sagt.'],
    ['Synchronregie', 'Die Person, die im Studio die Sprecher anleitet, wie eine Szene gespielt werden soll.'],
    ['Originalton (O-Ton)', 'Der ursprüngliche Ton eines Films in der Originalsprache.'],
    ['IT-Spur', 'Internationale Tonspur: Musik und Geräusche ohne Stimmen. Darauf kommt die deutsche Sprache. (Hat nichts mit Computern zu tun!)'],
    ['Pegel', 'Die Lautstärke eines Signals. Ist der Pegel zu hoch, verzerrt der Ton; ist er zu niedrig, rauscht es.'],
    ['Mikrofon-Popschutz', 'Ein Netz vor dem Mikrofon, das harte Laute wie „P“ und „B“ abfängt.'],
    ['Nachsynchronisation (ADR)', 'Dialoge werden nach dem Dreh im Studio neu aufgenommen, z. B. weil am Set zu viel Lärm war.'],
    ['Loop / Schleife', 'Ein kurzer Filmabschnitt, der immer wieder abgespielt wird, damit der Sprecher genau den Einsatz trifft.'],
    ['Sprecherkabine', 'Schalldichter Raum im Studio, in dem die Sprecher aufgenommen werden.'],
    ['Rauschen', 'Ein störendes Hintergrundgeräusch in einer Aufnahme, z. B. durch schlechte Kabel oder zu leisen Pegel.'],
    ['Foley', 'Geräusche, die im Studio nachgemacht werden – z. B. Schritte, Türknarren oder Kleiderrascheln.'],
    ['Abhöre', 'Die Lautsprecher bzw. Kopfhörer im Studio, mit denen man genau hört, wie die Aufnahme klingt.']
  ]
});
