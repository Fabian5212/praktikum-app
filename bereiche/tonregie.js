/*
 * Bereich „Tonregie“ – alles, was die App über diesen Bereich weiß.
 * Was die Felder bedeuten, steht in tools/vorlagen/bereich.js. Angemeldet wird der Bereich in js/config.js.
 */
App.addArea({
  id: 'tonregie',
  label: 'Tonregie',
  short: 'Tonregie',
  icon: 'sliders',
  color: '#F472B6',
  today: 'Heute in der Tonregie beim WDR: Hier wird der Ton einer Sendung gesteuert – oft live.',

  intro: 'Die Tonregie ist der Raum, in dem bei Fernsehen und Radio der Ton einer Sendung gesteuert wird – oft live. Am großen Mischpult entscheidet die Tonregie, wann welches Mikrofon, welche Musik und welcher Einspieler zu hören ist. Beim WDR erlebst du, wie das bei einem großen Sender abläuft.',
  tasks: [
    'Mikrofone von Moderation und Gästen zur richtigen Zeit auf- und zuziehen',
    'Musik, Jingles und vorproduzierte Beiträge einspielen',
    'Pegel überwachen: nicht zu laut, nicht zu leise – für alle Zuschauer gleich angenehm',
    'Mit Regie und Studio über Kopfhörer und Gegensprechanlage reden',
    'Bei Störungen blitzschnell reagieren: Rückkopplung, ausgefallenes Funkmikro, Anrufer zu leise'
  ],
  jobs: [
    { name: 'Mediengestalter/in Bild und Ton', info: 'Ausbildung, 3 Jahre – Ton und Bild bei Sendern und Produktionen' },
    { name: 'Tonmeister/in / Toningenieur/in', info: 'meist Studium – Verantwortung für den Ton großer Sendungen' },
    { name: 'Fachkraft für Veranstaltungstechnik', info: 'Ausbildung, 3 Jahre – Ton, Licht und Bühne bei Live-Events' },
    { name: 'Audio-Engineer', info: 'Studium oder Weiterbildung – Aufnahme, Mischung, Live-Ton' }
  ],

  // „Gute Fragen zum Stellen“
  questions: [
    'Was ist der Unterschied zwischen Tonregie und Bildregie?',
    'Was passiert, wenn während einer Live-Sendung ein Mikrofon ausfällt?',
    'Wie viele Kanäle hat dieses Mischpult – und braucht ihr alle?',
    'Wie redet ihr während der Sendung mit dem Studio, ohne dass es jemand hört?',
    'Woher wisst ihr, wann welcher Beitrag oder welche Musik kommt?',
    'Bildet der Sender selbst aus – und wie komme ich an ein Praktikum?'
  ],

  // Wörterbuch: [Begriff, Erklärung in einfacher Sprache]
  glossary: [
    ['Mischpult', 'Das große Steuergerät in der Tonregie. Jede Tonquelle (Mikro, Musik, Einspieler) hat einen eigenen Kanal mit Reglern.'],
    ['Fader', 'Ein Schieberegler am Mischpult. Hochschieben = lauter bzw. „auf“, runterziehen = leiser bzw. „zu“.'],
    ['Kanalzug', 'Eine senkrechte Reihe am Mischpult für genau eine Tonquelle – mit Fader, Klangreglern und Knöpfen.'],
    ['Aussteuern', 'Die Lautstärke so einstellen, dass der Ton kräftig ist, aber nie übersteuert (verzerrt).'],
    ['Live-Sendung', 'Eine Sendung, die in dem Moment ausgestrahlt wird, in dem sie passiert. Fehler kann man nicht mehr rausschneiden!'],
    ['Sendeablauf', 'Der genaue Plan einer Sendung: was wann kommt – Moderation, Beitrag, Musik, Gast – oft auf die Sekunde.'],
    ['Einspieler', 'Ein vorbereiteter Beitrag oder Jingle, der während der Sendung abgespielt wird.'],
    ['Jingle', 'Eine kurze Erkennungsmelodie, z. B. am Anfang einer Sendung oder vor den Nachrichten.'],
    ['Equalizer (EQ)', 'Ein Klangregler: Damit macht man Bässe, Mitten oder Höhen lauter oder leiser – z. B. damit eine Stimme klarer klingt.'],
    ['Kompressor', 'Gleicht Lautstärkeunterschiede aus: Laute Stellen werden etwas leiser, damit die Stimme gleichmäßiger klingt.'],
    ['Rückkopplung', 'Lautes Pfeifen, wenn ein Mikrofon seinen eigenen Ton aus dem Lautsprecher wieder aufnimmt. Sofort Fader runter!'],
    ['Funkmikrofon', 'Mikrofon ohne Kabel. Der Ton wird per Funk übertragen – praktisch, aber der Akku muss voll sein.'],
    ['Ansteckmikrofon', 'Ein winziges Mikro, das an der Kleidung befestigt wird. Wird oft in Talkshows benutzt.'],
    ['Phantomspeisung', 'Strom, den das Mischpult über das Mikrofonkabel schickt. Manche Mikrofone (Kondensatormikros) brauchen ihn.'],
    ['Gegensprechanlage', 'Damit reden Regie, Ton und Kamera während der Sendung miteinander – die Zuschauer hören davon nichts.'],
    ['Lautheit', 'Wie laut etwas für unser Ohr wirkt. Sender halten feste Werte ein, damit Werbung nicht plötzlich lauter ist als der Film.'],
    ['Ü-Wagen', 'Übertragungswagen: eine fahrbare Regie, z. B. für Live-Übertragungen von Fußballspielen oder Konzerten.'],
    ['N-1 (Mix-Minus)', 'Ein Mix für einen zugeschalteten Gast, der alles enthält – außer seiner eigenen Stimme. Sonst hört er sich mit Verzögerung als Echo.']
  ]
});
