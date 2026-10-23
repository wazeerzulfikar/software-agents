/* Pattie Maes's group, 1989 to now: a timeline for the alumni event.
   Draws the rows from js/group-data.js, then runs on its own: a yellow line
   walks through the years, lighting up whoever was in the group that year,
   rests at today, and starts again. The music switch is the only control.

   ?still        no walking line (for screenshots)
   ?at=1997.5    hold the line at that year
   ?nointro      skip the bars growing in */
(function () {
  var D = window.GROUP;
  var params = new URLSearchParams(location.search);
  var STILL = params.has('still') || matchMedia('(prefers-reduced-motion: reduce)').matches;
  var AT = params.has('at') ? +params.get('at') : null;

  // The stage: names on the left, then the years from X0 to X1. X0 is set
  // once the names are measured, so the years get all the room there is.
  var NAME_LEFT = 68, X0, X1 = 1852;
  var ERA_TOP = 44, NAME_TOP = 35, LOGO_H = 34;
  var AXIS_Y, ROWS_TOP, ROWS_BOTTOM = 1030, PI_GAP = 10;
  var BAR_H = 18, WORD_H = 17, PAD = 5, WORD_SIZES = [13.5, 12.5, 11.5];
  var YEAR_MS = 1000;            // the line walks a year a second
  var REST_MS = 9000, HOLD_MS = 5000;

  function time(s) {
    if (s === 'now') return D.now;
    var p = String(s).split('-');
    return +p[0] + ((+p[1] || 1) - 1) / 12;
  }
  function x(t) { return X0 + (t - D.from) / (D.to - D.from) * (X1 - X0); }
  function el(tag, cls, parent, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    if (parent) parent.appendChild(e);
    return e;
  }
  function px(e, left, top, width, height) {
    if (left != null) e.style.left = left + 'px';
    if (top != null) e.style.top = top + 'px';
    if (width != null) e.style.width = width + 'px';
    if (height != null) e.style.height = height + 'px';
  }

  var stage, root, back, rows = [], eras = [], head, tag, yearLabels = [];

  function build() {
    stage = document.getElementById('stage');
    root = el('div', 'gp', stage);
    px(root, 0, 0, 1920, 1080);
    back = el('div', 'gp-back', root);   // the grid and the walking line, behind the rows

    // Pattie first, then everyone in the order they arrived
    var people = D.people.slice().sort(function (p, q) {
      return (q.pi ? 1 : 0) - (p.pi ? 1 : 0) || time(p.spans[0][0]) - time(q.spans[0][0]) ||
        time(p.spans[p.spans.length - 1][1]) - time(q.spans[q.spans.length - 1][1]);
    });

    // names and roles first, to see how much room they need
    people.forEach(function (p, i) {
      var row = el('div', 'gp-row' + (p.pi ? ' pi' : ''), root);
      var r = { p: p, el: row, i: i, runs: [], on: false };
      r.name = el('div', 'gp-name', row, p.name);
      r.role = el('div', 'gp-role', row, p.role);
      r.name.style.transitionDelay = r.role.style.transitionDelay = (0.1 + i * 0.045) + 's';
      rows.push(r);
    });
    var roleRight = 0;
    rows.forEach(function (r) { roleRight = Math.max(roleRight, NAME_LEFT + r.name.offsetWidth + 18 + r.role.offsetWidth); });
    X0 = Math.ceil(roleRight) + 30;

    // what the group was called, along the top, with its logo if it had one
    var logos = D.eras.some(function (era) { return era.logo; });
    D.eras.forEach(function (era) {
      var a = time(era.from), b = time(era.to);
      var e = el('div', 'gp-era', back);
      px(e, x(a), ERA_TOP, x(b) - x(a) - 8);
      el('div', 'yr', e, era.years);
      el('div', 'rule', e);
      var nm = el('div', 'nm', e, era.name);
      // a name too long for its years breaks onto two lines
      if (nm.offsetWidth > e.offsetWidth) { nm.classList.add('wrap'); nm.style.width = e.offsetWidth + 'px'; }
      eras.push({ a: a, b: b, el: e, nm: nm, logo: era.logo });
    });
    // A name the group had for only a year or so cannot fit under its rule.
    // It goes up into the small line of years instead, ending where its rule
    // ends, in the room the name before it leaves.
    eras.forEach(function (e) {
      e.tight = e.el.offsetWidth < 90;
      if (!e.tight) return;
      e.el.classList.add('tight');
      e.el.querySelector('.yr').textContent = e.nm.textContent + ' \u00b7 ' + e.el.querySelector('.yr').textContent;
    });
    // if a single word is still too long, all the names are set smaller together
    for (var size = 32; size > 22 && eras.some(function (e) { return !e.tight && e.nm.scrollWidth > e.el.offsetWidth; }); size -= 1) {
      eras.forEach(function (e) { e.nm.style.fontSize = (size - 1) + 'px'; e.nm.style.lineHeight = Math.round((size - 1) * 1.06) + 'px'; });
    }
    var nameH = Math.max.apply(null, eras.map(function (e) { return e.nm.offsetHeight; }));
    eras.forEach(function (e) {
      if (!e.logo) return;
      var img = el('img', 'logo', e.el);
      img.src = e.logo.src;
      img.alt = '';
      px(img, null, NAME_TOP + nameH + 10, null, e.logo.h || LOGO_H);
    });
    AXIS_Y = ERA_TOP + NAME_TOP + nameH + 18 + (logos ? LOGO_H + 14 : 0);
    ROWS_TOP = AXIS_Y + 30;
    var gridTop = AXIS_Y + 26;

    // a hairline for every year, a stronger one and a label every five
    for (var y = Math.ceil(D.from); y <= Math.floor(D.to); y++) {
      var g = el('div', 'gp-grid' + (y % 5 ? '' : ' major'), back);
      px(g, Math.round(x(y)), gridTop, null, ROWS_BOTTOM - gridTop);
      if (y % 5) continue;
      var label = el('div', 'gp-year', back, y);
      px(label, x(y), AXIS_Y);
      yearLabels.push({ y: y, el: label });
    }
    // and a stronger line where each of the group's names begins
    eras.forEach(function (e) {
      var g = el('div', 'gp-grid era', back);
      px(g, Math.round(x(e.a)), gridTop, null, ROWS_BOTTOM - gridTop);
    });

    // the walking line runs behind the bars, its year tag over the axis
    head = el('div', 'gp-head', back);
    px(el('div', 'line', head), null, gridTop, null, ROWS_BOTTOM - gridTop);
    tag = el('div', 'tag', head, '');
    px(tag, null, AXIS_Y - 3);

    var pitch = (ROWS_BOTTOM - ROWS_TOP - PI_GAP) / rows.length;
    BAR_H = Math.min(18, Math.round(pitch - 5));   // the more people, the slimmer the bars
    rows.forEach(function (r, i) {
      var p = r.p;
      var top = ROWS_TOP + i * pitch + (i ? PI_GAP : 0);
      var barTop = Math.round(top + (pitch - BAR_H) / 2);
      px(r.name, null, top + pitch / 2 - 12);
      px(r.role, X0 - 30 - r.role.offsetWidth, top + pitch / 2 - 12);

      // Spans that follow straight on from each other (an SM, then a PhD)
      // make one run, drawn as one bar with a faint line at each join.
      var runs = [];
      p.spans.forEach(function (s) {
        var a = time(s[0]), b = time(s[1]), own = s[2] === 'own', last = runs[runs.length - 1];
        if (last && !own && !last.own && Math.abs(a - last.b) < 0.1) { last.joins.push(a); last.b = b; last.open = s[1] === 'now'; }
        else runs.push({ a: a, b: b, own: own, label: s[3], open: s[1] === 'now', joins: [] });
      });
      runs.forEach(function (u) {
        u.bar = el('div', 'gp-bar' + (u.open ? ' open' : '') + (u.own ? ' own' : ''), r.el);
        px(u.bar, x(u.a), barTop, x(u.b) - x(u.a), BAR_H);
        u.bar.style.transitionDelay = (0.25 + i * 0.045) + 's, 0s';
        u.joins.forEach(function (j) { px(el('i', 'join', u.bar), x(j) - x(u.a) - 1); });
        if (!u.own) r.runs.push(u);
        // an outline may name the group its person led, in quiet type, if it fits
        else if (u.label) {
          var lab = el('div', 'gp-word quiet', r.el, u.label);
          lab.style.transitionDelay = (0.9 + i * 0.045) + 's';
          r.quiet = { el: lab, run: u, top: barTop + (BAR_H - WORD_H) / 2 };
        }
      });

      // the person's word, centred in their longest run
      if (p.word) {
        var longest = r.runs.reduce(function (m, u) { return u.b - u.a > m.b - m.a ? u : m; });
        r.word = { el: el('div', 'gp-word', r.el, p.word), run: longest, top: barTop + (BAR_H - WORD_H) / 2 };
        r.word.el.style.transitionDelay = (0.9 + i * 0.045) + 's';
      }

      if (p.pi) px(el('div', 'gp-sep', root), null, top + pitch + PI_GAP / 2);
    });

    if (!people.some(function (p) { return p.spans.some(function (s) { return s[2] === 'own'; }); })) {
      var key = document.querySelector('.gp-key');
      if (key) key.remove();
    }
  }

  // A word goes inside its bar, centred, whenever it fits. Otherwise it sits
  // just after the bar, or just before it, wherever no other bar is in the way.
  function placeWords() {
    rows.forEach(function (r) {
      if (!r.quiet) return;
      var a = x(r.quiet.run.a), room = x(r.quiet.run.b) - a - (r.quiet.run.open ? 46 : 0), width = r.quiet.el.offsetWidth;
      if (width + 2 * PAD <= room) px(r.quiet.el, Math.round(a + (room - width) / 2), r.quiet.top);
      else r.quiet.el.remove();
    });
    rows.forEach(function (r) {
      var w = r.word;
      if (!w) return;
      function clear(from, to) {
        return from >= X0 - 10 && to <= X1 + 40 && r.p.spans.every(function (s) { return x(time(s[1])) <= from || x(time(s[0])) >= to; });
      }
      var a = x(w.run.a), b = x(w.run.b);
      var room = b - a - (w.run.open ? 46 : 0);
      // a word a little too long for its bar is set a size or two smaller
      for (var k = 0; k < WORD_SIZES.length; k++) {
        w.el.style.fontSize = WORD_SIZES[k] + 'px';
        if (w.el.offsetWidth + 2 * PAD <= room) break;
      }
      if (k === WORD_SIZES.length) w.el.style.fontSize = '';
      var width = w.el.offsetWidth;
      if (width + 2 * PAD <= room) {
        px(w.el, Math.round(a + (room - width) / 2), w.top);
        w.inside = true;
      } else if (clear(b + 2, b + 12 + width)) {
        px(w.el, b + 9, w.top);
        w.el.classList.add('out');
      } else if (clear(a - 12 - width, a - 2)) {
        px(w.el, a - 9 - width, w.top);
        w.el.classList.add('out');
      } else {
        w.el.remove();
        r.word = null;
      }
    });
  }

  // ---------- the walking line ----------
  function setYear(t) {
    head.style.transform = 'translateX(' + x(t).toFixed(1) + 'px)';
    tag.textContent = Math.floor(t);
    rows.forEach(function (r) {
      var any = false;
      r.runs.forEach(function (u) {
        // a run lights up as a whole, so a word across a join stays readable
        var on = t >= u.a && t < u.b + (u.b >= D.now ? 1 : 0);
        u.bar.classList.toggle('on', on);
        if (r.word && r.word.run === u && r.word.inside) r.word.el.classList.toggle('on', on);
        any = any || on;
      });
      if (any !== r.on) { r.on = any; r.el.classList.toggle('on', any); }
    });
    eras.forEach(function (e) { e.el.classList.toggle('on', t >= e.a && t < e.b + (e.b >= D.now ? 1 : 0)); });
    // the year labels make way for the line's own tag
    yearLabels.forEach(function (l) { l.el.style.opacity = Math.abs(l.y - t) < 1.2 ? 0 : ''; });
  }

  function clearYear() {
    yearLabels.forEach(function (l) { l.el.style.opacity = ''; });
  }

  function sweep() {
    var start = D.from;
    var t0 = performance.now();
    root.classList.add('sweeping');
    head.classList.add('on');
    function frame(now) {
      var t = Math.min(D.now, start + (now - t0) / YEAR_MS);
      setYear(t);
      if (t < D.now) return requestAnimationFrame(frame);
      setTimeout(function () {
        root.classList.remove('sweeping');
        head.classList.remove('on');
        clearYear();
        setTimeout(sweep, REST_MS);
      }, HOLD_MS);
    }
    requestAnimationFrame(frame);
  }

  // ---------- fitting the stage to the window ----------
  function fit() {
    var s = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
    var ox = Math.round((window.innerWidth - 1920 * s) / 2);
    var oy = Math.round((window.innerHeight - 1080 * s) / 2);
    stage.style.transform = 'translate(' + ox + 'px,' + oy + 'px) scale(' + s + ')';
    stage.style.visibility = 'visible';
  }

  // ---------- the pointer hides while nobody moves it ----------
  var stillT;
  function moved() {
    document.documentElement.classList.remove('still');
    clearTimeout(stillT);
    stillT = setTimeout(function () { document.documentElement.classList.add('still'); }, 2500);
  }

  document.addEventListener('DOMContentLoaded', function () {
    stage = document.getElementById('stage');
    fit();
    window.addEventListener('resize', fit);
    window.addEventListener('mousemove', moved, { passive: true });
    moved();
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(function () {
      build();
      placeWords();
      if (params.has('nointro') || STILL || AT != null) {
        root.classList.add('snap');
        // ?nointro only skips the coming in; the walking line still eases
        if (!STILL && AT == null) setTimeout(function () { root.classList.remove('snap'); }, 200);
      }
      requestAnimationFrame(function () {
        root.classList.add('in');
        // once everything has come in, the walking line's changes should be immediate
        setTimeout(function () {
          root.querySelectorAll('.gp-name, .gp-role, .gp-word, .gp-bar').forEach(function (e) { e.style.transitionDelay = ''; });
        }, 4500);
        if (AT != null) {
          root.classList.add('sweeping');
          head.classList.add('on');
          setYear(AT);
        } else if (!STILL) {
          setTimeout(sweep, params.has('nointro') ? 1500 : 6000);
        }
      });
    });
  });
  window.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  window.addEventListener('dragstart', function (e) { e.preventDefault(); });
})();

