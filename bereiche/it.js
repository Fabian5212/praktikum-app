/*
 * Bereich „IT-Service“ – alles, was die App über diesen Bereich weiß.
 * Was die Felder bedeuten, steht in tools/vorlagen/bereich.js. Angemeldet wird der Bereich in js/config.js.
 */
App.addArea({
  id: 'it',
  label: 'IT-Service',
  short: 'IT',
  icon: 'monitor',
  color: '#4F8BFF',
  today: 'Heute schaust du dem IT-Service über die Schulter: Tickets, PCs, Netzwerk.',

  intro: 'Die IT sorgt dafür, dass alle Computer, Netzwerke, Drucker und Programme laufen. Wenn etwas kaputt ist oder jemand Hilfe braucht, meldet er sich beim IT-Service – meistens über ein Ticket.',
  tasks: [
    'Störungen lösen: „Mein Drucker geht nicht“, „Ich komme nicht ins WLAN“',
    'Neue PCs und Laptops einrichten und an Mitarbeitende übergeben',
    'Benutzerkonten und Passwörter verwalten',
    'Server, Netzwerk und Backups überwachen',
    'Für IT-Sicherheit sorgen: Updates, Virenschutz, Phishing-Warnungen'
  ],
  jobs: [
    { name: 'Fachinformatiker/in Systemintegration', info: 'Ausbildung, 3 Jahre – Netzwerke, Server, Support' },
    { name: 'Fachinformatiker/in Anwendungsentwicklung', info: 'Ausbildung, 3 Jahre – programmieren' },
    { name: 'Fachinformatiker/in Digitale Vernetzung', info: 'Ausbildung, 3 Jahre – vernetzte Geräte und Systeme' },
    { name: 'IT-System-Elektroniker/in', info: 'Ausbildung, 3 Jahre – Hardware, Verkabelung, Technik vor Ort' },
    { name: 'Kaufmann/-frau für IT-System-Management', info: 'Ausbildung, 3 Jahre – IT plus Beratung und Verkauf' }
  ],

  // „Gute Fragen zum Stellen“
  questions: [
    'Wie viele Tickets kommen hier an einem normalen Tag rein?',
    'Was war die verrückteste Störung, die ihr je hattet?',
    'Wie sichert ihr die Daten, falls ein Server ausfällt?',
    'Welche Aufgabe macht dir in deinem Job am meisten Spaß?',
    'Was sollte ich in der Schule lernen, wenn ich in die IT will?',
    'Wie erkennt ihr, ob eine E-Mail gefährlich ist?'
  ],

  // Wörterbuch: [Begriff, Erklärung in einfacher Sprache]
  glossary: [
    ['Ticket', 'Eine digitale Meldung an den IT-Service, z. B. „Mein Drucker geht nicht“. So geht keine Anfrage verloren und man sieht, wer sich gerade kümmert.'],
    ['Server', 'Ein Computer, der rund um die Uhr läuft und anderen Geräten etwas bereitstellt – zum Beispiel Dateien, E-Mails oder Webseiten.'],
    ['IP-Adresse', 'Die „Hausnummer“ eines Geräts im Netzwerk, z. B. 192.168.1.20. Damit wissen Daten, wohin sie geschickt werden sollen.'],
    ['Backup', 'Eine Sicherheitskopie von Daten. Geht etwas kaputt oder wird gelöscht, kann man es aus dem Backup zurückholen.'],
    ['Router', 'Verbindet das Netzwerk der Firma (oder von zu Hause) mit dem Internet und leitet Daten in die richtige Richtung.'],
    ['Switch', 'Ein Verteiler mit vielen Netzwerkanschlüssen. Er verbindet PCs, Drucker und Server innerhalb eines Netzwerks.'],
    ['WLAN-Access-Point', 'Ein Gerät, das ein WLAN-Funknetz aufspannt, damit Laptops und Handys ohne Kabel ins Netzwerk kommen.'],
    ['LAN', 'Local Area Network – ein lokales Netzwerk, z. B. alle Geräte in einem Bürogebäude.'],
    ['Firewall', 'Ein Schutzfilter zwischen Netzwerk und Internet. Er lässt erlaubte Verbindungen durch und blockt verdächtige.'],
    ['Phishing', 'Betrugsversuch mit gefälschten E-Mails oder SMS. Ziel: dein Passwort, deine Bankdaten oder dein Geld.'],
    ['Zwei-Faktor-Authentifizierung', 'Anmeldung mit zwei Beweisen, z. B. Passwort plus Code aufs Handy. Selbst wer dein Passwort kennt, kommt dann nicht rein.'],
    ['Update', 'Eine neue Version von Software. Updates schließen oft Sicherheitslücken – deshalb sind sie wichtig.'],
    ['Betriebssystem', 'Die Grundsoftware eines Geräts, z. B. Windows, macOS, Linux, Android oder iOS. Ohne sie läuft kein Programm.'],
    ['Cloud', 'Speicher und Programme, die nicht auf deinem Gerät liegen, sondern auf Servern im Internet.'],
    ['Admin-Rechte', 'Besondere Rechte, mit denen man z. B. Programme installieren oder Einstellungen ändern darf. Haben meist nur IT-Leute.'],
    ['Netzlaufwerk', 'Ein Ordner, der auf einem Server liegt und für mehrere Leute im Netzwerk erreichbar ist.'],
    ['Malware', 'Oberbegriff für Schadsoftware wie Viren, Trojaner oder Erpressungs-Software (Ransomware).'],
    ['Remote-Support', 'Fernwartung: Die IT schaut sich deinen Bildschirm über das Netzwerk an und hilft, ohne vorbeizukommen.']
  ]
});
