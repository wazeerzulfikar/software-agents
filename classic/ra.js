/* The Remembrance Agent for 1990s browsers.

   The Emacs window of the 1997 screenshot is built from a table, Monaco and a
   few small GIFs. Without JavaScript a page cannot watch each keystroke, so
   the line the cursor is on is a real text field: the visitor types there
   and presses Return, the server files the line into the buffer (auto-fill
   at column 75, as in the screenshot), and the agent looks again. The
   retrieval engine is the one in js/remembrance.js, over the same corpus. */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { BASE, esc, img, spacer, hidden } = require('./lib');

const label = {
  title: 'Remembrance agent',
  credit: 'Bradley Rhodes & Thad Starner, 1996',
  hint: 'Click at the end of the text, type a sentence or two and press <i>Return</i>. The bottom three lines change to match what you wrote. Click one of them to read it.'
};

const COLS = 80, ROWS = 17, RA_LINES = 3, FILL = 75;

// ---- the corpus, shared with the modern version ---------------------------
const CORPUS = (function () {
  var w = {};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '..', 'js', 'ra-corpus.js'), 'utf8'), { window: w });
  return w.RA_CORPUS;
})();

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

const EARLIER = wrap(
  'The Remembrance Agent\n\n' +
  'Most of a desktop computer\'s time is spent waiting: waiting for the user to hit the next keystroke, waiting for the user to read the next page, and waiting for the next packet to come down the network.  The Remembrance Agent (RA) uses those wasted CPU cycles constructively by performing continuous searches for information that might be of use in its user\'s current situation.  For example, while an engineer reads email about a project the RA reminds her of project schedules, status reports, and other resources related to the project in question.  When she stops reading email and starts editing a file, the RA automatically changes its recommendations accordingly.\n\n' +
  'These suggestions are presented in the form of one-line summaries at the bottom of the screen.  Here they can be easily monitored, but won\'t distract from the primary work at hand.  The full text of a suggestion can be brought up with a single keystroke.\n\n' +
  'Most applications for augmenting human memory have concentrated on recall-on-demand.  For example, they can answer questions such as "when is that conference paper deadline?".  However, they do not address situations where a user does not remember enough to realize he or she has forgotten something in the first place.  This associative form of recall is what reminds a user that an important conference exists at all.  The RA augments this continuous, associative form of recall.', FILL);
