/* The Original Agents, for 1990s browsers (Mac OS 9 and earlier).

   node classic/server.js            then open http://localhost:8040/classic/
   PORT=8040 HOST=127.0.0.1 IDLE=300 are the defaults.

   The modern exhibit is JavaScript in the browser. Period browsers (Internet
   Explorer 5 and Netscape 4 for the Mac, iCab, Classilla) cannot run it, so
   this version does the work on the server, as HOMR, Yenta and Kasbah
   originally did, and sends plain HTML 3.2 pages with GIF and JPEG images.
   No page contains any JavaScript.

   Each visitor's state lives on the server, keyed by a short id in the URL
   (old browsers, and the oldweb.today proxy, cannot be relied on for
   cookies). Forms use GET. An action is applied once: reloading its URL
   shows the result again without repeating it. Plain HTTP only, since these
   browsers cannot speak modern TLS. Needs Node 18 or later, nothing else. */
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { BASE, esc, ascii, img, spacer } = require('./lib');

const PORT = +process.env.PORT || 8040;
const HOST = process.env.HOST || '127.0.0.1';
const IDLE = process.env.IDLE === undefined ? 300 : +process.env.IDLE;   // seconds untouched before a prototype returns to the start; 0 = never
const SESSION_TTL = 3 * 3600 * 1000;
const MAX_SESSIONS = 5000;

const AGENTS = [require('./homr'), require('./ra'), require('./yenta'), require('./kasbah')];
const BY_KEY = {};
AGENTS.forEach(function (a, i) { a.index = i; BY_KEY[a.key] = a; });

const C = { indigo: '#413f92', yellow: '#e8e72e', red: '#e44627', lilac: '#b9b7ea', soft: '#dcdbf4' };

// ---- sessions ----------------------------------------------------------------
const sessions = new Map();
function newId() { return crypto.randomBytes(5).toString('base64').replace(/[^A-Za-z0-9]/g, '').slice(0, 6).toLowerCase() || newId(); }
function session(agent, id, now) {
  var s = sessions.get(agent.key + '/' + id);
  if (!s) {
    // an unknown or expired id simply starts afresh under the same name
    if (sessions.size >= MAX_SESSIONS) sessions.delete(sessions.keys().next().value);
    s = { state: agent.create(now), done: new Set(), seq: 0, seen: now };
    sessions.set(agent.key + '/' + id, s);
  }
  s.seen = now;
  return s;
}
setInterval(function () {
  var now = Date.now();
  sessions.forEach(function (s, k) { if (now - s.seen > SESSION_TTL) sessions.delete(k); });
}, 10 * 60 * 1000).unref();

/* Form data from a period browser arrives in the page's own character set,
   ISO 8859-1, so it is decoded byte for byte rather than as UTF-8. */
function parseQuery(raw) {
  var q = {};
  if (!raw) return q;
  raw.split('&').forEach(function (part) {
    if (!part) return;
    var i = part.indexOf('='), k = i < 0 ? part : part.slice(0, i), v = i < 0 ? '' : part.slice(i + 1);
    function dec(x) { return x.replace(/\+/g, ' ').replace(/%([0-9a-fA-F]{2})/g, function (m, h) { return String.fromCharCode(parseInt(h, 16)); }); }
    q[dec(k)] = dec(v);
  });
  return q;
}

// ---- the page around every prototype -------------------------------------------
function absolute(req, p) { return 'http://' + (req.headers.host || 'localhost:' + PORT) + p; }

const SHELL_CSS =
  'body { margin: 0px; }\n' +
  'a.band { text-decoration: none; }\n' +
  '.cap { font-family: Helvetica, Arial, sans-serif; font-size: 10px; letter-spacing: 2px; }\n' +
  '.ttl { font-family: Times, "Times New Roman", serif; font-size: 28px; line-height: 30px; }\n' +
  '.abt { font-family: Times, "Times New Roman", serif; font-size: 14px; line-height: 17px; }\n';

