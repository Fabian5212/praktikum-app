/*
 * Bereich „Schnitt“ – alles, was die App über diesen Bereich weiß.
 * Was die Felder bedeuten, steht in tools/vorlagen/bereich.js. Angemeldet wird der Bereich in js/config.js.
 */
App.addArea({
  id: 'schnitt',
  label: 'Schnitt',
  short: 'Schnitt',
  icon: 'film',
  color: '#F5A524',
  today: 'Heute im Schnitt: Aus vielen Aufnahmen wird ein fertiger Film.',

  intro: 'Im Schnitt (auch Montage oder Editing) entsteht aus vielen Einzelaufnahmen ein fertiger Film. Cutterinnen und Cutter wählen die besten Szenen aus, setzen sie in die richtige Reihenfolge und geben dem Film seinen Rhythmus.',
  tasks: [
    'Material sichten und sortieren: Welche Aufnahmen gibt es?',
    'Rohschnitt bauen: die Geschichte grob zusammensetzen',
    'Feinschnitt: Timing, Übergänge und Tempo verfeinern',
    'Farbkorrektur und Ton anlegen',
    'Rendern und exportieren für Kino, TV oder Streaming'
  ],
  jobs: [
    { name: 'Mediengestalter/in Bild und Ton', info: 'Ausbildung, 3 Jahre – häufiger Einstieg in den Schnitt' },
    { name: 'Film- und Videoeditor/in', info: 'Ausbildung an Fachschulen oder über den Beruf' },
    { name: 'Studium Film / Montage', info: 'an Film- und Medienhochschulen' },
    { name: 'Schnitt-Assistenz', info: 'häufiger Einstieg nach der Ausbildung' }
  ],

  // „Gute Fragen zum Stellen“
  questions: [
    'Wie viel Material wird gedreht – und wie viel landet am Ende im Film?',
    'Mit welchem Schnittprogramm arbeitet ihr und warum?',
    'Woran merkst du, dass ein Schnitt „sitzt“?',
    'Wie arbeitet ihr mit der Regie zusammen?',
    'Was passiert beim Rendern und warum dauert es so lange?',
    'Welche Projekte haben dir am meisten Spaß gemacht?'
  ],

  // Wörterbuch: [Begriff, Erklärung in einfacher Sprache]
  glossary: [
    ['Timeline', 'Die Zeitleiste im Schnittprogramm. Dort legt man Bild- und Tonclips hintereinander und baut den Film.'],
    ['Rohschnitt', 'Die erste grobe Version des Films. Die Geschichte steht, aber Details und Timing fehlen noch.'],
    ['Feinschnitt', 'Die überarbeitete Version: jeder Schnitt ist genau gesetzt, das Tempo stimmt.'],
    ['B-Roll', 'Zusätzliche Bilder, die das Hauptgeschehen ergänzen – z. B. Aufnahmen vom Ort, während jemand im Interview spricht.'],
    ['Rendern', 'Der Computer berechnet aus allen Clips, Effekten und Tönen eine fertige Videodatei. Das kann dauern.'],
    ['Clip', 'Ein einzelnes Stück Video- oder Tonmaterial in der Timeline.'],
    ['Schnittprogramm', 'Software für die Videobearbeitung. Profis nutzen spezielle Programme, die mit riesigen Datenmengen umgehen können.'],
    ['Farbkorrektur (Grading)', 'Farben und Helligkeit anpassen, damit alle Szenen zusammenpassen und eine Stimmung entsteht.'],
    ['Übergang', 'Die Art, wie ein Bild ins nächste wechselt – z. B. harter Schnitt, Überblendung oder Abblende.'],
    ['Jump Cut', 'Ein Sprung innerhalb einer Einstellung. Wirkt unruhig – wird manchmal absichtlich als Stilmittel genutzt.'],
    ['Frame', 'Ein Einzelbild. Ein Film besteht meist aus 24 oder 25 Frames pro Sekunde.'],
    ['Codec', 'Ein Verfahren, um Video zu komprimieren, damit die Datei kleiner wird – z. B. H.264.'],
    ['Proxy', 'Eine kleine Arbeitskopie des Materials, damit der Schnittcomputer flüssig läuft. Am Ende wird das Original genutzt.'],
    ['Export', 'Den fertigen Film als Datei ausgeben, z. B. für TV, Kino oder Internet.'],
    ['Einstellung', 'Ein ununterbrochen gefilmter Abschnitt aus einer Kameraperspektive.'],
    ['Abnahme', 'Der Moment, in dem der Kunde oder die Regie den Film anschaut und freigibt.'],
    ['Auflösung', 'Wie viele Bildpunkte ein Video hat, z. B. Full HD (1920 × 1080) oder 4K.'],
    ['Seitenverhältnis', 'Das Verhältnis von Breite zu Höhe, z. B. 16:9 für TV oder 9:16 für Handy-Videos.']
  ]
});
