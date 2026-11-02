/*
 * tickets.js – Minispiel „Ticket-Rush“ (IT-Support)
 * 12 zufällige Tickets pro Runde, jeweils 20 Sekunden Zeit.
 * Punkte: 100 + Restsekunden × 5, multipliziert mit dem Combo-Faktor (×1 … ×4).
 */
(function (App) {
  'use strict';
  const { icon, esc, shuffle } = App.ui;

  const ROUND = 12;
  const SECONDS = 20;

  function render(el) {
    App.gameKit.intro(el, {
      title: 'Ticket-Rush', icon: 'ticket', area: 'it',
      lead: 'Du sitzt heute am IT-Support! Kolleginnen und Kollegen melden Probleme – du entscheidest, was zu tun ist.',
      how: [ROUND + ' Tickets pro Runde, für jedes hast du ' + SECONDS + ' Sekunden.',
            'Je schneller du richtig antwortest, desto mehr Punkte.',
            'Mehrere richtige Antworten hintereinander geben einen Combo-Bonus (bis ×4).',
            'Nach jeder Antwort erfährst du, warum die Lösung richtig ist.'],
      learn: 'Typische Störungen im Büroalltag und wie man sie Schritt für Schritt löst.',
      onStart: () => play(el)
    });
  }

  function play(el) {
    const deck = shuffle(App.data.tickets).slice(0, ROUND);
    let i = 0, score = 0, streak = 0, bestStreak = 0, correct = 0, timer = null, left = SECONDS;
    const missed = [];

    function mult() { return Math.min(4, 1 + Math.floor(streak / 3)); }

    function show() {
      const tk = deck[i];
      const answers = shuffle([tk.ok].concat(tk.wrong));
      left = SECONDS;
      el.innerHTML =
        '<div class="game-bar"><span class="chip">Ticket ' + (i + 1) + '/' + ROUND + '</span>' +
        '<span class="chip">' + icon('star') + score + '</span>' +
        '<span class="chip combo' + (mult() > 1 ? ' hot' : '') + '">' + icon('flame') + '×' + mult() + '</span></div>' +
        '<div class="timer"><i id="t-bar"></i></div>' +
        '<article class="card ticket-card pop">' +
          '<div class="ticket-head"><span class="ticket-no">#' + (4711 + i) + '</span><span class="muted">' + esc(tk.from) + '</span></div>' +
          '<h2 class="h3">' + esc(tk.t) + '</h2><p>' + esc(tk.text) + '</p></article>' +
        '<p class="muted small">Was machst du?</p>' +
        '<div class="answers">' + answers.map(a => '<button class="answer" data-ok="' + (a === tk.ok ? 1 : 0) + '">' + esc(a) + '</button>').join('') + '</div>' +
        '<div id="t-fb"></div>';
      el.querySelectorAll('.answer').forEach(b => b.addEventListener('click', () => answer(b)));
      tick();
    }

    function tick() {
      const bar = el.querySelector('#t-bar');
      if (!bar || !el.isConnected) return;   // Seite wurde verlassen → Timer endet
      bar.style.width = (left / SECONDS * 100) + '%';
      bar.classList.toggle('low', left <= 5);
      if (left <= 0) { answer(null); return; }
      timer = setTimeout(() => { left--; tick(); }, 1000);
    }

    function answer(btn) {
      clearTimeout(timer);
      const tk = deck[i];
      const ok = btn && btn.dataset.ok === '1';
      el.querySelectorAll('.answer').forEach(b => {
        b.disabled = true;
        if (b.dataset.ok === '1') b.classList.add('right');
      });
      let gained = 0;
      if (ok) {
        streak++; correct++;
        bestStreak = Math.max(bestStreak, streak);
        gained = (100 + left * 5) * mult();
        score += gained;
      } else {
        if (btn) btn.classList.add('wrong');
        streak = 0;
        missed.push(tk);
      }
      el.querySelector('#t-fb').innerHTML =
        '<div class="feedback ' + (ok ? 'good' : 'bad') + ' pop">' +
          '<b>' + (ok ? 'Richtig! +' + gained : btn ? 'Leider falsch.' : 'Zeit abgelaufen!') + '</b>' +
          '<p>' + esc(tk.why) + '</p>' +
          '<button class="btn primary" id="t-next">' + (i + 1 < ROUND ? 'Nächstes Ticket' : 'Auswertung') + icon('next') + '</button></div>';
      const nx = el.querySelector('#t-next');
      nx.addEventListener('click', () => App.ui.step(() => { i++; i < ROUND ? show() : finish(); }));
      nx.focus();
      nx.scrollIntoView({ block: 'nearest', behavior: App.ui.reducedMotion() ? 'auto' : 'smooth' });
    }

    function finish() {
      const pct = Math.round(correct / ROUND * 100);
      let isBest = false;
      App.gameKit.save('tickets', g => {
        g.plays++;
        if (score > g.best) { g.best = score; isBest = true; }
        g.bestPct = Math.max(g.bestPct, pct);
        g.bestCombo = Math.max(g.bestCombo, bestStreak);
      });
      if (pct >= 75) App.ui.confetti();
      el.innerHTML = App.gameKit.resultHtml({
        title: correct + ' von ' + ROUND + ' Tickets gelöst', score, isBest,
        sub: 'Längste Combo: ' + bestStreak,
        learnTitle: missed.length ? 'Das nimmst du mit' : 'Perfekt – alle Tickets gelöst!',
        learn: missed.map(t => '<li><span class="li-ico">' + icon('ticket') + '</span><div><b>' + esc(t.t) + '</b><br>' + esc(t.ok) + '. <span class="muted">' + esc(t.why) + '</span></div></li>').join('')
      }) + '<div class="stack"><button class="btn primary" id="t-again">' + icon('play') + 'Neue Runde</button>' +
        '<a class="btn ghost" href="#/spiele">' + icon('back') + 'Zu den Spielen</a></div>';
      el.querySelector('#t-again').addEventListener('click', () => App.ui.step(() => play(el)));
    }

    show();
    // Timer stoppen, wenn die Seite verlassen wird
    return () => clearTimeout(timer);
  }

  App.games.tickets = {
    id: 'tickets', title: 'Ticket-Rush', icon: 'ticket', area: 'it', topic: 'IT-Support',
    teaser: 'Löse Störungen unter Zeitdruck.',
    render
  };
})(window.App);
