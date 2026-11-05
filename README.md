# Einblick – deine Praktikumswoche

Eine mobile Web-App (PWA) für Schülerpraktikantinnen und -praktikanten, die eine Woche in **IT-Service**, **Synchronisation** und **Schnitt** verbringen – plus einen Besuch in der **Tonregie**.

- **Start:** Begrüßung, heutiger Praktikumstag, Wochenplan, Fortschritt und Abzeichen
- **Spiele:** fünf Minispiele mit Erklärung vorher und Lerneffekt nachher
  - *Kabel-Salat* (Netzwerk): Geräte durch Ziehen oder Antippen verbinden, 5 Level
  - *Ticket-Rush* (IT-Support): 30 Störungstickets, Zeitdruck, Combo-System
  - *Phishing oder echt?* (IT-Sicherheit): 22 erfundene E-Mails und SMS mit markierten Warnsignalen
  - *PC zusammenbauen* (Hardware): Bauteile ins Gehäuse ziehen
  - *Live-Mix* (Tonregie): am Mischpult eine Live-Sendung mischen, 12 Momente
- **Tagebuch:** ein Eintrag pro Tag (Mo–Fr) mit Sterne-Bewertung, beliebig vielen Fotos und eigenen Notizen, dazu eine Fragenliste
- **Mindmap:** fasst die ganze Woche als selbst gezeichnete Mindmap zusammen (`#/mindmap`) und speichert sie als **Bild (PNG)**, das jeder PC öffnet und das sich drucken lässt. Optional gibt es eine **XMind-Datei**, und ein **Link für den PC** trägt die Daten komprimiert hinter dem `#`, wird also nie an einen Server geschickt. PNG und XMind enthalten auch die Fotos, der Link nicht.
- **Wissen:** die vier Bereiche erklärt, Wörterbuch mit über 70 Begriffen, gute Fragen zum Stellen
- **Fazit:** Auswertung als Balkengrafik, persönliches Fazit pro Tag, Export als Text und JSON, Import, alles löschen

Das Design ist ein dunkles Glas-Design mit leuchtenden Akzentfarben pro Spiel bzw. Bereich (Farben zentral in `css/style.css` unter `:root`).

Alle Daten bleiben **nur im Browser** (localStorage). Es gibt kein Backend und kein Tracking. Die einzige externe Quelle ist Google Fonts. Ohne Internet nimmt die App die Systemschrift.

## Technik

Reines HTML, CSS und Vanilla JavaScript, ohne Framework und ohne Build-Schritt.

```
index.html          App-Gerüst mit Bottom-Navigation
manifest.json       PWA-Manifest
sw.js               Service Worker (Offline-Cache)
css/style.css       komplettes Design inkl. Dark Mode
js/store.js         Datenspeicher (localStorage)
js/ui.js            Icons, Toasts, Bottom-Sheets, Drag & Drop
js/badges.js        Abzeichen
js/app.js           Router (#/seite) und Start
js/views/*.js       die fünf Seiten und die Mindmap
js/mindmap.js       Mindmap-Baum, Zeichnen als Bild (Canvas), XMind-Export (kleiner ZIP-Packer), Link-Format
js/data/*.js        Wissenstexte und Wörterbuch
games/*.js          Minispiele und ihre Inhalte (*-data.js)
img/games/          Illustrationen der Spiele (tonregie.png aus tools/make-tonregie-art.js)
icons/              Logo (logo.svg) und App-Icons (SVG + PNG)
tools/make-icons.js erzeugt Logo und Icons neu: node tools/make-icons.js
```

### Inhalte ändern

- Tickets: `games/tickets-data.js`
- Phishing-Nachrichten: `games/phishing-data.js` (Warnsignale als `[[Text|Erklärung]]`, gute Zeichen als `[[OK:Text|Erklärung]]`)
- Wörterbuch: `js/data/glossary.js`
- Bereiche, Berufe und gute Fragen: `js/data/knowledge.js`
- Abzeichen: `js/badges.js`
- Sendeablauf für Live-Mix: `games/tonregie.js` (Liste `SHOW`)
- Neues Spiel: in `App.store.GAMES` (`js/store.js`) eintragen, Skript in `index.html` und `sw.js` ergänzen

> **Wichtig:** Nach jeder Änderung in `sw.js` die Konstante `VERSION` erhöhen (z. B. `einblick-v1.0.1`). Sonst zeigen bereits installierte Apps weiter die alten Dateien. Neue Dateien müssen außerdem in die Liste `FILES` in `sw.js`.

## Lokal starten

Der Service Worker funktioniert nur über `http://localhost` oder `https://`, nicht per Doppelklick auf `index.html`.

```bash
npx serve .
```

Danach im Browser `http://localhost:3000` öffnen. Alternativ unter Windows einfach `start.bat` doppelklicken.

Zum Testen am Handy im selben WLAN: `npx serve .` zeigt auch eine Netzwerk-Adresse an (z. B. `http://192.168.1.20:3000`). Die Installation als App klappt aber erst über HTTPS, also über GitHub Pages.

## Veröffentlichen über GitHub Pages

1. **Repository anlegen:** Auf [github.com](https://github.com) oben rechts auf **+ → New repository** klicken. Als Namen z. B. `praktikum-app` eintragen, **Public** wählen und *keine* README hinzufügen (die gibt es schon). Dann **Create repository** klicken.
2. **Code hochladen:** Im Projektordner ein Terminal öffnen und ausführen (`<user>` durch deinen GitHub-Namen ersetzen):
   ```bash
   git remote add origin https://github.com/<user>/praktikum-app.git
   git branch -M main
   git push -u origin main
   ```
3. **Pages einschalten:** Im Repository auf **Settings → Pages** gehen. Unter *Build and deployment* bei **Source** „Deploy from a branch“ wählen, dann Branch **main** und Ordner **/ (root)** auswählen und **Save** klicken.
4. **Warten:** Nach 1–2 Minuten ist die App unter `https://<user>.github.io/praktikum-app/` erreichbar. Den Fortschritt siehst du im Tab **Actions**.
5. **Aufs Handy holen:** Den Link am Handy öffnen.
   - **Android (Chrome):** Menü ⋮ → **App installieren** bzw. **Zum Startbildschirm hinzufügen**
   - **iPhone (Safari):** Teilen-Symbol → **Zum Home-Bildschirm**

   Danach läuft die App auch ohne Internet.
6. **Updates:** Dateien ändern, in `sw.js` die `VERSION` erhöhen, dann `git commit` und `git push`. Die installierte App lädt das Update im Hintergrund und zeigt es beim nächsten Öffnen.

Alle Pfade sind relativ. Deshalb funktioniert die App auch im Unterordner `/<repo>/` ohne Anpassung.

## Daten mitnehmen

Unter **Fazit → Als Datei herunterladen** entsteht eine JSON-Datei mit allen Einträgen und Fotos. Auf dem neuen Gerät spielst du sie unter **Fazit → Datei importieren** wieder ein.
