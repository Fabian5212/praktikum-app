/*
 * tonregie.js – Minispiel „Live-Mix“ (Tonregie)
 * Der Spieler sitzt am Mischpult einer Live-Sendung. In jedem Moment des Sendeablaufs
 * zieht er die richtigen Fader auf bzw. zu und bestätigt den Mix.
 * Wie am echten Pult bleiben Fader offen, bis man sie wieder zuzieht.
 *
 * Moment: { cue: Was passiert gerade?, must: [müssen offen sein], never: [müssen zu sein], why: Erklärung }
 * Kanäle, die weder in must noch in never stehen, sind egal.
 */
(function (App) {
  'use strict';
  const { icon, esc } = App.ui;

  const SECONDS = 15;

  const CHANNELS = [
    { id: 'mod',   short: 'MOD',   name: 'Moderation', icon: 'mic' },
    { id: 'gast',  short: 'GAST',  name: 'Studiogast', icon: 'user' },
    { id: 'tel',   short: 'TEL',   name: 'Telefon',    icon: 'phone' },
    { id: 'musik', short: 'MUSIK', name: 'Musik',      icon: 'music' },
    { id: 'clip',  short: 'CLIP',  name: 'Einspieler', icon: 'film' }
  ];
  const NAME = Object.fromEntries(CHANNELS.map(c => [c.id, c.name]));

  /* Sendeablauf einer kleinen Talksendung – läuft immer in dieser Reihenfolge */
  const SHOW = [
    { cue: 'Gleich geht\'s los! Die Sendung startet mit dem Opener-Jingle.',
      must: ['clip'], never: ['mod', 'gast', 'tel'],
      why: 'Beim Jingle bleiben alle Mikros zu – sonst hört man Rascheln und Husten aus dem Studio.' },
    { cue: 'Die Moderatorin begrüßt die Zuschauer. Darunter läuft leise ein Musikbett.',
      must: ['mod', 'musik'], never: ['clip', 'gast', 'tel'],
      why: 'Moderation auf, Musik leise darunter. Der Jingle ist vorbei – also Einspieler wieder zu!' },
    { cue: 'Sie stellt den Studiogast vor und stellt ihm die erste Frage.',
      must: ['mod', 'gast'], never: ['musik', 'clip', 'tel'],
      why: 'Im Gespräch sind beide Mikros offen. Die Musik ist jetzt aus, damit man jedes Wort versteht.' },
    { cue: 'Es pfeift laut aus dem Gastmikro – eine Rückkopplung! Die Moderatorin überbrückt kurz.',
      must: ['mod'], never: ['gast'],
      why: 'Bei einer Rückkopplung nimmt ein Mikro seinen eigenen Ton wieder auf. Sofort den Fader runter – erst dann die Ursache suchen.' },
    { cue: 'Problem gelöst: Der Gast hat seinen Kopfhörer leiser gestellt. Das Gespräch geht weiter.',
      must: ['mod', 'gast'], never: ['musik', 'clip', 'tel'],
      why: 'Ursache behoben, also Gastmikro wieder auf. Der Kopfhörer war so laut, dass das Mikro ihn aufgenommen hat.' },
    { cue: 'Jetzt kommt ein vorproduzierter Beitrag zum Thema.',
      must: ['clip'], never: ['mod', 'gast'],
      why: 'Während eines Einspielers sind die Studiomikros zu – vielleicht sprechen Moderatorin und Gast gerade leise miteinander.' },
    { cue: 'Der Beitrag ist vorbei. Ein Zuschauer ruft an und stellt dem Gast eine Frage.',
      must: ['tel', 'gast'], never: ['clip', 'musik'],
      why: 'Anrufer und Gast müssen zu hören sein, der Einspieler ist vorbei. Der Anrufer bekommt übrigens einen Mix ohne seine eigene Stimme (N-1) – sonst hört er sich als Echo.' },
    { cue: 'Die Moderatorin muss husten und gibt dir ein Zeichen. Der Gast antwortet gerade dem Anrufer.',
      must: ['gast', 'tel'], never: ['mod'],
      why: 'Ein Handzeichen aus dem Studio heißt: Mikro zu! Das Gespräch zwischen Gast und Anrufer läuft weiter.' },
    { cue: 'Das Telefonat ist zu Ende. Die Moderatorin bedankt sich und kündigt einen Song an.',
      must: ['mod'], never: ['tel', 'clip'],
      why: 'Telefonleitung zu, sonst hört man Rauschen oder das Freizeichen. Die Moderatorin muss natürlich wieder auf sein.' },
    { cue: 'Der Song läuft.',
      must: ['musik'], never: ['mod', 'gast', 'tel', 'clip'],
      why: 'Während der Musik sind alle Mikros zu. Im Studio wird jetzt oft kurz besprochen, was als Nächstes kommt.' },
    { cue: 'Der Song ist aus. Die Moderatorin verabschiedet sich, darunter läuft der Outro-Jingle.',
      must: ['mod', 'clip'], never: ['musik', 'tel'],
      why: 'Abmoderation mit Jingle darunter. Der Song ist vorbei – Musik-Fader wieder zu.' },
    { cue: 'Sendung vorbei! Jetzt kommen die Nachrichten aus einem anderen Studio.',
      must: [], never: ['mod', 'gast', 'tel', 'musik', 'clip'],
      why: 'Alles zu! Sonst landen Gespräche aus eurem Studio mitten in den Nachrichten.' }
  ];

  const RULES = [
    ['mic', 'Mikros nur auf, wenn jemand spricht – sonst hört man Husten, Rascheln und Flüstern.'],
    ['sliders', 'Fader bleiben offen, bis du sie zuziehst. Immer an das Zuziehen denken!'],
    ['film', 'Bei Einspielern und Musik sind die Studiomikros zu.'],
    ['alert', 'Pfeift es (Rückkopplung)? Sofort den Fader runter, dann die Ursache suchen.'],
    ['clock', 'Live heißt: keine zweite Chance. Darum hat die Tonregie den Sendeablauf immer vor Augen.']
  ];

  function render(el) {
    App.gameKit.intro(el, {
      title: 'Live-Mix', icon: 'sliders', area: 'tonregie',
      lead: 'Du sitzt in der Tonregie einer Live-Sendung. Alles, was du aufziehst, hören die Zuschauer sofort!',
      how: ['Lies, was gerade in der Sendung passiert.',
            'Tippe auf die Kanäle, um ihre Fader auf- oder zuzuziehen.',
            'Drück „Mix senden“, bevor die ' + SECONDS + ' Sekunden um sind.',
            'Achtung: Offene Fader bleiben offen – denk ans Zuziehen!'],
      learn: 'Wie ein Mischpult funktioniert und worauf die Tonregie in einer Live-Sendung achtet.',
      onStart: () => play(el)
    });
  }

  function play(el) {
    const open = new Set();
    let i = 0, score = 0, correct = 0, timer = null, left = SECONDS, locked = false;
    const missed = [];

    function show() {
      const m = SHOW[i];
      left = SECONDS;
      locked = false;
      el.innerHTML =
        '<div class="game-bar"><span class="onair live">ON AIR</span><span class="chip">Moment ' + (i + 1) + '/' + SHOW.length + '</span>' +
        '<span class="chip">' + icon('star') + score + '</span></div>' +
        '<div class="timer"><i id="lm-bar"></i></div>' +
        '<article class="card glow cue pop"><span class="eyebrow">Sendeablauf</span><p class="cue-text">' + esc(m.cue) + '</p></article>' +
        '<div class="console" role="group" aria-label="Mischpult">' + CHANNELS.map(c =>
          '<button class="strip' + (open.has(c.id) ? ' on' : '') + '" data-ch="' + c.id + '" aria-pressed="' + open.has(c.id) + '" aria-label="' + c.name + '">' +
            '<span class="strip-name">' + c.short + '</span>' + icon(c.icon) +
            '<span class="strip-body"><span class="meter"><i></i></span><span class="fader"></span></span>' +
            '<span class="strip-flag"></span></button>').join('') +
        '</div>' +
        '<button class="btn primary block" id="lm-send">' + icon('play') + 'Mix senden</button>' +
        '<div id="lm-fb"></div>';

      el.querySelectorAll('.strip').forEach(b => b.addEventListener('click', () => {
        if (locked) return;
        const id = b.dataset.ch;
        open.has(id) ? open.delete(id) : open.add(id);
        b.classList.toggle('on', open.has(id));
        b.setAttribute('aria-pressed', String(open.has(id)));
      }));
      el.querySelector('#lm-send').addEventListener('click', () => evaluate(false));
      tick();
    }

    function tick() {
      const bar = el.querySelector('#lm-bar');
      if (!bar || !el.isConnected || locked) return;
      bar.style.width = (left / SECONDS * 100) + '%';
      bar.classList.toggle('low', left <= 4);
      if (left <= 0) { evaluate(true); return; }
      timer = setTimeout(() => { left--; tick(); }, 1000);
    }

    function evaluate(timeout) {
      if (locked) return;
      locked = true;
      clearTimeout(timer);
      const m = SHOW[i];
      const lacking = m.must.filter(c => !open.has(c));
      const wrongOpen = m.never.filter(c => open.has(c));
      const ok = !lacking.length && !wrongOpen.length;

      // Kanäle markieren: fehlt (hätte auf sein müssen) / zu! (hätte zu sein müssen)
      el.querySelectorAll('.strip').forEach(b => {
        const id = b.dataset.ch, flag = b.querySelector('.strip-flag');
        if (lacking.includes(id)) { b.classList.add('miss'); flag.textContent = 'auf!'; }
        else if (wrongOpen.includes(id)) { b.classList.add('miss'); flag.textContent = 'zu!'; }
        else if (m.must.includes(id) || m.never.includes(id)) b.classList.add('good');
      });

      let gained = 0;
      if (ok) { correct++; gained = 100 + left * 5; score += gained; }
      else missed.push(m);

      const parts = [];
      if (lacking.length) parts.push('Hätte auf sein müssen: ' + lacking.map(c => NAME[c]).join(', ') + '.');
      if (wrongOpen.length) parts.push('Hätte zu sein müssen: ' + wrongOpen.map(c => NAME[c]).join(', ') + '.');

      el.querySelector('#lm-send').remove();
      el.querySelector('#lm-fb').innerHTML =
        '<div class="feedback ' + (ok ? 'good' : 'bad') + ' pop">' +
          '<b>' + (ok ? 'Sauber gemischt! +' + gained : timeout ? 'Zeit um – so ging dein Mix auf Sendung.' : 'Nicht ganz.') + '</b>' +
          (parts.length ? '<p>' + esc(parts.join(' ')) + '</p>' : '') +
          '<p>' + esc(m.why) + '</p>' +
          '<button class="btn primary" id="lm-next">' + (i + 1 < SHOW.length ? 'Nächster Moment' : 'Auswertung') + icon('next') + '</button></div>';
      const nx = el.querySelector('#lm-next');
      nx.addEventListener('click', () => App.ui.step(() => { i++; i < SHOW.length ? show() : finish(); window.scrollTo(0, 0); }));
      nx.focus({ preventScroll: true });
      nx.scrollIntoView({ block: 'nearest', behavior: App.ui.reducedMotion() ? 'auto' : 'smooth' });
    }

    function finish() {
      const pct = Math.round(correct / SHOW.length * 100);
      let isBest = false;
      App.gameKit.save('tonregie', g => {
        g.plays++;
        if (score > g.best) { g.best = score; isBest = true; }
        g.bestPct = Math.max(g.bestPct, pct);
      });
      if (pct >= 75) App.ui.confetti();
      el.innerHTML = App.gameKit.resultHtml({
        title: correct + ' von ' + SHOW.length + ' Momenten sauber gemischt', score, isBest,
        sub: pct >= 90 ? 'Bereit für die Tonregie!' : pct >= 60 ? 'Gute Sendung!' : 'Live ist schwer – nochmal?',
        learnTitle: 'Die Regeln der Tonregie',
        learn: RULES.map(r => '<li><span class="li-ico">' + icon(r[0]) + '</span><div>' + esc(r[1]) + '</div></li>').join('') +
          missed.map(m => '<li><span class="li-ico">' + icon('alert') + '</span><div><b>' + esc(m.cue) + '</b><br><span class="muted">' + esc(m.why) + '</span></div></li>').join('')
      }) + '<div class="stack"><button class="btn primary" id="lm-again">' + icon('play') + 'Neue Sendung</button>' +
        '<a class="btn ghost" href="#/spiele">' + icon('back') + 'Zu den Spielen</a></div>';
      el.querySelector('#lm-again').addEventListener('click', () => App.ui.step(() => play(el)));
    }

    show();
  }

  App.games.tonregie = {
    id: 'tonregie', title: 'Live-Mix', icon: 'sliders', area: 'tonregie', topic: 'Tonregie',
    teaser: 'Misch eine Live-Sendung am Mischpult.',
    render,
    SHOW, CHANNELS   // für Tests
  };
})(window.App);
