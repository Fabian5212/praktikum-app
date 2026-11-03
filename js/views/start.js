/*
 * start.js – Startseite (#/start): Begrüßung, heutiger Tag, Wochenplan, Fortschritt, Abzeichen.
 * Enthält auch das Einstellungs-Sheet (Name, Startdatum, Wochenplan), das beim ersten Start erscheint.
 */
(function (App) {
  'use strict';
  const { icon, esc, areaPill, WEEKDAYS, WD_SHORT } = App.ui;
  const AREAS = App.store.AREAS;

  /** Kurzer Satz, was heute im Bereich passiert */
  const TODAY_LINE = {
    it: 'Heute schaust du dem IT-Service über die Schulter: Tickets, PCs, Netzwerk.',
    synchro: 'Heute geht\'s ins Tonstudio: Hier bekommen Filme ihre deutschen Stimmen.',
    schnitt: 'Heute im Schnitt: Aus vielen Aufnahmen wird ein fertiger Film.',
    tonregie: 'Heute in der Tonregie beim WDR: Hier wird der Ton einer Sendung gesteuert – oft live.',
    anderes: 'Heute steht etwas Besonderes an – schreib es nachher ins Tagebuch.'
  };

  function greeting() {
    const h = new Date().getHours();
    return h < 11 ? 'Guten Morgen' : h < 17 ? 'Hallo' : 'Guten Abend';
  }

  function heroHtml(s) {
    const t = App.store.today();
    let title, text, area = '';
    if (t.phase === 'none') {
      title = 'Deine Praktikumswoche';
      text = 'Trag dein Startdatum ein, dann zeige ich dir jeden Tag, wo du bist.';
    } else if (t.phase === 'before') {
      title = t.daysUntil === 1 ? 'Morgen geht\'s los!' : 'Noch ' + t.daysUntil + ' Tage';
      text = 'Dein Praktikum startet am ' + App.ui.formatDate(s.startDate, true) + '. Schau dich schon mal in den Spielen um.';
    } else if (t.phase === 'during') {
      area = s.plan[t.index];
      title = 'Tag ' + (t.index + 1) + ' von 5 · ' + WEEKDAYS[t.index];
      text = area ? TODAY_LINE[area] : 'Wo bist du heute? Tippe auf „Woche planen“.';
    } else if (t.phase === 'weekend') {
      title = 'Wochenende!';
      text = 'Deine Praktikumswoche ist geschafft. Zeit fürs Tagebuch und dein Fazit.';
    } else {
      title = 'Praktikum geschafft';
      text = 'Die App bleibt dir: Spiel weiter, schau ins Wörterbuch oder lies dein Tagebuch nach.';
    }
    return '<section class="hero' + (area ? ' area-' + area : '') + '">' +
      '<div class="hero-top"><span class="eyebrow">Heute</span>' + (area ? areaPill(area, true) : '') + '</div>' +
      '<h2>' + esc(title) + '</h2><p>' + esc(text) + '</p>' +
      '<div class="week" role="list">' + WD_SHORT.map((d, i) => {
        const a = s.plan[i];
        const now = t.phase === 'during' && t.index === i;
        return '<button class="wday' + (a ? ' area-' + a : '') + (now ? ' now' : '') + '" data-plan role="listitem" aria-label="' + WEEKDAYS[i] + ': ' + (a ? AREAS[a].label : 'offen') + '">' +
          '<b>' + d + '</b><span>' + (a ? AREAS[a].short : '–') + '</span></button>';
      }).join('') + '</div>' +
      '<button class="link-btn" data-plan>' + icon('edit') + 'Woche planen</button>' +
    '</section>';
  }

  function render(view) {
    const s = App.store.get();
    const games = App.store.GAMES;
    const plays = games.reduce((n, k) => n + s.games[k].plays, 0);
    const got = App.badges.LIST.filter(b => s.badges[b.id]).length;

    view.innerHTML =
      App.ui.pageHead(greeting() + ', ' + (s.name || 'du'), 'Deine Praktikumswoche') +
      heroHtml(s) +

      '<div class="quick">' +
        '<a href="#/tagebuch/notizen" class="quick-btn">' + icon('edit') + '<span>Notiz schreiben</span></a>' +
        '<a href="#/wissen/lexikon" class="quick-btn">' + icon('search') + '<span>Begriff nachschlagen</span></a>' +
        '<a href="#/spiele" class="quick-btn">' + icon('play') + '<span>Spiel starten</span></a>' +
      '</div>' +

      '<section class="card"><div class="card-head"><h2 class="h3">Dein Fortschritt</h2><span class="muted small">' + plays + (plays === 1 ? ' Spiel' : ' Spiele') + ' gespielt</span></div>' +
        '<div class="stats">' + games.map(k => {
          const g = App.games[k], st = s.games[k];
          return '<a class="stat g-' + k + '" href="#/spiele/' + k + '"><img src="img/games/' + k + '.png" alt="" width="48" height="48">' +
            '<b>' + (st.plays ? st.best : '–') + '</b><span>' + esc(g.title) + '</span></a>';
        }).join('') + '</div></section>' +

      '<section class="card"><div class="card-head"><h2 class="h3">Abzeichen</h2><span class="muted small">' + got + ' / ' + App.badges.LIST.length + '</span></div>' +
        '<div class="badges">' + App.badges.LIST.map(b => {
          const on = !!s.badges[b.id];
          return '<button class="badge' + (on ? ' on' : '') + '" data-badge="' + b.id + '">' +
            '<span class="badge-ico">' + icon(on ? b.icon : 'lock') + '</span><span>' + esc(b.name) + '</span></button>';
        }).join('') + '</div></section>';

    view.querySelectorAll('[data-plan]').forEach(b => b.addEventListener('click', () => settings(false)));
    view.querySelectorAll('[data-badge]').forEach(b => b.addEventListener('click', () => {
      const bd = App.badges.LIST.find(x => x.id === b.dataset.badge);
      const when = s.badges[bd.id];
      App.ui.sheet({
        title: bd.name,
        html: '<div class="badge-detail' + (when ? ' on' : '') + '">' + icon(when ? bd.icon : 'lock') + '</div><p>' + esc(bd.desc) + '</p>' +
          '<p class="muted">' + (when ? 'Freigeschaltet am ' + App.ui.formatDate(when, true) : 'Noch nicht freigeschaltet.') + '</p>',
        actions: [{ label: 'Schließen', kind: 'primary' }]
      });
    }));
  }

  /**
   * Einstellungen: Name, Startdatum, Wochenplan.
   * first=true → Willkommens-Dialog beim ersten Öffnen (nicht wegklickbar, Name Pflicht).
   */
  function settings(first) {
    const s = App.store.get();
    const opts = sel => '<option value="">offen</option>' + Object.keys(AREAS).map(k => '<option value="' + k + '"' + (sel === k ? ' selected' : '') + '>' + AREAS[k].label + '</option>').join('');
    App.ui.sheet({
      title: first ? 'Willkommen bei Einblick!' : 'Einstellungen',
      dismissable: !first,
      html:
        (first ? '<p>Diese App begleitet dich durch deine Praktikumswoche. Alles, was du einträgst, bleibt <b>nur auf deinem Handy</b>.</p>' : '') +
        '<label class="field"><span>Wie heißt du?</span><input id="set-name" type="text" maxlength="30" autocomplete="given-name" value="' + esc(s.name) + '" placeholder="Dein Vorname"></label>' +
        '<label class="field"><span>Erster Praktikumstag (Montag)</span><input id="set-start" type="date" value="' + esc(s.startDate) + '"></label>' +
        '<fieldset class="field"><legend>Wo bist du an welchem Tag?</legend><div class="plan-grid">' +
          WEEKDAYS.map((d, i) => '<label><span>' + d + '</span><select data-day="' + i + '">' + opts(s.plan[i]) + '</select></label>').join('') +
        '</div><p class="muted small">Kannst du später jederzeit ändern.</p></fieldset>' +
        '<p class="err" id="set-err" hidden>Bitte gib deinen Namen ein.</p>',
      actions: [{
        label: first ? 'Los geht\'s' : 'Speichern', kind: 'primary', icon: 'check',
        onClick: (close, wrap) => {
          const name = wrap.querySelector('#set-name').value.trim();
          if (!name) { wrap.querySelector('#set-err').hidden = false; wrap.querySelector('#set-name').focus(); return false; }
          App.store.update(st => {
            st.name = name;
            st.startDate = wrap.querySelector('#set-start').value;
            wrap.querySelectorAll('[data-day]').forEach(sel => { st.plan[+sel.dataset.day] = sel.value; });
          });
          App.badges.check();
          App.router.refresh();
        }
      }]
    });
  }

  App.views.start = render;
  App.settings = settings;
})(window.App);
