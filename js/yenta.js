/* Yenta (Leonard Foner): matchmaking by agents that compare their users'
   interests without a central server.

   The pages are those of Yenta 0.7.0 as documented in Foner's dissertation
   (1999): the interests it has inferred from your mail and files, the
   messages its clusters carry, attestations, news, tuning. The session is
   Foner's own, as in his figures. The doors along the top stand open when
   there is something behind them you have not seen. */
(function () {
  'use strict';

  var root = document.getElementById('yenta');
  var A = 'assets/yenta/';
  var SECTIONS = ['news', 'messages', 'interests', 'attestations', 'requests', 'tune', 'help'];
  var START = new Date(1999, 3, 20, 0, 37, 6).getTime(), T0 = Date.now();
  var DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function stamp() {
    var d = new Date(START + (Date.now() - T0));
    function z(n) { return (n < 10 ? '0' : '') + n; }
    return DAYS[d.getDay()] + ' ' + MON[d.getMonth()] + ' ' + d.getDate() + ' ' + z(d.getHours()) + ':' + z(d.getMinutes()) + ':' + z(d.getSeconds()) + ' ' + d.getFullYear();
  }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }

  var S = {
    page: 'interests', arg: undefined, note: '',
    interests: [
      { title: 'tea-lovers', words: 'tea mit messag interest blend', size: 21, contacts: ['forget'], relevant: true },
      { title: 'general cookery', words: 'cook www http recip ref', size: 14, contacts: ['saffron'], relevant: true },
      { title: 'floating dinnerparty', words: 'dinner date eat list cook', size: 11, contacts: ['mole'], relevant: true },
      { title: 'palm pilots', words: 'media mit pilot lab www', size: 10, contacts: ['graffiti'], relevant: true },
      { title: 'word-a-day', words: 'org word wordsmith www http', size: 15, contacts: ['lexicon'], relevant: false },
      { title: 'directions to places', words: 'street left turn st av', size: 10, contacts: ['atlas', 'wanderer'], relevant: false }
    ],
    undone: 264, finding: false,
    messages: [
      { title: 'A new tea I just found', sender: 'forget', interest: 0, topic: 'tea mit interest messag richard', body: 'It’s like Oolong #6, but from a different vendor.', read: false }
    ],
    news: [
      { head: 'Interests:Single Update:[Sun Mar 28 22:12:38 1999]', text: '378 documents found in /mas/mc/doh/foner/YY; now finding interests.' }
    ],
    attest: [
      { text: 'My public key’s fingerprint is "PkCT eCV8 DQqK V30N 2Bla 0w3P 41g="', signers: 'foner [you]', oldest: 'Sun Mar 28 22:11:06 1999', newest: 'Sun Mar 28 22:11:06 1999' }
    ],
    fresh: { interests: true, attestations: true },
    visited: {}, bookmarks: [], alpha: false, down: false
  };

  // ---- the frame ----------------------------------------------------------
  root.innerHTML =
    '<img class="logo" alt="yenta" src="' + A + 'logo.png" data-go="interests">' +
    '<img class="labels" alt="" src="' + A + 'navlabels.png">' +
    '<div class="cells">' + SECTIONS.map(function (s) { return '<a data-go="' + s + '"><img alt="' + s + '" id="cell-' + s + '"></a>'; }).join('') + '</div>' +
    '<img class="big" alt="">' +
    '<img class="marks" alt="" src="' + A + 'bookmarks.png">' +
    '<div class="marks-map"><a data-bm="add" style="left:4px;width:54px"></a><a data-bm="delete" style="left:60px;width:56px"></a><a data-bm="reorder" style="left:118px;width:52px"></a></div>' +
    '<div class="bm"></div><div class="rule"></div><div class="main"></div>';
  var main = root.querySelector('.main'), big = root.querySelector('.big'), bm = root.querySelector('.bm');

  function open(section) {
    if (S.down) return false;
    if (section === 'news') return S.news.length > 0;
    if (section === 'messages') return S.messages.some(function (m) { return !m.read; });
    return !!S.fresh[section];
  }
  function section() {
    return { message: 'messages', reply: 'messages', compose: 'messages', contacts: 'interests', topic: 'help', request: 'requests', shutdown: 'shutdown' }[S.page] || S.page;
  }
  function frame() {
    SECTIONS.forEach(function (s, i) {
      document.getElementById('cell-' + s).src = A + 'cell_' + s + '_' + (i < 4 && open(s) ? 'open' : 'closed') + '.png';
    });
    var sec = section(), pic = {
      news: 'big_news_open', messages: open('messages') ? 'big_messages_open' : 'big_messages_closed', interests: 'big_interests_closed',
      attestations: 'big_attestations_open', requests: 'big_requests', tune: 'big_tune', help: 'big_help', shutdown: 'big_shutdown'
    }[sec];
    big.src = A + pic + '.png';
    var list = S.bookmarks.slice();
    if (S.alpha) list.sort(function (a, b) { return a.name.localeCompare(b.name); });
    bm.innerHTML = list.length ? list.map(function (b, i) { return '<a data-mark="' + S.bookmarks.indexOf(b) + '">' + esc(b.name) + '</a>'; }).join('') : '[No bookmarks defined.]';
  }

  // ---- widgets ------------------------------------------------------------
  function link(attrs, text, key) { return '<a ' + attrs + (key && S.visited[key] ? ' class="seen"' : '') + (key ? ' data-key="' + key + '"' : '') + '>' + text + '</a>'; }
  function cb(name, on) { return '<span class="cb' + (on ? ' on' : '') + '" data-cb="' + name + '"></span>'; }
  function btn(act, text) { return '<span class="btn" data-act="' + act + '">' + text + '</span>'; }
  function ta(name) { return '<span class="ta"><textarea name="' + name + '" spellcheck="false"></textarea></span>'; }
  function words(i) { return S.interests[i].words; }

  // ---- pages --------------------------------------------------------------
  var TITLES = { news: 'Current status', messages: 'Recent messages', interests: 'Your interests', attestations: 'Attestations', requests: 'Special requests', tune: 'Tunable parameters', help: 'Help' };
  var TUNE = [
    ['Accept interest threshold', '0.5', 'This determines how closely an interest sent to you has to be to one of your own interests in order for you to join it.'],
    ['Interest partial match threshold', '0.1', 'This determines how close an interest has to be to a rumor in order for me to follow up on the rumor.'],
    ['Interest matching threshold', '0.25', 'This determines how much a prospective match has to be similar to your own interest for me to decide that you share an interest.'],
    ['Single-document interest weight', '30', 'Weight for an interest specified with a single document.'],
    ['Undone-document similarity threshold', '0.25', 'Similarity required to put a document in an interest from the list of documents being processed'],
    ['Introduction throttle', '0', 'If there are likely candidates for introductions, this determines how often they will be suggested to you. This can keep you from getting a huge pile of suggested introductions if you happen to join a group where many people match you closely. It is a value in hours, and it may also be a fractional value, or zero. Yenta waits at least this many hours in between each introduction it suggests.']
  ];
  var TOPICS = [
    ['Specifying a single file of your interests', 'Normally I work out what you are interested in by reading a whole tree of your files and mail. You can also point me at one particular file, such as a document you have just imported, and tell me to give it disproportionate weight. This makes it easier to say that you are interested in a particular subject, so that you may find a group of experts.'],
    ['How attestations work, and why to use them', 'An attestation is a short piece of text that you write about yourself. Other people may cryptographically sign it if they are willing to vouch for it. Nobody is told who you are; all anyone can check is that the same Yenta keeps saying the same things, and who has signed them. You can use attestations to decide whose messages you see.'],
    ['How to submit bug reports', 'This is a pilot release. If something goes wrong, please describe what you were doing and what you saw, and send it along. Statistics that I send home never include your interests, your messages or your identity.'],
    ['Yenta’s license and lack of warrantee', 'Yenta is distributed with its source code so that anyone may check that it does what it says. It comes with no warrantee of any kind.'],
    ['A quick description of Yenta, and where to get an updated copy', 'Yenta finds people who share your interests and introduces you to them, even if you have never said a word in public. Each Yenta talks only to other Yentas, one at a time, by word of mouth: there is no central server, and nothing I know about you leaves this machine unencrypted.']
  ];
  var REQUESTS = [
    ['Save and quit', 'This is the proper way to shut down Yenta so that all of your settings, conversations, and interests are guaranteed to be properly saved.'],
    ['Change your passphrase.', 'If you think that someone may know your passphrase, you should change it.'],
    ['Talk to a particular Yenta.', 'This is the way to get in touch with a person you’ve heard about though a means other than Yenta. This lets you specify a Yenta that I don’t yet know about.'],
    ['Look up a particular Yenta by handle.', 'If you know the handle of a Yenta, but you don’t have a page handy that refers to that Yenta, use this form to get a list of possibilities.']
  ];

  var PAGES = {
    interests: function () {
      var h = '<h1>Your currently known interests</h1><table class="int"><tr><th>Title</th><th>Some related words</th><th>Size</th><th>Contacts</th><th>Relevant?</th></tr>';
      S.interests.forEach(function (it, i) {
        h += '<tr><td><input type="text" name="title' + i + '" value="' + esc(it.title) + '" autocomplete="off" spellcheck="false"></td><td>' + it.words + '</td><td>' + it.size + '</td>' +
          '<td class="c">' + link('data-contacts="' + i + '"', it.contacts.length, 'c' + i) + '</td><td class="c">' + cb('rel' + i, it.relevant) + '</td></tr>';
      });
      h += '</table><p class="said">I know about ' + S.undone + ' documents that I have not put into any of these interests. I am ' + (S.finding ? '' : 'not ') + 'currently working on these.</p>';
      if (!S.finding && S.undone > 0) h += '<p>' + cb('find', false) + ' &nbsp;<b>Start finding interests.</b></p>';
      return h + btn('interests', 'Make changes');
    },
    contacts: function (i) {
      var it = S.interests[i];
      return '<h1>Contacts for an interest</h1><p><b>Interest</b>: <i>' + it.words + '</i>' + (it.title ? ' (' + esc(it.title) + ')' : '') + '</p>' +
        '<p>I am in touch with ' + (it.contacts.length === 1 ? 'one other Yenta whose user shares' : it.contacts.length + ' other Yentas whose users share') + ' this interest:</p><ul>' +
        it.contacts.map(function (c) { return '<li>' + link('data-talk="' + c + '" data-int="' + i + '"', c) + '</li>'; }).join('') + '</ul>' +
        '<p>Compose a ' + link('data-compose="' + i + '"', 'new message') + ' to everyone who shares it.</p>';
    },
    messages: function () {
      var h = '<h1>Recent messages</h1>';
      if (S.note) h += '<p class="said">' + S.note + '</p>';
      h += '<ul style="margin:24px 0 24px;list-style:disc">';
      S.messages.forEach(function (m, i) {
        var lead = m.body.split(' ').slice(0, 3).join(' ');
        h += '<li>' + link('data-msg="' + i + '"', '"' + esc(m.title) + '", by ' + m.sender + ': "' + esc(lead) + ',..."', m.read ? 'm' + i : null) + '</li>';
        if (m.read) S.visited['m' + i] = 1;
      });
      h = h.replace(/data-msg="(\d+)"/g, function (all, n) { return all + (S.messages[+n].read ? ' class="seen"' : ''); });
      return h + '</ul><p>Compose a ' + link('data-compose="0"', 'new message') + ' to a cluster.</p><p>' + link('data-blockpage="1"', 'Block') + ' an annoying Yenta.</p>';
    },
    message: function (i) {
      var m = S.messages[i];
      return '<h1>Message ' + (i + 1) + '</h1><div class="field">Relevant interest<span class="t">: ' + link('data-go="interests"', words(m.interest)) + '</span></div>' +
        '<div class="field">Topic<span class="t">: &nbsp;<i>' + m.topic + '</i></span></div><div class="field">Sender<span class="t">: ' + link('data-talk="' + m.sender + '" data-int="' + m.interest + '"', m.sender) + '</span></div>' +
        '<div class="field">Title<span class="t">: ' + esc(m.title) + '</span></div><hr style="margin-top:8px"><p style="margin-bottom:6px">' + esc(m.body) + '</p><hr style="margin-bottom:20px">' +
        '<p>' + btn('reply:' + i, 'Reply') + '</p><p><span class="rb on" data-rb="only"></span>to sender only</p><p><span class="rb" data-rb="all"></span>to sender and all other recipients</p><hr>' +
        '<p><i>Is this Yenta annoying you? You can block it, and won’t be shown any more messages from it.</i></p>' + btn('block:' + i, 'Block');
    },
    reply: function (o) {
      return '<h1>Reply to a message</h1><div class="field">Title<span class="t">: <input type="text" name="title" style="width:220px" value="' + esc(o.title) + '" autocomplete="off"></span></div>' +
        '<div class="field" style="margin:6px 0">Message to ' + o.to + '</div>' + ta('body') + '<div>' + btn('send', 'Send message') + '</div>';
    },
    compose: function (i) {
      return '<h1>Compose a message to an interest</h1><div class="field">Title<span class="t">: <input type="text" name="title" autocomplete="off"></span></div>' +
        '<div class="field" style="margin:2px 0 3px">Message to all contacts for &nbsp;<span class="pop" data-value="' + i + '">' + words(i) + '</span></div>' + ta('body') + '<div>' + btn('send', 'Send message') + '</div>';
    },
    news: function () {
      var h = '<h1>Current status as of ' + stamp() + '</h1><p class="said">I am ' + (S.finding ? '' : 'not ') + 'currently trying to find new interests.</p><h1>Things I’ve done lately</h1>';
      if (!S.news.length) h += '<p>Nothing new.</p>';
      else {
        h += '<p>Check the box beside each item when you’ve read it and I’ll know not to keep it.</p>';
        S.news.forEach(function (n, i) { h += '<p style="margin-bottom:8px">' + cb('news' + i, false) + ' &nbsp; ' + link('data-go="' + (n.go || 'interests') + '"', n.head, 'n' + n.head) + '<span class="said" style="display:block;margin-left:20px">' + n.text + '</span></p>'; });
        h += '<p>' + btn('erase', 'Erase checked items') + '</p>';
      }
      return h + '<hr style="margin-top:18px"><p class="said" style="margin-top:22px">This Yenta’s ID is PkCT eCV8 DQqK V30N 2Bla 0w3P 41g=<br>It is version 0.7.0.</p>';
    },
    attestations: function () {
      var h = '<table class="plain"><tr><th>Status</th><th>Message</th><th>Signers</th><th>Oldest sig</th><th>Newest sig</th></tr>';
      S.attest.forEach(function (a, i) {
        h += '<tr><td class="status"><b>T</b>' + link('data-topic="1"', '?') + link('data-unattest="' + i + '"', 'X') + '</td><td style="max-width:176px">' + esc(a.text) + '</td><td>' + link('data-go="attestations"', a.signers) + '</td>' +
          '<td class="nw">' + a.oldest.replace(/ (\d\d:)/, '<br>$1') + '</td><td class="nw">' + a.newest.replace(/ (\d\d:)/, '<br>$1') + '</td></tr>';
      });
      return h + '</table><h2>Add an attestation</h2><p>To add an attestation, enter it in the box below and select "add".</p>' + ta('attest') + '<div>' + btn('attest', 'add') + '</div>';
    },
    requests: function () {
      var h = '<h1>Special requests</h1><p>This page is a catch-all for a variety of commands that don’t naturally fit somewhere else.</p><dl>';
      REQUESTS.forEach(function (r, i) { h += '<dt>' + link('data-request="' + i + '"', r[0].replace(/\.$/, '') + (i ? '.' : ''), 'r' + i) + (i ? '' : '.') + '</dt><dd>' + r[1] + '</dd>'; });
      return h + '</dl>';
    },
    request: function (i) {
      if (i === 1) return '<h1>Change your passphrase</h1><div class="field">Old passphrase<span class="t">: <input type="password" name="a"></span></div><div class="field">New passphrase<span class="t">: <input type="password" name="b"></span></div>' +
        '<div class="field" style="margin-bottom:14px">New passphrase, again<span class="t">: <input type="password" name="c"></span></div>' + btn('passphrase', 'Change passphrase');
      if (i === 2) return '<h1>Talk to a particular Yenta</h1><p>Enter the Yenta-ID of the Yenta you would like to talk to. I will try to find it and tell you in the news when I have.</p><div class="field" style="margin-bottom:14px">Yenta-ID<span class="t">: <input type="text" name="yid" style="width:260px" autocomplete="off"></span></div>' + btn('findyenta', 'Find this Yenta');
      return '<h1>Look up a Yenta by handle</h1>' + (S.note ? '<p class="said">' + S.note + '</p>' : '') + '<div class="field" style="margin-bottom:14px">Handle<span class="t">: <input type="text" name="handle" autocomplete="off"></span></div>' + btn('lookup', 'Look up');
    },
    tune: function () {
      var h = '<div class="tune"><h1>Tunable parameters</h1><p class="said">Some of these parameters might be useful to change. However, the documentation on their values is <i>not</i> currently guaranteed complete in this release, so you should know what you are doing or you may inadvertently disable some part of your Yenta. Additional documentation on these will appear in a later release.</p>';
      TUNE.forEach(function (t, i) { h += '<p><b>' + t[0] + '</b> &nbsp;=&nbsp; <input type="text" name="tune' + i + '" value="' + t[1] + '" autocomplete="off"><br>' + t[2] + '</p>'; });
      return h + btn('tune', 'Make changes') + '</div>';
    },
    help: function () {
      return '<h1>Help on various topics</h1><p>This is <b>Yenta version 0.7.0,</b> running on <b>HP-UX-A.09.05.A-9000/725</b>.</p><p>Possible help topics:</p><ul style="list-style:disc">' +
        TOPICS.map(function (t, i) { return '<li>' + link('data-topic="' + i + '"', t[0], 't' + i) + '</li>'; }).join('') + '</ul>';
    },
    topic: function (i) { return '<h1>' + TOPICS[i][0] + '</h1><p>' + TOPICS[i][1] + '</p><p>' + link('data-go="help"', 'Other help topics') + '</p>'; },
    shutdown: function () { return '<p class="said" style="margin-top:8px">Yenta has now shut down. In order to use it again, you will need to restart it.</p>'; }
  };

  function show(page, arg) {
    closeMenu();
    // a door closes behind you once you have looked inside
    var leaving = section();
    if (S.fresh[leaving] && (page !== S.page || arg !== S.arg)) S.fresh[leaving] = false;
    S.page = page; S.arg = arg;
    main.innerHTML = PAGES[page](arg);
    main.scrollTop = 0;
    S.note = '';
    frame();
  }

  // ---- what Yenta does on its own ----------------------------------------
  function findInterests() {
    S.finding = true;
    setTimeout(function () {
      if (S.down) return;
      S.finding = false; S.undone -= 12;
      S.interests.push({ title: '', words: 'dive scuba florida reef trip', size: 12, contacts: ['nitrox'], relevant: true });
      S.fresh.interests = true;
      S.news.unshift({ head: 'Interests:Single Update:[' + stamp() + ']', text: '264 documents examined; I found one new interest and joined a cluster for it.' });
      if (S.page === 'interests' || S.page === 'news') show(S.page); else frame();
      setTimeout(function () {
        if (S.down) return;
        var i = S.interests.length - 1;
        if (!S.interests[i].relevant) return;
        S.messages.push({ title: 'I think we should be introduced', sender: 'nitrox', interest: i, topic: 'dive scuba reef florida key', read: false,
          body: 'My Yenta noticed that you and I share an interest that hardly anybody else around here has, and suggested that I introduce myself. Did you realize there is another person here who is interested in going scuba diving in Florida?' });
        S.news.unshift({ head: 'Introduction:[' + stamp() + ']', text: 'I think you should introduce yourself to nitrox; you seem unusually close on one interest. See your messages.', go: 'messages' });
        if (S.page === 'messages' || S.page === 'news') show(S.page); else frame();
      }, 5200);
    }, 6500);
  }
  var REPLIES = ['Thanks. I will send you the name of the shop.', 'Good to hear from you. I thought I was the only one.', 'Yes! I was hoping somebody would write. Let me know what you think.'];
  function answer(from, interest, title) {
    setTimeout(function () {
      if (S.down) return;
      S.messages.push({ title: /^Re: /.test(title) ? title : 'Re: ' + (title || 'your message'), sender: from, interest: interest, topic: words(interest), body: REPLIES[S.messages.length % REPLIES.length], read: false });
      if (S.page === 'messages') show('messages'); else frame();
    }, 7000);
  }

  // ---- events -------------------------------------------------------------
  var menu = null;
  function closeMenu() { if (menu) { menu.remove(); menu = null; } }
  function val(name) { var e = main.querySelector('[name="' + name + '"]'); return e ? e.value.trim() : ''; }

  root.addEventListener('mousedown', function (e) {
    var t = e.target, p = t.closest('.pop');
    if (menu && menu.contains(t)) return;
    closeMenu();
    if (!p) return;
    e.preventDefault();
    menu = document.createElement('div'); menu.className = 'menu';
    S.interests.forEach(function (it, i) { var d = document.createElement('div'); d.textContent = it.words; d.dataset.v = i; if (+p.dataset.value === i) d.className = 'on'; menu.appendChild(d); });
    var at = window.Shell.place(p, main, 560);
    main.appendChild(menu);
    menu.style.left = at.x + 'px';
    menu.style.top = Math.max(main.scrollTop + 2, at.y + main.scrollTop - (+p.dataset.value) * 15 - 2) + 'px';
    menu.style.minWidth = at.w + 'px';
    menu.addEventListener('click', function (ev) {
      if (ev.target.dataset.v === undefined) return;
      p.dataset.value = ev.target.dataset.v; p.textContent = ev.target.textContent; closeMenu();
    });
  });

  root.addEventListener('click', function (e) {
    var t = e.target, x, d;
    if (S.down) return;
    if ((x = t.closest('[data-key]'))) S.visited[x.dataset.key] = 1;
    if ((x = t.closest('.cb'))) { x.classList.toggle('on'); return; }
    if ((x = t.closest('.rb'))) { main.querySelectorAll('.rb').forEach(function (r) { r.classList.remove('on'); }); x.classList.add('on'); return; }

    if ((x = t.closest('[data-bm]'))) {
      d = x.dataset.bm;
      var name = (S.page === 'message' ? 'Message ' + (S.arg + 1) : S.page === 'topic' ? 'Help' : TITLES[section()] || 'Yenta');
      if (d === 'add' && S.bookmarks.length < 6 && !S.bookmarks.some(function (b) { return b.page === S.page && b.arg === S.arg; })) S.bookmarks.push({ name: name, page: S.page, arg: S.arg });
      if (d === 'delete') S.bookmarks = S.bookmarks.filter(function (b) { return !(b.page === S.page && b.arg === S.arg); }).slice(0, S.bookmarks.some(function (b) { return b.page === S.page && b.arg === S.arg; }) ? 99 : -1);
      if (d === 'reorder') S.alpha = !S.alpha;
      return frame();
    }
    if ((x = t.closest('[data-mark]'))) { d = S.bookmarks[+x.dataset.mark]; return show(d.page, d.arg); }
    if ((x = t.closest('[data-go]'))) return show(x.dataset.go);
    if ((x = t.closest('[data-contacts]'))) return show('contacts', +x.dataset.contacts);
    if ((x = t.closest('[data-compose]'))) return show('compose', +x.dataset.compose);
    if ((x = t.closest('[data-talk]'))) return show('reply', { to: x.dataset.talk, interest: +x.dataset.int, title: '' });
    if ((x = t.closest('[data-msg]'))) { S.messages[+x.dataset.msg].read = true; return show('message', +x.dataset.msg); }
    if ((x = t.closest('[data-topic]'))) return show('topic', +x.dataset.topic);
    if ((x = t.closest('[data-blockpage]'))) { S.note = 'To block a Yenta, open one of its messages and choose Block.'; return show('messages'); }
    if ((x = t.closest('[data-unattest]'))) { if (+x.dataset.unattest > 0) S.attest.splice(+x.dataset.unattest, 1); return show('attestations'); }
    if ((x = t.closest('[data-request]'))) {
      d = +x.dataset.request;
      if (d !== 0) return show('request', d);
      S.down = true; show('shutdown');
      // An exhibit should not stay boarded up: Yenta is restarted after a moment.
      return setTimeout(function () { S.down = false; S.news.unshift({ head: 'Startup:[' + stamp() + ']', text: 'Yenta has been restarted. All settings, conversations and interests were restored.', go: 'news' }); show('news'); }, 7000);
    }

    if (!(x = t.closest('[data-act]'))) return;
    var act = x.dataset.act.split(':'), n = +act[1];
    switch (act[0]) {
      case 'interests':
        S.interests.forEach(function (it, i) { it.title = val('title' + i); it.relevant = main.querySelector('[data-cb=rel' + i + ']').classList.contains('on'); });
        d = main.querySelector('[data-cb=find]');
        if (d && d.classList.contains('on')) findInterests();
        return show('interests');
      case 'reply':
        d = S.messages[n];
        return show('reply', { to: d.sender, interest: d.interest, title: 'Re: ' + d.title.replace(/^Re: /, '') });
      case 'block':
        d = S.messages[n].sender;
        S.messages = S.messages.filter(function (m) { return m.sender !== d; });
        S.note = 'I will not show you any more messages from ' + d + '.';
        return show('messages');
      case 'send':
        if (S.page === 'reply') { S.note = 'Your message to ' + S.arg.to + ' has been sent.'; answer(S.arg.to, S.arg.interest, val('title')); }
        else {
          d = +main.querySelector('.pop').dataset.value;
          S.note = 'Your message has been sent to all contacts for <i>' + words(d) + '</i>.';
          answer(S.interests[d].contacts[0], d, val('title'));
        }
        return show('messages');
      case 'erase':
        S.news = S.news.filter(function (item, i) { return !main.querySelector('[data-cb=news' + i + ']').classList.contains('on'); });
        return show('news');
      case 'attest':
        d = val('attest');
        if (d) { S.attest.push({ text: d.slice(0, 120), signers: 'foner [you]', oldest: stamp(), newest: stamp() }); S.fresh.attestations = true; }
        return show('attestations');
      case 'tune':
        TUNE.forEach(function (tn, i) { tn[1] = val('tune' + i) || tn[1]; });
        return show('tune');
      case 'passphrase': S.news.unshift({ head: 'Passphrase:[' + stamp() + ']', text: 'Your passphrase has been changed.', go: 'news' }); return show('news');
      case 'findyenta': S.news.unshift({ head: 'Rumor:[' + stamp() + ']', text: 'I do not know that Yenta yet. I am asking the Yentas I do know whether they have heard of it.', go: 'news' }); return show('news');
      case 'lookup':
        d = val('handle').toLowerCase();
        var hits = [];
        S.interests.forEach(function (it, i) { it.contacts.forEach(function (c) { if (d && c.indexOf(d) >= 0) hits.push(link('data-talk="' + c + '" data-int="' + i + '"', c)); }); });
        S.note = hits.length ? 'I know of: ' + hits.join(', ') + '.' : 'No Yenta that I know of uses that handle.';
        return show('request', 3);
    }
  });
  window.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });

  show('interests');
  window.YN = { S: S, show: show };
})();
