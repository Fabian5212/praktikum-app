/*
 * check.js – prüft die App vor dem Hochladen.   Aufruf: npm run check   (oder: node tools/check.js)
 *
 * - Sind alle Dateien aus js/config.js vorhanden?
 * - Haben alle Skripte gültiges JavaScript?
 * - Sind Bereiche, Spiele und Quiz-Fragen vollständig (id, Farbe, Antworten …)?
 * - Gibt es Dateien in bereiche/ oder games/, die nicht in js/config.js stehen?
 * - Wurde die Version erhöht, wenn sich App-Dateien geändert haben? (nur mit git)
 *
 * Fehler (✗) müssen behoben werden, Hinweise (!) sind nur Tipps. Braucht nur Node.js, keine Pakete.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const exists = f => fs.existsSync(path.join(ROOT, f));
const errors = [], hints = [];
const err = m => errors.push(m);
const hint = m => hints.push(m);
const isStr = x => typeof x === 'string' && x.trim() !== '';

/* ---------- Konfiguration ---------- */
function loadConfig(src) {
  const self = {};
  vm.runInNewContext(src, { self });
  return self.App.config;
}
let config;
try { config = loadConfig(read('js/config.js')); }
catch (e) { console.error('✗ js/config.js lässt sich nicht lesen: ' + e.message); process.exit(1); }

const ids = list => list.map(x => typeof x === 'string' ? x : x.id);
const dupes = list => list.filter((x, i) => list.indexOf(x) !== i);
dupes(config.areas).forEach(id => err('js/config.js: Bereich „' + id + '“ steht doppelt in areas.'));
dupes(ids(config.games)).forEach(id => err('js/config.js: Spiel „' + id + '“ steht doppelt in games.'));
config.areas.concat(ids(config.games)).forEach(id => {
  if (!/^[a-z][a-z0-9-]*$/.test(id)) err('js/config.js: „' + id + '“ ist keine gültige id (nur a–z, 0–9 und -, am Anfang ein Buchstabe).');
});

/* ---------- Dateien und Syntax ---------- */
config.files().filter(f => f !== './').forEach(f => { if (!exists(f)) err('Datei fehlt: ' + f + ' (steht in js/config.js)'); });

const jsFiles = config.scripts().concat('sw.js', 'js/config.js',
  fs.readdirSync(path.join(ROOT, 'tools')).filter(f => f.endsWith('.js')).map(f => 'tools/' + f));
jsFiles.filter(exists).forEach(f => {
  try { new vm.Script(read(f), { filename: f }); }
  catch (e) { err(f + ': JavaScript-Fehler – ' + e.message); }
});

/* ---------- Icons (aus js/ui.js) ---------- */
const ui = read('js/ui.js');
const iconBlock = ui.slice(ui.indexOf('const P = {'), ui.indexOf('};', ui.indexOf('const P = {')));
const ICONS = new Set([...iconBlock.matchAll(/^\s+([a-z0-9]+):/gm)].map(m => m[1]));
const checkIcon = (file, name) => {
  if (name && !ICONS.has(name)) hint(file + ': Icon „' + name + '“ gibt es nicht in js/ui.js – es wird „dots“ angezeigt (eigene Icons: App.ui.addIcons).');
};

