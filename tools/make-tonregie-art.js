/*
 * make-tonregie-art.js – zeichnet die Illustration für „Live-Mix“ (Mischpult in Schrägansicht)
 * als SVG im Stil der anderen Spielbilder: dunkler Grund, Glanz, leuchtender Ring.
 * Aufruf: node tools/make-tonregie-art.js  → schreibt tools/tonregie-art.svg
 * Das PNG (img/games/tonregie.png, 192×192) wird daraus im Browser gerendert.
 */
const fs = require('fs');
const path = require('path');

const ROSE = '#F472B6';
// Pult-Oberseite als Parallelogramm: vorne links A, Breite W (nach rechts oben), Tiefe D (nach hinten)
const A = [40, 140], W = [128, -32], D = [-16, -56];
const P = (u, v) => [A[0] + W[0] * u + D[0] * v, A[1] + W[1] * u + D[1] * v];   // u = Breite 0..1, v = Tiefe 0..1
const pts = arr => arr.map(p => p.map(n => n.toFixed(1)).join(',')).join(' ');
const H = 20;   // Höhe der Vorderkante

const top = [P(0, 0), P(1, 0), P(1, 1), P(0, 1)];
const front = [P(0, 0), P(1, 0), [P(1, 0)[0], P(1, 0)[1] + H], [P(0, 0)[0], P(0, 0)[1] + H]];
const side = [P(0, 0), P(0, 1), [P(0, 1)[0], P(0, 1)[1] + H], [P(0, 0)[0], P(0, 0)[1] + H]];

// 5 Fader: Position entlang der Breite, Stellung (0 = zu, 1 = auf), leuchtend?
const faders = [[.14, .2, false], [.31, .78, true], [.48, .35, false], [.65, .9, true], [.82, .15, false]];
let fx = '';
for (const [u, pos, lit] of faders) {
  const a = P(u, .12), b = P(u, .62);
  fx += `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="#0B0D15" stroke-width="4.6" stroke-linecap="round"/>`;
  const k = P(u, .12 + .5 * pos);
  fx += `<rect x="${(k[0] - 9).toFixed(1)}" y="${(k[1] - 4.5).toFixed(1)}" width="18" height="9" rx="2.2" transform="rotate(-14 ${k[0].toFixed(1)} ${k[1].toFixed(1)})" fill="${lit ? 'url(#knobLit)' : 'url(#knob)'}"${lit ? ' filter="url(#glow)"' : ''}/>`;
  // LED-Pegelanzeige hinter jedem Fader
  for (let s = 0; s < 4; s++) {
    const c = P(u, .72 + s * .07);
    const on = lit ? s < 4 : s < 1;
    const col = s < 2 ? '#2DD4AE' : s < 3 ? '#F5B83D' : '#FF5D6C';
    fx += `<circle cx="${c[0].toFixed(1)}" cy="${c[1].toFixed(1)}" r="2.3" fill="${on ? col : '#2A2E40'}"${on ? ' filter="url(#glow)"' : ''}/>`;
  }
}
// Drehregler-Reihe vorne
let knobs = '';
for (const u of [.14, .31, .48, .65, .82]) {
  const c = P(u, .04);
  knobs += `<circle cx="${c[0].toFixed(1)}" cy="${(c[1] + 1).toFixed(1)}" r="3.2" fill="#8A91AB"/>`;
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="192" height="192" viewBox="0 0 192 192">
  <defs>
    <radialGradient id="bg" cx="0" cy="96" r="190" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${ROSE}" stop-opacity=".32"/><stop offset=".55" stop-color="${ROSE}" stop-opacity="0"/></radialGradient>
    <linearGradient id="topG" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#3B4058"/><stop offset=".55" stop-color="#555B78"/><stop offset="1" stop-color="#2F3349"/></linearGradient>
    <linearGradient id="frontG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2A2E42"/><stop offset="1" stop-color="#14161F"/></linearGradient>
    <linearGradient id="knob" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C9CEDD"/><stop offset="1" stop-color="#6E768C"/></linearGradient>
    <linearGradient id="knobLit" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFE0F0"/><stop offset="1" stop-color="${ROSE}"/></linearGradient>
    <linearGradient id="ring" x1="0" x2="1"><stop offset="0" stop-color="${ROSE}" stop-opacity="0"/><stop offset=".3" stop-color="${ROSE}"/><stop offset=".75" stop-color="#FFC4E1"/><stop offset="1" stop-color="${ROSE}" stop-opacity="0"/></linearGradient>
    <filter id="glow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="1.6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <filter id="soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6"/></filter>
  </defs>
  <rect width="192" height="192" fill="#12141F"/>
  <rect width="192" height="192" fill="url(#bg)"/>
  <!-- Leuchtring unter dem Pult -->
  <ellipse cx="100" cy="150" rx="84" ry="19" fill="none" stroke="${ROSE}" stroke-opacity=".35" stroke-width="6" filter="url(#soft)"/>
  <ellipse cx="100" cy="150" rx="82" ry="18" fill="none" stroke="url(#ring)" stroke-width="1.6" filter="url(#glow)"/>
  <ellipse cx="100" cy="158" rx="66" ry="10" fill="#000" opacity=".45" filter="url(#soft)"/>
  <!-- Pult -->
  <polygon points="${pts(side)}" fill="#1B1E2C"/>
  <polygon points="${pts(front)}" fill="url(#frontG)"/>
  <polygon points="${pts(top)}" fill="url(#topG)" stroke="#6E7594" stroke-width=".8"/>
  <line x1="${P(0, 0)[0]}" y1="${P(0, 0)[1]}" x2="${P(1, 0)[0]}" y2="${P(1, 0)[1]}" stroke="#9BA2C0" stroke-width="1" opacity=".7"/>
  ${knobs}
  ${fx}
  <!-- ON-AIR-Lämpchen -->
  <circle cx="${P(.95, .95)[0].toFixed(1)}" cy="${(P(.95, .95)[1] - 6).toFixed(1)}" r="4" fill="#FF3B55" filter="url(#glow)"/>
</svg>
`;
fs.writeFileSync(path.join(__dirname, 'tonregie-art.svg'), svg);
console.log('tools/tonregie-art.svg geschrieben');