const SCREEN = [
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

// ---- the agent, as in js/remembrance.js -----------------------------------
const STOP = {};
('a an and are as at be been but by can could did do does for from had has have he her here him his how i if in into is it its ' +
 'just may me more most my no not of on one or our out she so some than that the their them then there these they this those to too ' +
 'up us was we were what when where which who will with would you your about after again all also am any because before being ' +
 'both each few get got like much need now off only other over same should such through under until very want while s t d ll re ve ' +
 'e i.e etc th st nd rd anyone anybody everyone everybody everything someone something anything ever never really still maybe ' +
 'going go goes gone went got come came know known think thought say said see seen saw look take taken make made ' +
 'many every always often lot bit thing things way kind sort please thanks thank hi hey ok okay yes yeah').split(' ').forEach(function (w) { STOP[w] = 1; });

function stem(w) {
  if (w.length > 4 && /ies$/.test(w)) w = w.slice(0, -3) + 'y';
  else if (w.length > 4 && /es$/.test(w) && !/[aeiou]es$/.test(w)) w = w.slice(0, -2);
  else if (w.length > 3 && /s$/.test(w) && !/ss$/.test(w)) w = w.slice(0, -1);
  if (w.length > 5 && /ing$/.test(w)) w = w.slice(0, -3);
  else if (w.length > 4 && /ed$/.test(w)) w = w.slice(0, -2);
  else if (w.length > 5 && /er$/.test(w)) w = w.slice(0, -2);
  if (w.length > 3 && /(.)\1$/.test(w) && !/(ll|ss|ee|oo)$/.test(w)) w = w.slice(0, -1);
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

const DOCS = CORPUS.map(function (d, i) {
  var t = terms(rawWords(d.s + ' ' + d.s + ' ' + d.b));
  var tf = {};
  t.forEach(function (w) { tf[w] = (tf[w] || 0) + 1; });
  return { id: i, s: d.s, f: d.f, d: d.d, b: d.b, tf: tf };
});
const IDF = {};
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

const MIN_SCORE = 0.04;
function suggest(b) {
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
  // Three scopes centred on the cursor: the last thousand words, the last
  // thirty, and the last ten (counted from where the visitor began, once
  // they have begun). The narrowest chooses first.
  var before = b.lines.slice(0, b.r).join(' ') + ' ' + b.lines[b.r].slice(0, b.c);
  var words = rawWords(before);
  var own = (b.mark !== null && before.length > b.mark) ? rawWords(before.slice(b.mark)) : [];
  var near = rank((own.length ? own : words).slice(-10)), mid = rank(words.slice(-30)), far = rank(words.slice(-1000));
  next[2] = pick([near, mid, far]);
  next[1] = pick([mid, far, near]);
  next[0] = pick([far, mid, near]);
  for (var i = 0; i < 3; i++) if (next[i]) b.shown[i] = next[i];
}

// ---- one visitor ---------------------------------------------------------
function create() {
  return {
    lines: EARLIER.concat(SCREEN),
    top: EARLIER.length,
    r: EARLIER.length + SCREEN.length - 1,
    c: SCREEN[SCREEN.length - 1].length,
    modified: true,
    mark: null,
    // the three lines in the screenshot, scores and all, until something changes
    shown: [
      { id: byTitle('Boston local: Wearable Computing talk take 2'), score: 0.31 },
      { id: byTitle('mobile Linux web page'), score: 0.25 },
      { id: byTitle('rebooting workstations in the agents area'), score: 0.51 }
    ],
    echo: ''
  };
}

function offset(b, r, c) { for (var i = 0, n = 0; i < r; i++) n += b.lines[i].length + 1; return n + c; }

/* What the visitor typed, kept to what the X11 font can show. */
function clean(t) {
  return String(t || '').replace(/[‘’]/g, '\'').replace(/[“”]/g, '"').replace(/\t/g, ' ')
    .replace(/[\r\n]/g, '').replace(/[^\x20-\x7e]/g, '?').slice(0, 400);
}

function type(b, t) {
  var old = b.lines[b.r];
  t = clean(t);
  if (t === old) {
    // Return on an unchanged line is a plain newline, as in Emacs.
    b.lines.splice(b.r + 1, 0, '');
    b.r++; b.c = 0;
  } else {
    if (b.mark === null) b.mark = offset(b, b.r, t.indexOf(old.replace(/ +$/, '')) === 0 ? old.replace(/ +$/, '').length : 0);
    b.lines[b.r] = t;
    // auto-fill: break the line at the last space before column 75
    while (b.lines[b.r].length > FILL) {
      var line = b.lines[b.r], cut = line.lastIndexOf(' ', FILL);
      if (cut <= 0) break;
      b.lines.splice(b.r, 1, line.slice(0, cut).replace(/ +$/, ''), line.slice(cut + 1));
      b.r++;
    }
    b.c = b.lines[b.r].length;
  }
  b.modified = true;
  if (b.r < b.top || b.r >= b.top + ROWS) b.top = Math.max(0, b.r - (ROWS >> 1));   // Emacs recentres
  suggest(b);
}

// ---- the window ------------------------------------------------------------
function pad(s, n) { while (s.length < n) s += ' '; return s; }
function modeLine(name, mode, flags, top, n) {
  var atTop = top === 0, atBot = top + ROWS >= n, pos;
  if (atTop && atBot) pos = 'All'; else if (atTop) pos = 'Top'; else if (atBot) pos = 'Bot'; else pos = Math.floor(100 * top / n) + '%';
  var s = '--' + flags + '-Emacs: ' + pad(name, 17) + '    ' + mode + '--' + pos + '--';
  while (s.length < COLS) s += '-';
  return s.slice(0, COLS);
}

const LH = 15;   // line height, in pixels, set by the stylesheet

/* An Athena scroll bar: a grey hairline box with a solid black thumb. */
function scrollbar(h, from, to) {
  var inner = h - 4, a = Math.round(inner * from), b = Math.max(a + 6, Math.round(inner * to));
  if (b > inner) { a -= b - inner; b = inner; }
  function row(hh, black) {
    return hh > 0 ? '<tr><td' + (black ? ' bgcolor="#000000"' : '') + ' height="' + hh + '">' + spacer(10, hh) + '</td></tr>' : '';
  }
  return '<table border="0" cellspacing="0" cellpadding="1" bgcolor="#7f7f7f"><tr><td>' +
    '<table border="0" cellspacing="0" cellpadding="1" bgcolor="#ffffff"><tr><td><table border="0" cellspacing="0" cellpadding="0">' +
    row(a, false) + row(b - a, true) + row(inner - b, false) + '</table></td></tr></table></td></tr></table>';
}

/* Monaco lines joined by <br>, every space kept. (A <pre> would be simpler,
   but Netscape 4 puts margins around one that no stylesheet can remove.) */
function text(s) { return esc(s).replace(/ /g, '&nbsp;') || '&nbsp;'; }
function mono(html, colour) {
  return '<font face="Monaco,Courier" size="2" class="e"' + (colour ? ' color="' + colour + '"' : '') + '>' + html + '</font>';
}
function pre(lines) { return mono(lines.map(text).join('<br>')); }

function window_(s, req, doc) {
  var base = req.base, rows, buffer, mode, n, top;
  if (doc) {
    var d = DOCS[doc.id];
    rows = ['From: ' + d.f, 'Date: ' + d.d, 'Subject: ' + d.s, ''].concat(wrap(d.b, 72));
    n = rows.length; top = 0;
    while (rows.length < ROWS) rows.push('');
    // point sits at the top of the document, on the F of From:
    var first = rows[0];
    buffer = mono('<span class="cur">' + text(first.charAt(0)) + '</span>' + text(first.slice(1)) + '<br>' +
      rows.slice(1, ROWS).map(text).join('<br>'));
    mode = modeLine('*remem-document-output*', '(Fundamental Remembrance)', '%%', 0, n);
  } else {
    n = s.lines.length; top = s.top;
    var vis = [];
    for (var i = 0; i < ROWS; i++) vis.push(s.lines[top + i] === undefined ? '' : s.lines[top + i].slice(0, COLS));
    var at = s.r - top;
    buffer = (at > 0 ? pre(vis.slice(0, at)) + '<br>' : '') +
      '<input type="text" name="t" value="' + esc(s.lines[s.r]) + '" size="80" maxlength="400" class="line">' +
      (at < ROWS - 1 ? '<br>' + pre(vis.slice(at + 1)) : '');
    mode = modeLine('wearables.paper', '(Text Remembrance Fill)', s.modified ? '**' : '--', top, n);
  }

  var ra = s.shown.map(function (e, i) {
    var line = (i + 1) + '   ' + e.score.toFixed(2) + ' ' + DOCS[e.id].s;
    return '<a href="' + base + '/doc/' + e.id + '" class="ra">' + text(line.slice(0, COLS)) + '</a>';
  }).join('<br>');

  var mini = doc ? '<a href="' + base + '/" class="back">Click here to return to wearables.paper</a>' : text(s.echo);

  return (doc ? '' : '<form method="get" action="' + base + '/">' + hidden({ do: 'type', n: req.n })) +
    '<table border="0" cellspacing="0" cellpadding="1" bgcolor="#000000"><tr><td>' +
    '<table border="0" cellspacing="0" cellpadding="1" bgcolor="#ffffff"><tr><td>' +
    '<table border="0" cellspacing="0" cellpadding="0" width="608">' +
    // twm's title bar
    '<tr><td background="' + BASE + '/img/ra-stipple.gif" bgcolor="#7f7f7f" height="17">' +
    '<table border="0" cellspacing="0" cellpadding="0" width="100%"><tr>' +
    '<td width="20" align="left">' + spacer(1, 1) + img('ra-btn-icon.gif', 15, 15) + '</td>' +
    '<td align="center">' + img('ra-title.gif', 198, 15, 'alt="emacs@hattrick.media.mit.edu"') + '</td>' +
    '<td width="36" align="right" nowrap>' + img('ra-btn-full.gif', 15, 15) + spacer(2, 1) + img('ra-btn-size.gif', 15, 15) + spacer(1, 1) + '</td>' +
    '</tr></table></td></tr>' +
    '<tr><td bgcolor="#000000">' + spacer(1, 1) + '</td></tr>' +
    '<tr><td>' + spacer(1, 2) + '</td></tr>' +
    '<tr><td><table border="0" cellspacing="0" cellpadding="0" width="100%">' +
    // Emacs's menu bar
    '<tr><td colspan="4" bgcolor="#000000">' + img('ra-menu.gif', 208, 20, 'alt="Buffers File Edit Help"') + '</td></tr>' +
    '<tr><td colspan="4">' + spacer(1, 2) + '</td></tr>' +
    // the buffer
    '<tr><td width="2">' + spacer(2, 1) + '</td><td valign="top" width="570" nowrap>' + buffer + '</td><td width="5">' + spacer(5, 1) + '</td>' +
    '<td valign="top" width="16">' + scrollbar(ROWS * LH, top / Math.max(n, 1), Math.min(1, (top + ROWS) / Math.max(n, 1))) + '</td></tr>' +
    '<tr><td colspan="2" bgcolor="#000000">' + mono(text(mode), '#ffffff') + '</td><td colspan="2"></td></tr>' +
    // the agent's own window, and its mode line
    '<tr><td></td><td valign="top" nowrap>' + mono(ra) + '</td><td></td><td valign="top">' + scrollbar(RA_LINES * LH, 0, 1) + '</td></tr>' +
    '<tr><td colspan="2" bgcolor="#000000">' + mono(text('  *remem-display*'), '#ffffff') + '</td><td colspan="2"></td></tr>' +
    // minibuffer
    '<tr><td></td><td nowrap>' + mono(mini) + '</td><td></td><td valign="top">' + scrollbar(13, 0, 1) + '</td></tr>' +
    '<tr><td colspan="4">' + spacer(1, 3) + '</td></tr>' +
    '</table></td></tr></table></td></tr></table></td></tr></table>' + (doc ? '' : '</form>');
}

const css =
  'font.e { font-family: Monaco, "Courier New", Courier, monospace; font-size: 12px; line-height: 15px; }\n' +
  'a.ra { color: #000000; text-decoration: none; }\n' +
  'a.back { color: #000000; }\n' +
  'span.cur { background: #000000; color: #ffffff; }\n' +
  'input.line { font-family: Monaco, "Courier New", Courier, monospace; font-size: 12px; }\n';

function respond(s, req) {
  var view = req.path[0] || '', doc = null;
  s.echo = '';
  if (req.fresh && req.q.do === 'type' && view === '') type(s, req.q.t);
  if (view === 'doc' && DOCS[+req.path[1]]) doc = { id: +req.path[1] };
  return {
    title: doc ? 'emacs: *remem-document-output*' : 'emacs: wearables.paper',
    body: { bgcolor: '#413f92', text: '#000000', link: '#000000', vlink: '#000000', alink: '#000000' },
    css: css,
    html: '<center>' + spacer(1, 4) + '<br>' + window_(s, req, doc) + '</center>'
  };
}

module.exports = { key: 'ra', label: label, create: create, respond: respond, _engine: { suggest: suggest, rank: rank, docs: DOCS } };
