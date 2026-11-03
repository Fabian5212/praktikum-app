/*
 * wissen.js – Wissen (#/wissen, #/wissen/lexikon, #/wissen/fragen)
 * Bereiche erklärt, durchsuchbares Wörterbuch, gute Fragen zum Stellen.
 */
(function (App) {
  'use strict';
  const { icon, esc, areaPill } = App.ui;
  const AREAS = App.store.AREAS;
  const KEYS = ['it', 'synchro', 'schnitt', 'tonregie'];
  let filter = '';   // gewählter Bereich im Wörterbuch ('' = alle)

  function tabs(cur) {
    const t = [['', 'Bereiche'], ['lexikon', 'Wörterbuch'], ['fragen', 'Gute Fragen']];
    return '<nav class="seg seg-tabs" aria-label="Wissen">' + t.map(([k, l]) =>
      '<a class="seg-btn' + (cur === k ? ' on' : '') + '" href="#/wissen' + (k ? '/' + k : '') + '"' + (cur === k ? ' aria-current="page"' : '') + '>' + l + '</a>').join('') + '</nav>';
  }

  /* ---------- Bereiche ---------- */
  function areasHtml() {
    return KEYS.map(k => {
      const a = App.data.areas[k];
      return '<details class="card area-card area-' + k + '"' + '>' +
        '<summary><span class="area-ico">' + icon(AREAS[k].icon) + '</span><span><b class="h3">' + esc(a.title) + '</b><span class="muted small">Was passiert dort?</span></span>' + icon('next', 'chev') + '</summary>' +
        '<p>' + esc(a.intro) + '</p>' +
        '<h3 class="h4">Typische Aufgaben</h3><ul class="dots">' + a.tasks.map(t => '<li>' + esc(t) + '</li>').join('') + '</ul>' +
        '<h3 class="h4">Passende Berufe</h3><ul class="jobs">' + a.jobs.map(j => '<li><b>' + esc(j.name) + '</b><span>' + esc(j.info) + '</span></li>').join('') + '</ul>' +
      '</details>';
    }).join('');
  }

  /* ---------- Wörterbuch ---------- */
  function lexHtml() {
    return '<div class="search"><span class="search-ico">' + icon('search') + '</span>' +
      '<input id="lex-q" type="search" placeholder="Begriff suchen …" aria-label="Begriff suchen" autocomplete="off"></div>' +
      '<div class="chips" id="lex-chips">' + [['', 'Alle']].concat(KEYS.map(k => [k, AREAS[k].short])).map(([k, l]) =>
        '<button class="chip-btn' + (filter === k ? ' on' : '') + (k ? ' area-' + k : '') + '" data-filter="' + k + '">' + l + '</button>').join('') + '</div>' +
      '<p class="muted small" id="lex-count"></p><dl class="lex" id="lex-list"></dl>';
  }

  function lexFill(view) {
    const q = view.querySelector('#lex-q').value.trim().toLowerCase();
    const items = App.data.glossary
      .filter(([w, a, d]) => (!filter || a === filter) && (!q || w.toLowerCase().includes(q) || d.toLowerCase().includes(q)))
      .sort((x, y) => x[0].localeCompare(y[0], 'de'));
    view.querySelector('#lex-count').textContent = items.length + ' Begriffe';
    view.querySelector('#lex-list').innerHTML = items.length
      ? items.map(([w, a, d]) => '<div class="lex-item"><dt>' + esc(w) + areaPill(a) + '</dt><dd>' + esc(d) + '</dd></div>').join('')
      : '<p class="empty muted">Nichts gefunden. Frag doch jemanden vor Ort – und schreib es dir in die Notizen!</p>';
  }

  /* ---------- Gute Fragen ---------- */
  function questionsHtml() {
    const mine = App.store.get().questions.map(q => q.text);
    return '<p class="muted">Tippe auf <b>+</b>, um eine Frage auf deine Liste im Tagebuch zu setzen.</p>' +
      KEYS.map(k => '<section class="card"><h2 class="h3">' + areaPill(k, true) + '</h2><ul class="qsuggest">' +
        App.data.questions[k].map(q => {
          const has = mine.includes(q);
          return '<li><span>' + esc(q) + '</span><button class="icon-btn small' + (has ? ' added' : '') + '" data-add="' + esc(q) + '" aria-label="' + (has ? 'Schon auf der Liste' : 'Zur Liste hinzufügen') + '"' + (has ? ' disabled' : '') + '>' + icon(has ? 'check' : 'plus') + '</button></li>';
        }).join('') + '</ul></section>').join('');
  }

  function render(view, params) {
    const sub = params[0] || '';
    view.innerHTML = App.ui.pageHead('Wissen', 'IT, Synchro, Schnitt & Tonregie erklärt') + tabs(sub) +
      '<div class="wissen-body vt-swap">' + (sub === 'lexikon' ? lexHtml() : sub === 'fragen' ? questionsHtml() : areasHtml()) + '</div>';

    if (sub === 'lexikon') {
      const inp = view.querySelector('#lex-q');
      inp.addEventListener('input', () => lexFill(view));
      view.querySelectorAll('[data-filter]').forEach(b => b.addEventListener('click', () => {
        filter = b.dataset.filter;
        view.querySelectorAll('[data-filter]').forEach(x => x.classList.toggle('on', x === b));
        lexFill(view);
      }));
      lexFill(view);
      // Vom Schnellzugriff kommend gleich ins Suchfeld
      if (App.router.prev === 'start') setTimeout(() => inp.focus(), 80);
    }
    if (sub === 'fragen') {
      view.querySelectorAll('[data-add]').forEach(b => b.addEventListener('click', () => {
        App.store.update(s => { s.questions.push({ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 5), text: b.dataset.add, done: false }); });
        App.badges.check();
        b.disabled = true; b.classList.add('added'); b.innerHTML = icon('check');
        App.ui.toast('Zur Fragenliste hinzugefügt', 'help');
      }));
    }
  }

  App.views.wissen = render;
})(window.App);
