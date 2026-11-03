/*
 * spiele.js – Spieleübersicht (#/spiele) und Spielseite (#/spiele/<id>)
 * Enthält außerdem App.gameKit: gemeinsame Bausteine für alle Minispiele.
 */
(function (App) {
  'use strict';
  const { icon, esc, pageHead } = App.ui;

  const ORDER = App.store.GAMES;

  /* ---------- Gemeinsame Bausteine für die Spiele ---------- */
  App.gameKit = {
    /** Erklärung vor dem Spiel */
    intro(el, g) {
      el.innerHTML =
        '<div class="card intro glow">' +
          '<div class="intro-art"><img src="img/games/' + el.dataset.game + '.png" alt="" width="140" height="140"></div>' +
          '<p class="lead">' + esc(g.lead) + '</p>' +
          '<h2 class="h3">So geht\'s</h2><ul class="dots">' + g.how.map(x => '<li>' + esc(x) + '</li>').join('') + '</ul>' +
          '<div class="learnbox">' + icon('bulb') + '<div><b>Das lernst du:</b> ' + esc(g.learn) + '</div></div>' +
          '<button class="btn primary block" id="g-start">' + icon('play') + 'Los geht\'s</button>' +
        '</div>';
      el.querySelector('#g-start').addEventListener('click', () => App.ui.step(() => { g.onStart(); window.scrollTo(0, 0); }));
    },

    /** Spielstand speichern und Abzeichen prüfen */
    save(id, fn) {
      App.store.update(s => fn(s.games[id]));
      App.badges.check();
    },

    /** Ergebnis-Karte mit Lerneffekt */
    resultHtml(r) {
      return '<div class="card result pop">' +
        '<div class="result-ico">' + icon('trophy') + '</div>' +
        '<h2>' + esc(r.title) + '</h2>' +
        (r.sub ? '<p class="muted">' + esc(r.sub) + '</p>' : '') +
        '<div class="score"><span data-count="' + r.score + '">' + r.score + '</span><small>Punkte</small></div>' +
        (r.isBest ? '<span class="pill best">' + icon('star') + 'Neuer Rekord!</span>' : '') +
      '</div>' +
      (r.learn ? '<div class="card"><h3 class="h3">' + esc(r.learnTitle) + '</h3><ul class="learn-list">' + r.learn + '</ul></div>' : '');
    }
  };

  /* ---------- Übersicht ---------- */
  function list(view) {
    const s = App.store.get();
    view.innerHTML = pageHead('Spiele', 'Spielerisch die IT kennenlernen') +
      '<div class="game-list">' + ORDER.map((id, i) => {
        const g = App.games[id], st = s.games[id];
        return '<a class="game-card g-' + id + '" href="#/spiele/' + id + '" style="--i:' + i + '">' +
          '<div class="game-art"><img src="img/games/' + id + '.png" alt="" width="96" height="96"></div>' +
          '<div class="game-txt"><span class="tag">' + esc(g.topic) + '</span><h2 class="h3">' + esc(g.title) + '</h2>' +
          '<p>' + esc(g.teaser) + '</p>' +
          '<div class="game-meta">' + (st.plays ? icon('trophy') + 'Rekord ' + st.best + ' · ' + st.plays + '× gespielt' : '<i class="status-dot"></i>Noch nicht gespielt') + '</div></div>' +
          '<span class="go">' + icon('next') + '</span></a>';
      }).join('') + '</div>';
  }

  /* ---------- Einzelnes Spiel ---------- */
  function game(view, id) {
    const g = App.games[id];
    if (!g) { location.hash = '#/spiele'; return; }
    view.innerHTML = pageHead(g.title, g.topic, '#/spiele') + '<div id="game-root" class="game-root vt-swap g-' + id + '" data-game="' + id + '"></div>';
    return g.render(view.querySelector('#game-root'));
  }

  App.views.spiele = function (view, params) {
    return params[0] ? game(view, params[0]) : list(view);
  };
})(window.App);
