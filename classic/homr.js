/* HOMR for 1990s browsers: the Firefly-era page, served the way Firefly
   served it, as plain HTML forms. The social information filter is the one
   in js/homr.js (Ringo's constrained Pearson correlation over a seeded
   community), run here on the server for each visitor. */
'use strict';

const { BASE, esc, rng, img, spacer, select, hidden } = require('./lib');

const label = {
  title: 'HOMR',
  credit: 'Upendra Shardanand, Max Metral & Pattie Maes, 1994-1996',
  hint: 'Rate a few of these artists from the menus, press <i>Submit and Send More</i>, and see how the next five change. Click an artist, or <i>people</i>, to see why.'
};

// ---- the world, built as in js/homr.js -------------------------------------
const rnd = rng(1996);
const ME = 'Finagler';

const SCALE = {
  7: '7: BOOM! A favorite.',
  6: '6: Solid. Up there.',
  5: '5: Good stuff.',
  4: '4: Doesn’t bother me.',
  3: '3: Eh. Not my thing.',
  2: '2: Barely tolerable.',
  1: '1: Pass the earplugs.'
};

const ARTISTS = [
  ['Pink Floyd', 'ce'], ['Roger Waters', 'c'], ['Dire Straits', 'c'], ['Mark Knopfler', 'cs'], ['Led Zeppelin', 'ch'],
  ['The Who', 'c'], ['Genesis', 'cp'], ['Peter Gabriel', 'ci'], ['Rush', 'ch'], ['Yes', 'c'], ['Jethro Tull', 'c'],
  ['Eric Clapton', 'cs'], ['The Beatles', 'cp'], ['The Rolling Stones', 'c'], ['The Beach Boys', 'cp'], ['Be Bop Deluxe', 'c'],
  ['R.E.M.', 'ai'], ['Toad The Wet Sprocket', 'a'], ['Lemonheads', 'ai'], ['Counting Crows', 'as'], ['Gin Blossoms', 'a'],
  ['Live', 'ah'], ['Hootie & the Blowfish', 'ap'], ['Matthew Sweet', 'a'], ['They Might Be Giants', 'ai'],
  ['Barenaked Ladies', 'a'], ['Crowded House', 'ac'], ['10,000 Maniacs', 'as'], ['Indigo Girls', 'as'], ['B-52s', 'ap'],
  ['Sugarcubes', 'i'], ['Björk', 'ie'], ['Pixies', 'i'], ['Sonic Youth', 'i'], ['Cocteau Twins', 'ie'], ['The Cure', 'i'],
  ['The Smiths', 'i'], ['New Order', 'ie'], ['Depeche Mode', 'ie'], ['PJ Harvey', 'is'], ['Throwing Muses', 'i'],
  ['The Breeders', 'i'], ['My Bloody Valentine', 'i'], ['Dinosaur Jr.', 'ih'], ['The Velvet Underground', 'ic'],
  ['Mudhoney', 'ih'], ['Grifters', 'i'], ['Beat Happening', 'i'], ['Babes in Toyland', 'ih'], ['Laurie Anderson', 'ie'],
  ['Nirvana', 'hi'], ['Pearl Jam', 'ha'], ['Soundgarden', 'h'], ['Alice in Chains', 'h'], ['Smashing Pumpkins', 'hi'],
  ['Stone Temple Pilots', 'h'], ['Metallica', 'h'], ['Nine Inch Nails', 'he'], ['Tool', 'h'], ['AC/DC', 'hc'], ['Aerosmith', 'hc'],
  ['The Orb', 'e'], ['Orbital', 'e'], ['Aphex Twin', 'e'], ['Brian Eno', 'ec'], ['Kraftwerk', 'e'], ['Massive Attack', 'er'],
  ['Portishead', 'ei'], ['Tricky', 'er'], ['Autechre', 'e'], ['Negativland', 'ei'],
  ['Tori Amos', 'si'], ['Sarah McLachlan', 'sa'], ['Suzanne Vega', 's'], ['Joni Mitchell', 'sc'], ['Bob Dylan', 'sc'],
  ['Neil Young', 'sc'], ['Leonard Cohen', 's'], ['Tom Waits', 's'], ['Elvis Costello', 'sa'], ['Paul Simon', 'sc'],
  ['Madonna', 'p'], ['Paula Abdul', 'p'], ['Ace of Base', 'p'], ['Bryan Adams', 'pc'], ['Mariah Carey', 'p'],
  ['Michael Jackson', 'pr'], ['Prince', 'pr'], ['Alanis Morissette', 'pa'], ['Sheryl Crow', 'ps'], ['Bee Gees', 'pc'],
  ['Beastie Boys', 'ri'], ['A Tribe Called Quest', 'rj'], ['De La Soul', 'r'], ['Public Enemy', 'r'],
  ['Arrested Development', 'r'], ['Fugees', 'rp'],
  ['Miles Davis', 'j'], ['John Coltrane', 'j'], ['Harry Connick, Jr.', 'jp'], ['Alpha Blondy', 'j'], ['Bob Marley', 'jc'],
  ['Ella Fitzgerald', 'j']
].map(function (a, i) {
  return { id: i, name: a[0], g: a[1], bias: (rnd() - 0.5) * 1.0, extras: [rnd() < 0.6, rnd() < 0.45, rnd() < 0.3] };
});
function byName(n) { for (var i = 0; i < ARTISTS.length; i++) if (ARTISTS[i].name === n) return ARTISTS[i]; }

