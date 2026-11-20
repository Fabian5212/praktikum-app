/*
 * bump.js – erhöht die Version in js/config.js.
 *   npm run bump            2.5.0 → 2.5.1   (kleine Änderung, Inhalte, Fehler behoben)
 *   npm run bump -- minor   2.5.1 → 2.6.0   (neues Spiel, neuer Bereich, neue Funktion)
 *   npm run bump -- major   2.6.0 → 3.0.0   (großer Umbau)
 * Erst mit neuer Version holen sich installierte Apps die geänderten Dateien.
 */
'use strict';
const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'js', 'config.js');
const src = fs.readFileSync(file, 'utf8');
const m = src.match(/version: '(\d+)\.(\d+)\.(\d+)'/);
if (!m) { console.error('In js/config.js wurde keine version wie \'1.2.3\' gefunden.'); process.exit(1); }

let [maj, min, pat] = m.slice(1).map(Number);
const kind = process.argv[2] || 'patch';
if (kind === 'major') { maj++; min = 0; pat = 0; }
else if (kind === 'minor') { min++; pat = 0; }
else if (kind === 'patch') pat++;
else { console.error('Unbekannt: „' + kind + '“ – erlaubt sind patch, minor oder major.'); process.exit(1); }

const next = maj + '.' + min + '.' + pat;
fs.writeFileSync(file, src.replace(m[0], "version: '" + next + "'"));
console.log('Version: ' + m.slice(1).join('.') + ' → ' + next);
