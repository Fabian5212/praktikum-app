/*
 * phishing.js – Minispiel „Phishing oder echt?“ (IT-Sicherheit)
 * 10 zufällige Nachrichten. Nach jeder Entscheidung werden Warnsignale (rot)
 * und gute Zeichen (grün) im Text markiert und unten erklärt.
 */
(function (App) {
  'use strict';
  const { icon, esc, shuffle } = App.ui;

  const ROUND = 10;

  /**
   * Wandelt „[[Text|Erklärung]]“ (Warnsignal) bzw. „[[OK:Text|Erklärung]]“ (gutes Zeichen) in HTML um.
   * reveal=false: nur der Text. reveal=true: <mark> mit Nummer, Erklärungen landen in notes.
   */
  function parse(src, reveal, notes) {
    let out = '', last = 0;
    const re = /\[\[(OK:)?([^|\]]+)\|([^\]]+)\]\]/g;
    let m;
    while ((m = re.exec(src))) {
      out += esc(src.slice(last, m.index));
      const good = m[1] === 'OK:';
      if (reveal) {
        notes.push({ good, text: m[2], why: m[3] });
        out += '<mark class="flag ' + (good ? 'good' : 'bad') + '"><sup>' + notes.length + '</sup>' + esc(m[2]) + '</mark>';
      } else {
        out += esc(m[2]);
      }
      last = re.lastIndex;
    }
    return (out + esc(src.slice(last))).replace(/\n/g, '<br>');
  }

  function messageHtml(msg, reveal, notes) {
    const isSms = msg.type === 'sms';
    return '<article class="msg ' + (isSms ? 'sms' : 'mail') + '">' +
      '<div class="msg-head">' + icon(isSms ? 'phone' : 'mail') +
        '<div><div class="msg-from">' + parse(msg.from, reveal, notes) + '</div>' +
        (msg.subject ? '<div class="msg-subj">' + parse(msg.subject, reveal, notes) + '</div>' : '') + '</div></div>' +
      '<div class="msg-body">' + parse(msg.body, reveal, notes) + '</div></article>';
  }

  function render(el) {
    App.gameKit.intro(el, {
      title: 'Phishing oder echt?', icon: 'shield', area: 'it',
      lead: 'Betrüger verschicken täglich Millionen gefälschte Nachrichten. Kannst du sie erkennen?',
      how: [ROUND + ' E-Mails und SMS – alle Firmen darin sind erfunden.',
            'Lies genau und entscheide: sicher oder Phishing?',
            'Danach werden Warnsignale rot und gute Zeichen grün markiert.',
            'Achte auf Absender, Links, Zeitdruck und was von dir verlangt wird.'],
      learn: 'Die typischen Tricks von Betrügern – damit du und deine Familie nicht reinfallen.',
      onStart: () => play(el)
    });
  }

  function play(el) {
    // Ungefähr halb/halb mischen, damit nicht nur Phishing kommt
    const ph = shuffle(App.data.phishing.filter(m => m.phishing)).slice(0, 6);
    const ok = shuffle(App.data.phishing.filter(m => !m.phishing)).slice(0, ROUND - ph.length);
    const deck = shuffle(ph.concat(ok));
    let i = 0, correct = 0;

    function show() {
      const msg = deck[i];
      el.innerHTML =
        '<div class="game-bar"><span class="chip">Nachricht ' + (i + 1) + '/' + ROUND + '</span>' +
        '<span class="chip">' + icon('check') + correct + ' richtig</span></div>' +
        (msg.context ? '<p class="context">' + icon('help') + esc(msg.context) + '</p>' : '') +
        '<div class="pop">' + messageHtml(msg, false) + '</div>' +
        '<div class="decide"><button class="btn safe" data-v="0">' + icon('check') + 'Sicher</button>' +
        '<button class="btn danger" data-v="1">' + icon('alert') + 'Phishing</button></div>';
      el.querySelectorAll('.decide .btn').forEach(b => b.addEventListener('click', () => App.ui.transition(() => decide(b.dataset.v === '1'), 'fade')));
    }

    function decide(saysPhish) {
      const msg = deck[i];
      const right = saysPhish === msg.phishing;
      if (right) correct++;
      const notes = [];
      const body = messageHtml(msg, true, notes);
      el.innerHTML =
        '<div class="game-bar"><span class="chip">Nachricht ' + (i + 1) + '/' + ROUND + '</span>' +
        '<span class="chip">' + icon('check') + correct + ' richtig</span></div>' +
        '<div class="feedback ' + (right ? 'good' : 'bad') + ' pop"><b>' + (right ? 'Richtig erkannt!' : 'Nicht ganz.') + '</b> ' +
          'Das war ' + (msg.phishing ? '<b>Phishing</b>.' : '<b>eine echte Nachricht</b>.') + '</div>' +
        (msg.context ? '<p class="context">' + icon('help') + esc(msg.context) + '</p>' : '') +
        body +
        '<ol class="flags">' + notes.map(n => '<li class="' + (n.good ? 'good' : 'bad') + '"><b>' + esc(n.text) + '</b><br>' + esc(n.why) + '</li>').join('') + '</ol>' +
        '<p class="tipbox">' + icon('bulb') + esc(msg.tip) + '</p>' +
        '<button class="btn primary block" id="p-next">' + (i + 1 < ROUND ? 'Nächste Nachricht' : 'Auswertung') + icon('next') + '</button>';
      el.querySelector('#p-next').addEventListener('click', () => App.ui.step(() => { i++; i < ROUND ? show() : finish(); window.scrollTo(0, 0); }));
      el.scrollIntoView({ block: 'start' });
    }

    function finish() {
      const pct = Math.round(correct / ROUND * 100);
      const score = correct * 100;
      let isBest = false;
      App.gameKit.save('phishing', g => {
        g.plays++;
        if (score > g.best) { g.best = score; isBest = true; }
        g.bestPct = Math.max(g.bestPct, pct);
      });
      if (pct >= 80) App.ui.confetti();
      const rules = [
        ['mail', 'Absender genau ansehen: Passt die Adresse wirklich zur Firma?'],
        ['globe', 'Links prüfen: Seltsame Adressen nicht antippen – lieber die App selbst öffnen.'],
        ['clock', 'Zeitdruck und Drohungen („in 24 Stunden gesperrt“) sind Alarmzeichen.'],
        ['lock', 'Niemand Seriöses fragt per Mail oder SMS nach Passwort, PIN oder TAN.'],
        ['help', 'Im Zweifel nachfragen – über einen Weg, den du selbst kennst.']
      ];
      el.innerHTML = App.gameKit.resultHtml({
        title: correct + ' von ' + ROUND + ' richtig erkannt', score, isBest,
        sub: pct >= 90 ? 'Echter Phishing-Jäger!' : pct >= 70 ? 'Gut aufgepasst!' : 'Übung macht den Profi.',
        learnTitle: 'Die 5 goldenen Regeln',
        learn: rules.map(r => '<li><span class="li-ico">' + icon(r[0]) + '</span><div>' + esc(r[1]) + '</div></li>').join('')
      }) + '<div class="stack"><button class="btn primary" id="p-again">' + icon('play') + 'Neue Runde</button>' +
        '<a class="btn ghost" href="#/spiele">' + icon('back') + 'Zu den Spielen</a></div>';
      el.querySelector('#p-again').addEventListener('click', () => App.ui.step(() => play(el)));
    }

    show();
  }

  App.games.phishing = {
    id: 'phishing', title: 'Phishing oder echt?', icon: 'shield', area: 'it', topic: 'IT-Sicherheit',
    teaser: 'Erkenne gefälschte E-Mails und SMS.',
    render
  };
})(window.App);