/* The label over each prototype, kept to about 80 pixels so that the screen
   below it fits a small browser window: the way back, the title and credit,
   and what to do. */
function band(agent, req) {
  var L = agent.label, i = agent.index, n = AGENTS.length;
  var prev = AGENTS[(i + n - 1) % n], next = AGENTS[(i + 1) % n];
  function link(href, text, colour) { return '<a class="band" href="' + href + '"><font color="' + (colour || C.lilac) + '">' + text + '</font></a>'; }
  function cap(text, colour) { return '<font face="Helvetica,Arial" size="1" class="cap" color="' + (colour || C.lilac) + '">' + text + '</font>'; }
  return '<table border="0" cellspacing="0" cellpadding="0" width="100%" bgcolor="' + C.indigo + '"><tr><td>' +
    '<table border="0" cellspacing="0" cellpadding="0" width="100%"><tr>' +
    '<td width="16">' + spacer(16, 1) + '</td>' +
    '<td valign="top" nowrap>' + spacer(1, 7) + '<br>' + cap(link(BASE + '/', '&laquo;&nbsp;THE FIRST SIGNS OF AGENTS')) + '</td>' +
    '<td valign="top" align="right" nowrap>' + spacer(1, 7) + '<br>' +
    cap(link(BASE + '/' + agent.key + '/', 'START OVER') + ' &nbsp; &nbsp; &nbsp; ' + link(BASE + '/' + prev.key + '/', '&laquo;') + ' &nbsp; ' +
      '<font color="#ffffff">' + (i + 1) + '</font> / ' + n + ' &nbsp; ' + link(BASE + '/' + next.key + '/', '&raquo;')) + '</td>' +
    '<td width="16">' + spacer(16, 1) + '</td></tr>' +
    '<tr><td></td><td colspan="2"><table border="0" cellspacing="0" cellpadding="0" width="100%"><tr>' +
    '<td valign="top" nowrap><font face="Times" size="5" class="ttl" color="' + (L.red ? C.red : C.yellow) + '">' + esc(L.title) + '</font></td>' +
    '<td width="22">' + spacer(22, 1) + '</td>' +
    '<td valign="top" width="100%">' + spacer(1, 8) + '<br>' + cap('USE IT', C.yellow) + '&nbsp;&nbsp; <font face="Times" size="3" class="abt" color="#ffffff">' + L.hint + '</font></td>' +
    '</tr></table></td><td></td></tr>' +
    '<tr><td></td><td colspan="2">' + spacer(1, 2) + '<br>' + cap(esc(L.credit.toUpperCase())) + '</td><td></td></tr>' +
    '<tr><td colspan="4">' + spacer(1, 8) + '</td></tr></table></td></tr></table>';
}

function document_(req, o) {
  var b = o.body || {};
  var meta = '';
  if (o.refresh) meta = '<meta http-equiv="refresh" content="' + o.refresh.secs + ';URL=' + absolute(req, o.refresh.url) + '">\n';
  else if (o.idle && IDLE > 0) meta = '<meta http-equiv="refresh" content="' + IDLE + ';URL=' + absolute(req, BASE + '/') + '">\n';
  return '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 3.2 Final//EN">\n<html>\n<head>\n<title>' + esc(o.title) + '</title>\n' + meta +
    '<style type="text/css">\n<!--\n' + SHELL_CSS + (o.css || '') + '-->\n</style>\n</head>\n' +
    '<body bgcolor="' + (b.bgcolor || C.indigo) + '" text="' + (b.text || '#ffffff') + '" link="' + (b.link || C.yellow) + '" vlink="' + (b.vlink || C.yellow) + '" alink="' + (b.alink || '#ffffff') + '"' +
    ' marginwidth="0" marginheight="0" leftmargin="0" topmargin="0">\n' + o.html + '\n</body>\n</html>\n';
}

