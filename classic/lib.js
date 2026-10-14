/* The Original Agents, for 1990s browsers: shared helpers.
   Everything here produces HTML 3.2 with a little CSS1, so that a page reads
   the same in Netscape 3, Internet Explorer 4 or 5 for the Mac, iCab or
   Classilla. No page contains any JavaScript. */
'use strict';

const BASE = '/classic';

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/* Old Macintosh browsers each guess a page's character set differently, so
   every page goes out as plain ASCII: typographic quotes become straight
   ones, dashes become hyphens, and anything else is a numeric entity. */
function ascii(s) {
  return s
    .replace(/[‘’]/g, '\'')
    .replace(/[“”]/g, '"')
    .replace(/—/g, '--')
    .replace(/–/g, '-')
    .replace(/…/g, '...')
    .replace(/ /g, '&nbsp;')
    .replace(/[^\x00-\x7f]/g, function (c) { var n = c.charCodeAt(0); return n < 256 ? '&#' + n + ';' : '?'; });
}

/* Deterministic pseudo-random numbers, the same generator as js/shell.js, so
   every visitor meets the same simulated world. (It is not quite the modern
   version's world: browsers and Node shuffle with sort() differently.) */
function rng(seed) {
  var s = seed >>> 0;
  return function () {
    s = (s + 0x6D2B79F5) >>> 0;
    var t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function img(name, w, h, extra) {
  return '<img src="' + BASE + '/img/' + name + '" width="' + w + '" height="' + h + '" border="0"' + (extra ? ' ' + extra : ' alt=""') + '>';
}
function spacer(w, h) { return img('dot.gif', w, h); }

function select(name, options, value) {
  // options: [[value, label], ...]
  return '<select name="' + name + '">' + options.map(function (o) {
    return '<option value="' + esc(o[0]) + '"' + (String(o[0]) === String(value) ? ' selected' : '') + '>' + esc(o[1]);
  }).join('') + '</select>';
}

function hidden(fields) {
  return Object.keys(fields).map(function (k) { return '<input type="hidden" name="' + k + '" value="' + esc(fields[k]) + '">'; }).join('');
}

module.exports = { BASE: BASE, esc: esc, ascii: ascii, rng: rng, img: img, spacer: spacer, select: select, hidden: hidden };
