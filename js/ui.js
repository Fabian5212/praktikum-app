/*
 * ui.js – wiederverwendbare Bausteine: Icons, Toasts, Bottom-Sheets, Drag & Drop, kleine Helfer.
 */
(function (App) {
  'use strict';

  /* ---------- Icons (24×24, Linienstil, currentColor) ---------- */
  const P = {
    home: '<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v9.5h13V10"/><path d="M10 19.5v-5h4v5"/>',
    gamepad: '<rect x="2.5" y="7" width="19" height="11" rx="5.5"/><path d="M7.5 10.5v4M5.5 12.5h4"/><circle cx="15.5" cy="11.5" r="1"/><circle cx="17.5" cy="13.8" r="1"/>',
    book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5"/><path d="M8.5 7.5h7"/>',
    bulb: '<path d="M9 18h6M10 21.5h4"/><path d="M12 2.5a6.5 6.5 0 0 0-4 11.6c.7.6 1 1.3 1 2.2V17h6v-.7c0-.9.3-1.6 1-2.2a6.5 6.5 0 0 0-4-11.6z"/>',
    flag: '<path d="M5 21.5V3.5"/><path d="M5 4h11.5l-2 4 2 4H5"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m20 20-4.8-4.8"/>',
    play: '<path d="M7 4.5v15l12-7.5z"/>',
    check: '<path d="m4.5 12.5 5 5 10-11"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    trash: '<path d="M4 6.5h16M9.5 6.5V4h5v2.5M6.5 6.5l1 14h9l1-14"/>',
    download: '<path d="M12 3.5v12M7 11l5 5 5-5"/><path d="M4.5 20.5h15"/>',
    upload: '<path d="M12 16V4M7 8.5l5-5 5 5"/><path d="M4.5 20.5h15"/>',
    copy: '<rect x="8.5" y="8.5" width="12" height="12" rx="2.5"/><path d="M15.5 8.5V6a2.5 2.5 0 0 0-2.5-2.5H6A2.5 2.5 0 0 0 3.5 6v7A2.5 2.5 0 0 0 6 15.5h2.5"/>',
    camera: '<path d="M3.5 8.5A2 2 0 0 1 5.5 6.5H8l1.5-2.5h5L16 6.5h2.5a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z"/><circle cx="12" cy="13" r="3.5"/>',
    back: '<path d="M15 5 8 12l7 7"/>',
    next: '<path d="m9 5 7 7-7 7"/>',
    star: '<path d="m12 3 2.8 5.8 6.2.8-4.6 4.3 1.2 6.2L12 17l-5.6 3.1 1.2-6.2L3 9.6l6.2-.8z"/>',
    trophy: '<path d="M7.5 4h9v5a4.5 4.5 0 0 1-9 0z"/><path d="M7.5 6H4v1.5A3.5 3.5 0 0 0 7.7 11M16.5 6H20v1.5a3.5 3.5 0 0 1-3.7 3.5"/><path d="M12 13.5V17M8 21h8M9.5 17h5v4h-5z"/>',
    network: '<rect x="9" y="2.5" width="6" height="5" rx="1.2"/><rect x="2.5" y="16.5" width="6" height="5" rx="1.2"/><rect x="15.5" y="16.5" width="6" height="5" rx="1.2"/><path d="M12 7.5V12M5.5 16.5V12h13v4.5"/>',
    ticket: '<path d="M3.5 7.5a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2V10a2 2 0 0 0 0 4v2.5a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2V14a2 2 0 0 0 0-4z"/><path d="M14.5 6v12" stroke-dasharray="2 2"/>',
    shield: '<path d="M12 2.5 4.5 5.5V11c0 5 3.2 8.8 7.5 10.5 4.3-1.7 7.5-5.5 7.5-10.5V5.5z"/><path d="m8.8 12 2.3 2.3 4.2-4.6"/>',
    cpu: '<rect x="6" y="6" width="12" height="12" rx="2"/><rect x="9.5" y="9.5" width="5" height="5" rx=".8"/><path d="M9.5 2.5V6M14.5 2.5V6M9.5 18v3.5M14.5 18v3.5M2.5 9.5H6M2.5 14.5H6M18 9.5h3.5M18 14.5h3.5"/>',
    edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1"/>',
    monitor: '<rect x="2.5" y="3.5" width="19" height="13" rx="2"/><path d="M8.5 21h7M12 16.5V21"/>',
    mic: '<rect x="9" y="2.5" width="6" height="12" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5v4M8.5 21.5h7"/>',
    film: '<rect x="3" y="3.5" width="18" height="17" rx="2.5"/><path d="M7.5 3.5v17M16.5 3.5v17M3 8h4.5M3 12h4.5M3 16h4.5M16.5 8H21M16.5 12H21M16.5 16H21"/>',
    dots: '<circle cx="5.5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="18.5" cy="12" r="1.3"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',
    flame: '<path d="M12 21.5c4 0 6.5-2.6 6.5-6.3 0-4-3.3-6.2-4.4-10.7-2.3 1.6-3.4 3.8-3.2 6.3-1.2-.6-2-1.8-2.2-3.3-1.8 1.8-3.2 4.3-3.2 7.4 0 3.9 2.6 6.6 6.5 6.6z"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9.6 9.3a2.5 2.5 0 0 1 4.8.9c0 1.7-2.4 2.2-2.4 3.8M12 17.2v.1"/>',
    alert: '<path d="M12 3.5 2.5 20h19z"/><path d="M12 10v4.5M12 17.3v.1"/>',
    mail: '<rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="m3.5 6.5 8.5 7 8.5-7"/>',
    phone: '<rect x="6.5" y="2.5" width="11" height="19" rx="2.5"/><path d="M10.5 18.5h3"/>',
    lock: '<rect x="4.5" y="10.5" width="15" height="11" rx="2.5"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/>',
    sparkle: '<path d="M12 3c.6 4.3 2.7 6.4 7 7-4.3.6-6.4 2.7-7 7-.6-4.3-2.7-6.4-7-7 4.3-.6 6.4-2.7 7-7z"/><path d="M19 16c.2 1.5.9 2.3 2.5 2.5-1.6.2-2.3 1-2.5 2.5-.2-1.5-1-2.3-2.5-2.5 1.5-.2 2.3-1 2.5-2.5z"/>',
    list: '<path d="M9 6.5h11M9 12h11M9 17.5h11"/><circle cx="4.5" cy="6.5" r="1"/><circle cx="4.5" cy="12" r="1"/><circle cx="4.5" cy="17.5" r="1"/>',
    chat: '<path d="M4 5.5h16v11H9.5L5 20.5v-4H4z"/>',
    power: '<path d="M12 3v8"/><path d="M6.6 6.6a7.5 7.5 0 1 0 10.8 0"/>',
    wifi: '<path d="M2.5 9a14 14 0 0 1 19 0M5.5 12.5a9.5 9.5 0 0 1 13 0M8.7 16a5 5 0 0 1 6.6 0"/><circle cx="12" cy="19.3" r="1"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.7 5.6 3.7 9s-1.2 6.4-3.7 9c-2.5-2.6-3.7-5.6-3.7-9S9.5 5.6 12 3z"/>',
    router: '<rect x="2.5" y="13" width="19" height="7" rx="2"/><path d="M6.5 16.5h.1M10 16.5h.1M17 13V9M8.6 7.6a5 5 0 0 1 6.8 0M6.4 5.2a8.4 8.4 0 0 1 11.2 0"/>',
    switch: '<rect x="2" y="8" width="20" height="8" rx="2"/><path d="M5.5 12h1.5M9 12h1.5M12.5 12H14M16 12h2.5"/>',
    printer: '<path d="M7 8.5V3.5h10v5"/><rect x="3" y="8.5" width="18" height="8" rx="2"/><path d="M7 14h10v6.5H7z"/>',
    laptop: '<rect x="4.5" y="4.5" width="15" height="10.5" rx="1.5"/><path d="M2 19h20l-1.5-4h-17z"/>',
    server: '<rect x="4" y="3" width="16" height="7.5" rx="1.8"/><rect x="4" y="13.5" width="16" height="7.5" rx="1.8"/><path d="M7.5 6.8h.1M7.5 17.3h.1M11 6.8h5.5M11 17.3h5.5"/>',
    ap: '<circle cx="12" cy="15.5" r="5"/><path d="M8.6 7a5 5 0 0 1 6.8 0M6.4 4.6a8.4 8.4 0 0 1 11.2 0"/><circle cx="12" cy="15.5" r="1"/>'
  };

  /** Liefert ein Icon als SVG-String */
  function icon(name, cls) {
    return '<svg class="ico ' + (cls || '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (P[name] || P.dots) + '</svg>';
  }

  /** Ersetzt alle <x data-icon="name"> im Element durch das Icon */
  function hydrateIcons(root) {
    (root || document).querySelectorAll('[data-icon]').forEach(el => {
      if (!el.firstElementChild) el.innerHTML = icon(el.dataset.icon);
    });
  }

  /** HTML-Sonderzeichen entschärfen – IMMER für Nutzereingaben benutzen */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Toasts ---------- */
  function toast(msg, ico) {
    const root = document.getElementById('toasts');
    const t = document.createElement('div');
    t.className = 'toast';
    t.innerHTML = icon(ico || 'check') + '<span>' + esc(msg) + '</span>';
    root.appendChild(t);
    setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 300); }, 3200);
  }

  /* ---------- Bottom-Sheet (ersetzt alert/confirm) ---------- */
  /**
   * sheet({ title, html, actions:[{label, kind:'primary'|'ghost'|'danger', onClick(close) }], dismissable })
   * onClick bekommt close() – gibt onClick false zurück, bleibt das Sheet offen.
   */
  function sheet(opts) {
    const root = document.getElementById('sheet-root');
    const wrap = document.createElement('div');
    wrap.className = 'sheet-wrap';
    const dismissable = opts.dismissable !== false;
    wrap.innerHTML =
      '<div class="sheet-backdrop"></div>' +
      '<div class="sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-title">' +
        '<div class="sheet-grip" aria-hidden="true"></div>' +
        (opts.title ? '<h2 id="sheet-title" class="sheet-title">' + esc(opts.title) + '</h2>' : '') +
        '<div class="sheet-body">' + (opts.html || '') + '</div>' +
        '<div class="sheet-actions"></div>' +
      '</div>';
    const actions = wrap.querySelector('.sheet-actions');
    const prevFocus = document.activeElement;

    function close() {
      wrap.classList.add('out');
      document.removeEventListener('keydown', onKey);
      setTimeout(() => { wrap.remove(); prevFocus && prevFocus.focus && prevFocus.focus(); }, reducedMotion() ? 0 : 220);
    }
    function onKey(e) { if (e.key === 'Escape' && dismissable) close(); }

    (opts.actions || [{ label: 'OK', kind: 'primary' }]).forEach(a => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'btn ' + (a.kind || 'ghost');
      b.innerHTML = (a.icon ? icon(a.icon) : '') + '<span>' + esc(a.label) + '</span>';
      b.addEventListener('click', () => {
        const keep = a.onClick ? a.onClick(close, wrap) === false : false;
        if (!keep) close();
      });
      actions.appendChild(b);
    });
    if (dismissable) wrap.querySelector('.sheet-backdrop').addEventListener('click', close);
    document.addEventListener('keydown', onKey);
    root.appendChild(wrap);
    hydrateIcons(wrap);
    const first = wrap.querySelector('input, textarea, select') || wrap.querySelector('.sheet-actions .btn');
    setTimeout(() => first && first.focus(), 50);
    return { close, el: wrap };
  }

  /* ---------- Drag & Drop mit Finger und Maus ---------- */
  /**
   * draggable(el, { data, onDrop(target, data), dropSelector, onTap })
   * Erzeugt beim Ziehen eine Kopie unter dem Finger. Ziel wird per elementFromPoint gesucht.
   * Kurzes Tippen ohne Bewegung ruft onTap auf (Alternative zum Ziehen).
   */
  function draggable(el, opts) {
    el.style.touchAction = 'none';
    el.addEventListener('pointerdown', start);

    function start(e) {
      if (e.button !== undefined && e.button !== 0) return;
      const sx = e.clientX, sy = e.clientY;
      const rect = el.getBoundingClientRect();
      let ghost = null, over = null, moved = false;
      el.setPointerCapture && el.setPointerCapture(e.pointerId);

      function move(ev) {
        const dx = ev.clientX - sx, dy = ev.clientY - sy;
        if (!moved && Math.hypot(dx, dy) < 8) return;
        if (!moved) {
          moved = true;
          ghost = el.cloneNode(true);
          ghost.classList.add('drag-ghost');
          ghost.style.width = rect.width + 'px';
          ghost.style.height = rect.height + 'px';
          ghost.style.left = '0'; ghost.style.top = '0'; ghost.style.margin = '0';   // Inline-Position des Originals überschreiben
          document.body.appendChild(ghost);
          el.classList.add('dragging');
        }
        ghost.style.transform = 'translate(' + (rect.left + dx) + 'px,' + (rect.top + dy) + 'px)';
        ghost.style.visibility = 'hidden';
        const hit = document.elementFromPoint(ev.clientX, ev.clientY);
        ghost.style.visibility = '';
        const target = hit && hit.closest(opts.dropSelector);
        if (target !== over) {
          over && over.classList.remove('drop-over');
          over = target;
          over && over.classList.add('drop-over');
        }
      }
      function end(ev) {
        el.removeEventListener('pointermove', move);
        el.removeEventListener('pointerup', end);
        el.removeEventListener('pointercancel', end);
        el.classList.remove('dragging');
        over && over.classList.remove('drop-over');
        if (ghost) ghost.remove();
        if (!moved) { opts.onTap && opts.onTap(el, opts.data); return; }
        if (ev.type !== 'pointercancel' && over) opts.onDrop(over, opts.data, el);
      }
      el.addEventListener('pointermove', move);
      el.addEventListener('pointerup', end);
      el.addEventListener('pointercancel', end);
    }
  }

  /* ---------- Konfetti (klein, respektiert reduzierte Bewegung) ---------- */
  function confetti() {
    if (reducedMotion()) return;
    const box = document.createElement('div');
    box.className = 'confetti';
    const colors = ['var(--brand)', 'var(--accent)', 'var(--it)', 'var(--synchro)', 'var(--schnitt)'];
    for (let i = 0; i < 36; i++) {
      const s = document.createElement('i');
      s.style.left = Math.random() * 100 + '%';
      s.style.background = colors[i % colors.length];
      s.style.animationDelay = Math.random() * 0.3 + 's';
      s.style.setProperty('--dx', (Math.random() * 120 - 60) + 'px');
      s.style.setProperty('--r', (Math.random() * 720 - 360) + 'deg');
      box.appendChild(s);
    }
    document.body.appendChild(box);
    setTimeout(() => box.remove(), 1800);
  }

  /* ---------- Kleine Helfer ---------- */
  const WEEKDAYS = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag'];
  const WD_SHORT = ['Mo', 'Di', 'Mi', 'Do', 'Fr'];

  function formatDate(iso, withYear) {
    if (!iso) return '';
    const d = new Date(iso + 'T12:00:00');
    return d.toLocaleDateString('de-DE', withYear ? { day: 'numeric', month: 'long', year: 'numeric' } : { day: 'numeric', month: 'short' });
  }

  function debounce(fn, ms) {
    let t;
    return function () { const a = arguments; clearTimeout(t); t = setTimeout(() => fn.apply(this, a), ms); };
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }

  /** Bereichs-Pill (IT / Synchro / Schnitt) */
  function areaPill(key, long) {
    const a = App.store.AREAS[key];
    if (!a) return '<span class="pill">Noch offen</span>';
    return '<span class="pill area-' + key + '">' + icon(a.icon) + esc(long ? a.label : a.short) + '</span>';
  }

  /** Seitenkopf mit optionalem Zurück-Link */
  function pageHead(title, sub, backHref) {
    return '<header class="page-head">' +
      (backHref ? '<a class="icon-btn back" href="' + backHref + '" aria-label="Zurück">' + icon('back') + '</a>' : '') +
      '<div><h1>' + esc(title) + '</h1>' + (sub ? '<p class="sub">' + esc(sub) + '</p>' : '') + '</div></header>';
  }

  App.ui = { icon, hydrateIcons, esc, toast, sheet, draggable, confetti, formatDate, debounce, shuffle, areaPill, pageHead, reducedMotion, WEEKDAYS, WD_SHORT };
})(window.App);
