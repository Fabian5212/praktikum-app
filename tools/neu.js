/*
 * neu.js – legt einen neuen Bereich, ein Quiz oder ein Spiel aus einer Vorlage an
 * und trägt es gleich in js/config.js ein.
 *
 *   npm run neu -- bereich kamera "Kamera"
 *   npm run neu -- quiz kamera-quiz kamera "Kamera-Check"
 *   npm run neu -- spiel bildmischer kamera "Bildmischer"
 *
 * Die Vorlagen liegen in tools/vorlagen/. Danach die neue Datei mit Inhalt füllen und npm run check ausführen.
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const [kind, id, ...rest] = process.argv.slice(2);
const fail = m => { console.error(m); process.exit(1); };
const USAGE = 'So geht\'s:\n' +
  '  npm run neu -- bereich <id> "Name"\n' +
  '  npm run neu -- quiz <id> <bereich> "Titel"\n' +
  '  npm run neu -- spiel <id> <bereich> "Titel"';

if (!['bereich', 'quiz', 'spiel'].includes(kind) || !id) fail(USAGE);
if (!/^[a-z][a-z0-9-]*$/.test(id)) fail('Die id „' + id + '“ geht nicht: nur Kleinbuchstaben a–z, Ziffern und -, am Anfang ein Buchstabe.');
const area = kind === 'bereich' ? '' : rest[0];
const name = (kind === 'bereich' ? rest[0] : rest[1]) || id;
if (kind !== 'bereich' && !area) fail(USAGE);

const cfgFile = path.join(ROOT, 'js', 'config.js');
let cfg = fs.readFileSync(cfgFile, 'utf8');
const nl = cfg.includes('\r\n') ? '\r\n' : '\n';

const target = kind === 'bereich' ? 'bereiche/' + id + '.js' : 'games/' + id + '.js';
if (fs.existsSync(path.join(ROOT, target))) fail(target + ' gibt es schon.');
if (kind !== 'bereich' && !new RegExp("^\\s+'" + area + "',?\\s*$", 'm').test(cfg)) {
  console.warn('Hinweis: Den Bereich „' + area + '“ gibt es noch nicht in js/config.js. Anlegen mit: npm run neu -- bereich ' + area + ' "Name"');
}

// Vorlage kopieren und Platzhalter ersetzen
const tpl = fs.readFileSync(path.join(__dirname, 'vorlagen', kind + '.js'), 'utf8');
const out = tpl.split('__ID__').join(id).split('__NAME__').join(name.replace(/'/g, '’')).split('__AREA__').join(area);
fs.mkdirSync(path.dirname(path.join(ROOT, target)), { recursive: true });
fs.writeFileSync(path.join(ROOT, target), out);

// In js/config.js eintragen: am Ende der Liste areas bzw. games
// (neue Bereiche vor „anderes“, damit der Sammelbereich am Schluss bleibt)
function append(listName, line) {
  const start = cfg.indexOf(listName + ': [');
  const end = cfg.indexOf(nl + '    ]', start);
  if (start < 0 || end < 0) fail('Die Liste ' + listName + ' in js/config.js wurde nicht gefunden – bitte von Hand eintragen: ' + line);
  const other = listName === 'areas' ? cfg.indexOf("      'anderes'", start) : -1;
  if (other > start && other < end) cfg = cfg.slice(0, other) + '      ' + line + ',' + nl + cfg.slice(other);
  else cfg = cfg.slice(0, end) + ',' + nl + '      ' + line + cfg.slice(end);
}
if (kind === 'bereich') {
  if (new RegExp("^\\s+'" + id + "',?\\s*$", 'm').test(cfg)) fail('„' + id + '“ steht schon in js/config.js.');
  append('areas', "'" + id + "'");
} else {
  if (cfg.includes("{ id: '" + id + "'")) fail('„' + id + '“ steht schon in js/config.js.');
  append('games', "{ id: '" + id + "', img: false }");
}
fs.writeFileSync(cfgFile, cfg);

console.log('Angelegt: ' + target);
console.log('Eingetragen in js/config.js');
console.log('\nNächste Schritte:');
console.log('  1. ' + target + ' mit Inhalt füllen');
if (kind !== 'bereich') console.log('     (eigenes Bild: img/games/' + id + '.png, 512×512, dann in js/config.js „img: false“ entfernen)');
console.log('  2. npm start → im Browser ansehen');
console.log('  3. npm run bump und npm run check');