// ---- the start page --------------------------------------------------------------
const PROTOS = [
  { key: 'homr', thumb: 'thumb-homr.jpg', name: 'HOMR', who: 'Upendra Shardanand, Max Metral & Pattie Maes', what: 'A personal critic that learns your taste in music from people like you.' },
  { key: 'ra', thumb: 'thumb-ra.jpg', name: 'Remembrance Agent', who: 'Bradley Rhodes & Thad Starner', what: 'A memory that reads over your shoulder and reminds you of what you once knew.' },
  { key: 'yenta', thumb: 'thumb-yenta.jpg', name: 'Yenta', who: 'Leonard Foner', what: 'A matchmaker that introduces you to strangers who share your interests.' },
  { key: 'kasbah', thumb: 'thumb-kasbah.jpg', name: 'Kasbah', who: 'Anthony Chavez & Pattie Maes', what: 'A marketplace where your agent does the haggling for you.' }
];

/* The start page's music: "Retro Gadget Waltz", two minutes, converted from
   the WAV in assets/ (not in the repository; see the README) to a plain MP3
   that QuickTime of the time can play: MPEG-1 Layer III, 128 kbps,
   44.1 kHz, no ID3 tag.

   Browsers of the time do not know <audio>, so they skip it and use what is
   inside: an <embed> that the browser hands to the QuickTime plug-in
   (QuickTime 4 and later, so every Mac OS 9), shown as QuickTime's own
   controller bar, because some browsers do not start a hidden plug-in. A
   modern browser plays the <audio> instead. Both try to start on their own
   and loop; if the browser holds the sound back, the play button is there.
   It plays on the start page only: each prototype page reloads, which would
   start it again every time. */
const MUSIC_URL = BASE + '/sound/agents.mp3';
const MUSIC =
  '<audio src="' + MUSIC_URL + '" autoplay loop controls style="width: 210px; height: 28px; vertical-align: middle;">' +
  '<embed src="' + MUSIC_URL + '" type="audio/mpeg" width="180" height="16" autoplay="true" autostart="true" loop="true" controller="true" volume="80" bgcolor="#413f92" align="absmiddle">' +
  '<noembed><bgsound src="' + MUSIC_URL + '" loop="infinite"><a href="' + MUSIC_URL + '">play</a></noembed>' +
  '</audio>';

/* The start page is drawn for a window of about 780 by 560, the size of the
   Mac OS 9 machine's. A modern browser in a larger window enlarges it to
   fill the window, in steps, as the modern exhibit scales its stage. These
   are CSS3 media queries, which browsers of the time skip entirely. */
const ZOOM = [1.15, 1.3, 1.45, 1.6, 1.8, 2, 2.3, 2.6].map(function (z) {
  return '@media (min-width: ' + Math.round(780 * z) + 'px) and (min-height: ' + Math.round(560 * z) + 'px) { body { zoom: ' + z + '; } }\n';
}).join('');

