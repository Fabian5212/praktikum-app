/*
 * mindmap.js – Mindmap der Woche (#/mindmap).
 *   #/mindmap          → eigene Woche: Mindmap als Bild (PNG), optional als XMind-Datei, Link für den PC
 *   #/mindmap/<daten>  → Mindmap aus einem geteilten Link (z. B. am PC geöffnet), dort ebenfalls herunterladbar
 */
(function (App) {
  'use strict';
  const { icon, esc } = App.ui;

  /** Zweig-Farbe: Bereich des Tages bzw. eigene Farbe für die Fragen */
  const CLS = { fragen: 'g-tickets' };
  const cls = a => a ? (CLS[a] || 'area-' + a) : '';

  function node(n, depth) {
    const kids = (n.c || []).map(k => node(k, depth + 1)).join('');
    const imgs = (n.img || []).map(src => '<img src="' + src + '" alt="" loading="lazy">').join('');
    return '<li>' +
      '<span class="mm-node mm-d' + depth + '">' + esc(n.t) + (imgs ? '<span class="mm-imgs">' + imgs + '</span>' : '') + '</span>' +
      (kids ? '<ul>' + kids + '</ul>' : '') + '</li>';
  }

  /** Alle Einträge als gegliederte Liste (gut lesbar auf dem Handy) */
  function listHtml(tree) {
    if (!tree.c.length) return '<p class="empty muted">Noch nichts eingetragen. Schreib ins <a href="#/tagebuch">Tagebuch</a>, dann wächst hier deine Mindmap.</p>';
    return '<h2 class="h3 mm-list-title">' + icon('list') + 'Alle Einträge im Überblick</h2>' +
      '<div class="mm"><ul class="mm-branches">' + tree.c.map((b, i) =>
        '<li class="mm-branch ' + cls(b.a) + '" style="--i:' + i + '">' +
          '<span class="mm-node mm-d1">' + esc(b.t) + '</span>' +
          (b.c && b.c.length ? '<ul>' + b.c.map(k => node(k, 2)).join('') + '</ul>' : '') +
        '</li>').join('') + '</ul></div>';
  }

  function save(blob, name, msg) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    App.ui.toast(msg, 'download');
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

  /** Seite aufbauen – für die eigene Woche und für einen geteilten Link gleich, nur die Texte unterscheiden sich */
  function show(view, tree, shared) {
    view.innerHTML = App.ui.pageHead('Mindmap', shared ? 'Geteilte Praktikumswoche' : 'Deine Woche auf einen Blick', shared ? null : '#/tagebuch') +
      '<section class="card">' +
        '<div class="mm-pic-wrap" id="mm-pic"><p class="muted center">Mindmap wird gezeichnet …</p></div>' +
        '<p class="muted small center">Antippen zum Vergrößern</p>' +
        '<div class="stack">' +
          '<button class="btn primary" id="mm-png">' + icon('download') + 'Als Bild herunterladen (PNG)</button>' +
          (shared ? '' : '<button class="btn ghost" id="mm-link">' + icon('monitor') + 'Link für den PC</button>') +
        '</div>' +
        (shared
          ? '<p class="muted small">Diese Mindmap kommt aus einem Link. Fotos sind darin nicht enthalten – die gibt es nur, wenn die Mindmap direkt auf dem Handy heruntergeladen wird.</p>'
          : '<p class="muted small">Das Bild öffnet jeder PC und jedes Handy und lässt sich drucken. Der Link enthält deine Einträge (ohne Fotos) direkt in der Adresse – es wird nichts hochgeladen. Teile ihn nur mit dir selbst oder Leuten, die ihn sehen dürfen.</p>') +
      '</section>' +
      '<section class="card"><h2 class="h3">' + icon('network') + 'Für XMind (optional)</h2>' +
        '<p class="muted">Falls du am PC das Mindmap-Programm <b>XMind</b> nutzen darfst: Diese Datei kannst du dort öffnen und weiterbearbeiten.</p>' +
        '<button class="btn ghost block" id="mm-xmind">' + icon('download') + 'Als XMind-Datei herunterladen</button>' +
      '</section>' +
      listHtml(tree);
    App.ui.hydrateIcons(view);

    let canvas = null, picUrl = '';
    const ready = App.mindmap.image(tree).then(c => {
      canvas = c;
      return new Promise(r => c.toBlob(r, 'image/png'));
    }).then(blob => {
      const box = view.querySelector('#mm-pic');
      if (!box) return blob;
      picUrl = URL.createObjectURL(blob);
      const w = Math.round(canvas.width / canvas.dataset.scale);
      box.innerHTML = '<img src="' + picUrl + '" alt="Mindmap der Praktikumswoche" style="--w:' + w + 'px">';
      box.addEventListener('click', () => box.classList.toggle('zoom'));
      return blob;
    });

    view.querySelector('#mm-png').addEventListener('click', () => {
      ready.then(blob => save(blob, App.mindmap.fileName(tree, 'png'), 'Bild wird heruntergeladen'))
        .catch(() => App.ui.toast('Das Bild konnte nicht erstellt werden.', 'alert'));
    });
    view.querySelector('#mm-xmind').addEventListener('click', () => {
      App.mindmap.xmind(tree).then(blob => save(blob, App.mindmap.fileName(tree, 'xmind'), 'XMind-Datei wird heruntergeladen'))
        .catch(() => App.ui.toast('Die Datei konnte nicht erstellt werden.', 'alert'));
    });
    const link = view.querySelector('#mm-link');
    link && link.addEventListener('click', () => shareLink(tree));
    return () => { if (picUrl) URL.revokeObjectURL(picUrl); };
  }

  function render(view, params) {
    const shared = params[0];
    if (!shared) return show(view, App.mindmap.build(App.store.get()), false);

    // Geteilter Link: Daten aus der Adresse lesen
    view.innerHTML = App.ui.pageHead('Mindmap', 'Geteilte Praktikumswoche') + '<p class="muted center">Mindmap wird geladen …</p>';
    let alive = true, done = null;
    App.mindmap.decode(shared).then(tree => {
      if (alive) done = show(view, tree, true);
    }).catch(() => {
      if (!alive) return;
      view.innerHTML = App.ui.pageHead('Mindmap', 'Geteilte Praktikumswoche') +
        '<section class="card"><p>Dieser Link ist unvollständig oder beschädigt. Kopiere ihn bitte noch einmal komplett.</p>' +
        '<a class="btn ghost block" href="#/start">Zur Startseite</a></section>';
      App.ui.hydrateIcons(view);
    });
    return () => { alive = false; done && done(); };
  }

  App.views.mindmap = render;
})(window.App);
