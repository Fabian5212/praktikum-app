/*
 * kabel.js – Minispiel „Kabel-Salat“ (Netzwerk)
 * Geräte werden durch Ziehen oder Antippen (erst Gerät A, dann Gerät B) verbunden.
 * Falsche Verbindungen werden sofort mit einem Tipp abgelehnt.
 * Gelöst ist ein Level, wenn alle Geräte über genau einen Weg mit dem Internet verbunden sind.
 */
(function (App) {
  'use strict';
  const { icon, esc } = App.ui;

  /* ---------- Gerätetypen mit Erklärung ---------- */
  const TYPES = {
    internet: { label: 'Internet',  icon: 'globe',   info: 'Das weltweite Netz aus Millionen Computern. Der Anschluss kommt meist über eine Leitung vom Internetanbieter.' },
    router:   { label: 'Router',    icon: 'router',  info: 'Das Tor zum Internet. Er verbindet das Firmennetz mit dem Internet und leitet Daten in die richtige Richtung.' },
    switch:   { label: 'Switch',    icon: 'switch',  info: 'Ein Verteiler mit vielen Anschlüssen. Er verbindet die Geräte im Gebäude miteinander – per Kabel.' },
    ap:       { label: 'WLAN-AP',   icon: 'ap',      info: 'Der WLAN-Access-Point funkt das WLAN. Er hängt per Kabel am Switch oder Router.' },
    pc:       { label: 'PC',        icon: 'monitor', info: 'Ein Arbeitsplatzrechner. Er bekommt sein Netzwerk per Kabel vom Switch.' },
    drucker:  { label: 'Drucker',   icon: 'printer', info: 'Netzwerkdrucker hängen am Switch, damit alle im Büro darauf drucken können.' },
    laptop:   { label: 'Laptop',    icon: 'laptop',  info: 'Hier verbindet sich der Laptop per WLAN mit dem Access-Point – ganz ohne Kabel.' },
    handy:    { label: 'Handy',     icon: 'phone',   info: 'Handys haben keinen Netzwerkanschluss, sie kommen nur über WLAN ins Netz.' },
    server:   { label: 'Server',    icon: 'server',  info: 'Stellt Dateien und Dienste für alle bereit. Er steht im Serverraum und hängt per Kabel am Switch.' }
  };
  const WIRELESS = ['laptop', 'handy'];
  const ENDPOINTS = ['pc', 'drucker', 'laptop', 'handy', 'server'];

  /* ---------- Level: [id, typ, x %, y %, optionales Label] ---------- */
  const LEVELS = [
    { title: 'Ab ins Internet', task: 'Der PC soll ins Internet. Verbinde die Geräte miteinander.',
      nodes: [['i', 'internet', 50, 12], ['r', 'router', 50, 50], ['p', 'pc', 50, 86]] },
    { title: 'Das kleine Büro', task: 'PC und Drucker sollen ins Netz. Tipp: Der Router hat hier nur einen freien Anschluss.',
      nodes: [['i', 'internet', 80, 12], ['r', 'router', 30, 22], ['s', 'switch', 60, 52], ['p', 'pc', 18, 84], ['d', 'drucker', 80, 84]] },
    { title: 'Kabellos', task: 'Jetzt kommt ein Laptop dazu – der hat kein Kabel, nur WLAN.',
      nodes: [['i', 'internet', 15, 10], ['r', 'router', 70, 16], ['s', 'switch', 30, 46], ['a', 'ap', 78, 54], ['p', 'pc', 15, 84], ['d', 'drucker', 46, 86], ['l', 'laptop', 82, 86]] },
    { title: 'Großraumbüro', task: 'Viele Geräte, ein Netzwerk. Jedes Gerät braucht genau einen Weg ins Internet.',
      nodes: [['p1', 'pc', 14, 14, 'PC 1'], ['i', 'internet', 86, 10], ['a', 'ap', 18, 50], ['r', 'router', 54, 30], ['s', 'switch', 62, 58],
              ['h', 'handy', 12, 86], ['p2', 'pc', 40, 86, 'PC 2'], ['sv', 'server', 88, 40], ['d', 'drucker', 80, 86], ['l', 'laptop', 36, 64]] },
    { title: 'Das ganze Studio', task: 'Zwei Etagen, zwei Switches. Tipp: Switches kann man auch untereinander verbinden.',
      nodes: [['s1', 'switch', 50, 34, 'Switch Büro'], ['i', 'internet', 14, 8], ['r', 'router', 82, 10], ['s2', 'switch', 30, 64, 'Switch Studio'],
              ['p1', 'pc', 10, 36, 'PC Büro'], ['sv', 'server', 86, 40], ['a', 'ap', 78, 68], ['p2', 'pc', 10, 88, 'PC Schnitt'],
              ['d', 'drucker', 40, 90], ['l', 'laptop', 88, 90], ['h', 'handy', 64, 86]] }
  ];
  const MAX_PER_LEVEL = 130;

  /* ---------- Regeln: welche Verbindungen ergeben Sinn? ---------- */
  function check(ta, tb, level) {
    const hasSwitch = level.nodes.some(n => n[1] === 'switch');
    const key = [ta, tb].sort().join('|');
    const ok = ['internet|router', 'router|switch', 'ap|router', 'ap|switch', 'switch|switch',
                'pc|switch', 'drucker|switch', 'server|switch', 'ap|laptop', 'ap|handy'];
    if (!hasSwitch) ok.push('pc|router', 'drucker|router');
    if (ok.includes(key)) return { ok: true };

    const has = t => ta === t || tb === t;
    if (has('internet')) return { msg: 'Ins Internet kommt man nur über den Router.' };
    if (WIRELESS.some(has)) return { msg: TYPES[WIRELESS.find(has)].label + ' hat hier kein Kabel – es braucht WLAN vom Access-Point.' };
    if (ENDPOINTS.includes(ta) && ENDPOINTS.includes(tb)) return { msg: 'Zwei Endgeräte direkt verbinden klappt nicht – dazwischen gehört ein Switch.' };
    if (has('router') && hasSwitch) return { msg: 'Der Router hat nur wenige Anschlüsse. Die Geräte kommen an den Switch.' };
    if (has('ap')) return { msg: 'Dieses Gerät hat kein WLAN – es braucht ein Kabel zum Switch.' };
    return { msg: 'Diese Verbindung ergibt keinen Sinn. Überleg: Wo bekommt das Gerät sein Netzwerk her?' };
  }

  /* ---------- Spielablauf ---------- */
  function render(el) {
    App.gameKit.intro(el, {
      title: 'Kabel-Salat', icon: 'network', area: 'it',
      lead: 'Jedes Netzwerk braucht die richtigen Verbindungen. Hier baust du eins von klein bis groß.',
      how: ['Zieh ein Gerät auf ein anderes – oder tippe nacheinander zwei Geräte an.',
            'Falsche Verbindungen werden abgelehnt und du bekommst einen Tipp.',
            'Tippst du zwei verbundene Geräte erneut an, wird das Kabel entfernt.',
            'Wenig Fehler und schnelles Lösen bringen mehr Punkte.'],
      learn: 'Was Router, Switch und WLAN-Access-Point machen und wie ein Netzwerk aufgebaut ist.',
      onStart: () => levelSelect(el)
    });
  }

  function levelSelect(el) {
    const st = App.store.get().games.kabel;
    el.innerHTML = '<div class="card"><h2 class="h3">Level wählen</h2><p class="muted">Gesamtpunkte: <b>' + st.best + '</b> / ' + LEVELS.length * MAX_PER_LEVEL + '</p>' +
      '<div class="level-grid">' + LEVELS.map((L, i) => {
        const locked = i > 0 && !st.levels[i - 1];
        return '<button class="level-btn' + (st.levels[i] ? ' done' : '') + '" data-l="' + i + '"' + (locked ? ' disabled' : '') + '>' +
          '<span class="lv-n">' + (locked ? icon('lock') : i + 1) + '</span><span class="lv-t">' + esc(L.title) + '</span>' +
          '<span class="lv-s">' + (st.levels[i] ? st.levels[i] + ' Pkt.' : locked ? 'gesperrt' : 'offen') + '</span></button>';
      }).join('') + '</div></div>';
    el.querySelectorAll('.level-btn').forEach(b => b.addEventListener('click', () => play(el, +b.dataset.l)));
  }

  function play(el, li) {
    const L = LEVELS[li];
    const nodes = {};
    L.nodes.forEach(n => { nodes[n[0]] = { id: n[0], type: n[1], x: n[2], y: n[3], label: n[4] || TYPES[n[1]].label }; });
    const needed = L.nodes.length - 1;      // ein Baum hat immer Knoten − 1 Kanten
    let links = [];                         // [idA, idB]
    let selected = null, mistakes = 0;
    const t0 = Date.now();

    el.innerHTML =
      '<div class="game-bar"><span class="chip">Level ' + (li + 1) + '/' + LEVELS.length + '</span>' +
      '<span class="chip" id="k-prog"></span><span class="chip warn" id="k-err">' + icon('x') + '0</span></div>' +
      '<p class="task">' + esc(L.task) + '</p>' +
      '<div class="kabel-board" id="k-board"><svg class="kabel-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"></svg>' +
      Object.values(nodes).map(n =>
        '<button class="knode t-' + n.type + '" data-id="' + n.id + '" style="left:' + n.x + '%;top:' + n.y + '%">' +
        icon(TYPES[n.type].icon) + '<span>' + esc(n.label) + '</span></button>').join('') + '</div>' +
      '<p class="hint" id="k-hint" role="status">Tipp: Fang beim Internet an.</p>' +
      '<div class="row gap"><button class="btn ghost" id="k-reset">' + icon('trash') + 'Kabel lösen</button>' +
      '<button class="btn ghost" id="k-levels">' + icon('list') + 'Level</button></div>';

    const board = el.querySelector('#k-board');
    const svg = board.querySelector('svg');
    const hint = el.querySelector('#k-hint');

    function say(msg, bad) {
      hint.textContent = msg;
      hint.classList.toggle('bad', !!bad);
    }

    function draw() {
      svg.innerHTML = links.map(([a, b]) => {
        const A = nodes[a], B = nodes[b];
        const wl = WIRELESS.includes(A.type) || WIRELESS.includes(B.type);
        return '<line x1="' + A.x + '" y1="' + A.y + '" x2="' + B.x + '" y2="' + B.y + '" class="' + (wl ? 'wl' : '') + '"/>';
      }).join('');
      el.querySelector('#k-prog').textContent = links.length + '/' + needed + ' Verbindungen';
      el.querySelector('#k-err').innerHTML = icon('x') + mistakes;
      board.querySelectorAll('.knode').forEach(b => {
        b.classList.toggle('sel', b.dataset.id === selected);
        b.classList.toggle('linked', links.some(l => l.includes(b.dataset.id)));
      });
    }

    /** Sind a und b schon (auch über Umwege) verbunden? → dann gäbe es eine Schleife */
    function connected(a, b) {
      const seen = new Set([a]), queue = [a];
      while (queue.length) {
        const cur = queue.shift();
        if (cur === b) return true;
        links.forEach(([x, y]) => {
          const nb = x === cur ? y : y === cur ? x : null;
          if (nb && !seen.has(nb)) { seen.add(nb); queue.push(nb); }
        });
      }
      return false;
    }

    function shake(id) {
      const b = board.querySelector('[data-id="' + id + '"]');
      b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake');
    }

    function link(a, b) {
      selected = null;
      if (a === b) { draw(); return; }
      const idx = links.findIndex(l => l.includes(a) && l.includes(b));
      if (idx >= 0) { links.splice(idx, 1); say('Kabel entfernt.'); draw(); return; }

      const res = check(nodes[a].type, nodes[b].type, L);
      if (!res.ok) { mistakes++; say(res.msg, true); shake(a); shake(b); draw(); return; }
      if (connected(a, b)) {
        mistakes++; say('Die beiden sind schon über einen anderen Weg verbunden. Jedes Gerät braucht genau einen Weg – sonst entsteht eine Schleife.', true);
        shake(b); draw(); return;
      }
      links.push([a, b]);
      const wl = WIRELESS.includes(nodes[a].type) || WIRELESS.includes(nodes[b].type);
      say(wl ? 'WLAN-Verbindung steht.' : 'Kabel steckt.');
      draw();
      if (links.length === needed) setTimeout(solved, 350);
    }

    function solved() {
      const secs = Math.round((Date.now() - t0) / 1000);
      const score = Math.max(20, 100 - mistakes * 15) + Math.max(0, 30 - Math.floor(secs / 3));
      let isBest = false;
      App.gameKit.save('kabel', g => {
        g.plays++;
        if (score > g.levels[li]) { g.levels[li] = score; isBest = true; }
        g.best = g.levels.reduce((x, y) => x + y, 0);
        g.bestPct = Math.round(g.best / (LEVELS.length * MAX_PER_LEVEL) * 100);
      });
      App.ui.confetti();
      const types = [...new Set(L.nodes.map(n => n[1]))];
      const last = li === LEVELS.length - 1;
      el.innerHTML = App.gameKit.resultHtml({
        title: last ? 'Alle Level geschafft!' : 'Level ' + (li + 1) + ' gelöst!',
        score, isBest, sub: secs + ' Sekunden · ' + mistakes + ' Fehler',
        learnTitle: 'Was machen diese Geräte?',
        learn: types.map(t => '<li><span class="li-ico">' + icon(TYPES[t].icon) + '</span><div><b>' + TYPES[t].label + '</b><br>' + esc(TYPES[t].info) + '</div></li>').join('')
      }) + '<div class="stack">' +
        (last ? '' : '<button class="btn primary" id="k-next">' + icon('next') + 'Nächstes Level</button>') +
        '<button class="btn ghost" id="k-again">' + icon('play') + 'Nochmal spielen</button>' +
        '<button class="btn ghost" id="k-sel">' + icon('list') + 'Levelübersicht</button></div>';
      const nx = el.querySelector('#k-next');
      nx && nx.addEventListener('click', () => play(el, li + 1));
      el.querySelector('#k-again').addEventListener('click', () => play(el, li));
      el.querySelector('#k-sel').addEventListener('click', () => levelSelect(el));
      el.scrollIntoView({ block: 'start' });
    }

    board.querySelectorAll('.knode').forEach(btn => {
      App.ui.draggable(btn, {
        dropSelector: '.knode',
        onDrop: target => link(btn.dataset.id, target.dataset.id),
        onTap: () => {
          const id = btn.dataset.id;
          if (!selected) { selected = id; say(nodes[id].label + ' gewählt – jetzt das Ziel antippen.'); draw(); }
          else link(selected, id);
        }
      });
    });
    el.querySelector('#k-reset').addEventListener('click', () => { links = []; selected = null; say('Alle Kabel gelöst.'); draw(); });
    el.querySelector('#k-levels').addEventListener('click', () => levelSelect(el));
    draw();
  }

  App.games.kabel = {
    id: 'kabel', title: 'Kabel-Salat', icon: 'network', area: 'it', topic: 'Netzwerk',
    teaser: 'Verbinde Router, Switch & Co. zu einem Netzwerk.',
    render,
    LEVELS, check   // für Tests und eigene Level
  };
})(window.App);