const ALIASES = ('Moonbeam vinyljunkie DrBenway Sprocket LunaC tinear Zarathud mixtape Ophelia static Kilgore bluenote ' +
  'feedback Persephone wombat ElRay halcyon reverb Calliope dubplate MrTambourine fuzzbox Lorelei sidetwo Ignatius ' +
  'quietloud Marzipan lofi Thelonius needledrop Esperanza wahwah Bartleby hiss Clementine overdub Ulysses bside ' +
  'Seraphina tapehead Algernon flanger Mirabelle rewind Octavian liner_notes Winnifred echoplex Balthazar 45rpm ' +
  'Guinevere tremolo Leopold scratch Henrietta sustain Fitzgerald crossfade Wilhelmina dropD').split(' ');
const CLUSTERS = 'caihesprj';
const USERS = ALIASES.map(function (alias) {
  var aff = {}, k, r = {};
  for (k = 0; k < CLUSTERS.length; k++) aff[CLUSTERS[k]] = (rnd() - 0.5) * 0.7;
  var order = CLUSTERS.split('').sort(function () { return rnd() - 0.5; });
  aff[order[0]] = 0.85 + rnd() * 0.25;
  if (rnd() < 0.7) aff[order[1]] = 0.5 + rnd() * 0.4;
  aff[order[2]] = -0.9 + rnd() * 0.3;
  if (rnd() < 0.6) aff[order[3]] = -0.7 + rnd() * 0.4;
  ARTISTS.forEach(function (a) {
    if (rnd() > 0.5) return;
    var v = 4 + 2.7 * aff[a.g[0]] + (a.g[1] ? 1.0 * aff[a.g[1]] : 0) + a.bias + (rnd() - 0.5) * 1.6;
    r[a.id] = Math.max(1, Math.min(7, Math.round(v)));
  });
  return { alias: alias, r: r };
});

const KNOWN = [['Pink Floyd', 7], ['Dire Straits', 6], ['The Beatles', 6], ['Peter Gabriel', 6], ['Led Zeppelin', 5], ['R.E.M.', 6],
  ['Counting Crows', 5], ['Gin Blossoms', 5], ['Björk', 6], ['Pixies', 5], ['The Cure', 5], ['Paula Abdul', 2],
  ['Ace of Base', 1], ['Bryan Adams', 2], ['Metallica', 3], ['AC/DC', 3], ['Mariah Carey', 2]];

