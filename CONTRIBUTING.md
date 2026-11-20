# Mitmachen bei Einblick

Diese Anleitung ist für alle, die Inhalte ergänzen oder eigene Bereiche und Minispiele bauen wollen – zum Beispiel für ihren Fachbereich.

Die App ist bewusst einfach gehalten: **reines HTML, CSS und JavaScript**, kein Framework, kein Build-Schritt, keine Pakete. Wer JavaScript-Grundlagen kann, kommt sofort zurecht.

## Loslegen

Voraussetzungen: [Node.js](https://nodejs.org) (LTS) und Git. Ein Editor wie VS Code.

```bash
git clone https://github.com/<user>/praktikum-app.git
cd praktikum-app
npm start            # App unter http://localhost:3000
```

Im Browser am besten die Handy-Ansicht der Entwicklertools nutzen (F12 → Gerätesymbol, z. B. 375 px Breite). Warnungen der App erscheinen in der Konsole mit `[Einblick]` davor.

> **Tipp:** Der Service Worker speichert die App für offline. Damit du beim Entwickeln immer den neuesten Stand siehst: F12 → *Application* → *Service Workers* → **Update on reload** anhaken.

## Wie die App aufgebaut ist

Alles Wichtige steht in **`js/config.js`**: welche Bereiche und Spiele es gibt und in welcher Reihenfolge. `index.html` und der Service Worker lesen diese Liste. Neue Dateien musst du also **nur dort** eintragen.

```
js/config.js        ← Bereiche + Spiele an- und abmelden, Version
bereiche/<id>.js    ← ein Bereich: Name, Farbe, Wissen, gute Fragen, Wörterbuch
games/<id>.js       ← ein Minispiel oder Quiz
games/<id>-data.js  ← (optional) Inhalte eines Spiels, z. B. die Tickets
img/games/<id>.png  ← (optional) Bild eines Spiels, 512 × 512
tools/vorlagen/     ← Vorlagen für neue Bereiche, Quiz und Spiele
```

Der Rest (`js/store.js`, `js/views/…`, `css/style.css`) ist das Gerüst der App. Das musst du für neue Inhalte nicht anfassen.

## Häufige Aufgaben

### Neuen Bereich anlegen (z. B. für deine Abteilung)

```bash
npm run neu -- bereich kamera "Kamera"
```

Das legt `bereiche/kamera.js` aus der Vorlage an und trägt den Bereich in `js/config.js` ein. Danach die Datei mit Inhalt füllen: Einleitung, typische Aufgaben, passende Berufe, gute Fragen und Wörterbuch-Begriffe. Was jedes Feld bedeutet, steht als Kommentar in der Datei.

Der Bereich erscheint danach automatisch in Wochenplanung, Tagebuch, Wissen, Wörterbuch, Fazit und Mindmap.

### Quiz anlegen (ohne Programmieren)

```bash
npm run neu -- quiz kamera-quiz kamera "Kamera-Check"
```

Ein Quiz besteht nur aus Fragen, die Spiel-Logik liefert `js/quiz.js`. Ein fertiges Beispiel ist `games/schnitt-quiz.js`. Jede Frage hat dieses Format:

```js
{ q: 'Frage?', ok: 'Richtige Antwort', wrong: ['Falsch 1', 'Falsch 2', 'Falsch 3'], why: 'Erklärung' }
```

### Eigenes Minispiel programmieren

```bash
npm run neu -- spiel bildmischer kamera "Bildmischer"
```

Die Vorlage enthält ein kleines, lauffähiges Spiel („Stimmt das?“) mit Erklärung, Punkten, Speichern und Ergebnis-Karte. Das ersetzt du durch deine Idee. Die Kommentare oben in der Datei erklären, wie ein Spiel mit der App verbunden ist. Als Vorbilder eignen sich:

- `games/tickets.js`: Fragen mit Timer und Combo
- `games/tonregie.js`: eigene Bedienelemente (Mischpult)
- `games/kabel.js`: Ziehen und Verbinden
- `games/pc.js`: Drag & Drop

Für ein eigenes Bild: `img/games/<id>.png` (512 × 512) ablegen und in `js/config.js` beim Spiel `img: false` entfernen. Für eigenes CSS: `games/<id>.css` anlegen und `css: true` setzen.

### Inhalte bestehender Spiele ergänzen

- Tickets: `games/tickets-data.js`
- Phishing-Nachrichten: `games/phishing-data.js`. Warnsignale werden als `[[Text|Erklärung]]` markiert, gute Zeichen als `[[OK:Text|Erklärung]]`.
- Sendeablauf Live-Mix: `games/tonregie.js` (Liste `SHOW`)
- Level von Kabel-Salat: `games/kabel.js` (Liste `LEVELS`)

### Bereich oder Spiel entfernen

Die Zeile in `js/config.js` löschen. Fertig. Die Datei kann liegen bleiben (`npm run check` weist darauf hin) oder gelöscht werden. Gespeicherte Spielstände der Praktikanten gehen dabei nicht kaputt.

### Allgemeines Abzeichen ergänzen

In `js/badges.js` einen Eintrag in `LIST` ergänzen. Abzeichen, die zu einem Spiel gehören, stehen in der Spieldatei unter `badges`.

### Eigenes Icon

Icons sind kleine SVG-Pfade (24 × 24, nur Linien) in `js/ui.js`. Eigene kannst du in deiner Datei ergänzen:

```js
App.ui.addIcons({ kamera: '<path d="M3 8h13v9H3z"/><path d="m16 11 5-3v9l-5-3"/>' });
```

## Vor dem Hochladen

```bash
npm run bump         # Version erhöhen (bei neuem Spiel/Bereich: npm run bump -- minor)
npm run check        # prüft Dateien, JavaScript, Fragen, Farben, Version
```

**Warum die Version?** Die App ist installiert und läuft offline. Neue Dateien holt sie sich nur, wenn sich die Version in `js/config.js` ändert. `npm run check` meldet einen Fehler, wenn du das vergessen hast.

Dann in Git:

```bash
git checkout -b kamera-bereich
git add .
git commit -m "Bereich Kamera mit Quiz"
git push -u origin kamera-bereich
```

Danach auf GitHub einen **Pull Request** öffnen. Sobald er in `main` gemergt ist, ist die Änderung nach 1–2 Minuten live.

## Regeln

- **Datenschutz:** Alles bleibt im Browser (localStorage). Kein Backend, kein Tracking, keine Analyse-Tools, keine externen Skripte. Einzige Ausnahme sind Google Fonts.
- **Keine echten Firmennamen oder Logos** in Phishing-Beispielen. Erfundene Namen benutzen.
- **Das Repository ist öffentlich.** Keine internen Informationen, Namen von Kolleginnen und Kollegen, Zugangsdaten, Raumpläne oder Fotos aus nicht öffentlichen Bereichen.
- **Zielgruppe** sind Schülerinnen und Schüler (ca. 14–16 Jahre). Deshalb einfache Sprache, Fachbegriffe erklären und lieber kurze Sätze.
- **Handy zuerst:** Alles muss bei 375 px Breite funktionieren, ohne seitliches Scrollen.
- **Nutzereingaben** immer mit `App.ui.esc()` ausgeben (Schutz vor HTML-Einschleusung).
- Pfade immer **relativ** (`img/…`, nicht `/img/…`), sonst funktioniert GitHub Pages nicht.
