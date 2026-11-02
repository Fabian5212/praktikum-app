/*
 * knowledge.js – Texte für den Bereich „Wissen“: die drei Abteilungen und gute Fragen.
 * Einfach hier Texte ändern oder ergänzen.
 */
(function (App) {
  'use strict';

  App.data.areas = {
    it: {
      title: 'IT-Service',
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
      ]
    },
    synchro: {
      title: 'Synchronisation',
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
      ]
    },
    schnitt: {
      title: 'Schnitt',
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
      ]
    }
  };

  /** „Gute Fragen zum Stellen“ – damit man im Gespräch nicht stumm danebensteht */
  App.data.questions = {
    it: [
      'Wie viele Tickets kommen hier an einem normalen Tag rein?',
      'Was war die verrückteste Störung, die ihr je hattet?',
      'Wie sichert ihr die Daten, falls ein Server ausfällt?',
      'Welche Aufgabe macht dir in deinem Job am meisten Spaß?',
      'Was sollte ich in der Schule lernen, wenn ich in die IT will?',
      'Wie erkennt ihr, ob eine E-Mail gefährlich ist?'
    ],
    synchro: [
      'Wie lange dauert es, einen ganzen Film zu synchronisieren?',
      'Wie wird ausgesucht, wer welche Rolle spricht?',
      'Was macht ihr, wenn ein Satz nicht zu den Lippen passt?',
      'Welche Technik braucht man für ein Tonstudio?',
      'Wie viele Takes braucht ein Sprecher für einen Satz?',
      'Wie seid ihr zu diesem Beruf gekommen?'
    ],
    schnitt: [
      'Wie viel Material wird gedreht – und wie viel landet am Ende im Film?',
      'Mit welchem Schnittprogramm arbeitet ihr und warum?',
      'Woran merkst du, dass ein Schnitt „sitzt“?',
      'Wie arbeitet ihr mit der Regie zusammen?',
      'Was passiert beim Rendern und warum dauert es so lange?',
      'Welche Projekte haben dir am meisten Spaß gemacht?'
    ]
  };
})(window.App);