function startPage(req) {
  var css =
    '.big { font-family: Times, "Times New Roman", serif; font-size: 54px; line-height: 56px; }\n' +
    '.lede { font-family: Times, "Times New Roman", serif; font-size: 18px; line-height: 23px; }\n' +
    '.quote { font-family: Times, "Times New Roman", serif; font-size: 15px; line-height: 20px; font-style: italic; }\n' +
    '.name { font-family: Times, "Times New Roman", serif; font-size: 22px; line-height: 25px; color: #ffffff; }\n' +
    '.who { font-family: Georgia, Times, serif; font-size: 13px; line-height: 16px; font-style: italic; }\n' +
    '.what { font-family: Times, "Times New Roman", serif; font-size: 14px; line-height: 17px; }\n' +
    ZOOM;
  function cap(text, colour) { return '<font face="Helvetica,Arial" size="1" class="cap" color="' + (colour || C.lilac) + '">' + text + '</font>'; }
  var cols = PROTOS.map(function (p, i) {
    var href = BASE + '/' + p.key + '/';
    // a 420-pixel picture shown at 172, so it stays sharp when a modern
    // browser enlarges the page (Netscape 4 cannot scale an image to a column)
    return '<td valign="top" width="25%"><a href="' + href + '">' + img(p.thumb, 172, 97, 'alt="' + p.name + '"') + '</a><br>' + spacer(1, 10) + '<br>' +
      cap('PROTOTYPE ' + (i + 1)) + '<br>' + spacer(1, 2) + '<br>' +
      '<a class="band" href="' + href + '"><font face="Times" size="5" class="name" color="#ffffff">' + p.name + '</font></a><br>' + spacer(1, 3) + '<br>' +
      '<font face="Georgia,Times" size="2" class="who" color="' + C.yellow + '"><i>' + esc(p.who) + '</i></font><br>' + spacer(1, 5) + '<br>' +
      '<font face="Times" size="2" class="what" color="' + C.soft + '">' + p.what + '</font><br>' + spacer(1, 6) + '<br>' +
      '<a class="band" href="' + href + '">' + cap('USE IT &raquo;', C.yellow) + '</a></td>' +
      (i < PROTOS.length - 1 ? '<td width="14">' + spacer(14, 1) + '</td>' : '');
  }).join('');
  var top =
    '<table border="0" cellspacing="0" cellpadding="0" width="100%"><tr>' +
    '<td valign="middle">' + spacer(1, 8) + '<br>' + cap('MIT MEDIA LAB &nbsp;/&nbsp; SOFTWARE AGENTS GROUP &nbsp;/&nbsp; 1994 - 1999') + '</td>' +
    '<td valign="bottom" align="right" nowrap>' + cap('MUSIC') + '&nbsp;&nbsp;' + MUSIC + '</td></tr></table>' +
    spacer(1, 4) + '<br><font face="Times" size="7" class="big" color="' + C.yellow + '">The First Signs of Agents</font><br>' + spacer(1, 10) + '<br>' +
    '<table border="0" cellspacing="0" cellpadding="0" width="100%"><tr>' +
    '<td valign="top" width="50%"><font face="Times" size="4" class="lede" color="#ffffff">Four software agents from Pattie Maes’s group, recreated as working prototypes. You can choose one below and use it.</font></td>' +
    '<td width="40">' + spacer(40, 1) + '</td>' +
    '<td valign="top"><font face="Times" size="3" class="quote" color="' + C.soft + '"><i>"We need to be able to delegate to what could be thought of as ‘extra eyes or extra ears’ that are on the lookout for things that you may be interested in."</i></font><br>' +
    spacer(1, 10) + '<br>' + cap('PATTIE MAES, DEBATING BEN SHNEIDERMAN, 1997') + '</td></tr></table>';
  var middle =
    '<table border="0" cellspacing="0" cellpadding="0" width="100%"><tr><td bgcolor="#7d7bbf">' + spacer(1, 1) + '</td></tr></table>' +
    spacer(1, 8) + '<br>' + cap('CHOOSE A PROTOTYPE TO USE', C.yellow) + '<br>' + spacer(1, 8) + '<br>' +
    '<table border="0" cellspacing="0" cellpadding="0" width="100%"><tr>' + cols + '</tr></table>';
  var bottom = cap('AFTER "DIRECT MANIPULATION VS. INTERFACE AGENTS", INTERACTIONS, NOV-DEC 1997') + '<br>' + spacer(1, 8);
  // centred in the window, whatever its height
  var html =
    '<table border="0" cellspacing="0" cellpadding="0" width="100%" height="100%"><tr><td width="22">' + spacer(22, 1) + '</td>' +
    '<td valign="middle">' + top + spacer(1, 12) + '<br>' + middle + spacer(1, 12) + '<br>' + bottom + '</td>' +
    '<td width="22">' + spacer(22, 1) + '</td></tr></table>';
  return document_(req, { title: 'The First Signs of Agents', css: css, html: html });
}

// ---- HTTP --------------------------------------------------------------------------
const IMG_DIR = path.join(__dirname, 'img');
const SOUND_DIR = path.join(__dirname, 'sound');
const TYPES = { '.gif': 'image/gif', '.jpg': 'image/jpeg', '.mp3': 'audio/mpeg' };