/* ---------- Bereiche ---------- */
const glossary = [];
config.areas.forEach(id => {
  const f = 'bereiche/' + id + '.js';
  if (!exists(f)) return;
  const got = [];
  try { vm.runInNewContext(read(f), { App: { addArea: d => got.push(d) } }); }
  catch (e) { return err(f + ': ' + e.message); }
  if (got.length !== 1) return err(f + ': muss genau einmal App.addArea({...}) aufrufen.');
  const a = got[0];
  if (a.id !== id) err(f + ': id ist „' + a.id + '“, muss aber „' + id + '“ heißen (wie die Datei).');
  if (!isStr(a.label)) err(f + ': label fehlt.');
  if (!/^#[0-9a-fA-F]{6}$/.test(a.color || '')) err(f + ': color muss eine Farbe wie \'#4F8BFF\' sein.');
  if (a.short && a.short.length > 10) hint(f + ': short „' + a.short + '“ ist lang – auf dem Handy wird es eng (max. ~10 Zeichen).');
  if (!isStr(a.today)) hint(f + ': today fehlt (Satz auf der Startseite, wenn man an dem Tag dort ist).');
  checkIcon(f, a.icon);
  ['tasks', 'questions'].forEach(k => {
    if (a[k] !== undefined && !(Array.isArray(a[k]) && a[k].every(isStr))) err(f + ': ' + k + ' muss eine Liste von Texten sein.');
  });
  if (a.jobs !== undefined && !(Array.isArray(a.jobs) && a.jobs.every(j => j && isStr(j.name) && isStr(j.info)))) err(f + ': jobs braucht Einträge wie { name: \'…\', info: \'…\' }.');
  if ((a.tasks || a.jobs) && !isStr(a.intro)) err(f + ': Ohne intro erscheint der Bereich nicht unter „Wissen“ – intro ergänzen.');
  (a.glossary || []).forEach((g, i) => {
    if (!Array.isArray(g) || g.length !== 2 || !isStr(g[0]) || !isStr(g[1])) err(f + ': Wörterbuch-Eintrag ' + (i + 1) + ' muss [\'Begriff\', \'Erklärung\'] sein.');
    else glossary.push([g[0], f]);
  });
});
const seen = {};
glossary.forEach(([w, f]) => {
  const k = w.toLowerCase();
  if (seen[k]) hint('Begriff „' + w + '“ steht doppelt im Wörterbuch (' + seen[k] + ', ' + f + ').');
  seen[k] = seen[k] || f;
});

/* ---------- Spiele ---------- */
const badgeIds = [...read('js/badges.js').matchAll(/\{ id: '([^']+)'/g)].map(m => m[1]);
config.games.forEach(g => {
  const f = 'games/' + g.id + '.js';
  if (!exists(f)) return;
  const src = read(f);
  const quiz = src.includes('App.addQuiz(');
  if (!quiz && !src.includes('App.addGame(')) return err(f + ': ruft weder App.addGame({...}) noch App.addQuiz({...}) auf.');
  const id = (src.match(/App\.add(?:Game|Quiz)\(\{\s*id:\s*'([^']+)'/) || [])[1];
  if (id !== g.id) err(f + ': id im Spiel ist „' + id + '“, muss aber „' + g.id + '“ heißen (wie die Datei).');
  const area = (src.match(/area:\s*'([^']+)'/) || [])[1];
  if (area && !config.areas.includes(area)) hint(f + ': Bereich „' + area + '“ steht nicht in js/config.js – das Spiel bekommt die Standardfarbe.');
  (src.match(/icon:\s*'([^']+)'/g) || []).forEach(m => checkIcon(f, m.match(/'([^']+)'/)[1]));
  [...src.matchAll(/badges:\s*\[([\s\S]*?)\]\s*,?\s*\n/g)].forEach(m => badgeIds.push(...[...m[1].matchAll(/\{ id: '([^']+)'/g)].map(x => x[1])));

  if (quiz) {
    let def;
    try { vm.runInNewContext(src, { App: { addQuiz: d => { def = d; } } }); }
    catch (e) { return err(f + ': ' + e.message); }
    if (!isStr(def.title)) err(f + ': title fehlt.');
    const qs = def.questions || [];
    if (qs.length < 3) err(f + ': Ein Quiz braucht mindestens 3 Fragen.');
    qs.forEach((q, i) => {
      const n = f + ': Frage ' + (i + 1);
      if (!isStr(q.q) || !isStr(q.ok)) return err(n + ' braucht q (Frage) und ok (richtige Antwort).');
      if (!Array.isArray(q.wrong) || !q.wrong.length || !q.wrong.every(isStr)) err(n + ' braucht wrong: [mindestens eine falsche Antwort].');
      else if (q.wrong.includes(q.ok)) err(n + ': Die richtige Antwort steht auch bei wrong.');
      if (!isStr(q.why)) hint(n + ' hat keine Erklärung (why) – gerade die bringt beim Lernen am meisten.');
    });
    if (def.round > qs.length) hint(f + ': round (' + def.round + ') ist größer als die Zahl der Fragen (' + qs.length + ').');
    if (def.badge) badgeIds.push(def.id);
  }
});
dupes(badgeIds).forEach(id => err('Abzeichen-id „' + id + '“ gibt es mehrfach (js/badges.js oder games/).'));

/* ---------- Dateien, die nirgends eingetragen sind ---------- */
const used = new Set(config.files());
['bereiche', 'games', 'img/games'].forEach(dir => {
  if (!exists(dir)) return;
  fs.readdirSync(path.join(ROOT, dir)).forEach(f => {
    if (!used.has(dir + '/' + f)) hint(dir + '/' + f + ' wird nicht geladen – fehlt der Eintrag in js/config.js?');
  });
});

/* ---------- Version erhöht? ---------- */
(function versionCheck() {
  const base = process.env.CHECK_BASE || 'HEAD';
  const git = cmd => execSync('git ' + cmd, { cwd: ROOT, stdio: ['ignore', 'pipe', 'ignore'] }).toString();
  let changed, old;
  try {
    changed = (git('diff --name-only ' + base) + git('ls-files --others --exclude-standard')).split('\n').filter(Boolean);
    old = loadConfig(git('show ' + base + ':js/config.js')).version;
  } catch (e) { return; }   // kein git oder js/config.js gab es dort noch nicht
  const app = changed.filter(f => used.has(f) || f === 'sw.js' || f === 'index.html');
  if (app.length && old === config.version) {
    err('App-Dateien geändert (' + app.slice(0, 3).join(', ') + (app.length > 3 ? ' …' : '') + '), aber die Version ist noch ' + old +
      '. Bitte „npm run bump“ ausführen, sonst bekommen installierte Apps das Update nicht.');
  }
})();

/* ---------- Ergebnis ---------- */
hints.forEach(m => console.log('! ' + m));
errors.forEach(m => console.log('✗ ' + m));
console.log(errors.length
  ? '\n' + errors.length + ' Fehler gefunden.'
  : '\n✓ Alles in Ordnung (' + config.areas.length + ' Bereiche, ' + config.games.length + ' Spiele, ' + glossary.length + ' Begriffe, Version ' + config.version + ').');
process.exit(errors.length ? 1 : 0);