const REVIEWS = {
  7: ['The most amazing band ever.', 'Has been a big part of my life. If you don’t have the albums, go, no, better yet, run and pick them up.', 'Perfect for almost any mood.', 'I wore out the tape. Twice.'],
  6: ['Solid. Not a weak album in the bunch.', 'Their albums until the last one were excellent.', 'Better live than on record, and the records are good.'],
  5: ['Good stuff, in small doses.', 'A couple of great songs and a fair amount of filler.'],
  4: ['Doesn’t turn me on, doesn’t bother me.', 'Fine. I never put it on myself.'],
  3: ['Eh. I keep trying and it keeps not working.', 'They have become a tad too tame and predictable.'],
  2: ['Barely tolerable. My roommate disagrees, loudly.', 'One good single does not make a career.'],
  1: ['Pass the earplugs.', 'Not for me. Not even a little.']
};

// ---- one visitor ---------------------------------------------------------
function create() {
  var s = { mine: {}, told: {}, seen: {}, current: null };
  KNOWN.forEach(function (p) { s.mine[byName(p[0]).id] = p[1]; });
  // the five in the figure, with the little icons each one had
  s.current = [
    { a: byName('Roger Waters'), why: 'Recommended', extras: [true, false, false] },
    { a: byName('Mark Knopfler'), why: 'Suggested', extras: [false, false, false] },
    { a: byName('Sugarcubes'), why: 'Suggested', extras: [true, true, false] },
    { a: byName('Toad The Wet Sprocket'), why: 'Suggested', extras: [true, false, true], order: 'ac' },
    { a: byName('Lemonheads'), why: 'Suggested', extras: [true, true, false] }
  ];
  s.current.forEach(function (c) { s.seen[c.a.id] = 1; });
  return s;
}

// ---- social information filtering -------------------------------------
function similarity(s, u, v) {
  var num = 0, du = 0, dv = 0, n = 0, a, x, y, w;
  for (a in u) if (v[a]) { w = s.told[a] ? 3 : 1; x = u[a] - 4; y = v[a] - 4; num += w * x * y; du += w * x * x; dv += w * y * y; n++; }
  if (n < 3 || !du || !dv) return 0;
  return num / Math.sqrt(du * dv) * Math.min(1, n / 6);
}
function neighbours(s) {
  return USERS.map(function (u) { return { u: u, s: similarity(s, s.mine, u.r) }; })
    .filter(function (n) { return n.s > 0.25; })
    .sort(function (a, b) { return b.s - a.s; });
}
function predictions(s) {
  var nb = neighbours(s), out = [];
  ARTISTS.forEach(function (a) {
    var num = 0, den = 0, n = 0;
    nb.forEach(function (x) { var r = x.u.r[a.id]; if (r) { num += x.s * r; den += x.s; n++; } });
    if (n >= 2) out.push({ a: a, p: num / den, n: n });
  });
  return out;
}
function predictFor(s, a) {
  var all = predictions(s);
  for (var i = 0; i < all.length; i++) if (all[i].a === a) return all[i];
  return null;
}
function confidence(n) { return n >= 9 ? 'high' : n >= 5 ? 'fair' : 'low'; }
function nextFive(s) {
  var all = predictions(s).filter(function (x) { return !s.mine[x.a.id] && !s.seen[x.a.id]; });
  all.sort(function (x, y) { return (y.p + Math.min(y.n, 8) * 0.03) - (x.p + Math.min(x.n, 8) * 0.03); });
  if (all.length < 5) { s.seen = {}; return nextFive(s); }
  return all.slice(0, 5).map(function (x) {
    s.seen[x.a.id] = 1;
    return { a: x.a, why: (x.p >= 5.8 && x.n >= 5) ? 'Recommended' : 'Suggested', extras: x.a.extras };
  });
}

/* A rating chosen from a menu. "not rated yet" leaves a rating alone, as the
   modern version does; only a changed rating counts as a fresh opinion. */
