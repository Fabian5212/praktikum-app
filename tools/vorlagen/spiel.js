/*
 * __ID__.js – Minispiel „__NAME__“
 * Vorlage für ein Spiel mit eigener Logik. Als Beispiel ist hier „Stimmt das?“ eingebaut:
 * Aussagen erscheinen, man tippt auf „Stimmt“ oder „Stimmt nicht“. Ersetze das durch deine Idee.
 * Angemeldet wird das Spiel in js/config.js (games). Danach: npm run check
 *
 * So hängt ein Spiel an der App:
 *   render(el)          zeichnet das Spiel in el (zuerst die Erklärung über App.gameKit.intro)
 *   App.gameKit.save()  speichert das Ergebnis (plays, best, bestPct + eigene Felder aus save)
 *   App.gameKit.resultHtml()  die Ergebnis-Karte mit Punkten und Lerneffekt
 *   render darf eine Funktion zurückgeben – sie wird beim Verlassen der Seite aufgerufen (Timer stoppen!)
 * Bausteine wie .card, .answers/.answer, .feedback, .btn stehen in css/style.css.
 * Eigenes CSS: games/__ID__.css anlegen und in js/config.js css: true setzen.
 */
(function (App) {
  'use strict';
  const { icon, esc, shuffle } = App.ui;

  // Inhalte: Aussage, stimmt sie?, Erklärung
  const ITEMS = [
    { text: 'Beispiel-Aussage, die stimmt.', yes: true, why: 'Erklärung, warum sie stimmt.' },
    { text: 'Beispiel-Aussage, die nicht stimmt.', yes: false, why: 'Erklärung, warum sie nicht stimmt.' },
    { text: 'Noch eine Aussage.', yes: true, why: 'Erklärung.' }
  ];

  function render(el) {
    App.gameKit.intro(el, {
      lead: 'Einleitung: Worum geht es in diesem Spiel?',
      how: ['Du siehst ' + ITEMS.length + ' Aussagen.', 'Tippe auf „Stimmt“ oder „Stimmt nicht“.'],
      learn: 'Was man in diesem Spiel lernt.',
      onStart: () => play(el)
    });
  }

  function play(el) {
    const deck = shuffle(ITEMS);
    let i = 0, correct = 0;

    function show() {
      el.innerHTML =
        '<div class="game-bar"><span class="chip">' + (i + 1) + '/' + deck.length + '</span></div>' +
        '<article class="card glow pop"><h2 class="h3">' + esc(deck[i].text) + '</h2></article>' +
        '<div class="answers">' +
          '<button class="answer" data-yes="1">' + icon('check') + ' Stimmt</button>' +
          '<button class="answer" data-yes="0">' + icon('x') + ' Stimmt nicht</button>' +
        '</div><div id="fb"></div>';
      el.querySelectorAll('.answer').forEach(b => b.addEventListener('click', () => answer(b)));
    }

    function answer(btn) {
      const item = deck[i];
      const ok = (btn.dataset.yes === '1') === item.yes;
      if (ok) correct++;
      el.querySelectorAll('.answer').forEach(b => { b.disabled = true; });
      btn.classList.add(ok ? 'right' : 'wrong');
      el.querySelector('#fb').innerHTML =
        '<div class="feedback ' + (ok ? 'good' : 'bad') + ' pop"><b>' + (ok ? 'Richtig!' : 'Leider falsch.') + '</b>' +
        '<p>' + esc(item.why) + '</p><button class="btn primary" id="next">Weiter' + icon('next') + '</button></div>';
      el.querySelector('#next').addEventListener('click', () => App.ui.step(() => { i++; i < deck.length ? show() : finish(); }));
    }

    function finish() {
      const score = correct * 100;
      const pct = Math.round(correct / deck.length * 100);
      let isBest = false;
      App.gameKit.save('__ID__', g => {
        g.plays++;
        if (score > g.best) { g.best = score; isBest = true; }
        g.bestPct = Math.max(g.bestPct, pct);
      });
      el.innerHTML = App.gameKit.resultHtml({
        title: correct + ' von ' + deck.length + ' richtig', score, isBest,
        learnTitle: 'Das nimmst du mit',
        learn: deck.map(it => '<li><span class="li-ico">' + icon(it.yes ? 'check' : 'x') + '</span><div>' + esc(it.text) +
          '<br><span class="muted">' + esc(it.why) + '</span></div></li>').join('')
      }) + '<div class="stack"><button class="btn primary" id="again">' + icon('play') + 'Nochmal</button>' +
        '<a class="btn ghost" href="#/spiele">' + icon('back') + 'Zu den Spielen</a></div>';
      el.querySelector('#again').addEventListener('click', () => App.ui.step(() => play(el)));
    }

    show();
  }

  App.addGame({
    id: '__ID__',
    title: '__NAME__',
    area: '__AREA__',             // Bereich aus js/config.js – bestimmt die Farbe
    icon: 'gamepad',              // Symbol aus js/ui.js (wird gezeigt, solange es kein Bild gibt)
    topic: '__NAME__',            // kleines Schild über dem Titel
    teaser: 'Ein Satz für die Spieleliste.',
    render,
    save: {},                     // eigene Felder im Spielstand, z. B. { bestStreak: 0 }
    badges: [                     // optional: Abzeichen zu diesem Spiel
      { id: '__ID__-profi', name: '__NAME__-Profi', icon: 'trophy', desc: 'Alles richtig in „__NAME__“.',
        test: s => s.games['__ID__'].bestPct === 100 }
    ]
  });
})(window.App);
