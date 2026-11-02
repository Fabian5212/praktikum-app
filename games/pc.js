/*
 * pc.js – Minispiel „PC zusammenbauen“ (Hardware)
 * Bauteile aus der Kiste ins Gehäuse ziehen (oder antippen → Platz antippen).
 * Reihenfolge-Regeln über "needs": z. B. Kühler erst, wenn die CPU sitzt.
 */
(function (App) {
  'use strict';
  const { icon, esc, shuffle } = App.ui;

  /* Bauteile: slot = Ziel-Platz im Gehäuse, needs = was vorher drin sein muss */
  const PARTS = [
    { id: 'mainboard', name: 'Mainboard', slot: 'board', needs: [],
      info: 'Die Hauptplatine. Alle anderen Teile werden hier angeschlossen und tauschen darüber Daten aus.',
      hint: 'Das Mainboard ist die große Platine – alles andere wird darauf gesteckt. Es kommt zuerst ins Gehäuse.' },
    { id: 'cpu', name: 'Prozessor (CPU)', slot: 'socket', needs: ['mainboard'],
      info: 'Das „Gehirn“ des Computers. Er rechnet alles aus – Milliarden Schritte pro Sekunde.',
      hint: 'Die CPU sitzt im quadratischen Sockel auf dem Mainboard.' },
    { id: 'kuehler', name: 'CPU-Kühler', slot: 'socket', needs: ['cpu'],
      info: 'Die CPU wird beim Rechnen heiß. Der Kühler mit Lüfter führt die Wärme ab, sonst würde sie sich abschalten.',
      hint: 'Der Kühler kommt direkt auf die CPU – die muss also zuerst drin sein.' },
    { id: 'ram', name: 'Arbeitsspeicher (RAM)', slot: 'ram', needs: ['mainboard'],
      info: 'Das Kurzzeitgedächtnis. Hier liegen Programme, während du sie benutzt. Beim Ausschalten wird es gelöscht.',
      hint: 'RAM-Riegel kommen in die langen, schmalen Steckplätze neben dem CPU-Sockel.' },
    { id: 'ssd', name: 'SSD (M.2)', slot: 'm2', needs: ['mainboard'],
      info: 'Der Langzeitspeicher für Betriebssystem, Programme und Dateien. Bleibt auch ohne Strom erhalten.',
      hint: 'Eine M.2-SSD ist klein und flach – sie kommt in den kurzen Steckplatz unter dem Sockel.' },
    { id: 'gpu', name: 'Grafikkarte (GPU)', slot: 'pcie', needs: ['mainboard'],
      info: 'Berechnet die Bilder für den Monitor. Für Spiele und Videoschnitt besonders wichtig.',
      hint: 'Die Grafikkarte kommt in den langen PCIe-Steckplatz unten auf dem Mainboard.' },
    { id: 'netzteil', name: 'Netzteil', slot: 'psu', needs: [],
      info: 'Wandelt den Strom aus der Steckdose so um, dass alle Bauteile ihn nutzen können.',
      hint: 'Das Netzteil hat seinen eigenen Platz unten im Gehäuse.' }
  ];

  /* Plätze im Gehäuse in % der Fläche: [links, oben, breite, höhe, Beschriftung] */
  const SLOTS = {
    board:  [8, 6, 70, 66, 'Mainboard-Platz'],
    socket: [26, 14, 22, 17, 'CPU-Sockel'],
    ram:    [53, 12, 15, 24, 'RAM'],
    m2:     [22, 38, 30, 7, 'M.2'],
    pcie:   [12, 52, 62, 10, 'PCIe'],
    psu:    [8, 78, 50, 16, 'Netzteil']
  };
  const BOARD_SLOTS = ['socket', 'ram', 'm2', 'pcie'];

  function render(el) {
    App.gameKit.intro(el, {
      title: 'PC zusammenbauen', icon: 'cpu', area: 'it',
      lead: 'Jeder Computer besteht aus denselben Grundteilen. Bau deinen eigenen PC!',
      how: ['Zieh die Bauteile aus der Kiste an den richtigen Platz im Gehäuse.',
            'Oder: Bauteil antippen, dann den Platz antippen.',
            'Achte auf die Reihenfolge – manche Teile brauchen andere zuerst.',
            'Zu jedem eingebauten Teil erfährst du, was es macht.'],
      learn: 'Was die wichtigsten Bauteile eines Computers tun und wie sie zusammenspielen.',
      onStart: () => play(el)
    });
  }

  function play(el) {
    const placed = new Set();
    let mistakes = 0, selected = null;
    const t0 = Date.now();
    const order = shuffle(PARTS);

    el.innerHTML =
      '<div class="game-bar"><span class="chip" id="pc-step"></span><span class="chip warn" id="pc-err"></span></div>' +
      '<div class="pc-case" id="pc-case" aria-label="PC-Gehäuse">' +
        '<div class="pc-fan" aria-hidden="true"></div>' +
        Object.keys(SLOTS).map(k => {
          const s = SLOTS[k];
          return '<div class="pc-slot s-' + k + (BOARD_SLOTS.includes(k) ? ' on-board' : '') + '" data-slot="' + k + '" style="left:' + s[0] + '%;top:' + s[1] + '%;width:' + s[2] + '%;height:' + s[3] + '%">' +
            '<span class="slot-label">' + s[4] + '</span></div>';
        }).join('') +
      '</div>' +
      '<p class="hint" id="pc-hint" role="status">Fang mit dem größten Teil an.</p>' +
      '<div class="parts" id="pc-parts">' + order.map(p =>
        '<button class="part p-' + p.id + '" data-id="' + p.id + '"><span class="part-art" aria-hidden="true"></span><span>' + esc(p.name) + '</span></button>').join('') +
      '</div>' +
      '<div id="pc-info"></div>';

    const caseEl = el.querySelector('#pc-case');
    const hint = el.querySelector('#pc-hint');

    function update() {
      el.querySelector('#pc-step').textContent = placed.size + '/' + PARTS.length + ' eingebaut';
      el.querySelector('#pc-err').innerHTML = icon('x') + mistakes;
      caseEl.classList.toggle('has-board', placed.has('mainboard'));
      caseEl.classList.toggle('selecting', !!selected);
      el.querySelectorAll('.part').forEach(b => b.classList.toggle('sel', b.dataset.id === selected));
    }

    function say(msg, bad) { hint.textContent = msg; hint.classList.toggle('bad', !!bad); }

    function tryPlace(partId, slotKey) {
      selected = null;
      const part = PARTS.find(p => p.id === partId);
      const slotEl = caseEl.querySelector('[data-slot="' + slotKey + '"]');
      // Slots auf dem Mainboard gibt es erst, wenn das Mainboard drin ist
      if (BOARD_SLOTS.includes(slotKey) && !placed.has('mainboard')) {
        return fail('Hier ist noch nichts, worauf man etwas stecken kann. ' + PARTS[0].hint, slotEl);
      }
      if (part.slot !== slotKey) return fail('Da passt ' + part.name + ' nicht hin. ' + part.hint, slotEl);
      const missing = part.needs.find(n => !placed.has(n));
      if (missing) return fail('Noch nicht! ' + part.hint, slotEl);

      placed.add(partId);
      const btn = el.querySelector('.part[data-id="' + partId + '"]');
      btn.remove();
      const chip = document.createElement('div');
      chip.className = 'installed i-' + partId + ' pop';
      chip.innerHTML = '<span class="part-art"></span>';
      slotEl.appendChild(chip);
      slotEl.classList.add('filled');
      say(part.name + ' eingebaut!');
      el.querySelector('#pc-info').innerHTML = '<div class="feedback good pop"><b>' + esc(part.name) + '</b><p>' + esc(part.info) + '</p></div>';
      update();
      if (placed.size === PARTS.length) setTimeout(done, 500);
    }

    function fail(msg, slotEl) {
      mistakes++;
      say(msg, true);
      if (slotEl) { slotEl.classList.remove('shake'); void slotEl.offsetWidth; slotEl.classList.add('shake'); }
      update();
    }

    function done() {
      const secs = Math.round((Date.now() - t0) / 1000);
      const score = Math.max(50, 1000 - mistakes * 100 - secs * 2);
      const pct = Math.max(0, 100 - mistakes * 15);
      let isBest = false;
      App.gameKit.save('pc', g => {
        g.plays++;
        if (score > g.best) { g.best = score; isBest = true; }
        g.bestPct = Math.max(g.bestPct, pct);
        if (mistakes === 0) g.perfect = true;
      });
      caseEl.classList.add('powered');
      say('Alles drin – Strom an!');
      App.ui.confetti();
      setTimeout(() => {
        if (!el.isConnected) return;
        el.innerHTML = App.gameKit.resultHtml({
          title: 'Dein PC läuft!', score, isBest, sub: secs + ' Sekunden · ' + mistakes + ' Fehler',
          learnTitle: 'Die Bauteile im Überblick',
          learn: PARTS.map(p => '<li><span class="li-ico">' + icon('cpu') + '</span><div><b>' + esc(p.name) + '</b><br>' + esc(p.info) + '</div></li>').join('')
        }) + '<div class="stack"><button class="btn primary" id="pc-again">' + icon('play') + 'Nochmal bauen</button>' +
          '<a class="btn ghost" href="#/spiele">' + icon('back') + 'Zu den Spielen</a></div>';
        el.querySelector('#pc-again').addEventListener('click', () => play(el));
      }, App.ui.reducedMotion() ? 300 : 1600);
    }

    el.querySelectorAll('.part').forEach(btn => {
      App.ui.draggable(btn, {
        dropSelector: '.pc-slot',
        onDrop: target => tryPlace(btn.dataset.id, target.dataset.slot),
        onTap: () => {
          selected = selected === btn.dataset.id ? null : btn.dataset.id;
          say(selected ? 'Jetzt den passenden Platz im Gehäuse antippen.' : 'Auswahl aufgehoben.');
          update();
        }
      });
    });
    caseEl.addEventListener('click', e => {
      const slot = e.target.closest('.pc-slot');
      if (selected && slot) tryPlace(selected, slot.dataset.slot);
    });
    update();
  }

  App.games.pc = {
    id: 'pc', title: 'PC zusammenbauen', icon: 'cpu', area: 'it', topic: 'Hardware',
    teaser: 'Bau Bauteil für Bauteil einen Computer.',
    render
  };
})(window.App);
