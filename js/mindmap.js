/*
 * mindmap.js – fasst die ganze Woche als Mindmap zusammen.
 *
 * build(state)  → Baum { t: Titel, a: Bereich (Farbe), c: [Kinder], img: [Fotos] }
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

  /** Dateiname wie einblick-mindmap-finn-2026-11-06.xmind */
  function fileName(tree) {
    const m = tree.t.match(/–\s*(.+)$/);
    const name = m ? m[1].toLowerCase().replace(/[^a-z0-9äöüß]+/g, '-').replace(/^-|-$/g, '') : '';
    return 'einblick-mindmap-' + (name ? name + '-' : '') + App.store.toISO(new Date()) + '.xmind';
  }

  App.mindmap = { build, encode, decode, xmind, fileName };
})(window.App);
