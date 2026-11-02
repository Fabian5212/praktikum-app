/*
 * make-icons.js – erzeugt die App-Icons (SVG + PNG) ohne zusätzliche Pakete.
 * Aufruf im Projektordner:  node tools/make-icons.js
 *
 * Motiv: ein Auge („Einblick“) auf Indigo-Hintergrund.
 * Die PNGs werden Pixel für Pixel mit 4×4-Supersampling gezeichnet.
 */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const OUT = path.join(__dirname, '..', 'icons');

const C = {
  bgA: [75, 63, 224], bgB: [40, 36, 150],
  white: [255, 248, 238], iris: [255, 107, 74], pupil: [26, 29, 41], spark: [255, 190, 60]
};

/* ---------- Formen im Koordinatensystem 0..512 ---------- */
const inRoundRect = (x, y, r) => {
  const cx = Math.min(Math.max(x, r), 512 - r), cy = Math.min(Math.max(y, r), 512 - r);
  return (x - cx) ** 2 + (y - cy) ** 2 <= r * r;
};
const inCircle = (x, y, cx, cy, r) => (x - cx) ** 2 + (y - cy) ** 2 <= r * r;
// Mandelform des Auges: Schnittmenge zweier Kreise (Breite 320, Höhe 200)
const inEye = (x, y) => inCircle(x, y, 256, 334, 178) && inCircle(x, y, 256, 178, 178);
// kleiner Funken oben rechts (Raute)
const inSpark = (x, y) => Math.abs(x - 392) / 30 + Math.abs(y - 128) / 30 <= 1;

/** Farbe an Stelle (x, y). scale verkleinert das Motiv (für maskable Icons). */
function sample(x, y, opts) {
  if (opts.rounded && !inRoundRect(x, y, 112)) return null;
  const t = (x + y) / 1024;
  let col = C.bgA.map((a, i) => a + (C.bgB[i] - a) * t);
  // Motiv um die Mitte skalieren
  const s = opts.scale;
  const mx = 256 + (x - 256) / s, my = 256 + (y - 256) / s;
  if (inSpark(mx, my)) col = C.spark;
  if (inEye(mx, my)) {
    col = C.white;
    if (inCircle(mx, my, 256, 256, 66)) col = C.iris;
    if (inCircle(mx, my, 256, 256, 30)) col = C.pupil;
    if (inCircle(mx, my, 274, 236, 11)) col = C.white;
  }
  return col;
}

function render(size, opts) {
  const px = Buffer.alloc(size * size * 4);
  const SS = 4;
  for (let py = 0; py < size; py++) {
    for (let pxl = 0; pxl < size; pxl++) {
      let r = 0, g = 0, b = 0, a = 0;
      for (let sy = 0; sy < SS; sy++) for (let sx = 0; sx < SS; sx++) {
        const x = (pxl + (sx + 0.5) / SS) * 512 / size;
        const y = (py + (sy + 0.5) / SS) * 512 / size;
        const c = sample(x, y, opts);
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
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  const raw = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y++) { raw[y * (size * 4 + 1)] = 0; rgba.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4); }
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
}

/* ---------- SVG-Version (für Browser-Tab und moderne Systeme) ---------- */
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="rgb(${C.bgA})"/><stop offset="1" stop-color="rgb(${C.bgB})"/></linearGradient>
  <clipPath id="eye"><circle cx="256" cy="334" r="178"/></clipPath></defs>
  <rect width="512" height="512" rx="112" fill="url(#g)"/>
  <path d="M392 98l30 30-30 30-30-30z" fill="rgb(${C.spark})"/>
  <circle cx="256" cy="178" r="178" fill="rgb(${C.white})" clip-path="url(#eye)"/>
  <circle cx="256" cy="256" r="66" fill="rgb(${C.iris})"/>
  <circle cx="256" cy="256" r="30" fill="rgb(${C.pupil})"/>
  <circle cx="274" cy="236" r="11" fill="rgb(${C.white})"/>
</svg>
`;

fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, 'icon.svg'), svg);
fs.writeFileSync(path.join(OUT, 'icon-192.png'), render(192, { rounded: true, scale: 1 }));
fs.writeFileSync(path.join(OUT, 'icon-512.png'), render(512, { rounded: true, scale: 1 }));
// maskable: Hintergrund randlos, Motiv kleiner (sichere Zone)
fs.writeFileSync(path.join(OUT, 'icon-maskable-512.png'), render(512, { rounded: false, scale: 0.78 }));
// Apple: randlos, iOS rundet selbst ab
fs.writeFileSync(path.join(OUT, 'apple-touch-icon.png'), render(180, { rounded: false, scale: 0.9 }));
console.log('Icons erzeugt in', OUT);