function rate(s, id, v) {
  v = +v;
  if (!(v >= 1 && v <= 7) || !ARTISTS[id]) return;
  if (s.mine[id] !== v) s.told[id] = 1;
  s.mine[id] = v;
}

// ---- pages ---------------------------------------------------------------
function icons(extras, order) {
  var out = '', seq = order || 'bac';     // sound clip, then reviews, then discography
  for (var i = 0; i < seq.length; i++) {
    var k = seq[i], on = k === 'a' ? extras[0] : k === 'b' ? extras[1] : extras[2];
    if (on) out += img('ff-ico-' + k + '.gif', 16, 11, 'hspace="1" alt=""');
  }
  return out;
}
function menu(s, id) {
  var cur = s.mine[id] || 0;
  return select('r' + id, [0, 7, 6, 5, 4, 3, 2, 1].map(function (v) {
    var star = (v === 0 ? !s.mine[id] : s.mine[id] === v) ? '*' : '';
    return [v, star + (v === 0 ? 'not rated yet' : SCALE[v])];
  }), cur);
}

function page(s, base, n, view, arg) {
  function href(p) { return base + '/' + p; }
  function artistLink(a, cls) { return '<a href="' + href('artist/' + a.id) + '"' + (cls ? ' class="' + cls + '"' : '') + '>' + esc(a.name) + '</a>'; }
  function back(to, text) { return '<p class="foot"><a href="' + href(to) + '">' + text + '</a></p>'; }

  function masthead(here) {
    function nav(k, t) {
      return '[<a href="' + href(k) + '"' + (here === k ? ' class="here"' : '') + '>' + t.split('').join('&nbsp;') + '</a>]';
    }
    return '<center>' + img('ff-banner.jpg', 557, 77, 'usemap="#banner" alt="firefly music"') +
      '<map name="banner"><area shape="rect" coords="0,0,185,77" href="' + href('people') + '" alt="people">' +
      '<area shape="rect" coords="185,0,375,77" href="' + href('welcome') + '" alt="welcome">' +
      '<area shape="rect" coords="375,0,557,77" href="' + href('buzz') + '" alt="buzz"></map><br>' +
      '<font size="1" class="nav"><b>' + nav('people', 'PEOPLE') + ' &nbsp; &nbsp; ' + nav('welcome', 'WELCOME') + ' &nbsp; &nbsp; ' + nav('buzz', 'BUZZ') + '</b></font></center>';
  }
  function heading(html) { return '<p class="h2"><font size="5" class="h2f">' + html + '</font></p>'; }

  var V = {
    recs: function () {
      // the figure's layout, with the spacing pulled in to fit a small window
      var h = masthead() + spacer(1, 3) + '<br><form method="get" action="' + href('recs') + '">' + hidden({ do: 'send', n: n }) +
        '<table border="0" cellspacing="0" cellpadding="0" width="635">' +
        '<tr><td colspan="4">' + spacer(22, 1) + '<font size="5" class="h2f"><a href="' + href('me') + '" class="plain">' + ME + '</a><b>, You should check out these artists.</b></font></td></tr>' +
        '<tr><td width="71">' + spacer(71, 1) + '</td><td colspan="3"><font class="note">An asterisk indicates your current rating.</font></td></tr>' +
        '<tr><td colspan="4">' + spacer(1, 6) + '</td></tr>';
      s.current.forEach(function (c) {
        h += '<tr><td></td><td width="53">' + spacer(53, 1) + '</td><td valign="middle" nowrap>' + menu(s, c.a.id) + '&nbsp;&nbsp;&nbsp;</td>' +
          '<td valign="middle" width="100%"><font size="4" class="artist"><b>' + artistLink(c.a) + '</b></font></td></tr>' +
          '<tr><td></td><td></td><td colspan="2"><tt class="tt">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + c.why + '</tt>' + icons(c.extras, c.order) + '</td></tr>' +
          '<tr><td colspan="4">' + spacer(1, 1) + '</td></tr>';
      });
      return h +
        '<tr><td></td><td></td><td colspan="2">' + img('ff-dots.gif', 503, 1) + '</td></tr>' +
        '<tr><td colspan="4">' + spacer(1, 6) + '</td></tr>' +
        '<tr><td></td><td></td><td valign="middle" nowrap><input type="submit" value="Submit and Send More">&nbsp;&nbsp;&nbsp;</td>' +
        '<td valign="middle"><table border="0" cellspacing="0" cellpadding="0"><tr><td valign="middle">' + img('ff-spiral.gif', 102, 52) + '</td>' +
        '<td width="10">' + spacer(10, 1) + '</td><td valign="middle" nowrap><font class="tell">Tell <b>firefly</b></font><br><tt class="tt">what you\u2019re looking for</tt></td></tr></table></td></tr>' +
        '</table></form>';
    },

    artist: function (id) {
      var a = ARTISTS[id];
      if (!a) return V.recs();
      var p = predictFor(s, a), h = masthead() + spacer(1, 4) + heading('<b>' + esc(a.name) + '</b>') + '<div class="body">';
      if (s.mine[id]) h += '<p class="lead">You gave ' + esc(a.name) + ' a ' + s.mine[id] + '.</p>';
      else if (p) h += '<p class="lead"><b>firefly</b> thinks you would give ' + esc(a.name) + ' a <b>' + p.p.toFixed(1) +
        '</b>. <tt class="tt">(confidence: ' + confidence(p.n) + ')</tt></p>';
      else h += '<p class="lead"><b>firefly</b> does not know enough yet to guess what you would think of ' + esc(a.name) + '.</p>';
      h += '<form method="get" action="' + href('artist/' + id) + '"><p class="lead">' + hidden({ do: 'rate', n: n }) + menu(s, id) + ' &nbsp; <input type="submit" value="Submit"></p></form>';

      var said = neighbours(s).concat(USERS.map(function (u) { return { u: u, s: 0 }; }))
        .filter(function (x, i, arr) { return x.u.r[id] && arr.findIndex(function (y) { return y.u === x.u; }) === i; })
        .slice(0, 2);
      if (said.length) {
        h += '<p>What members with taste like yours say:</p>';
        said.forEach(function (x, i) {
          var r = x.u.r[id], pool = REVIEWS[r];
          h += '<p class="quote"><i>' + pool[(id + i * 3 + x.u.alias.length) % pool.length] + '</i> <tt class="tt">— ' + x.u.alias + ', who rated it ' + r + '</tt></p>';
        });
      }
      var score = {};
      USERS.forEach(function (u) {
        if ((u.r[id] || 0) < 6) return;
        for (var k in u.r) if (+k !== id && u.r[k] >= 6) score[k] = (score[k] || 0) + 1;
      });
      var also = Object.keys(score).sort(function (x, y) { return score[y] - score[x] || x - y; }).slice(0, 4);
      if (also.length) {
        h += '<p>People who love ' + esc(a.name) + ' also love ' + also.map(function (k) { return artistLink(ARTISTS[k]); }).join(', ') + '.</p>';
      }
      return h + '</div>' + back('recs', 'Back to your recommendations');
    },

    people: function () {
      var nb = neighbours(s).slice(0, 5), h = masthead('people') + spacer(1, 4) +
        heading('<a href="' + href('me') + '" class="plain">' + ME + '</a><b>, You should meet these people.</b>') +
        '<div class="body"><p class="lead">Their taste in music is the closest to yours. <b>firefly</b> draws on what they love when it picks artists for you.</p>' +
        '<table border="0" cellspacing="0" cellpadding="1" class="list">';
      nb.forEach(function (x) {
        var raves = Object.keys(x.u.r).filter(function (k) { return x.u.r[k] === 7 && !s.mine[k]; }).slice(0, 2);
        h += '<tr><td nowrap valign="top"><font class="big"><a href="' + href('user/' + x.u.alias) + '">' + x.u.alias + '</a></font> &nbsp; &nbsp; </td><td nowrap valign="top"><tt class="tt">' + Math.round(x.s * 100) + '% like you</tt> &nbsp; &nbsp; </td>' +
          '<td valign="top">' + (raves.length ? 'raves about ' + raves.map(function (k) { return artistLink(ARTISTS[k]); }).join(' and ') : 'has rated the same things you have') + '</td></tr>';
      });
      return h + '</table></div>' + back('recs', 'Back to your recommendations');
    },

    user: function (alias) {
      var u = USERS.filter(function (x) { return x.alias === alias; })[0];
      if (!u) return V.people();
      var h = masthead('people') + spacer(1, 4) + heading('<b>' + alias + '</b>') + '<div class="body">';
      var both = Object.keys(u.r).filter(function (k) { return s.mine[k]; });
      var loves = Object.keys(u.r).filter(function (k) { return u.r[k] >= 6 && !s.mine[k]; }).slice(0, 8);
      h += '<p class="lead">You and ' + alias + ' have rated ' + both.length + ' of the same artists.</p><table border="0" cellspacing="0" cellpadding="1" class="list">';
      both.slice(0, 7).forEach(function (k) {
        h += '<tr><td nowrap>' + artistLink(ARTISTS[k]) + ' &nbsp; &nbsp; </td><td nowrap><tt class="tt">you ' + s.mine[k] + '</tt> &nbsp; &nbsp; </td><td nowrap><tt class="tt">' + alias + ' ' + u.r[k] + '</tt></td></tr>';
      });
      h += '</table>';
      if (loves.length) h += '<p>' + alias + ' also loves ' + loves.map(function (k) { return artistLink(ARTISTS[k]); }).join(', ') + '.</p>';
      return h + '</div>' + back('people', 'Back to people');
    },

    buzz: function () {
      var rows = ARTISTS.map(function (a) {
        var sum = 0, cnt = 0; USERS.forEach(function (u) { if (u.r[a.id]) { sum += u.r[a.id]; cnt++; } });
        return { a: a, avg: cnt ? sum / cnt : 0, n: cnt };
      }).filter(function (r) { return r.n >= 12; }).sort(function (x, y) { return y.avg - x.avg; }).slice(0, 10);
      var h = masthead('buzz') + spacer(1, 4) + heading('<b>The buzz.</b>') + '<div class="body"><p class="lead">The artists <b>firefly</b> members rate most highly right now, whatever your own taste.</p><table border="0" cellspacing="0" cellpadding="1" class="list">';
      rows.forEach(function (r, i) {
        h += '<tr><td align="right">' + (i + 1) + '. &nbsp;</td><td nowrap>' + artistLink(r.a) + ' &nbsp; &nbsp; </td><td nowrap><tt class="tt">' + r.avg.toFixed(1) + ' from ' + r.n + ' members</tt></td></tr>';
      });
      return h + '</table></div>' + back('recs', 'Back to your recommendations');
    },

    welcome: function () {
      return masthead('welcome') + spacer(1, 4) + heading('<b>Welcome to firefly.</b>') + '<div class="body">' +
        '<p class="lead">Tell <b>firefly</b> which music you love and which you can’t stand. It finds the members whose taste is most like yours and passes along what they are listening to, the way a friend would.</p>' +
        '<p class="lead">The more you rate, the better it knows you.</p>' +
        '<ul><li><a href="' + href('recs') + '">See the artists picked for you</a><li><a href="' + href('me') + '">See what firefly knows about you</a>' +
        '<li><a href="' + href('people') + '">Meet people with taste like yours</a><li><a href="' + href('buzz') + '">Hear the buzz</a></ul></div>';
    },

    me: function () {
      var ids = Object.keys(s.mine).sort(function (x, y) { return s.mine[y] - s.mine[x] || ARTISTS[x].name.localeCompare(ARTISTS[y].name); });
      var h = masthead() + spacer(1, 4) + heading('<b>' + ME + ', this is what firefly knows about you.</b>') + '<div class="body">' +
        '<p class="lead">You have rated ' + ids.length + ' artists. An asterisk indicates your current rating; change any of them from the artist’s page.</p>' +
        '<table border="0" cellspacing="0" cellpadding="0" class="list">';
      var half = Math.ceil(Math.min(ids.length, 34) / 2);
      for (var i = 0; i < half; i++) {
        h += '<tr>';
        [ids[i], ids[i + half]].forEach(function (k) {
          h += k === undefined ? '<td></td><td></td>' : '<td><tt class="tt">*' + s.mine[k] + '</tt>&nbsp;&nbsp;</td><td nowrap>' + artistLink(ARTISTS[k]) + ' &nbsp; &nbsp; &nbsp; &nbsp;</td>';
        });
        h += '</tr>';
      }
      return h + '</table></div>' + back('recs', 'Back to your recommendations');
    }
  };
  return (V[view] || V.recs)(arg);
}

