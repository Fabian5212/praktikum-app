/*
 * quiz.js – Baukasten für Quiz-Spiele.
 * Ein Quiz braucht keine eigene Spiel-Logik, nur Fragen:
 *
 *   App.addQuiz({
 *     id: 'kamera-quiz', title: 'Kamera-Check', area: 'kamera', icon: 'camera',
 *     teaser: 'Ein Satz für die Spieleliste.',
 *     lead: 'Einleitung vor dem Start.',
 *     learn: 'Was man dabei lernt.',
 *     round: 8,                       // optional: so viele zufällige Fragen pro Runde (sonst alle)
 *     questions: [
 *       { q: 'Frage?', ok: 'Richtige Antwort', wrong: ['Falsch 1', 'Falsch 2', 'Falsch 3'], why: 'Erklärung' }
 *     ]
 *   });
 *
 * Vorlage zum Kopieren: tools/vorlagen/quiz.js (oder: npm run neu -- quiz <id> <bereich> "Titel")
 * Antworten werden gemischt. Punkte: 100 pro richtiger Antwort, +50 für jede weitere in Folge.
 */
(function (App) {
  'use strict';
  const { icon, esc, shuffle } = App.ui;

  function addQuiz(def) {
    const qs = def.questions || [];
    const round = Math.min(def.round || qs.length, qs.length);

    function render(el) {
      App.gameKit.intro(el, {
        lead: def.lead || def.teaser || '',
        how: [round + ' Fragen, jeweils eine Antwort ist richtig.',
              'Mehrere richtige Antworten hintereinander geben Bonuspunkte.',
              'Nach jeder Antwort erfährst du, warum sie richtig oder falsch ist.'],
        learn: def.learn || '',
        onStart: () => play(el)
      });
    }

    function play(el) {
      const deck = shuffle(qs).slice(0, round);
      let i = 0, score = 0, streak = 0, correct = 0;
      const missed = [];

      function show() {
        const q = deck[i];
        el.innerHTML =
          '<div class="game-bar"><span class="chip">Frage ' + (i + 1) + '/' + round + '</span>' +
          '<span class="chip">' + icon('star') + score + '</span></div>' +
          '<article class="card glow pop"><h2 class="h3">' + esc(q.q) + '</h2></article>' +
          '<div class="answers">' + shuffle([q.ok].concat(q.wrong)).map(a =>
            '<button class="answer" data-ok="' + (a === q.ok ? 1 : 0) + '">' + esc(a) + '</button>').join('') + '</div>' +
          '<div id="qz-fb"></div>';
        el.querySelectorAll('.answer').forEach(b => b.addEventListener('click', () => answer(b)));
      }

      function answer(btn) {
        const q = deck[i];
        const ok = btn.dataset.ok === '1';
        el.querySelectorAll('.answer').forEach(b => {
          b.disabled = true;
          if (b.dataset.ok === '1') b.classList.add('right');
        });
        let gained = 0;
        if (ok) {
          gained = 100 + streak * 50;
          streak++; correct++; score += gained;
        } else {
          btn.classList.add('wrong');
          streak = 0;
          missed.push(q);
        }
        el.querySelector('#qz-fb').innerHTML =
          '<div class="feedback ' + (ok ? 'good' : 'bad') + ' pop">' +
            '<b>' + (ok ? 'Richtig! +' + gained : 'Leider falsch.') + '</b>' +
            (q.why ? '<p>' + esc(q.why) + '</p>' : '') +
            '<button class="btn primary" id="qz-next">' + (i + 1 < round ? 'Nächste Frage' : 'Auswertung') + icon('next') + '</button></div>';
        const nx = el.querySelector('#qz-next');
        nx.addEventListener('click', () => App.ui.step(() => { i++; i < round ? show() : finish(); }));
        nx.focus();
        nx.scrollIntoView({ block: 'nearest', behavior: App.ui.reducedMotion() ? 'auto' : 'smooth' });
      }

      function finish() {
        const pct = Math.round(correct / round * 100);
        let isBest = false;
        App.gameKit.save(def.id, g => {
          g.plays++;
          if (score > g.best) { g.best = score; isBest = true; }
          g.bestPct = Math.max(g.bestPct, pct);
        });
        if (pct >= 75) App.ui.confetti();
        el.innerHTML = App.gameKit.resultHtml({
          title: correct + ' von ' + round + ' Fragen richtig', score, isBest,
          sub: pct === 100 ? 'Alles richtig – stark!' : pct >= 60 ? 'Gut gemacht!' : 'Nochmal? Beim zweiten Mal klappt es besser.',
          learnTitle: missed.length ? 'Das nimmst du mit' : 'Perfekt – alles gewusst!',
          learn: missed.map(q => '<li><span class="li-ico">' + icon(def.icon || 'help') + '</span><div><b>' + esc(q.q) + '</b><br>' +
            esc(q.ok) + (q.why ? ' <span class="muted">' + esc(q.why) + '</span>' : '') + '</div></li>').join('')
        }) + '<div class="stack"><button class="btn primary" id="qz-again">' + icon('play') + 'Neue Runde</button>' +
          '<a class="btn ghost" href="#/spiele">' + icon('back') + 'Zu den Spielen</a></div>';
        el.querySelector('#qz-again').addEventListener('click', () => App.ui.step(() => play(el)));
      }

      show();
    }

    App.addGame({
      id: def.id, title: def.title, icon: def.icon || 'help', area: def.area, topic: def.topic, color: def.color,
      teaser: def.teaser || '',
      render,
      badges: def.badge ? [{ id: def.id, name: def.badge.name, icon: def.icon || 'help', desc: def.badge.desc,
        test: s => s.games[def.id].bestPct >= (def.badge.pct || 100) }] : [],
      questions: qs   // für Tests
    });
  }

  App.addQuiz = addQuiz;
})(window.App);