/* The music: "Return To Light", on a loop (sound/return-to-light.mp3, made
   from assets/Return_To_Light_*.wav). It fades in and out. A browser may refuse to start
   sound before anyone has clicked; then the first click anywhere starts it.
   (group.command opens the page in Chrome with that rule lifted.) The choice
   to switch it off is remembered in this browser. */
(function () {
  var KEY = 'group-music';
  var VOLUME = 0.8;
  var audio, button, hint, fadeT;

  function remembered() { try { return localStorage.getItem(KEY) !== 'off'; } catch (e) { return true; } }
  function remember(on) { try { localStorage.setItem(KEY, on ? 'on' : 'off'); } catch (e) { /* private window */ } }

  function fade(to, ms, done) {
    cancelAnimationFrame(fadeT);
    var from = audio.volume, t0 = performance.now();
    (function step(now) {
      var k = Math.max(0, Math.min(1, (now - t0) / ms));   // a frame can be stamped just before t0
      audio.volume = from + (to - from) * k;
      if (k < 1) fadeT = requestAnimationFrame(step); else if (done) done();
    })(t0);
  }

  function show(state) {
    button.className = 'gp-music ' + state;
    button.title = state === 'off' ? 'Music off: click to turn it on' : 'Music on: click to turn it off';
    hint.classList.toggle('on', state === 'waiting');
  }

  function play() {
    audio.volume = 0;
    var p = audio.play();
    show('on');
    if (p && p.catch) p.catch(function () {
      show('waiting');
      window.addEventListener('pointerdown', function first(e) {
        window.removeEventListener('pointerdown', first, true);
        if (e.target.closest && e.target.closest('.gp-music')) return;   // the switch handles its own click
        if (remembered()) play();
      }, true);
    });
    fade(VOLUME, 2500);
  }

  function stop() {
    show('off');
    fade(0, 700, function () { audio.pause(); });
  }

  document.addEventListener('DOMContentLoaded', function () {
    var stage = document.getElementById('stage');
    audio = new Audio('sound/return-to-light.mp3');
    audio.loop = true;
    audio.preload = 'auto';

    hint = document.createElement('div');
    hint.className = 'gp-music-hint';
    hint.textContent = 'Click for music';
    stage.appendChild(hint);

    button = document.createElement('button');
    button.type = 'button';
    button.innerHTML =
      '<svg viewBox="0 0 48 48" aria-hidden="true">' +
      '<g fill="currentColor"><ellipse cx="16.5" cy="32.5" rx="4.6" ry="3.6" transform="rotate(-20 16.5 32.5)"/>' +
      '<ellipse cx="31.5" cy="29.5" rx="4.6" ry="3.6" transform="rotate(-20 31.5 29.5)"/>' +
      '<rect x="19.6" y="13" width="2" height="19.5"/><rect x="34.6" y="10" width="2" height="19.5"/>' +
      '<path d="M19.6 13 L36.6 10 L36.6 14.6 L19.6 17.6 Z"/></g>' +
      '<path class="slash" d="M11 11 L37 37" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>';
    button.setAttribute('aria-label', 'Music');
    stage.appendChild(button);
    button.addEventListener('click', function () {
      var on = !button.classList.contains('on');
      remember(on);
      if (on) play(); else stop();
    });

    if (remembered()) play(); else show('off');
  });
})();