/* Firefly's page, laid out in the original's pixels on Netscape's grey. */
const css =
  '.ff, .ff p, .ff td, .ff li { font-family: Times, "Times New Roman", serif; font-size: 17px; line-height: 22px; color: #000000; }\n' +
  '.ff a { color: #9a9a9c; }\n' +
  '.ff a.here { color: #6f6f78; }\n' +
  '.ff a.plain { font-weight: normal; }\n' +
  '.ff .nav { font-family: Times, serif; font-size: 11px; line-height: 13px; }\n' +
  '.ff .h2 { margin: 6px 0px 6px 22px; }\n' +
  '.ff .h2f { font-family: Times, serif; font-size: 22px; line-height: 28px; }\n' +
  '.ff .note { font-size: 17px; }\n' +
  '.ff .artist { font-size: 21px; line-height: 26px; }\n' +
  '.ff .tt { font-family: Monaco, "Courier New", Courier, monospace; font-size: 12px; line-height: 16px; color: #1a1a1a; }\n' +
  '.ff .tell { font-size: 17px; }\n' +
  '.ff .body { margin: 0px 44px 0px 44px; }\n' +
  '.ff .lead { margin-left: 27px; }\n' +
  '.ff .quote { margin-left: 27px; }\n' +
  '.ff .list { margin-left: 27px; }\n' +
  '.ff .big { font-weight: bold; font-size: 19px; line-height: 23px; }\n' +
  '.ff .list td { line-height: 18px; }\n' +
  '.ff p { margin-top: 0px; margin-bottom: 8px; }\n' +
  '.ff .foot { margin: 10px 0px 0px 44px; }\n';

function respond(s, req) {
  var view = req.path[0] || 'recs', arg = req.path[1];
  if (req.fresh && req.q.do === 'send') {
    s.current.forEach(function (c) { rate(s, c.a.id, req.q['r' + c.a.id]); });
    s.current = nextFive(s);
    view = 'recs';
  }
  if (req.fresh && req.q.do === 'rate' && view === 'artist') rate(s, +arg, req.q['r' + arg]);
  if (view === 'artist') arg = +arg;
  if (view === 'user') arg = decodeURIComponent(arg || '');
  return {
    title: 'firefly',
    body: { bgcolor: '#c7c3cf', text: '#000000', link: '#9a9a9c', vlink: '#9a9a9c', alink: '#6f6f78' },
    css: css,
    html: '<center><table border="0" cellspacing="0" cellpadding="0" width="635" class="ff"><tr><td>' + spacer(1, 8) + '<br>' +
      page(s, req.base, req.n, view, arg) + spacer(1, 8) + '</td></tr></table></center>'
  };
}

module.exports = { key: 'homr', label: label, create: create, respond: respond, _world: { ARTISTS: ARTISTS, USERS: USERS } };
