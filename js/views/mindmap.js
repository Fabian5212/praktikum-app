/*
 * mindmap.js – Mindmap der Woche (#/mindmap).
 *   #/mindmap          → eigene Woche, mit Download (.xmind) und Link für den PC
 *   #/mindmap/<daten>  → Mindmap aus einem geteilten Link (z. B. am PC geöffnet), dort ebenfalls als .xmind ladbar
 */
(function (App) {
  'use strict';
  const { icon, esc } = App.ui;

  /** Zweig-Farbe: Bereich des Tages bzw. eigene Farbe für Spiele, Abzeichen, Fragen */
  const CLS = { spiele: 'g-kabel', badges: 'g-phishing', fragen: 'g-tickets' };
  const cls = a => a ? (CLS[a] || 'area-' + a) : '';

  function node(n, depth) {
    const kids = (n.c || []).map(k => node(k, depth + 1)).join('');
    const imgs = (n.img || []).map(src => '<img src="' + src + '" alt="" loading="lazy">').join('');
    return '<li>' +
      '<span class="mm-node mm-d' + depth + '">' + esc(n.t) + (imgs ? '<span class="mm-imgs">' + imgs + '</span>' : '') + '</span>' +
      (kids ? '<ul>' + kids + '</ul>' : '') + '</li>';
  }

  function mapHtml(tree) {
    return '<div class="mm" role="tree" aria-label="Mindmap der Woche">' +
      '<div class="mm-root"><b>' + esc(tree.t) + '</b>' + (tree.sub ? '<span>' + esc(tree.sub) + '</span>' : '') + '</div>' +
      (tree.c.length
        ? '<ul class="mm-branches">' + tree.c.map((b, i) =>
            '<li class="mm-branch ' + cls(b.a) + '" style="--i:' + i + '">' +
              '<span class="mm-node mm-d1">' + esc(b.t) + '</span>' +
              (b.c && b.c.length ? '<ul>' + b.c.map(k => node(k, 2)).join('') + '</ul>' : '') +
            '</li>').join('') + '</ul>'
        : '<p class="empty muted">Noch nichts eingetragen. Schreib ins <a href="#/tagebuch">Tagebuch</a>, dann wächst hier deine Mindmap.</p>') +
    '</div>';
  }

  function download(tree) {
    App.mindmap.xmind(tree).then(blob => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = App.mindmap.fileName(tree);
      document.body.appendChild(a);
      a.click();
      setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
      App.ui.toast('XMind-Datei wird heruntergeladen', 'download');
    }).catch(() => App.ui.toast('Die Datei konnte nicht erstellt werden.', 'alert'));
  }

  /** Link für den PC: teilen (Handy) oder kopieren, zur Not zum Markieren anzeigen */
  async function shareLink(tree) {
    const url = location.href.split('#')[0] + '#/mindmap/' + await App.mindmap.encode(tree);
    if (navigator.share) {
      try { await navigator.share({ title: 'Meine Praktikumswoche als Mindmap', url }); return; }
      catch (e) { if (e.name === 'AbortError') return; }
    }
    try { await navigator.clipboard.writeText(url); App.ui.toast('Link kopiert! Schick ihn dir selbst, z. B. per Mail.', 'copy'); return; }
    catch (e) { /* Zwischenablage gesperrt */ }
    App.ui.sheet({
      title: 'Link für den PC',
      html: '<p class="muted">Markiere den Link und schick ihn dir selbst, z. B. per Mail.</p><textarea class="export-text" rows="5" readonly>' + esc(url) + '</textarea>',
      actions: [{ label: 'Fertig', kind: 'primary' }]
    });
  }

  function render(view, params) {
    const shared = params[0];
    if (!shared) {
      const tree = App.mindmap.build(App.store.get());
      view.innerHTML = App.ui.pageHead('Mindmap', 'Deine Woche auf einen Blick', '#/tagebuch') +
        '<section class="card">' +
          '<p class="muted">Alles aus Tagebuch, Fazit, Spielen und Fragen – als Mindmap. Öffnen kannst du sie z. B. mit <b>XMind</b> am PC.</p>' +
          '<div class="stack">' +
            '<button class="btn primary" id="mm-dl">' + icon('download') + 'Als XMind-Datei herunterladen</button>' +
            '<button class="btn ghost" id="mm-link">' + icon('monitor') + 'Link für den PC</button>' +
          '</div>' +
          '<p class="muted small">Der Link enthält deine Einträge (ohne Fotos) direkt in der Adresse – es wird nichts hochgeladen. Am PC öffnen, dort siehst du die Mindmap und kannst sie herunterladen. Teile den Link nur mit dir selbst oder Leuten, die ihn sehen dürfen.</p>' +
        '</section>' +
        mapHtml(tree);
      view.querySelector('#mm-dl').addEventListener('click', () => download(tree));
      view.querySelector('#mm-link').addEventListener('click', () => shareLink(tree));
      return;
    }

    // Geteilter Link: Daten aus der Adresse lesen
    view.innerHTML = App.ui.pageHead('Mindmap', 'Geteilte Praktikumswoche') + '<p class="muted center">Mindmap wird geladen …</p>';
    let alive = true;
    App.mindmap.decode(shared).then(tree => {
      if (!alive) return;
      view.innerHTML = App.ui.pageHead('Mindmap', 'Geteilte Praktikumswoche') +
        '<section class="card">' +
          '<p class="muted">Diese Mindmap kommt aus einem Link. Fotos sind darin nicht enthalten – die gibt es nur in der Datei, die direkt auf dem Handy heruntergeladen wird.</p>' +
          '<button class="btn primary block" id="mm-dl">' + icon('download') + 'Als XMind-Datei herunterladen</button>' +
        '</section>' +
        mapHtml(tree);
      App.ui.hydrateIcons(view);
      view.querySelector('#mm-dl').addEventListener('click', () => download(tree));
    }).catch(() => {
      if (!alive) return;
      view.innerHTML = App.ui.pageHead('Mindmap', 'Geteilte Praktikumswoche') +
        '<section class="card"><p>Dieser Link ist unvollständig oder beschädigt. Kopiere ihn bitte noch einmal komplett.</p>' +
        '<a class="btn ghost block" href="#/start">Zur Startseite</a></section>';
      App.ui.hydrateIcons(view);
    });
    return () => { alive = false; };
  }

  App.views.mindmap = render;
})(window.App);