function send(res, status, headers, body) {
  headers['Content-Length'] = Buffer.byteLength(body);
  res.writeHead(status, headers);
  res.end(body);
}
function sendHtml(res, html) {
  // no-cache, in all three dialects old browsers understand
  send(res, 200, {
    'Content-Type': 'text/html; charset=iso-8859-1', 'Cache-Control': 'no-cache', 'Pragma': 'no-cache',
    'Expires': 'Thu, 01 Jan 1998 00:00:00 GMT'
  }, Buffer.from(ascii(html), 'latin1'));
}
function redirect(req, res, to) {
  var url = absolute(req, to);
  send(res, 302, { 'Location': url, 'Content-Type': 'text/html; charset=iso-8859-1' }, '<html><body><a href="' + url + '">Continue</a></body></html>');
}
function notFound(req, res) {
  send(res, 404, { 'Content-Type': 'text/html; charset=iso-8859-1' }, document_(req, {
    title: 'Not found', html: '<p>&nbsp;</p><center><font face="Times" size="4">There is nothing here. <a href="' + BASE + '/">Go to the start</a>.</font></center>'
  }));
}

function handle(req, res) {
  var now = Date.now();
  var full = req.url, qi = full.indexOf('?');
  var pathname = qi < 0 ? full : full.slice(0, qi), raw = qi < 0 ? '' : full.slice(qi + 1);
  if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, { 'Content-Type': 'text/plain', 'Allow': 'GET' }, 'GET only');

  if (pathname === '/' || pathname === BASE) return redirect(req, res, BASE + '/');
  if (pathname.indexOf(BASE + '/') !== 0) return notFound(req, res);
  var parts = pathname.slice(BASE.length + 1).split('/');

  if (parts[0] === '') return sendHtml(res, startPage(req));

  if ((parts[0] === 'img' && /^[a-z0-9-]+\.(gif|jpg)$/.test(parts[1]) || parts[0] === 'sound' && /^[a-z0-9-]+\.mp3$/.test(parts[1])) && parts.length === 2) {
    return fs.readFile(path.join(parts[0] === 'img' ? IMG_DIR : SOUND_DIR, parts[1]), function (err, data) {
      if (err) return notFound(req, res);
      send(res, 200, { 'Content-Type': TYPES[path.extname(parts[1])], 'Cache-Control': 'max-age=86400' }, data);
    });
  }

  var agent = BY_KEY[parts[0]];
  if (!agent) return notFound(req, res);
  // /classic/homr/ starts a visit: give it an id and go there
  if (parts.length < 3 || !/^[a-z0-9]{3,12}$/.test(parts[1])) return redirect(req, res, BASE + '/' + agent.key + '/' + newId() + '/');

  var id = parts[1], s = session(agent, id, now), q = parseQuery(raw);
  var fresh = false;
  if (q.do || q.cmd) {
    // an action happens once; the same URL again only shows where it led
    fresh = !s.done.has(raw);
    s.done.add(raw);
  }
  var out = agent.respond(s.state, {
    path: parts.slice(2).filter(function (p, i, a) { return p !== '' || i < a.length - 1; }),
    q: q, raw: raw, fresh: fresh, now: now, n: ++s.seq, base: BASE + '/' + agent.key + '/' + id
  });
  sendHtml(res, document_(req, {
    title: out.title, css: out.css, body: out.body, refresh: out.refresh, idle: true,
    html: band(agent, req) + out.html
  }));
}

if (require.main === module) {
  http.createServer(function (req, res) {
    try { handle(req, res); } catch (e) {
      console.error(e);
      if (!res.headersSent) send(res, 500, { 'Content-Type': 'text/plain' }, 'Something went wrong.');
    }
  }).listen(PORT, HOST, function () {
    console.log('The Original Agents, for 1990s browsers: http://' + HOST + ':' + PORT + BASE + '/');
  });
}

module.exports = { handle: handle, parseQuery: parseQuery };
