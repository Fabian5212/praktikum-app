/*
 * tagebuch.js – Tagebuch (#/tagebuch): ein Eintrag pro Tag, Notizen und Fragenliste.
 * Speichert automatisch beim Tippen. Fotos werden verkleinert als Base64 gespeichert.
 *
 * Eintrag: { date, area, did, exciting, learned, rating (0–5), photos (Liste von dataURLs), notes }
 */
(function (App) {
  'use strict';
  const { icon, esc, WEEKDAYS, WD_SHORT } = App.ui;
  const AREAS = App.store.AREAS;

  const PHOTO_MAX = 800;        // längste Seite in Pixeln (klein halten, damit viele Fotos in den Speicher passen)
  const PHOTO_QUALITY = 0.65;   // JPEG-Qualität
  let day = null;               // aktuell gewählter Tag (0–4), bleibt beim Seitenwechsel erhalten

  function entry(s, i) {
    return s.diary[i] || { date: App.store.dayDate(i), area: s.plan[i] || '', did: '', exciting: '', learned: '', rating: 0, photos: [], notes: '' };
  }

  /** Speichert ein Feld des aktuellen Tages */
  function setField(i, key, val) {
    return App.store.update(s => {
      const e = entry(s, i);
      e[key] = val;
      s.diary[i] = e;
    });
  }

  function render(view, params) {
    const s = App.store.get();
    if (day === null) {
      const t = App.store.today();
      day = t.phase === 'during' ? t.index : 0;
    }
    const e = entry(s, day);
    const used = App.store.usage();

    view.innerHTML = App.ui.pageHead('Tagebuch', 'Halte fest, was du erlebst') +
      // Tagesauswahl
      '<div class="day-tabs" role="tablist">' + WD_SHORT.map((d, i) => {
        const de = s.diary[i];
        const done = de && ((de.did && de.did.trim()) || (de.notes && de.notes.trim()));
        return '<button role="tab" class="day-tab' + (i === day ? ' on' : '') + (done ? ' done' : '') + '" data-day="' + i + '" aria-selected="' + (i === day) + '">' +
          '<b>' + d + '</b><span>' + (de && de.date ? App.ui.formatDate(de.date) : App.store.dayDate(i) ? App.ui.formatDate(App.store.dayDate(i)) : 'Tag ' + (i + 1)) + '</span>' +
          (done ? '<i class="dot"></i>' : '') + '</button>';
      }).join('') + '</div>' +

      // Eintrag des Tages
      '<section class="card entry vt-swap">' +
        '<div class="card-head"><h2 class="h3">' + WEEKDAYS[day] + '</h2><span class="saved muted small" id="tb-saved" aria-live="polite"></span></div>' +
        '<label class="field"><span>Datum</span><input type="date" data-f="date" value="' + esc(e.date) + '"></label>' +
        '<div class="field"><span>Bereich</span><div class="seg">' + Object.keys(AREAS).map(k =>
          '<button type="button" class="seg-btn area-' + k + (e.area === k ? ' on' : '') + '" data-area="' + k + '">' + icon(AREAS[k].icon) + AREAS[k].short + '</button>').join('') + '</div></div>' +
        area('did', 'Was habe ich gemacht?', 'z. B. Ich war im Tonstudio und habe bei einer Aufnahme zugeschaut …', e.did) +
        area('exciting', 'Was fand ich spannend?', 'Was hat dich überrascht oder begeistert?', e.exciting) +
        area('learned', 'Was habe ich gelernt?', 'Ein neues Wort, ein Trick, eine Erkenntnis …', e.learned) +
        '<div class="field"><span>Wie war der Tag?</span><div class="stars" role="radiogroup" aria-label="Bewertung">' +
          [1, 2, 3, 4, 5].map(n => '<button type="button" class="star' + (n <= e.rating ? ' on' : '') + '" data-star="' + n + '" role="radio" aria-checked="' + (n === e.rating) + '" aria-label="' + n + ' von 5">' + icon('star') + '</button>').join('') +
        '</div></div>' +
        '<div class="field"><span>Fotos (optional)</span>' +
          (e.photos.length ? '<div class="photo-grid">' + e.photos.map((p, n) =>
            '<figure class="photo"><button type="button" class="photo-open" data-photo-open="' + n + '" aria-label="Foto ' + (n + 1) + ' groß anzeigen"><img src="' + p + '" alt="Foto ' + (n + 1) + ' vom ' + WEEKDAYS[day] + '"></button>' +
            '<button type="button" class="icon-btn danger" data-photo-del="' + n + '" aria-label="Foto ' + (n + 1) + ' entfernen">' + icon('trash') + '</button></figure>').join('') + '</div>' : '') +
          '<label class="btn ghost file-btn">' + icon('camera') + (e.photos.length ? 'Weiteres Foto hinzufügen' : 'Foto hinzufügen') + '<input type="file" accept="image/*" multiple id="tb-photo" hidden></label>' +
          '<p class="muted small">Speicher belegt: ' + Math.round(used / 1024) + ' KB von ca. ' + Math.round(App.store.LIMIT_BYTES / 1024 / 1024) + ' MB. Fotos werden verkleinert.</p>' +
        '</div>' +
        // Freie Notizen gehören zum gewählten Tag und wechseln mit ihm
        '<label class="field" id="notizen"><span>Freie Notizen für ' + WEEKDAYS[day] + '</span>' +
          '<textarea id="tb-notes" rows="5" data-f="notes" placeholder="Alles, was du dir heute merken willst: Namen, Programme, Ideen …">' + esc(e.notes || '') + '</textarea></label>' +
      '</section>' +

      // Fragen
      '<section class="card"><h2 class="h3">' + icon('help') + 'Fragen, die ich noch stellen will</h2>' +
        '<form class="add-row" id="tb-qform"><input id="tb-q" type="text" maxlength="200" placeholder="Neue Frage …" aria-label="Neue Frage"><button class="icon-btn primary" aria-label="Frage hinzufügen">' + icon('plus') + '</button></form>' +
        '<ul class="qlist">' + (s.questions.length ? s.questions.map(q =>
          '<li class="' + (q.done ? 'done' : '') + '"><label><input type="checkbox" data-q="' + q.id + '"' + (q.done ? ' checked' : '') + '><span>' + esc(q.text) + '</span></label>' +
          '<button class="icon-btn small" data-qdel="' + q.id + '" aria-label="Frage löschen">' + icon('x') + '</button></li>').join('')
          : '<li class="empty muted">Noch keine Fragen. Ideen findest du unter <a href="#/wissen/fragen">Wissen → Gute Fragen</a>.</li>') +
        '</ul></section>' +

      // Ganze Woche als Mindmap
      '<section class="card"><h2 class="h3">' + icon('network') + 'Deine Woche als Mindmap</h2>' +
        '<p class="muted">Alle Tage auf einen Blick – zum Ansehen, als XMind-Datei herunterladen oder per Link an den PC schicken.</p>' +
        '<a class="btn primary block" href="#/mindmap">' + icon('network') + 'Mindmap öffnen</a></section>';

    bind(view);
    if (params[0] === 'notizen') setTimeout(() => {
      const n = view.querySelector('#notizen');
      n.scrollIntoView({ behavior: App.ui.reducedMotion() ? 'auto' : 'smooth' });
      view.querySelector('#tb-notes').focus({ preventScroll: true });
    }, 50);
  }

  function area(key, label, ph, val) {
    return '<label class="field"><span>' + label + '</span><textarea rows="3" data-f="' + key + '" placeholder="' + esc(ph) + '">' + esc(val) + '</textarea></label>';
  }

  function bind(view) {
    const savedEl = view.querySelector('#tb-saved');
    const flash = () => { savedEl.textContent = 'Gespeichert'; clearTimeout(flash.t); flash.t = setTimeout(() => { savedEl.textContent = ''; }, 1500); };
    const saveText = App.ui.debounce((key, val) => { if (setField(day, key, val)) { flash(); App.badges.check(); } }, 400);

    // Tag wechseln: Eintrag gleitet je nach Richtung von rechts oder links herein
    view.querySelectorAll('.day-tab').forEach(b => b.addEventListener('click', () => {
      const next = +b.dataset.day;
      if (next === day) return;
      const kind = next > day ? 'step' : 'step-back';
      App.ui.transition(() => { day = next; App.router.refresh(); }, kind);
    }));
    view.querySelectorAll('[data-f]').forEach(inp => inp.addEventListener('input', () => saveText(inp.dataset.f, inp.value)));

    view.querySelectorAll('[data-area]').forEach(b => b.addEventListener('click', () => {
      const e = entry(App.store.get(), day);
      setField(day, 'area', e.area === b.dataset.area ? '' : b.dataset.area);
      view.querySelectorAll('[data-area]').forEach(x => x.classList.toggle('on', x === b && e.area !== b.dataset.area));
      flash();
    }));

    view.querySelectorAll('[data-star]').forEach(b => b.addEventListener('click', () => {
      const n = +b.dataset.star;
      setField(day, 'rating', n);
      view.querySelectorAll('[data-star]').forEach(x => {
        const on = +x.dataset.star <= n;
        x.classList.toggle('on', on);
        x.setAttribute('aria-checked', String(+x.dataset.star === n));
        // Sterne nacheinander aufploppen lassen
        x.style.setProperty('--d', (+x.dataset.star - 1) * 50 + 'ms');
        if (on) App.ui.replay(x, 'bounce');
      });
      flash();
    }));

    // Fotos: mehrere auf einmal möglich, jedes wird einzeln verkleinert und gespeichert
    const photo = view.querySelector('#tb-photo');
    photo.addEventListener('change', async () => {
      const files = [...photo.files];
      photo.value = '';
      let saved = 0;
      for (const file of files) {
        try {
          const data = await shrink(file);
          const ok = App.store.update(s => { const e = entry(s, day); e.photos = [...e.photos, data]; s.diary[day] = e; });
          if (!ok) break;        // Speicher voll – Hinweis kommt vom Store
          saved++;
        } catch (err) {
          App.ui.toast('Ein Foto konnte nicht geladen werden.', 'alert');
        }
      }
      if (saved) { App.ui.toast(saved === 1 ? 'Foto gespeichert' : saved + ' Fotos gespeichert', 'camera'); App.router.refresh(); }
    });
    view.querySelectorAll('[data-photo-del]').forEach(b => b.addEventListener('click', () => {
      const n = +b.dataset.photoDel;
      App.ui.sheet({
        title: 'Foto entfernen?',
        html: '<p class="muted">Das Foto wird aus dem Tagebuch gelöscht.</p>',
        actions: [
          { label: 'Abbrechen', kind: 'ghost' },
          { label: 'Entfernen', kind: 'danger', icon: 'trash', onClick: () => {
            App.store.update(s => { const e = entry(s, day); e.photos = e.photos.filter((_, i) => i !== n); s.diary[day] = e; });
            App.router.refresh();
          } }
        ]
      });
    }));
    view.querySelectorAll('[data-photo-open]').forEach(b => b.addEventListener('click', () => {
      const src = entry(App.store.get(), day).photos[+b.dataset.photoOpen];
      App.ui.sheet({ title: WEEKDAYS[day], html: '<img class="photo-big" src="' + src + '" alt="Foto vom ' + WEEKDAYS[day] + '">', actions: [{ label: 'Schließen', kind: 'primary' }] });
    }));

    // Fragen
    view.querySelector('#tb-qform').addEventListener('submit', ev => {
      ev.preventDefault();
      const inp = view.querySelector('#tb-q');
      const text = inp.value.trim();
      if (!text) return;
      App.store.update(s => { s.questions.push({ id: Date.now().toString(36), text, done: false }); });
      App.badges.check();
      App.router.refresh();
      setTimeout(() => { const i = document.getElementById('tb-q'); i && i.focus(); }, 30);
    });
    view.querySelectorAll('[data-q]').forEach(c => c.addEventListener('change', () => {
      App.store.update(s => { const q = s.questions.find(x => x.id === c.dataset.q); if (q) q.done = c.checked; });
      c.closest('li').classList.toggle('done', c.checked);
    }));
    view.querySelectorAll('[data-qdel]').forEach(b => b.addEventListener('click', () => {
      App.store.update(s => { s.questions = s.questions.filter(x => x.id !== b.dataset.qdel); });
      App.router.refresh();
    }));
  }

  /** Verkleinert ein Bild auf max. PHOTO_MAX px und gibt eine JPEG-dataURL zurück */
  function shrink(file) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, PHOTO_MAX / Math.max(img.width, img.height));
        const c = document.createElement('canvas');
        c.width = Math.round(img.width * scale);
        c.height = Math.round(img.height * scale);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        resolve(c.toDataURL('image/jpeg', PHOTO_QUALITY));
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Bild')); };
      img.src = url;
    });
  }

  App.views.tagebuch = render;
})(window.App);
