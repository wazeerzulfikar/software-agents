/* HOMR ("personal filters / personal critics"), which grew out of Ringo and
   became Firefly. The screen is the Firefly-era page in the 1997 figure.

   The page is the original one; behind it is a small working social
   information filter in the manner of Ringo (Shardanand & Maes, CHI 95):
   a community of simulated members with ratings on a 1-7 scale, similarity by
   constrained Pearson correlation, predictions as similarity-weighted
   averages. The first screen is exactly the one in the figure. After that the
   recommendations are computed from whatever the visitor rates. */
(function () {
  'use strict';

  var root = document.getElementById('ff');
  var rnd = window.Shell.rng(1996);
  var ME = 'Finagler';

  // Ringo's seven-point scale, in its own words (shortened to fit the menu).
  var SCALE = {
    7: '7: BOOM! A favorite.',
    6: '6: Solid. Up there.',
    5: '5: Good stuff.',
    4: '4: Doesn’t bother me.',
    3: '3: Eh. Not my thing.',
    2: '2: Barely tolerable.',
    1: '1: Pass the earplugs.'
  };

  // Artists and the taste clusters they sit in:
  // c classic rock, a college radio, i indie, h heavy, e electronic,
  // s songwriters, p pop, r hip-hop, j jazz and beyond.
  var ARTISTS = [
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

  // ---- the community ------------------------------------------------------
  var ALIASES = ('Moonbeam vinyljunkie DrBenway Sprocket LunaC tinear Zarathud mixtape Ophelia static Kilgore bluenote ' +
    'feedback Persephone wombat ElRay halcyon reverb Calliope dubplate MrTambourine fuzzbox Lorelei sidetwo Ignatius ' +
    'quietloud Marzipan lofi Thelonius needledrop Esperanza wahwah Bartleby hiss Clementine overdub Ulysses bside ' +
    'Seraphina tapehead Algernon flanger Mirabelle rewind Octavian liner_notes Winnifred echoplex Balthazar 45rpm ' +
    'Guinevere tremolo Leopold scratch Henrietta sustain Fitzgerald crossfade Wilhelmina dropD').split(' ');
  var CLUSTERS = 'caihesprj';
  var USERS = ALIASES.map(function (alias) {
    var aff = {}, k, r = {};
    for (k = 0; k < CLUSTERS.length; k++) aff[CLUSTERS[k]] = (rnd() - 0.5) * 0.7;
    // Everyone loves one or two things and can't stand one or two others.
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

  // What Firefly already knows about Finagler when the figure was captured.
  var mine = {};
  [['Pink Floyd', 7], ['Dire Straits', 6], ['The Beatles', 6], ['Peter Gabriel', 6], ['Led Zeppelin', 5], ['R.E.M.', 6],
   ['Counting Crows', 5], ['Gin Blossoms', 5], ['Björk', 6], ['Pixies', 5], ['The Cure', 5], ['Paula Abdul', 2],
   ['Ace of Base', 1], ['Bryan Adams', 2], ['Metallica', 3], ['AC/DC', 3], ['Mariah Carey', 2]]
    .forEach(function (p) { mine[byName(p[0]).id] = p[1]; });
  var pending = {};            // chosen in a menu but not yet submitted
  var seen = {};               // already offered as a recommendation

  // ---- social information filtering --------------------------------------
  var told = {};               // rated during this visit: fresh opinions weigh triple
  function similarity(u, v) {
    var num = 0, du = 0, dv = 0, n = 0, a, x, y, w;
    for (a in u) if (v[a]) { w = told[a] ? 3 : 1; x = u[a] - 4; y = v[a] - 4; num += w * x * y; du += w * x * x; dv += w * y * y; n++; }
    if (n < 3 || !du || !dv) return 0;
    return num / Math.sqrt(du * dv) * Math.min(1, n / 6);
  }
  function neighbours() {
    return USERS.map(function (u) { return { u: u, s: similarity(mine, u.r) }; })
      .filter(function (n) { return n.s > 0.25; })
      .sort(function (a, b) { return b.s - a.s; });
  }
  function predictions() {
    var nb = neighbours(), out = [];
    ARTISTS.forEach(function (a) {
      var num = 0, den = 0, n = 0;
      nb.forEach(function (x) { var r = x.u.r[a.id]; if (r) { num += x.s * r; den += x.s; n++; } });
      if (n >= 2) out.push({ a: a, p: num / den, n: n });
    });
    return out;
  }
  function predictFor(a) {
    var all = predictions();
    for (var i = 0; i < all.length; i++) if (all[i].a === a) return all[i];
    return null;
  }
  function confidence(n) { return n >= 9 ? 'high' : n >= 5 ? 'fair' : 'low'; }

  function nextFive() {
    var all = predictions().filter(function (x) { return !mine[x.a.id] && !seen[x.a.id]; });
    all.sort(function (x, y) { return (y.p + Math.min(y.n, 8) * 0.03) - (x.p + Math.min(x.n, 8) * 0.03); });
    if (all.length < 5) { seen = {}; return nextFive(); }
    return all.slice(0, 5).map(function (x) {
      seen[x.a.id] = 1;
      return { a: x.a, why: (x.p >= 5.8 && x.n >= 5) ? 'Recommended' : 'Suggested', extras: x.a.extras };
    });
  }

  // The five in the figure, with the little icons each one had.
  var current = [
    { a: byName('Roger Waters'), why: 'Recommended', extras: [true, false, false] },
    { a: byName('Mark Knopfler'), why: 'Suggested', extras: [false, false, false] },
    { a: byName('Sugarcubes'), why: 'Suggested', extras: [true, true, false] },
    { a: byName('Toad The Wet Sprocket'), why: 'Suggested', extras: [true, false, true], order: 'ac' },
    { a: byName('Lemonheads'), why: 'Suggested', extras: [true, true, false] }
  ];
  current.forEach(function (c) { seen[c.a.id] = 1; });

  // ---- the three tiny icons (reviews, sound clip, discography) -----------
  var ICON = (function () {
    function make(draw) {
      var c = document.createElement('canvas'); c.width = 16; c.height = 11;
      var x = c.getContext('2d'); x.fillStyle = '#000'; x.fillRect(0, 0, 16, 11); x.fillStyle = '#c7c3cf'; draw(x);
      return c.toDataURL();
    }
    return {
      a: make(function (x) { x.fillRect(2, 2, 12, 2); x.fillRect(2, 5, 12, 1); x.fillRect(2, 7, 12, 2); }),
      b: make(function (x) {
        x.fillRect(1, 4, 2, 3); x.fillRect(3, 3, 1, 5); x.fillRect(4, 2, 1, 7); x.fillRect(5, 1, 1, 9);
        x.fillRect(8, 3, 1, 5); x.fillRect(10, 2, 1, 1); x.fillRect(11, 3, 1, 5); x.fillRect(10, 8, 1, 1);
        x.fillRect(13, 1, 1, 1); x.fillRect(14, 2, 1, 7); x.fillRect(13, 9, 1, 1);
      }),
      c: make(function (x) {
        x.fillRect(2, 7, 3, 2); x.fillRect(4, 2, 1, 6); x.fillRect(9, 6, 3, 2); x.fillRect(11, 1, 1, 6);
        x.fillRect(4, 2, 4, 1); x.fillRect(8, 1, 4, 1); x.fillRect(13, 4, 2, 5);
      })
    };
  })();
  function icons(extras, order) {
    var out = '', seq = order || 'bac';     // sound clip, then reviews, then discography
    for (var i = 0; i < seq.length; i++) {
      var k = seq[i], on = k === 'a' ? extras[0] : k === 'b' ? extras[1] : extras[2];
      if (on) out += '<img class="ico" alt="" src="' + ICON[k] + '">';
    }
    return out;
  }

  // ---- pages --------------------------------------------------------------
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
  function label(id) {
    if (pending[id]) return SCALE[pending[id]];
    if (mine[id]) return '*' + SCALE[mine[id]];
    return '*not rated yet';
  }
  function option(id) { return '<div class="motif-opt" data-rate="' + id + '">' + esc(label(id)) + '</div>'; }
  function artistLink(a, cls) { return '<a ' + (cls ? 'class="' + cls + '" ' : '') + 'data-artist="' + a.id + '">' + esc(a.name) + '</a>'; }

  function masthead(here) {
    function nav(k, t) { return '[<a data-go="' + k + '"' + (here === k ? ' class="here"' : '') + '>' + t + '</a>]'; }
    return '<img class="banner" alt="firefly music" src="assets/firefly/banner.png">' +
      '<div class="banner-map"><a data-go="people" style="left:39px;width:185px"></a>' +
      '<a data-go="welcome" style="left:224px;width:190px"></a><a data-go="buzz" style="left:414px;width:182px"></a></div>' +
      '<div class="nav">' + nav('people', 'PEOPLE') + '<span></span>' + nav('welcome', 'WELCOME') + '<span></span>' + nav('buzz', 'BUZZ') + '</div>';
  }

  var PAGES = {
    recs: function () {
      var h = masthead() +
        '<h2><a data-go="me">' + ME + '</a>, You should check out these artists.</h2>' +
        '<div class="note">An asterisk indicates your current rating.</div>';
      current.forEach(function (c, i) {
        h += '<div class="row" style="top:' + Math.round(222 + i * 69.4) + 'px">' + option(c.a.id) + artistLink(c.a, 'artist') +
          '<div class="why tt">' + c.why + icons(c.extras, c.order) + '</div></div>';
      });
      return h + '<div class="motif-btn send" data-act="send"><span>Submit and Send More</span></div>' +
        '<div class="dots"></div><img class="spiral" alt="" src="assets/firefly/spiral.png">' +
        '<div class="tell">Tell <b>firefly</b><span class="tt">what you’re looking for</span></div>';
    },

    artist: function (id) {
      var a = ARTISTS[id], p = predictFor(a), h = masthead();
      h += '<h2>' + esc(a.name) + '</h2><div class="body">';
      if (mine[id]) h += '<p class="lead">You gave ' + esc(a.name) + ' a ' + mine[id] + '.</p>';
      else if (p) h += '<p class="lead"><b>firefly</b> thinks you would give ' + esc(a.name) + ' a <b>' + p.p.toFixed(1) +
        '</b>. <span class="tt">(confidence: ' + confidence(p.n) + ')</span></p>';
      else h += '<p class="lead"><b>firefly</b> does not know enough yet to guess what you would think of ' + esc(a.name) + '.</p>';
      h += '<div class="rate">' + option(id) + '<div class="motif-btn" data-act="rate" data-id="' + id + '"><span>Submit</span></div></div>';

      // Reviews from the members most like you who have an opinion.
      var said = neighbours().concat(USERS.map(function (u) { return { u: u, s: 0 }; }))
        .filter(function (x, i, arr) { return x.u.r[id] && arr.findIndex(function (y) { return y.u === x.u; }) === i; })
        .slice(0, 2);
      if (said.length) {
        h += '<p>What members with taste like yours say:</p>';
        said.forEach(function (x, i) {
          var r = x.u.r[id], pool = REVIEWS[r];
          h += '<p class="quote">' + pool[(id + i * 3 + x.u.alias.length) % pool.length] + ' <span class="tt">— ' + x.u.alias + ', who rated it ' + r + '</span></p>';
        });
      }
      // Fellow travellers: artists rated highly by the people who rate this one highly.
      var score = {};
      USERS.forEach(function (u) {
        if ((u.r[id] || 0) < 6) return;
        for (var k in u.r) if (+k !== id && u.r[k] >= 6) score[k] = (score[k] || 0) + 1;
      });
      var also = Object.keys(score).sort(function (x, y) { return score[y] - score[x] || x - y; }).slice(0, 4);
      if (also.length) {
        h += '<p>People who love ' + esc(a.name) + ' also love ' +
          also.map(function (k) { return artistLink(ARTISTS[k]); }).join(', ') + '.</p>';
      }
      return h + '</div><div class="foot"><a data-go="recs">Back to your recommendations</a></div>';
    },

    people: function () {
      var nb = neighbours().slice(0, 5), h = masthead('people') + '<h2><a data-go="me">' + ME + '</a>, You should meet these people.</h2><div class="body">' +
        '<p class="lead">Their taste in music is the closest to yours. <b>firefly</b> draws on what they love when it picks artists for you.</p><table>';
      nb.forEach(function (x) {
        var raves = Object.keys(x.u.r).filter(function (k) { return x.u.r[k] === 7 && !mine[k]; }).slice(0, 2);
        h += '<tr><td class="big"><a data-user="' + x.u.alias + '">' + x.u.alias + '</a></td><td class="tt">' + Math.round(x.s * 100) + '% like you</td></tr>' +
          '<tr><td colspan="2" style="padding:0 0 9px 18px">' + (raves.length ? 'raves about ' + raves.map(function (k) { return artistLink(ARTISTS[k]); }).join(' and ') : 'has rated the same things you have') + '</td></tr>';
      });
      return h + '</table></div><div class="foot"><a data-go="recs">Back to your recommendations</a></div>';
    },

    user: function (alias) {
      var u = USERS.filter(function (x) { return x.alias === alias; })[0], h = masthead('people') + '<h2>' + alias + '</h2><div class="body">';
      var both = Object.keys(u.r).filter(function (k) { return mine[k]; });
      var loves = Object.keys(u.r).filter(function (k) { return u.r[k] >= 6 && !mine[k]; }).slice(0, 8);
      h += '<p class="lead">You and ' + alias + ' have rated ' + both.length + ' of the same artists.</p><table>';
      both.slice(0, 7).forEach(function (k) {
        h += '<tr><td>' + artistLink(ARTISTS[k]) + '</td><td class="tt">you ' + mine[k] + '</td><td class="tt">' + alias + ' ' + u.r[k] + '</td></tr>';
      });
      h += '</table>';
      if (loves.length) h += '<p>' + alias + ' also loves ' + loves.map(function (k) { return artistLink(ARTISTS[k]); }).join(', ') + '.</p>';
      return h + '</div><div class="foot"><a data-go="people">Back to people</a></div>';
    },

    buzz: function () {
      var rows = ARTISTS.map(function (a) {
        var s = 0, n = 0; USERS.forEach(function (u) { if (u.r[a.id]) { s += u.r[a.id]; n++; } });
        return { a: a, avg: n ? s / n : 0, n: n };
      }).filter(function (r) { return r.n >= 12; }).sort(function (x, y) { return y.avg - x.avg; }).slice(0, 12);
      var h = masthead('buzz') + '<h2>The buzz.</h2><div class="body"><p class="lead">The artists <b>firefly</b> members rate most highly right now, whatever your own taste.</p><table>';
      rows.forEach(function (r, i) {
        h += '<tr><td class="n">' + (i + 1) + '.</td><td class="big" style="font-size:18px;line-height:22px">' + artistLink(r.a) + '</td><td class="tt">' + r.avg.toFixed(1) + ' from ' + r.n + ' members</td></tr>';
      });
      return h + '</table></div><div class="foot"><a data-go="recs">Back to your recommendations</a></div>';
    },

    welcome: function () {
      return masthead('welcome') + '<h2>Welcome to firefly.</h2><div class="body">' +
        '<p class="lead">Tell <b>firefly</b> which music you love and which you can’t stand. It finds the members whose taste is most like yours and passes along what they are listening to, the way a friend would.</p>' +
        '<p class="lead">The more you rate, the better it knows you.</p>' +
        '<ul><li><a data-go="recs">See the artists picked for you</a></li><li><a data-go="me">See what firefly knows about you</a></li>' +
        '<li><a data-go="people">Meet people with taste like yours</a></li><li><a data-go="buzz">Hear the buzz</a></li></ul></div>';
    },

    me: function () {
      var ids = Object.keys(mine).sort(function (x, y) { return mine[y] - mine[x] || ARTISTS[x].name.localeCompare(ARTISTS[y].name); });
      var h = masthead() + '<h2>' + ME + ', this is what firefly knows about you.</h2><div class="body">' +
        '<p class="lead">You have rated ' + ids.length + ' artists. An asterisk indicates your current rating; change any of them from the artist’s page.</p>' +
        '<table style="font-size:15px;line-height:19px">';
      var half = Math.ceil(Math.min(ids.length, 34) / 2);
      for (var i = 0; i < half; i++) {
        h += '<tr>';
        [ids[i], ids[i + half]].forEach(function (k) {
          h += k === undefined ? '<td></td><td></td>' : '<td class="tt">*' + mine[k] + '</td><td style="padding-right:34px">' + artistLink(ARTISTS[k]) + '</td>';
        });
        h += '</tr>';
      }
      return h + '</table></div><div class="foot"><a data-go="recs">Back to your recommendations</a></div>';
    }
  };

  var REVIEWS = {
    7: ['The most amazing band ever.', 'Has been a big part of my life. If you don’t have the albums, go, no, better yet, run and pick them up.', 'Perfect for almost any mood.', 'I wore out the tape. Twice.'],
    6: ['Solid. Not a weak album in the bunch.', 'Their albums until the last one were excellent.', 'Better live than on record, and the records are good.'],
    5: ['Good stuff, in small doses.', 'A couple of great songs and a fair amount of filler.'],
    4: ['Doesn’t turn me on, doesn’t bother me.', 'Fine. I never put it on myself.'],
    3: ['Eh. I keep trying and it keeps not working.', 'They have become a tad too tame and predictable.'],
    2: ['Barely tolerable. My roommate disagrees, loudly.', 'One good single does not make a career.'],
    1: ['Pass the earplugs.', 'Not for me. Not even a little.']
  };

  // ---- navigation and events ---------------------------------------------
  var here = ['recs'];
  function show(page, arg) {
    closeMenu();
    here = [page, arg];
    root.innerHTML = '<div class="page">' + PAGES[page](arg) + '</div>';
  }

  var menu = null, menuFor = null;
  function closeMenu() {
    if (menu) { menu.remove(); menu = null; }
    if (menuFor) { menuFor.classList.remove('open'); menuFor = null; }
  }
  function openMenu(btn) {
    closeMenu();
    var id = +btn.dataset.rate, shownNow = pending[id] || 0;
    menu = document.createElement('div'); menu.className = 'motif-menu';
    var items = [0, 7, 6, 5, 4, 3, 2, 1], at = 0;
    items.forEach(function (v, i) {
      var d = document.createElement('div');
      var star = (v === 0 ? !mine[id] : mine[id] === v) ? '*' : '';
      d.textContent = star + (v === 0 ? 'not rated yet' : SCALE[v]);
      d.dataset.v = v;
      if (v === shownNow || (!pending[id] && mine[id] === v)) { d.className = 'armed'; at = i; }
      menu.appendChild(d);
    });
    var at0 = window.Shell.place(btn, root, 635);
    root.appendChild(menu);
    menu.style.minWidth = at0.w + 'px';
    menu.style.left = at0.x + 'px';
    var mh = window.Shell.place(menu, root, 635).h;
    menu.style.top = Math.max(4, Math.min(695 - mh - 4, at0.y - 2 - at * 27)) + 'px';
    menuFor = btn; btn.classList.add('open');
    menu.addEventListener('mousemove', function () { var a = menu.querySelector('.armed'); if (a) a.classList.remove('armed'); });
  }

  root.addEventListener('mousedown', function (e) {
    var t = e.target;
    if (menu && menu.contains(t)) return;
    var opt = t.closest('.motif-opt');
    if (opt) { e.preventDefault(); if (menuFor === opt) closeMenu(); else openMenu(opt); return; }
    closeMenu();
  });
  root.addEventListener('click', function (e) {
    var t = e.target;
    if (menu && menu.contains(t) && t.dataset.v !== undefined) {
      var id = +menuFor.dataset.rate, v = +t.dataset.v;
      if (v) pending[id] = v; else delete pending[id];
      var btn = menuFor; closeMenu(); btn.textContent = label(id);
      return;
    }
    var go = t.closest('[data-go]'), art = t.closest('a[data-artist]'), usr = t.closest('[data-user]'), act = t.closest('[data-act]');
    if (act && act.dataset.act === 'send') {
      commit();
      current = nextFive();
      show('recs');
    } else if (act && act.dataset.act === 'rate') {
      commit(); show('artist', +act.dataset.id);
    } else if (art) show('artist', +art.dataset.artist);
    else if (usr) show('user', usr.dataset.user);
    else if (go) show(go.dataset.go);
  });
  window.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });

  function commit() { for (var k in pending) { mine[k] = pending[k]; told[k] = 1; } pending = {}; }

  show('recs');
  window.FF = { predictions: predictions, mine: mine, artists: ARTISTS, users: USERS, nextFive: nextFive };
})();
