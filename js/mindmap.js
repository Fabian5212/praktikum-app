/*
 * mindmap.js – fasst die ganze Woche als Mindmap zusammen.
 *
 * build(state)  → Baum { t: Titel, a: Bereich (Farbe), c: [Kinder], img: [Fotos] }
 * image(tree)   → Canvas mit einer selbst gezeichneten Mindmap (Mitte, Zweige links und rechts), als PNG
 *                 herunterladbar – öffnet jeder PC und jedes Handy, lässt sich drucken
 * xmind(tree)   → Blob einer .xmind-Datei (ZIP mit content.json, wie XMind ab Version 2020 sie liest), inkl. Fotos
 * encode(tree)  → kurzer Text für den Link #/mindmap/<text> (ohne Fotos). Die Daten stecken nur im Link –
 *                 der Teil hinter # wird nie an einen Server geschickt.
 * decode(text)  → Baum zurück
 */
(function (App) {
  'use strict';
  const { WEEKDAYS } = App.ui;
  const AREAS = App.store.AREAS;
  const has = v => typeof v === 'string' && v.trim() !== '';

  /* ---------- Baum aus den gespeicherten Daten ---------- */
  function build(s) {
    const days = [];
    WEEKDAYS.forEach((d, i) => {
      const e = s.diary[i] || {};
      const fz = (s.conclusions || [])[i];
      const photos = Array.isArray(e.photos) ? e.photos : [];
      const c = [];
      const text = (label, v) => { if (has(v)) c.push({ t: label, c: [{ t: v.trim() }] }); };
      if (e.area && AREAS[e.area]) c.push({ t: 'Bereich: ' + AREAS[e.area].label });
      if (e.rating) c.push({ t: 'Bewertung: ' + '★'.repeat(e.rating) + '☆'.repeat(5 - e.rating) });
      text('Was ich gemacht habe', e.did);
      text('Spannend fand ich', e.exciting);
      text('Gelernt habe ich', e.learned);
      text('Notizen', e.notes);
      text('Fazit des Tages', fz);
      if (photos.length) c.push({ t: photos.length === 1 ? '1 Foto' : photos.length + ' Fotos', img: photos });
      if (!c.length) return;                     // leere Tage weglassen
      const date = e.date || App.store.dayDate(i);
      days.push({ t: d + (date ? ' · ' + App.ui.formatDate(date) : ''), a: e.area || '', c });
    });

    const branches = days.slice();
    const games = App.store.GAMES.filter(k => s.games[k].plays)
      .map(k => ({ t: App.games[k].title + ': ' + s.games[k].bestPct + ' %' }));
    if (games.length) branches.push({ t: 'Minispiele', a: 'spiele', c: games });
    const badges = App.badges.LIST.filter(b => s.badges[b.id]).map(b => ({ t: b.name }));
    if (badges.length) branches.push({ t: 'Abzeichen', a: 'badges', c: badges });
    const qs = s.questions.map(q => ({ t: (q.done ? '✓ ' : '? ') + q.text }));
    if (qs.length) branches.push({ t: 'Meine Fragen', a: 'fragen', c: qs });

    const start = s.startDate ? App.ui.formatDate(s.startDate, true) : '';
    return { t: 'Meine Praktikumswoche' + (s.name ? ' – ' + s.name : ''), sub: start ? 'ab ' + start : '', c: branches };
  }

  /* ---------- Link-Format: JSON → deflate → base64url ---------- */
  function stripPhotos(n) {
    const out = { t: n.t };
    if (n.sub) out.sub = n.sub;
    if (n.a) out.a = n.a;
    if (n.c) out.c = n.c.map(stripPhotos);
    return out;
  }
  const b64url = bytes => {
    let bin = '';
    for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  };
  const unb64url = str => {
    const bin = atob(str.replace(/-/g, '+').replace(/_/g, '/'));
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  };
  async function pipe(bytes, stream) {
    const res = new Response(new Blob([bytes]).stream().pipeThrough(stream));
    return new Uint8Array(await res.arrayBuffer());
  }

  /** Erstes Zeichen: z = komprimiert, j = nur Base64 (für Browser ohne CompressionStream) */
  async function encode(tree) {
    const raw = new TextEncoder().encode(JSON.stringify(stripPhotos(tree)));
    if (window.CompressionStream) return 'z' + b64url(await pipe(raw, new CompressionStream('deflate-raw')));
    return 'j' + b64url(raw);
  }
  async function decode(str) {
    const kind = str[0];
    let bytes = unb64url(str.slice(1));
    if (kind === 'z') bytes = await pipe(bytes, new DecompressionStream('deflate-raw'));
    else if (kind !== 'j') throw new Error('Unbekanntes Format');
    const tree = JSON.parse(new TextDecoder().decode(bytes));
    if (!tree || typeof tree.t !== 'string') throw new Error('Kein Mindmap-Link');
    return tree;
  }

  /* ---------- XMind-Datei ---------- */
  let idN = 0;
  const id = () => 'einblick' + Date.now().toString(36) + (idN++).toString(36);

  /** Lange Texte für XMind in Zeilen umbrechen (sonst wird ein Zweig sehr breit) */
  function wrap(text, max) {
    return text.split('\n').map(line => {
      const words = line.split(' ');
      const out = [];
      let cur = '';
      words.forEach(w => {
        if (cur && (cur + ' ' + w).length > max) { out.push(cur); cur = w; } else cur = cur ? cur + ' ' + w : w;
      });
      out.push(cur);
      return out.join('\n');
    }).join('\n');
  }

  function imageSize(src) {
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => resolve([img.naturalWidth, img.naturalHeight]);
      img.onerror = () => resolve([4, 3]);
      img.src = src;
    });
  }

  async function xmind(tree) {
    const files = [];                       // [Name, Bytes]
    const enc = new TextEncoder();

    async function topic(n) {
      const t = { id: id(), class: 'topic', title: wrap(n.t, 42) };
      const kids = [];
      for (const k of n.c || []) kids.push(await topic(k));
      for (const src of n.img || []) {
        const name = 'resources/' + id() + '.jpg';
        files.push([name, unb64url(src.split(',')[1])]);
        const [w, h] = await imageSize(src);
        const scale = Math.min(1, 240 / Math.max(w, h));
        kids.push({ id: id(), class: 'topic', title: ' ', image: { src: 'xap:' + name, width: Math.round(w * scale), height: Math.round(h * scale) } });
      }
      if (kids.length) t.children = { attached: kids };
      return t;
    }

    const root = await topic({ t: tree.t + (tree.sub ? '\n' + tree.sub : ''), c: tree.c });
    root.structureClass = 'org.xmind.ui.map.clockwise';
    const content = [{ id: id(), class: 'sheet', title: 'Praktikumswoche', rootTopic: root, topicPositioning: 'fixed' }];
    const manifest = { 'file-entries': { 'content.json': {}, 'metadata.json': {} } };
    files.forEach(([name]) => { manifest['file-entries'][name] = {}; });

    return zip([
      ['content.json', enc.encode(JSON.stringify(content))],
      ['metadata.json', enc.encode(JSON.stringify({ creator: { name: 'Einblick', version: '2.3' } }))],
      ['manifest.json', enc.encode(JSON.stringify(manifest))],
      ...files
    ]);
  }

  /* ---------- Minimaler ZIP-Packer (ohne Komprimierung, reicht für XMind) ---------- */
  const CRC = (() => {
    const t = new Uint32Array(256);
    for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; }
    return t;
  })();
  function crc32(bytes) {
    let c = 0xFFFFFFFF;
    for (let i = 0; i < bytes.length; i++) c = CRC[(c ^ bytes[i]) & 0xFF] ^ (c >>> 8);
    return (c ^ 0xFFFFFFFF) >>> 0;
  }

  function zip(entries) {
    const enc = new TextEncoder();
    const now = new Date();
    const time = (now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1);
    const date = ((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate();
    const parts = [], central = [];
    let offset = 0;
    entries.forEach(([name, data]) => {
      const nameB = enc.encode(name);
      const crc = crc32(data);
      const local = new DataView(new ArrayBuffer(30));
      local.setUint32(0, 0x04034b50, true);
      local.setUint16(4, 20, true);
      local.setUint16(6, 0x0800, true);       // Dateinamen in UTF-8
      local.setUint16(8, 0, true);            // gespeichert, nicht komprimiert
      local.setUint16(10, time, true);
      local.setUint16(12, date, true);
      local.setUint32(14, crc, true);
      local.setUint32(18, data.length, true);
      local.setUint32(22, data.length, true);
      local.setUint16(26, nameB.length, true);
      parts.push(local, nameB, data);

      const cen = new DataView(new ArrayBuffer(46));
      cen.setUint32(0, 0x02014b50, true);
      cen.setUint16(4, 20, true);
      cen.setUint16(6, 20, true);
      cen.setUint16(8, 0x0800, true);
      cen.setUint16(12, time, true);
      cen.setUint16(14, date, true);
      cen.setUint32(16, crc, true);
      cen.setUint32(20, data.length, true);
      cen.setUint32(24, data.length, true);
      cen.setUint16(28, nameB.length, true);
      cen.setUint32(42, offset, true);
      central.push(cen, nameB);
      offset += 30 + nameB.length + data.length;
    });
    const cenSize = central.reduce((n, p) => n + p.byteLength, 0);
    const end = new DataView(new ArrayBuffer(22));
    end.setUint32(0, 0x06054b50, true);
    end.setUint16(8, entries.length, true);
    end.setUint16(10, entries.length, true);
    end.setUint32(12, cenSize, true);
    end.setUint32(16, offset, true);
    return new Blob([...parts, ...central, end], { type: 'application/vnd.xmind.workbook' });
  }

  /* ---------- Eigene Mindmap als Bild ---------- */

  // Farben für hellen Hintergrund (etwas kräftiger als in der dunklen App, damit sie gedruckt gut aussehen)
  const COLORS = { it: '#3B76F0', synchro: '#7C5CF0', schnitt: '#D98A0B', tonregie: '#DB4F96', anderes: '#64708A',
    spiele: '#109C7E', badges: '#C2740A', fragen: '#4B5A75', '': '#7C5CF0' };
  const FONT = "Outfit, 'Segoe UI', system-ui, sans-serif";
  // Aussehen je Ebene: 0 = Mitte, 1 = Tag, 2 = Überschrift, 3 = Text
  const LEVEL = [
    { size: 30, weight: 700, maxW: 360, padX: 30, padY: 22 },
    { size: 21, weight: 700, maxW: 240, padX: 18, padY: 12 },
    { size: 16.5, weight: 600, maxW: 240, padX: 13, padY: 8 },
    { size: 15.5, weight: 400, maxW: 300, padX: 14, padY: 9 }
  ];
  const GAP_X = [0, 80, 48, 40];   // Abstand zur Elternkarte
  const GAP_Y = 14;
  const THUMB = 86;

  /** Text in Zeilen umbrechen, die höchstens maxW Pixel breit sind */
  function lines(ctx, text, maxW) {
    const out = [];
    text.split('\n').forEach(par => {
      let cur = '';
      par.split(' ').forEach(word => {
        // sehr lange Wörter notfalls zerteilen
        while (ctx.measureText(word).width > maxW) {
          let n = word.length;
          while (n > 1 && ctx.measureText(word.slice(0, n)).width > maxW) n--;
          if (cur) { out.push(cur); cur = ''; }
          out.push(word.slice(0, n));
          word = word.slice(n);
        }
        const test = cur ? cur + ' ' + word : word;
        if (cur && ctx.measureText(test).width > maxW) { out.push(cur); cur = word; } else cur = test;
      });
      out.push(cur);
    });
    return out;
  }

  const loadImg = src => new Promise(resolve => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });

  /** Größe jeder Karte und Höhe jedes Teilbaums bestimmen */
  async function measure(ctx, n, depth, color) {
    const L = LEVEL[Math.min(depth, 3)];
    ctx.font = L.weight + ' ' + L.size + 'px ' + FONT;
    const ls = lines(ctx, n.t, L.maxW);
    const lh = Math.round(L.size * 1.3);
    let w = Math.max(...ls.map(l => ctx.measureText(l).width));
    let h = ls.length * lh;
    const subLine = depth === 0 && n.sub ? n.sub : '';
    if (subLine) {
      ctx.font = '400 17px ' + FONT;
      w = Math.max(w, ctx.measureText(subLine).width);
      h += 26;
    }
    const imgs = (await Promise.all((n.img || []).map(loadImg))).filter(Boolean);
    const textH = h;
    if (imgs.length) {
      const cols = Math.min(3, imgs.length), rows = Math.ceil(imgs.length / 3);
      w = Math.max(w, cols * THUMB + (cols - 1) * 6);
      h += 10 + rows * THUMB + (rows - 1) * 6;
    }
    const node = { ls, lh, L, depth, color, subLine, imgs, textH, w: Math.ceil(w) + 2 * L.padX, h: h + 2 * L.padY, kids: [] };
    for (const k of n.c || []) node.kids.push(await measure(ctx, k, depth + 1, depth === 0 ? (COLORS[k.a] || COLORS['']) : color));
    node.kidsH = node.kids.reduce((s, k) => s + k.sub, 0) + Math.max(0, node.kids.length - 1) * GAP_Y;
    node.sub = Math.max(node.h, node.kidsH);
    return node;
  }

  /** Teilbaum platzieren: dir = 1 nach rechts, -1 nach links; edge = Kante zur Elternkarte */
  function place(node, edge, top, dir) {
    node.dir = dir;
    node.x = dir > 0 ? edge : edge - node.w;
    node.y = top + (node.sub - node.h) / 2;
    let y = top + (node.sub - node.kidsH) / 2;
    node.kids.forEach(k => {
      const gap = GAP_X[Math.min(k.depth, 3)];
      place(k, dir > 0 ? node.x + node.w + gap : node.x - gap, y, dir);
      y += k.sub + GAP_Y;
    });
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
  const tint = (hex, a) => hex + Math.round(a * 255).toString(16).padStart(2, '0');
  // helle Akzentfarben (Gelb/Orange) bekommen dunkle Schrift
  const darkText = hex => { const v = parseInt(hex.slice(1), 16); return (0.299 * (v >> 16) + 0.587 * (v >> 8 & 255) + 0.114 * (v & 255)) > 150; };

  /** Geschwungene Linien von jeder Karte zu ihren Unterpunkten */
  function drawLinks(ctx, node) {
    node.kids.forEach(k => {
      const sx = k.dir > 0 ? node.x + node.w : node.x;
      const sy = node.y + (node.imgs.length ? node.L.padY + node.textH / 2 : node.h / 2);
      const ex = k.dir > 0 ? k.x : k.x + k.w;
      const ey = k.y + k.h / 2;
      const mx = (sx + ex) / 2;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.bezierCurveTo(mx, sy, mx, ey, ex, ey);
      ctx.strokeStyle = tint(k.color, node.depth === 0 ? 0.9 : 0.7);
      ctx.lineWidth = node.depth === 0 ? 5 : node.depth === 1 ? 3 : 2;
      ctx.lineCap = 'round';
      ctx.stroke();
      drawLinks(ctx, k);
    });
  }

  function drawNode(ctx, n) {
    const { L } = n;
    const r = n.depth === 0 ? 26 : n.depth === 1 ? 18 : 12;
    ctx.save();
    roundRect(ctx, n.x, n.y, n.w, n.h, r);
    if (n.depth === 0) {
      const g = ctx.createLinearGradient(n.x, n.y, n.x + n.w, n.y + n.h);
      g.addColorStop(0, '#8B78FF'); g.addColorStop(1, '#5B8CFF');
      ctx.shadowColor = 'rgba(91, 108, 255, .35)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 10;
      ctx.fillStyle = g; ctx.fill();
    } else if (n.depth === 1) {
      ctx.shadowColor = tint(n.color, 0.35); ctx.shadowBlur = 18; ctx.shadowOffsetY = 6;
      ctx.fillStyle = n.color; ctx.fill();
    } else if (n.depth === 2) {
      ctx.fillStyle = '#FFFFFF'; ctx.fill();
      ctx.fillStyle = tint(n.color, 0.12); ctx.fill();
      ctx.lineWidth = 2; ctx.strokeStyle = n.color; ctx.stroke();
    } else {
      ctx.fillStyle = '#FFFFFF'; ctx.fill();
      ctx.lineWidth = 1.5; ctx.strokeStyle = '#E2E5EE'; ctx.stroke();
    }
    ctx.restore();

    ctx.fillStyle = n.depth === 0 ? '#FFFFFF' : n.depth === 1 ? (darkText(n.color) ? '#231A05' : '#FFFFFF') : n.depth === 2 ? '#1E2433' : '#3A4256';
    ctx.font = L.weight + ' ' + L.size + 'px ' + FONT;
    ctx.textBaseline = 'top';
    ctx.textAlign = n.depth <= 1 ? 'center' : 'left';
    const tx = n.depth <= 1 ? n.x + n.w / 2 : n.x + L.padX;
    let y = n.y + L.padY + (n.lh - L.size) / 2;
    n.ls.forEach(l => { ctx.fillText(l, tx, y); y += n.lh; });
    if (n.subLine) {
      ctx.font = '400 17px ' + FONT; ctx.globalAlpha = 0.85;
      ctx.fillText(n.subLine, tx, y + 6); ctx.globalAlpha = 1;
    }
    // Fotos als kleine Kacheln (zugeschnitten wie object-fit: cover)
    n.imgs.forEach((img, i) => {
      const cx = n.x + L.padX + (i % 3) * (THUMB + 6);
      const cy = n.y + L.padY + n.textH + 10 + Math.floor(i / 3) * (THUMB + 6);
      const s = Math.min(img.naturalWidth, img.naturalHeight);
      ctx.save();
      roundRect(ctx, cx, cy, THUMB, THUMB, 10); ctx.clip();
      ctx.drawImage(img, (img.naturalWidth - s) / 2, (img.naturalHeight - s) / 2, s, s, cx, cy, THUMB, THUMB);
      ctx.restore();
    });
    n.kids.forEach(k => drawNode(ctx, k));
  }

  async function image(tree) {
    try { await Promise.all(['400', '600', '700'].map(w => document.fonts.load(w + ' 20px Outfit'))); } catch (e) { /* offline: Systemschrift */ }
    const root = await measure(document.createElement('canvas').getContext('2d'), tree, 0, COLORS['']);

    // Zweige auf rechts und links verteilen, so dass beide Seiten etwa gleich hoch sind.
    // Rechts von oben nach unten, links von unten nach oben → liest sich im Uhrzeigersinn.
    const kids = root.kids;
    const total = kids.reduce((s, k) => s + k.sub, 0);
    let split = kids.length, acc = 0, best = Infinity;
    for (let i = 0; i <= kids.length; i++) {
      const diff = Math.abs(total - 2 * acc);
      if (diff < best) { best = diff; split = i; }
      if (i < kids.length) acc += kids[i].sub;
    }
    if (kids.length === 1) split = 1;
    const right = kids.slice(0, split), left = kids.slice(split).reverse();
    const gapY = GAP_Y * 2;
    const height = side => side.reduce((s, k) => s + k.sub, 0) + Math.max(0, side.length - 1) * gapY;

    root.x = -root.w / 2; root.y = -root.h / 2;
    [[right, 1], [left, -1]].forEach(([side, dir]) => {
      let y = -height(side) / 2;
      side.forEach(k => {
        place(k, dir > 0 ? root.w / 2 + GAP_X[1] : -root.w / 2 - GAP_X[1], y, dir);
        y += k.sub + gapY;
      });
    });

    // Gesamtgröße bestimmen
    let minX = root.x, maxX = root.x + root.w, minY = root.y, maxY = root.y + root.h;
    (function bounds(n) {
      n.kids.forEach(k => {
        minX = Math.min(minX, k.x); maxX = Math.max(maxX, k.x + k.w);
        minY = Math.min(minY, k.y); maxY = Math.max(maxY, k.y + k.h);
        bounds(k);
      });
    })(root);
    const M = 60, W = maxX - minX + 2 * M, H = maxY - minY + 2 * M + 30;
    // doppelt scharf, aber nicht größer als Browser erlauben (ca. 16 Mio. Pixel, max. 16000 px Kante)
    const scale = Math.min(2, Math.sqrt(16e6 / (W * H)), 16000 / Math.max(W, H));

    const c = document.createElement('canvas');
    c.width = Math.round(W * scale);
    c.height = Math.round(H * scale);
    const ctx = c.getContext('2d');
    ctx.scale(scale, scale);
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#F8F9FD'); bg.addColorStop(1, '#EEF1FA');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
    ctx.translate(M - minX, M - minY);
    drawLinks(ctx, root);
    drawNode(ctx, root);
    ctx.font = '400 14px ' + FONT; ctx.fillStyle = '#8A93AB'; ctx.textAlign = 'right'; ctx.textBaseline = 'alphabetic';
    ctx.fillText('Erstellt mit Einblick · ' + App.ui.formatDate(App.store.toISO(new Date()), true), maxX, maxY + 44);
    c.dataset.scale = scale;
    return c;
  }

  /** Dateiname wie einblick-mindmap-finn-2026-11-06.png */
  function fileName(tree, ext) {
    const m = tree.t.match(/–\s*(.+)$/);
    const name = m ? m[1].toLowerCase().replace(/[^a-z0-9äöüß]+/g, '-').replace(/^-|-$/g, '') : '';
    return 'einblick-mindmap-' + (name ? name + '-' : '') + App.store.toISO(new Date()) + '.' + ext;
  }

  App.mindmap = { build, encode, decode, image, xmind, fileName };
})(window.App);
