/*
 * glossary.js – Wörterbuch mit Fachbegriffen.
 * Format: [Begriff, Bereich ('it' | 'synchro' | 'schnitt'), Erklärung in einfacher Sprache]
 */
(function (App) {
  'use strict';

  App.data.glossary = [
    /* ---------- IT ---------- */
    ['Ticket', 'it', 'Eine digitale Meldung an den IT-Service, z. B. „Mein Drucker geht nicht“. So geht keine Anfrage verloren und man sieht, wer sich gerade kümmert.'],
    ['Server', 'it', 'Ein Computer, der rund um die Uhr läuft und anderen Geräten etwas bereitstellt – zum Beispiel Dateien, E-Mails oder Webseiten.'],
    ['IP-Adresse', 'it', 'Die „Hausnummer“ eines Geräts im Netzwerk, z. B. 192.168.1.20. Damit wissen Daten, wohin sie geschickt werden sollen.'],
    ['Backup', 'it', 'Eine Sicherheitskopie von Daten. Geht etwas kaputt oder wird gelöscht, kann man es aus dem Backup zurückholen.'],
    ['Router', 'it', 'Verbindet das Netzwerk der Firma (oder von zu Hause) mit dem Internet und leitet Daten in die richtige Richtung.'],
    ['Switch', 'it', 'Ein Verteiler mit vielen Netzwerkanschlüssen. Er verbindet PCs, Drucker und Server innerhalb eines Netzwerks.'],
    ['WLAN-Access-Point', 'it', 'Ein Gerät, das ein WLAN-Funknetz aufspannt, damit Laptops und Handys ohne Kabel ins Netzwerk kommen.'],
    ['LAN', 'it', 'Local Area Network – ein lokales Netzwerk, z. B. alle Geräte in einem Bürogebäude.'],
    ['Firewall', 'it', 'Ein Schutzfilter zwischen Netzwerk und Internet. Er lässt erlaubte Verbindungen durch und blockt verdächtige.'],
    ['Phishing', 'it', 'Betrugsversuch mit gefälschten E-Mails oder SMS. Ziel: dein Passwort, deine Bankdaten oder dein Geld.'],
    ['Zwei-Faktor-Authentifizierung', 'it', 'Anmeldung mit zwei Beweisen, z. B. Passwort plus Code aufs Handy. Selbst wer dein Passwort kennt, kommt dann nicht rein.'],
    ['Update', 'it', 'Eine neue Version von Software. Updates schließen oft Sicherheitslücken – deshalb sind sie wichtig.'],
    ['Betriebssystem', 'it', 'Die Grundsoftware eines Geräts, z. B. Windows, macOS, Linux, Android oder iOS. Ohne sie läuft kein Programm.'],
    ['Cloud', 'it', 'Speicher und Programme, die nicht auf deinem Gerät liegen, sondern auf Servern im Internet.'],
    ['Admin-Rechte', 'it', 'Besondere Rechte, mit denen man z. B. Programme installieren oder Einstellungen ändern darf. Haben meist nur IT-Leute.'],
    ['Netzlaufwerk', 'it', 'Ein Ordner, der auf einem Server liegt und für mehrere Leute im Netzwerk erreichbar ist.'],
    ['Malware', 'it', 'Oberbegriff für Schadsoftware wie Viren, Trojaner oder Erpressungs-Software (Ransomware).'],
    ['Remote-Support', 'it', 'Fernwartung: Die IT schaut sich deinen Bildschirm über das Netzwerk an und hilft, ohne vorbeizukommen.'],

    /* ---------- Synchronisation ---------- */
    ['Take', 'synchro', 'Eine einzelne Aufnahme. Ein Satz wird oft in mehreren Takes aufgenommen, bis er perfekt sitzt.'],
    ['Timecode', 'synchro', 'Eine genaue Zeitangabe im Film (Stunde:Minute:Sekunde:Bild). So findet jeder sofort dieselbe Stelle.'],
    ['Atmo', 'synchro', 'Kurz für Atmosphäre: Hintergrundgeräusche wie Straßenlärm, Vogelzwitschern oder Stimmengewirr.'],
    ['Mischung', 'synchro', 'Das Zusammenführen aller Tonspuren (Stimmen, Musik, Geräusche) zu einem fertigen, ausgewogenen Ton.'],
    ['Lippensynchron', 'synchro', 'Der deutsche Text passt so genau zu den Mundbewegungen im Bild, dass es echt wirkt.'],
    ['Dialogbuch', 'synchro', 'Der übersetzte und angepasste Text für die Synchronisation. Darin steht, wer wann was sagt.'],
    ['Synchronregie', 'synchro', 'Die Person, die im Studio die Sprecher anleitet, wie eine Szene gespielt werden soll.'],
    ['Originalton (O-Ton)', 'synchro', 'Der ursprüngliche Ton eines Films in der Originalsprache.'],
    ['IT-Spur', 'synchro', 'Internationale Tonspur: Musik und Geräusche ohne Stimmen. Darauf kommt die deutsche Sprache. (Hat nichts mit Computern zu tun!)'],
    ['Pegel', 'synchro', 'Die Lautstärke eines Signals. Ist der Pegel zu hoch, verzerrt der Ton; ist er zu niedrig, rauscht es.'],
    ['Mikrofon-Popschutz', 'synchro', 'Ein Netz vor dem Mikrofon, das harte Laute wie „P“ und „B“ abfängt.'],
    ['Nachsynchronisation (ADR)', 'synchro', 'Dialoge werden nach dem Dreh im Studio neu aufgenommen, z. B. weil am Set zu viel Lärm war.'],
    ['Loop / Schleife', 'synchro', 'Ein kurzer Filmabschnitt, der immer wieder abgespielt wird, damit der Sprecher genau den Einsatz trifft.'],
    ['Sprecherkabine', 'synchro', 'Schalldichter Raum im Studio, in dem die Sprecher aufgenommen werden.'],
    ['Rauschen', 'synchro', 'Ein störendes Hintergrundgeräusch in einer Aufnahme, z. B. durch schlechte Kabel oder zu leisen Pegel.'],
    ['Foley', 'synchro', 'Geräusche, die im Studio nachgemacht werden – z. B. Schritte, Türknarren oder Kleiderrascheln.'],
    ['Abhöre', 'synchro', 'Die Lautsprecher bzw. Kopfhörer im Studio, mit denen man genau hört, wie die Aufnahme klingt.'],

    /* ---------- Schnitt ---------- */
    ['Timeline', 'schnitt', 'Die Zeitleiste im Schnittprogramm. Dort legt man Bild- und Tonclips hintereinander und baut den Film.'],
    ['Rohschnitt', 'schnitt', 'Die erste grobe Version des Films. Die Geschichte steht, aber Details und Timing fehlen noch.'],
    ['Feinschnitt', 'schnitt', 'Die überarbeitete Version: jeder Schnitt ist genau gesetzt, das Tempo stimmt.'],
    ['B-Roll', 'schnitt', 'Zusätzliche Bilder, die das Hauptgeschehen ergänzen – z. B. Aufnahmen vom Ort, während jemand im Interview spricht.'],
    ['Rendern', 'schnitt', 'Der Computer berechnet aus allen Clips, Effekten und Tönen eine fertige Videodatei. Das kann dauern.'],
    ['Clip', 'schnitt', 'Ein einzelnes Stück Video- oder Tonmaterial in der Timeline.'],
    ['Schnittprogramm', 'schnitt', 'Software für die Videobearbeitung. Profis nutzen spezielle Programme, die mit riesigen Datenmengen umgehen können.'],
    ['Farbkorrektur (Grading)', 'schnitt', 'Farben und Helligkeit anpassen, damit alle Szenen zusammenpassen und eine Stimmung entsteht.'],
    ['Übergang', 'schnitt', 'Die Art, wie ein Bild ins nächste wechselt – z. B. harter Schnitt, Überblendung oder Abblende.'],
    ['Jump Cut', 'schnitt', 'Ein Sprung innerhalb einer Einstellung. Wirkt unruhig – wird manchmal absichtlich als Stilmittel genutzt.'],
    ['Frame', 'schnitt', 'Ein Einzelbild. Ein Film besteht meist aus 24 oder 25 Frames pro Sekunde.'],
    ['Codec', 'schnitt', 'Ein Verfahren, um Video zu komprimieren, damit die Datei kleiner wird – z. B. H.264.'],
    ['Proxy', 'schnitt', 'Eine kleine Arbeitskopie des Materials, damit der Schnittcomputer flüssig läuft. Am Ende wird das Original genutzt.'],
    ['Export', 'schnitt', 'Den fertigen Film als Datei ausgeben, z. B. für TV, Kino oder Internet.'],
    ['Einstellung', 'schnitt', 'Ein ununterbrochen gefilmter Abschnitt aus einer Kameraperspektive.'],
    ['Abnahme', 'schnitt', 'Der Moment, in dem der Kunde oder die Regie den Film anschaut und freigibt.'],
    ['Auflösung', 'schnitt', 'Wie viele Bildpunkte ein Video hat, z. B. Full HD (1920 × 1080) oder 4K.'],
    ['Seitenverhältnis', 'schnitt', 'Das Verhältnis von Breite zu Höhe, z. B. 16:9 für TV oder 9:16 für Handy-Videos.']
  ];
})(window.App);
