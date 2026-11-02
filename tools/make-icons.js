/*
 * make-icons.js – erzeugt Logo und App-Icons (SVG + PNG) ohne zusätzliche Pakete.
 * Aufruf im Projektordner:  node tools/make-icons.js
 *
 * Motiv: ein silbernes „A“ aus Dreieck und Pfeilen (zwei Flächen hell/dunkel → 3D-Wirkung)
 * auf dunklem Navy mit lila Lichtbogen. Die PNGs werden mit 4×4-Supersampling gezeichnet.
 */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const OUT = path.join(__dirname, '..', 'icons');

/* ---------- Logo als Polygone im Raum 0..100 ([Farbe, Punkte]) ---------- */
const LIGHT = [206, 212, 236], DARK = [118, 126, 168], MID = [164, 171, 206];
const LOGO = [
  [LIGHT, [[50, 6], [50, 34], [22, 88], [6, 88]]],     // großes Dreieck, linke Seite
  [DARK,  [[50, 6], [94, 88], [78, 88], [50, 34]]],    // rechte Seite
  [LIGHT, [[50, 46], [50, 62], [34, 74]]],              // Pfeil oben, links
  [MID,   [[50, 46], [66, 74], [50, 62]]],              // Pfeil oben, rechts
  [LIGHT, [[50, 68], [50, 82], [40, 92]]],              // Pfeil unten, links
  [MID,   [[50, 68], [60, 92], [50, 82]]]               // Pfeil unten, rechts
];

const svgPoly = (scale, dx, dy) => LOGO.map(([c, pts]) =>
  '<polygon fill="rgb(' + c + ')" points="' + pts.map(([x, y]) => (x * scale + dx).toFixed(1) + ',' + (y * scale + dy).toFixed(1)).join(' ') + '"/>').join('');

/* Punkt-im-Polygon (Ray-Casting) */
function inPoly(x, y, pts) {
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i], [xj, yj] = pts[j];
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

const BG_A = [30, 33, 52], BG_B = [11, 13, 21], ARC = [139, 120, 255];
const inRoundRect = (x, y, r) => {
  const cx = Math.min(Math.max(x, r), 512 - r), cy = Math.min(Math.max(y, r), 512 - r);
  return (x - cx) ** 2 + (y - cy) ** 2 <= r * r;
};

/** Farbe an Stelle (x, y) im Raum 0..512. opts.scale = Größe des Logos, opts.rounded = abgerundete Ecken */
function sample(x, y, opts) {
  if (opts.rounded && !inRoundRect(x, y, 112)) return null;
  const t = Math.min(1, Math.hypot(x - 120, y - 60) / 600);
  let col = BG_A.map((a, i) => a + (BG_B[i] - a) * t);
  // weicher lila Lichtbogen unten rechts
  const d = Math.abs(Math.hypot(x - 620, y - 700) - 430);
  if (d < 26) { const k = (1 - d / 26) ** 2 * .55; col = col.map((c, i) => c + (ARC[i] - c) * k); }
  // Logo (zentriert)
  const s = opts.scale, off = 256 - 50 * s;
  const lx = (x - off) / s, ly = (y - off - 4 * s) / s;
  for (const [c, pts] of LOGO) if (inPoly(lx, ly, pts)) col = c;
  return col;
}

function render(size, opts) {
  const px = Buffer.alloc(size * size * 4);
  const SS = 4;
  for (let py = 0; py < size; py++) {
    for (let pxl = 0; pxl < size; pxl++) {
      let r = 0, g = 0, b = 0, a = 0;
      for (let sy = 0; sy < SS; sy++) for (let sx = 0; sx < SS; sx++) {
        const c = sample((pxl + (sx + 0.5) / SS) * 512 / size, (py + (sy + 0.5) / SS) * 512 / size, opts);
        if (c) { r += c[0]; g += c[1]; b += c[2]; a++; }
      }
      const o = (py * size + pxl) * 4;
      if (a) { px[o] = r / a; px[o + 1] = g / a; px[o + 2] = b / a; }
      px[o + 3] = Math.round(a / (SS * SS) * 255);
    }
  }
  return encodePNG(size, px);
}

/* ---------- Minimaler PNG-Encoder ---------- */
const CRC = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; }
  return buf => { let c = 0xffffffff; for (const b of buf) c = t[(c ^ b) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
})();
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(CRC(td));
  return Buffer.concat([len, td, crc]);
}
function encodePNG(size, rgba) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 6;
  const raw = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y++) rgba.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4);
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
}

/* ---------- SVG-Dateien ---------- */
// Nur das Logo (für die Kopfzeile der App), transparent
const logoSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">' + svgPoly(1, 0, 0) + '</svg>\n';
// App-Icon (Browser-Tab, moderne Systeme)
const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs><radialGradient id="g" cx="120" cy="60" r="600" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="rgb(${BG_A})"/><stop offset="1" stop-color="rgb(${BG_B})"/></radialGradient></defs>
  <rect width="512" height="512" rx="112" fill="url(#g)"/>
  <circle cx="620" cy="700" r="430" fill="none" stroke="rgb(${ARC})" stroke-opacity=".45" stroke-width="16"/>
  ${svgPoly(3.2, 256 - 160, 256 - 160 + 13)}
</svg>
`;

fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, 'logo.svg'), logoSvg);
fs.writeFileSync(path.join(OUT, 'icon.svg'), iconSvg);
fs.writeFileSync(path.join(OUT, 'icon-192.png'), render(192, { rounded: true, scale: 3.2 }));
fs.writeFileSync(path.join(OUT, 'icon-512.png'), render(512, { rounded: true, scale: 3.2 }));
// maskable: randlos, Logo kleiner (sichere Zone)
fs.writeFileSync(path.join(OUT, 'icon-maskable-512.png'), render(512, { rounded: false, scale: 2.5 }));
// Apple: randlos, iOS rundet selbst ab
fs.writeFileSync(path.join(OUT, 'apple-touch-icon.png'), render(180, { rounded: false, scale: 2.9 }));
console.log('Logo und Icons erzeugt in', OUT);
