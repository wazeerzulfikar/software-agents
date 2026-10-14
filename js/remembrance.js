/* The Remembrance Agent (Rhodes & Starner, 1996), as it appears in the 1997
   screenshot: Emacs 19 in a twm window on X11, black on white, 9x15 fixed.

   The whole window is drawn pixel for pixel on a 752x402 canvas with the
   original X11 bitmap fonts and shown at exactly twice that size. The text
   buffer is a small real editor; the agent is a small real retrieval engine
   (three scopes around the cursor, as the paper describes) over RA_CORPUS. */
(function () {
  'use strict';

  // ---- geometry, in original screen pixels --------------------------------
  var W = 752, H = 402;
  var COLS = 80, ROWS = 17, CW = 9, CH = 15;
  var FILL = 75;                       // fill-column, judging by the screenshot
  var X0 = 6;                          // left edge of the text columns
  var Y_MENU = 22, MENU_H = 20;
  var Y_TEXT = 44;
  var Y_MODE = Y_TEXT + ROWS * CH;     // main mode line
  var RA_LINES = 3;
  var Y_RA = Y_MODE + CH;
  var Y_RAMODE = Y_RA + RA_LINES * CH;
  var Y_MINI = Y_RAMODE + CH;
  var TEXT_R = X0 + COLS * CW;         // right edge of the text columns
  var SB_X = TEXT_R + 5, SB_W = 14;    // scroll bars

  var BLACK = [0, 0, 0], WHITE = [255, 255, 255];

  var canvas = document.getElementById('emacs');
  canvas.width = W; canvas.height = H;
  var g = canvas.getContext('2d');
  g.imageSmoothingEnabled = false;

  // ---- bitmap fonts -------------------------------------------------------
  function makeAtlas(font, fg, bg) {
    var n = 95, c = document.createElement('canvas');
    c.width = n * font.w; c.height = font.h;
    var x = c.getContext('2d'), img = x.createImageData(c.width, c.height), d = img.data;
    for (var i = 0; i < n; i++) {
      for (var r = 0; r < font.h; r++) {
        var v = parseInt(font.data.substr((i * font.h + r) * 3, 3), 16);
        for (var b = 0; b < font.w; b++) {
          var on = v & (1 << (font.w - 1 - b));
          var col = on ? fg : bg, o = (r * c.width + i * font.w + b) * 4;
          if (col) { d[o] = col[0]; d[o + 1] = col[1]; d[o + 2] = col[2]; d[o + 3] = 255; }
        }
      }
    }
    x.putImageData(img, 0, 0);
    return { img: c, w: font.w, h: font.h };
  }
  var F = {
    normal: makeAtlas(window.FIXED_9x15, BLACK, WHITE),
    inverse: makeAtlas(window.FIXED_9x15, WHITE, BLACK),
    menu: makeAtlas(window.FIXED_9x15B, WHITE, BLACK),
    titleInk: makeAtlas(window.FIXED_7x13B, WHITE, null),
    titleHalo: makeAtlas(window.FIXED_7x13B, BLACK, null)
  };
  function text(atlas, x, y, s) {
    for (var i = 0; i < s.length; i++) {
      var k = s.charCodeAt(i) - 32;
      if (k < 0 || k > 94) k = 31;      // '?' for anything outside ASCII
      g.drawImage(atlas.img, k * atlas.w, 0, atlas.w, atlas.h, x + i * atlas.w, y, atlas.w, atlas.h);
    }
  }
  function rect(x, y, w, h, c) { g.fillStyle = c; g.fillRect(x, y, w, h); }

  var stipple = (function () {
    var c = document.createElement('canvas'); c.width = 2; c.height = 2;
    var x = c.getContext('2d');
    // the grey mwm title bar, as a one-bit screen dump renders it
    x.fillStyle = '#000'; x.fillRect(0, 0, 2, 2);
    x.fillStyle = '#fff'; x.fillRect(0, 0, 1, 1);
    return g.createPattern(c, 'repeat');
  })();

  // ---- buffers ------------------------------------------------------------
  function wrap(str, width) {
    var out = [];
    str.split('\n').forEach(function (para) {
      if (para === '') { out.push(''); return; }
      var line = '';
      para.split(' ').forEach(function (w) {
        if (line === '') line = w;
        else if (line.length + 1 + w.length <= width) line += ' ' + w;
        else { out.push(line); line = w; }
      });
      out.push(line);
    });
    return out;
  }

  // Earlier in the file: the opening of the Remembrance Agent section, from
  // Rhodes & Starner's own description. The last paragraph is the one in the
  // screenshot, line for line.
  var EARLIER = wrap(
    'The Remembrance Agent\n\n' +
    'Most of a desktop computer\'s time is spent waiting: waiting for the user to hit the next keystroke, waiting for the user to read the next page, and waiting for the next packet to come down the network.  The Remembrance Agent (RA) uses those wasted CPU cycles constructively by performing continuous searches for information that might be of use in its user\'s current situation.  For example, while an engineer reads email about a project the RA reminds her of project schedules, status reports, and other resources related to the project in question.  When she stops reading email and starts editing a file, the RA automatically changes its recommendations accordingly.\n\n' +
    'These suggestions are presented in the form of one-line summaries at the bottom of the screen.  Here they can be easily monitored, but won\'t distract from the primary work at hand.  The full text of a suggestion can be brought up with a single keystroke.\n\n' +
    'Most applications for augmenting human memory have concentrated on recall-on-demand.  For example, they can answer questions such as "when is that conference paper deadline?".  However, they do not address situations where a user does not remember enough to realize he or she has forgotten something in the first place.  This associative form of recall is what reminds a user that an important conference exists at all.  The RA augments this continuous, associative form of recall.', FILL);
  var SCREEN = [
    '',
    'As a user collects a large database of private knowledge, his RA becomes an',
    'expert on that knowledge base through constant re-training.  A goal of the',
    'RA is to allow co-workers to conveniently access the ``public\'\' portions of',
    'this database without interrupting the user.  Thus, if a colleague wants to',
    'know about augmented reality, he simply sends a message to the user\'s',
    'Remembrance Agent, for example, thad-ra@media.mit.edu.  The RA can then',
    'return its best guess at an appropriate file.  Thus, the user is never',
    'bothered by the query, never has to format his knowledge (i.e. some mark-up',
    'language), and the colleague feels free to use the resource as opposed to',
    'knocking on an office door.  Knowledge transfer may occur in a similar',
    'fashion.  When an engineer trains his replacement, he can also transfer his',
    'RA database of knowledge on the subject so that his replacement may',
    'continually get the benefit of his experience even after he has left.',
    'Finally, if a large collective of people use Remembrance Agents, queries',
    'can be sent to communities, not just individuals.  This allows questions of',
    'the form ``How do I reboot a Sun workstation?\'\' '
  ];

  var main = {
    name: 'wearables.paper',
    mode: '(Text Remembrance Fill)',
    lines: EARLIER.concat(SCREEN),
    top: EARLIER.length,
    r: EARLIER.length + SCREEN.length - 1,
    c: SCREEN[SCREEN.length - 1].length,
    modified: true,
    ro: false
  };
  var doc = null;          // the suggestion being read, if any
  var cur = main;
  var echo = '';           // minibuffer
  var prefix = '';         // pending C-c / C-x

  // ---- the agent ----------------------------------------------------------
  var STOP = {};
  ('a an and are as at be been but by can could did do does for from had has have he her here him his how i if in into is it its ' +
   'just may me more most my no not of on one or our out she so some than that the their them then there these they this those to too ' +
   'up us was we were what when where which who will with would you your about after again all also am any because before being ' +
   'both each few get got like much need now off only other over same should such through under until very want while s t d ll re ve ' +
   'e i.e etc th st nd rd anyone anybody everyone everybody everything someone something anything ever never really still maybe ' +
   'going go goes gone went got come came know known think thought say said see seen saw look take taken make made ' +
   'many every always often lot bit thing things way kind sort please thanks thank hi hey ok okay yes yeah').split(' ').forEach(function (w) { STOP[w] = 1; });

  function stem(w) {
    // plural
    if (w.length > 4 && /ies$/.test(w)) w = w.slice(0, -3) + 'y';
    else if (w.length > 4 && /es$/.test(w) && !/[aeiou]es$/.test(w)) w = w.slice(0, -2);
    else if (w.length > 3 && /s$/.test(w) && !/ss$/.test(w)) w = w.slice(0, -1);
    // -ing, -ed, -er
    if (w.length > 5 && /ing$/.test(w)) w = w.slice(0, -3);
    else if (w.length > 4 && /ed$/.test(w)) w = w.slice(0, -2);
    else if (w.length > 5 && /er$/.test(w)) w = w.slice(0, -2);
    if (w.length > 3 && /(.)\1$/.test(w) && !/(ll|ss|ee|oo)$/.test(w)) w = w.slice(0, -1);   // running -> run
    if (w.length > 3 && /e$/.test(w)) w = w.slice(0, -1);
    return w;
  }
  function rawWords(s) { return s.toLowerCase().match(/[a-z][a-z0-9']*/g) || []; }
  function terms(words) {
    var out = [];
    for (var i = 0; i < words.length; i++) {
      var w = words[i].replace(/'/g, '');
      if (w.length < 2 || STOP[w]) continue;
      out.push(stem(w));
    }
    return out;
  }

  var DOCS = window.RA_CORPUS.map(function (d, i) {
    var t = terms(rawWords(d.s + ' ' + d.s + ' ' + d.b));   // the subject counts double
    var tf = {};
    t.forEach(function (w) { tf[w] = (tf[w] || 0) + 1; });
    return { id: i, s: d.s, f: d.f, d: d.d, b: d.b, tf: tf };
  });
  var IDF = {};
  (function () {
    var df = {};
    DOCS.forEach(function (d) { for (var w in d.tf) df[w] = (df[w] || 0) + 1; });
    for (var w in df) IDF[w] = Math.log(1 + DOCS.length / df[w]);
    DOCS.forEach(function (d) {
      var n = 0, w;
      d.vec = {};
      for (w in d.tf) { d.vec[w] = (1 + Math.log(d.tf[w])) * IDF[w]; n += d.vec[w] * d.vec[w]; }
      n = Math.sqrt(n);
      for (w in d.vec) d.vec[w] /= n;
    });
  })();

  function rank(words) {
    var tf = {}, w, n = 0, q = {};
    terms(words).forEach(function (t) { if (IDF[t]) tf[t] = (tf[t] || 0) + 1; });
    for (w in tf) { q[w] = (1 + Math.log(tf[w])) * IDF[w]; n += q[w] * q[w]; }
    n = Math.sqrt(n);
    if (!n) return [];
    var out = [];
    DOCS.forEach(function (d) {
      var s = 0;
      for (var w in q) if (d.vec[w]) s += q[w] * d.vec[w];
      if (s > 0) out.push({ id: d.id, score: s / n });
    });
    out.sort(function (a, b) { return b.score - a.score; });
    return out;
  }

  function byTitle(t) { for (var i = 0; i < DOCS.length; i++) if (DOCS[i].s === t) return DOCS[i].id; return 0; }
  // The three lines in the screenshot, scores and all, until something changes.
  var shown = [
    { id: byTitle('Boston local: Wearable Computing talk take 2'), score: 0.31 },
    { id: byTitle('mobile Linux web page'), score: 0.25 },
    { id: byTitle('rebooting workstations in the agents area'), score: 0.51 }
  ];

  var MIN_SCORE = 0.04;
  function suggest() {
    var used = {}, next = [null, null, null];
    function pick(lists) {
      for (var l = 0; l < lists.length; l++) {
        for (var i = 0; i < lists[l].length; i++) {
          var e = lists[l][i];
          if (e.score < MIN_SCORE) break;
          if (!used[e.id]) { used[e.id] = 1; return e; }
        }
      }
      return null;
    }
    // "By default the RA will not make suggestions based on a suggestion
    // that has been retrieved": while one is being read, the list stays put.
    if (cur === doc) return false;
    // Three scopes centred on the cursor, one display line each: the last
    // thousand words, a middle distance, and the last ten. The narrowest
    // chooses first. (The paper's middle scope is fifty words; it is thirty
    // here so that a visitor's second sentence already registers.)
    var before = cur.lines.slice(0, cur.r).join(' ') + ' ' + cur.lines[cur.r].slice(0, cur.c);
    var words = rawWords(before);
    // Likewise for the exhibit: once the visitor has typed something, the
    // ten-word scope stops at the point where they began, so that even a
    // short first sentence gets an answer of its own.
    var own = (mark !== null && before.length > mark) ? rawWords(before.slice(mark)) : [];
    var near = rank((own.length ? own : words).slice(-10)), mid = rank(words.slice(-30)), far = rank(words.slice(-1000));
    next[2] = pick([near, mid, far]);
    next[1] = pick([mid, far, near]);
    next[0] = pick([far, mid, near]);
    var changed = false;
    for (var i = 0; i < 3; i++) {
      if (next[i] && (next[i].id !== shown[i].id || Math.abs(next[i].score - shown[i].score) > 0.004)) {
        shown[i] = next[i]; changed = true;
      }
    }
    return changed;
  }
  function raLine(i) {
    var e = shown[i];
    return (i + 1) + '   ' + e.score.toFixed(2) + ' ' + DOCS[e.id].s;
  }

  // ---- editing ------------------------------------------------------------
  var dirty = false, lastInput = 0, lastSuggest = 0;
  function touched() { dirty = true; lastInput = Date.now(); }

  function clampCol(b) { if (b.c > b.lines[b.r].length) b.c = b.lines[b.r].length; }
  function reveal(b) {
    // Emacs recentres when point leaves the window.
    if (b.r < b.top || b.r >= b.top + ROWS) b.top = Math.max(0, b.r - (ROWS >> 1));
  }
  function readOnly() { echo = 'Buffer is read-only: #<buffer ' + cur.name + '>'; }

  function autoFill(b) {
    var line = b.lines[b.r];
    if (line.length <= FILL) return;
    var cut = line.lastIndexOf(' ', FILL);
    if (cut <= 0) return;
    var head = line.slice(0, cut).replace(/ +$/, ''), tail = line.slice(cut + 1);
    b.lines.splice(b.r, 1, head, tail);
    if (b.c > cut) { b.r++; b.c -= cut + 1; } else if (b.c > head.length) b.c = head.length;
  }
  var mark = null;         // where in the buffer the visitor started typing
  function offset(b) { for (var i = 0, n = 0; i < b.r; i++) n += b.lines[i].length + 1; return n + b.c; }
  function insert(ch) {
    if (cur.ro) return readOnly();
    if (mark === null) mark = offset(cur);
    var l = cur.lines[cur.r];
    cur.lines[cur.r] = l.slice(0, cur.c) + ch + l.slice(cur.c);
    cur.c++;
    if (ch === ' ' || cur.lines[cur.r].length > FILL + 4) autoFill(cur);
    cur.modified = true;
  }
  function newline() {
    if (cur.ro) return readOnly();
    var l = cur.lines[cur.r];
    cur.lines.splice(cur.r, 1, l.slice(0, cur.c), l.slice(cur.c));
    cur.r++; cur.c = 0; cur.modified = true;
  }
  function backspace() {
    if (cur.ro) return readOnly();
    if (cur.c > 0) {
      var l = cur.lines[cur.r];
      cur.lines[cur.r] = l.slice(0, cur.c - 1) + l.slice(cur.c); cur.c--;
    } else if (cur.r > 0) {
      var prev = cur.lines[cur.r - 1];
      cur.lines.splice(cur.r - 1, 2, prev + cur.lines[cur.r]);
      cur.r--; cur.c = prev.length;
    } else { echo = 'Beginning of buffer'; return; }
    cur.modified = true;
  }
  function del() {
    if (cur.ro) return readOnly();
    var l = cur.lines[cur.r];
    if (cur.c < l.length) cur.lines[cur.r] = l.slice(0, cur.c) + l.slice(cur.c + 1);
    else if (cur.r < cur.lines.length - 1) cur.lines.splice(cur.r, 2, l + cur.lines[cur.r + 1]);
    else { echo = 'End of buffer'; return; }
    cur.modified = true;
  }
  function killLine() {
    if (cur.ro) return readOnly();
    var l = cur.lines[cur.r];
    if (cur.c < l.length) cur.lines[cur.r] = l.slice(0, cur.c);
    else if (cur.r < cur.lines.length - 1) cur.lines.splice(cur.r, 2, l + cur.lines[cur.r + 1]);
    else { echo = 'End of buffer'; return; }
    cur.modified = true;
  }
  function move(dr, dc) {
    if (dc < 0) {
      if (cur.c > 0) cur.c--;
      else if (cur.r > 0) { cur.r--; cur.c = cur.lines[cur.r].length; }
      else echo = 'Beginning of buffer';
    } else if (dc > 0) {
      if (cur.c < cur.lines[cur.r].length) cur.c++;
      else if (cur.r < cur.lines.length - 1) { cur.r++; cur.c = 0; }
      else echo = 'End of buffer';
    }
    if (dr) {
      var r = cur.r + dr;
      if (r < 0) { r = 0; echo = 'Beginning of buffer'; }
      if (r > cur.lines.length - 1) { r = cur.lines.length - 1; echo = 'End of buffer'; }
      cur.r = r; clampCol(cur);
    }
  }
  function page(dir) {
    var step = ROWS - 2;
    cur.top = Math.max(0, Math.min(Math.max(0, cur.lines.length - 1), cur.top + dir * step));
    if (cur.r < cur.top) cur.r = cur.top;
    if (cur.r >= cur.top + ROWS) cur.r = cur.top + ROWS - 1;
    clampCol(cur);
  }

  // ---- reading a suggestion ----------------------------------------------
  function view(n) {
    var e = shown[n - 1];
    if (!e) return;
    var d = DOCS[e.id];
    var lines = ['From: ' + d.f, 'Date: ' + d.d, 'Subject: ' + d.s, ''].concat(wrap(d.b, 72));
    doc = {
      id: d.id, name: '*remem-document-output*', mode: '(Fundamental Remembrance)',
      lines: lines, top: 0, r: 0, c: 0, modified: false, ro: true
    };
    cur = doc;
    echo = 'Type q to return to ' + main.name;
    touched(); lastInput = 0;     // let the agent react to the new context at once
  }
  function back() {
    if (cur === main) return;
    cur = main; doc = null; echo = '';
    touched(); lastInput = 0;
  }

  // ---- drawing ------------------------------------------------------------
  function modeLine(b) {
    var name = b.name; while (name.length < 17) name += ' ';
    var n = b.lines.length, atTop = b.top === 0, atBot = b.top + ROWS >= n, pos;
    if (atTop && atBot) pos = 'All';
    else if (atTop) pos = 'Top';
    else if (atBot) pos = 'Bot';
    else pos = Math.floor(100 * b.top / n) + '%';
    var s = '--' + (b.ro ? '%%' : (b.modified ? '**' : '--')) + '-Emacs: ' + name + '    ' + b.mode + '--' + pos + '--';
    while (s.length < COLS) s += '-';
    return s.slice(0, COLS);
  }
  function scrollbar(y, h, from, to) {
    // An Athena scroll bar: a hairline box with a solid black thumb.
    rect(SB_X, y, SB_W, h, '#7f7f7f');
    rect(SB_X + 1, y + 1, SB_W - 2, h - 2, '#fff');
    var inner = h - 4, a = Math.round(inner * from), b = Math.max(a + 6, Math.round(inner * to));
    if (b > inner) { a -= b - inner; b = inner; }
    rect(SB_X + 2, y + 2 + a, SB_W - 4, b - a, '#000');
  }
  function draw() {
    var i, y, s;
    rect(0, 0, W, H, '#fff');

    // twm frame and title bar
    rect(0, 0, W, H, '#000'); rect(1, 1, W - 2, H - 2, '#fff');
    g.fillStyle = stipple; g.fillRect(2, 2, W - 4, 17);
    rect(2, 19, W - 4, 1, '#000');
    rect(2, 20, W - 4, H - 22, '#fff');
    function button(x, kind) {
      rect(x, 3, 15, 15, '#fff'); g.fillStyle = stipple; g.fillRect(x + 1, 4, 13, 13);
      if (kind === 'icon') { rect(x + 5, 8, 5, 5, '#fff'); rect(x + 6, 9, 3, 3, '#000'); }
      if (kind === 'size') { rect(x + 3, 6, 9, 9, '#fff'); rect(x + 4, 7, 7, 7, '#000'); rect(x + 4, 7, 4, 4, '#fff'); }
      if (kind === 'full') { rect(x + 3, 6, 9, 9, '#fff'); rect(x + 4, 8, 7, 6, '#000'); }
    }
    button(4, 'icon'); button(W - 36, 'full'); button(W - 19, 'size');
    // mwm drew the title in white straight onto the (dithered) title bar
    var title = 'emacs@hattrick.media.mit.edu', tx = Math.round((W - title.length * 7) / 2);
    [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(function (o) { text(F.titleHalo, tx + o[0], 4 + o[1], title); });
    text(F.titleInk, tx, 4, title);

    // menu bar
    rect(4, Y_MENU, W - 8, MENU_H, '#000');
    text(F.menu, 9, Y_MENU + 2, 'Buffers File Edit Help');

    // the buffer
    for (i = 0; i < ROWS; i++) {
      s = cur.lines[cur.top + i];
      if (s !== undefined) text(F.normal, X0, Y_TEXT + i * CH, s.slice(0, COLS));
    }
    if (cur.r >= cur.top && cur.r < cur.top + ROWS && cur.c < COLS) {
      var ch = cur.lines[cur.r].charAt(cur.c) || ' ';
      text(F.inverse, X0 + cur.c * CW, Y_TEXT + (cur.r - cur.top) * CH, ch);
    }
    var n = Math.max(cur.lines.length, 1);
    scrollbar(Y_TEXT, ROWS * CH, cur.top / n, Math.min(1, (cur.top + ROWS) / n));

    // mode line
    rect(4, Y_MODE, TEXT_R - 4 + 2, CH, '#000');
    text(F.inverse, X0, Y_MODE, modeLine(cur));

    // the agent's window
    for (i = 0; i < RA_LINES; i++) text(F.normal, X0, Y_RA + i * CH, raLine(i).slice(0, COLS));
    scrollbar(Y_RA, RA_LINES * CH, 0, 1);
    rect(4, Y_RAMODE, TEXT_R - 4 + 2, CH, '#000');
    text(F.inverse, X0, Y_RAMODE, '  *remem-display*');

    // minibuffer
    y = Y_MINI + 2;
    text(F.normal, X0, y, (prefix ? prefix + '-' : echo).slice(0, COLS));
    rect(SB_X, y + 1, SB_W, 13, '#7f7f7f'); rect(SB_X + 1, y + 2, SB_W - 2, 11, '#fff'); rect(SB_X + 2, y + 3, SB_W - 4, 9, '#000');
  }

  // ---- keyboard -----------------------------------------------------------
  function keyName(e) {
    var k = e.key.length === 1 ? e.key : e.key.toLowerCase();
    return (e.ctrlKey ? 'C-' : '') + k;
  }
  function onKey(e) {
    if (e.metaKey) return;                               // leave the browser's own shortcuts alone
    var k = e.key;
    if (k === 'Shift' || k === 'Control' || k === 'Alt' || k === 'Meta' || k === 'CapsLock') return;
    e.preventDefault();
    echo = '';
    var ctrl = e.ctrlKey, lk = k.length === 1 ? k.toLowerCase() : k;

    if (prefix) {
      var p = prefix; prefix = '';
      if (ctrl && lk === 'g') { echo = 'Quit'; }
      else if (p === 'C-c' && /^[1-9]$/.test(k)) {
        if (+k <= RA_LINES) view(+k); else echo = 'No suggestion on line ' + k;
      }
      else if (p === 'C-c' && k === '0') back();
      else if (p === 'C-x' && !ctrl && (lk === 'b' || lk === 'k')) back();
      else if (p === 'C-x' && ctrl && lk === 's') {
        if (main.modified) { main.modified = false; echo = 'Wrote ' + main.name; } else echo = '(No changes need to be saved)';
      }
      else if (p === 'C-x' && ctrl && lk === 'c') { location.href = 'index.html'; return; }   // leaving Emacs leaves the slide
      else echo = p + ' ' + keyName(e) + ' is undefined';
      draw(); return;
    }

    if (e.altKey) { echo = 'M-' + (e.code.replace(/^Key|^Digit/, '').toLowerCase()) + ' is undefined'; draw(); return; }
    if (ctrl) {
      switch (lk) {
        case 'c': prefix = 'C-c'; break;
        case 'x': prefix = 'C-x'; break;
        case 'g': echo = 'Quit'; break;
        case 'a': cur.c = 0; break;
        case 'e': cur.c = cur.lines[cur.r].length; break;
        case 'f': move(0, 1); break;
        case 'b': move(0, -1); break;
        case 'n': move(1, 0); break;
        case 'p': move(-1, 0); break;
        case 'd': del(); break;
        case 'k': killLine(); break;
        case 'v': page(1); break;
        case 'l': cur.top = Math.max(0, cur.r - (ROWS >> 1)); break;
        default: echo = keyName(e) + ' is undefined';
      }
    } else if (k === 'Escape') { if (cur === doc) back(); }
    else if (k === 'ArrowLeft') move(0, -1);
    else if (k === 'ArrowRight') move(0, 1);
    else if (k === 'ArrowUp') move(-1, 0);
    else if (k === 'ArrowDown') move(1, 0);
    else if (k === 'PageDown') page(1);
    else if (k === 'PageUp') page(-1);
    else if (k === 'Home') cur.c = 0;
    else if (k === 'End') cur.c = cur.lines[cur.r].length;
    else if (k === 'Backspace') backspace();
    else if (k === 'Delete') del();
    else if (k === 'Enter') newline();
    else if (k === 'Tab') { do insert(' '); while (!cur.ro && cur.c % 8); }
    else if (k.length === 1) {
      if (cur === doc) {
        if (lk === 'q') back();
        else if (k === ' ') page(1);
        else readOnly();
      } else {
        var code = k.charCodeAt(0);
        insert(code >= 32 && code < 127 ? k : (k === '’' ? '\'' : '?'));
      }
    }
    if (cur === doc && !echo && !prefix) echo = 'Type q to return to ' + main.name;
    reveal(cur);
    touched();
    draw();
  }

  // ---- mouse --------------------------------------------------------------
  function at(e) {
    var b = canvas.getBoundingClientRect();
    return { x: (e.clientX - b.left) * W / b.width, y: (e.clientY - b.top) * H / b.height };
  }
  canvas.addEventListener('mousedown', function (e) {
    var p = at(e);
    echo = ''; prefix = '';
    if (p.y >= Y_RA && p.y < Y_RAMODE && p.x < TEXT_R) {
      view(Math.min(RA_LINES, 1 + Math.floor((p.y - Y_RA) / CH)));
    } else if (p.y >= Y_TEXT && p.y < Y_MODE && p.x < TEXT_R + 4) {
      var r = Math.min(cur.lines.length - 1, cur.top + Math.floor((p.y - Y_TEXT) / CH));
      cur.r = r;
      cur.c = Math.max(0, Math.min(cur.lines[r].length, Math.round((p.x - X0) / CW)));
      if (cur === doc) echo = 'Type q to return to ' + main.name;
      touched();
    }
    draw();
  });
  canvas.addEventListener('mousemove', function (e) {
    var p = at(e);
    canvas.style.cursor = (p.y >= Y_RA && p.y < Y_RAMODE && p.x < TEXT_R) ? 'pointer'
      : (p.y >= Y_TEXT && p.y < Y_MODE && p.x < TEXT_R) ? 'text' : 'default';
  });
  canvas.addEventListener('wheel', function (e) {
    e.preventDefault();
    var d = e.deltaY > 0 ? 2 : -2;
    cur.top = Math.max(0, Math.min(Math.max(0, cur.lines.length - 3), cur.top + d));
    if (cur.r < cur.top) cur.r = cur.top;
    if (cur.r >= cur.top + ROWS) cur.r = cur.top + ROWS - 1;
    clampCol(cur);
    draw();
  }, { passive: false });

  if (!window.Shell || !window.Shell.thumb) window.addEventListener('keydown', onKey);

  // ---- the agent runs continuously ---------------------------------------
  // "Every few seconds it collects the text ... around the current cursor
  // position and sends this text to the information retrieval program."
  setInterval(function () {
    if (!dirty) return;
    var now = Date.now();
    if (now - lastInput > 900 || now - lastSuggest > 3000) {
      dirty = false; lastSuggest = now;
      if (suggest()) draw();
    }
  }, 250);

  draw();

  // For the test harness.
  window.RA = { suggest: suggest, shown: shown, docs: DOCS, rank: rank, rawWords: rawWords, main: main, early: EARLIER.length };
})();
