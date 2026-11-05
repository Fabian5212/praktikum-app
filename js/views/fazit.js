/*
 * fazit.js – Fazit (#/fazit): Auswertung, persönliches Fazit, Export/Import, alles löschen.
 */
(function (App) {
  'use strict';
  const { icon, esc, WEEKDAYS, WD_SHORT } = App.ui;
  const AREAS = App.store.AREAS;
  const GAMES = App.store.GAMES;
  let day = null;               // Tag (0–4), dessen Fazit gerade angezeigt wird

  /** Durchschnittliche Tagesbewertung pro Bereich */
  function areaStats(s) {
    const sum = {}, cnt = {};
    Object.values(s.diary).forEach(e => {
      if (!e || !e.area || !e.rating) return;
      sum[e.area] = (sum[e.area] || 0) + e.rating;
      cnt[e.area] = (cnt[e.area] || 0) + 1;
    });
    return Object.keys(AREAS).filter(k => cnt[k]).map(k => ({ key: k, label: AREAS[k].label, avg: sum[k] / cnt[k], n: cnt[k] }))
      .sort((a, b) => b.avg - a.avg);
  }

  function bars(rows) {
    return '<div class="bars">' + rows.map((r, i) =>
      '<div class="bar-row"><span class="bar-label">' + esc(r.label) + '</span>' +
      '<div class="bar-track"><i class="bar ' + (r.cls || '') + '" style="--w:' + r.pct + '%;--i:' + i + '"></i></div>' +
      '<span class="bar-val">' + esc(r.val) + '</span></div>').join('') + '</div>';
  }

  function render(view) {
    const s = App.store.get();
    const as = areaStats(s);
    const gs = GAMES.map(k => ({ key: k, label: App.games[k].title, pct: s.games[k].bestPct, plays: s.games[k].plays }))
      .sort((a, b) => b.pct - a.pct);
    const favArea = as[0];
    const favGame = gs[0] && gs[0].plays ? gs[0] : null;
    if (day === null) {
      const t = App.store.today();
      day = t.phase === 'during' ? t.index : 0;
    }

    view.innerHTML = App.ui.pageHead('Fazit', 'Deine Woche auf einen Blick') +

      '<section class="card"><h2 class="h3">' + icon('star') + 'Welcher Bereich hat dir gefallen?</h2>' +
        (as.length
          ? '<p class="highlight area-' + favArea.key + '">Dein Favorit: <b>' + esc(favArea.label) + '</b></p>' +
            bars(as.map(a => ({ label: AREAS[a.key].short, pct: a.avg / 5 * 100, val: a.avg.toFixed(1) + ' ★', cls: 'area-' + a.key })))
          : '<p class="empty muted">Bewerte deine Tage im <a href="#/tagebuch">Tagebuch</a> mit Sternen – dann siehst du hier deinen Favoriten.</p>') +
      '</section>' +

      '<section class="card"><h2 class="h3">' + icon('trophy') + 'Wo warst du am stärksten?</h2>' +
        (favGame
          ? '<p class="highlight">Deine Stärke: <b>' + esc(App.games[favGame.key].topic) + '</b> (' + esc(favGame.label) + ')</p>' +
            bars(gs.map(g => ({ label: g.label, pct: g.pct, val: g.plays ? g.pct + ' %' : '–', cls: 'g-' + g.key })))
          : '<p class="empty muted">Spiel ein paar <a href="#/spiele">Minispiele</a> – dann siehst du hier deine Stärken.</p>') +
        '<p class="muted small">Prozent = dein bestes Ergebnis im jeweiligen Spiel.</p>' +
      '</section>' +

      // Persönliches Fazit: ein eigener Text pro Tag
      '<section class="card"><h2 class="h3">' + icon('flag') + 'Mein persönliches Fazit</h2>' +
        '<div class="day-tabs" role="tablist">' + WD_SHORT.map((d, i) => {
          const done = s.conclusions[i] && s.conclusions[i].trim();
          return '<button role="tab" class="day-tab' + (i === day ? ' on' : '') + (done ? ' done' : '') + '" data-fzday="' + i + '" aria-selected="' + (i === day) + '">' +
            '<b>' + d + '</b>' + (done ? '<i class="dot"></i>' : '') + '</button>';
        }).join('') + '</div>' +
        '<label class="field"><span>Fazit für ' + WEEKDAYS[day] + '</span>' +
        '<textarea id="fz-text" rows="6" placeholder="Wie war dein Tag? Was nimmst du mit? Könntest du dir diesen Beruf vorstellen?">' + esc(s.conclusions[day] || '') + '</textarea></label>' +
        '<p class="muted small" id="fz-saved" aria-live="polite">Wird automatisch gespeichert.</p>' +
      '</section>' +

      '<section class="card"><h2 class="h3">' + icon('download') + 'Sichern & mitnehmen</h2>' +
        '<p class="muted">Deine Daten liegen nur auf diesem Gerät. Sichere sie, bevor du den Browser-Speicher löschst oder ein neues Handy bekommst.</p>' +
        '<div class="stack">' +
          '<a class="btn primary" href="#/mindmap">' + icon('network') + 'Woche als Mindmap (XMind)</a>' +
          '<button class="btn ghost" id="fz-copy">' + icon('copy') + 'Als Text kopieren</button>' +
          '<button class="btn ghost" id="fz-json">' + icon('download') + 'Als Datei herunterladen (JSON)</button>' +
          '<label class="btn ghost file-btn">' + icon('upload') + 'Datei importieren<input type="file" accept="application/json,.json" id="fz-import" hidden></label>' +
        '</div></section>' +

      '<section class="card danger-zone"><h2 class="h3">' + icon('trash') + 'Alles löschen</h2>' +
        '<p class="muted">Löscht Name, Tagebuch, Fotos, Spielstände und Abzeichen von diesem Gerät.</p>' +
        '<button class="btn danger" id="fz-del">' + icon('trash') + 'Alle Daten löschen</button></section>' +

      '<p class="muted small center">Einblick · alle Daten bleiben auf deinem Gerät · kein Tracking</p>';

    const ta = view.querySelector('#fz-text');
    ta.addEventListener('input', App.ui.debounce(() => {
      App.store.update(st => { st.conclusions[day] = ta.value; });
      view.querySelector('#fz-saved').textContent = 'Gespeichert.';
      App.badges.check();
    }, 500));

    // Tag wechseln: Seite neu zeichnen, Scrollposition behalten
    view.querySelectorAll('[data-fzday]').forEach(b => b.addEventListener('click', () => {
      const next = +b.dataset.fzday;
      if (next === day) return;
      day = next;
      const y = window.scrollY;
      App.router.refresh();
      window.scrollTo(0, y);
    }));

    view.querySelector('#fz-copy').addEventListener('click', copyText);
    view.querySelector('#fz-json').addEventListener('click', downloadJson);
    view.querySelector('#fz-import').addEventListener('change', importJson);
    view.querySelector('#fz-del').addEventListener('click', confirmDelete);
  }

  /* ---------- Export als Text ---------- */
  function asText() {
    const s = App.store.get();
    const L = [];
    const line = (k, v) => { if (v && String(v).trim()) L.push(k + ': ' + String(v).trim()); };
    L.push('MEINE PRAKTIKUMSWOCHE' + (s.name ? ' – ' + s.name : ''));
    if (s.startDate) L.push('Start: ' + App.ui.formatDate(s.startDate, true));
    L.push('');
    WEEKDAYS.forEach((d, i) => {
      const e = s.diary[i];
      if (!e || !(e.did || e.exciting || e.learned || e.rating || e.notes)) return;
      L.push('— ' + d + (e.date ? ', ' + App.ui.formatDate(e.date, true) : '') + (e.area ? ' (' + AREAS[e.area].label + ')' : '') + ' —');
      line('Was ich gemacht habe', e.did);
      line('Spannend fand ich', e.exciting);
      line('Gelernt habe ich', e.learned);
      line('Notizen', e.notes);
      if (e.rating) L.push('Bewertung: ' + '★'.repeat(e.rating) + '☆'.repeat(5 - e.rating));
      L.push('');
    });
    if (s.questions.length) {
      L.push('MEINE FRAGEN');
      s.questions.forEach(q => L.push((q.done ? '[x] ' : '[ ] ') + q.text));
      L.push('');
    }
    L.push('SPIELE');
    GAMES.forEach(k => { const g = s.games[k]; L.push(App.games[k].title + ': ' + (g.plays ? 'Rekord ' + g.best + ' Punkte (' + g.bestPct + ' %)' : 'nicht gespielt')); });
    const got = App.badges.LIST.filter(b => s.badges[b.id]).map(b => b.name);
    if (got.length) L.push('', 'ABZEICHEN: ' + got.join(', '));
    const fz = WEEKDAYS.map((d, i) => s.conclusions[i] && s.conclusions[i].trim() ? d + ': ' + s.conclusions[i].trim() : '').filter(Boolean);
    if (fz.length) L.push('', 'MEIN FAZIT', ...fz);
    return L.join('\n');
  }

  async function copyText() {
    const text = asText();
    try {
      await navigator.clipboard.writeText(text);
      App.ui.toast('Kopiert! Jetzt in deine Notiz-App einfügen.', 'copy');
    } catch (e) {
      // Fallback, z. B. wenn die Zwischenablage gesperrt ist: Text zum manuellen Kopieren zeigen
      App.ui.sheet({
        title: 'Text kopieren',
        html: '<p class="muted">Markiere den Text und kopiere ihn von Hand.</p><textarea class="export-text" rows="12" readonly>' + esc(text) + '</textarea>',
        actions: [{ label: 'Fertig', kind: 'primary' }]
      });
    }
  }

  /* ---------- Export/Import als JSON ---------- */
  function downloadJson() {
    const s = App.store.get();
    const blob = new Blob([JSON.stringify({ app: 'einblick', exported: new Date().toISOString(), data: s }, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'einblick-' + (s.name ? s.name.toLowerCase().replace(/[^a-z0-9äöüß]+/g, '-') + '-' : '') + App.store.toISO(new Date()) + '.json';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
    App.ui.toast('Datei wird heruntergeladen', 'download');
  }

  function importJson(ev) {
    const file = ev.target.files[0];
    ev.target.value = '';
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      let parsed;
      try { parsed = JSON.parse(reader.result); } catch (e) { App.ui.toast('Die Datei ist kein gültiges JSON.', 'alert'); return; }
      const data = parsed && parsed.app === 'einblick' ? parsed.data : parsed;
      App.ui.sheet({
        title: 'Daten importieren?',
        html: '<p>Die Daten auf diesem Gerät werden durch die Datei <b>' + esc(file.name) + '</b> ersetzt.</p>',
        actions: [
          { label: 'Abbrechen', kind: 'ghost' },
          { label: 'Importieren', kind: 'primary', icon: 'upload', onClick: () => {
            try {
              App.store.replaceAll(data);
              App.badges.check();
              App.ui.toast('Import erfolgreich!', 'check');
              App.router.refresh();
            } catch (e) { App.ui.toast(e.message, 'alert'); }
          } }
        ]
      });
    };
    reader.readAsText(file);
  }

  /* ---------- Alles löschen (eigener Dialog statt confirm()) ---------- */
  function confirmDelete() {
    App.ui.sheet({
      title: 'Wirklich alles löschen?',
      html: '<p>Das kann <b>nicht</b> rückgängig gemacht werden. Tipp: Lade vorher eine Sicherung als Datei herunter.</p>' +
        '<label class="field"><span>Zum Bestätigen <b>LÖSCHEN</b> eintippen</span><input id="del-confirm" type="text" autocomplete="off" autocapitalize="characters"></label>' +
        '<p class="err" id="del-err" hidden>Bitte genau LÖSCHEN eingeben.</p>',
      actions: [
        { label: 'Abbrechen', kind: 'ghost' },
        { label: 'Endgültig löschen', kind: 'danger', icon: 'trash', onClick: (close, wrap) => {
          if (wrap.querySelector('#del-confirm').value.trim().toUpperCase() !== 'LÖSCHEN') {
            wrap.querySelector('#del-err').hidden = false;
            return false;
          }
          App.store.reset();
          App.ui.toast('Alle Daten gelöscht', 'trash');
          location.hash = '#/start';
          setTimeout(() => App.settings(true), 300);
        } }
      ]
    });
  }

  App.views.fazit = render;
})(window.App);
