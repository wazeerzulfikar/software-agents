/* Yenta 0.7.0 for 1990s browsers. Yenta served its own interface to a web
   browser on the user's machine, so these are its pages much as Netscape on
   a Macintosh showed them: a table of collage GIFs, forms, and plain text.
   The behaviour is the one in js/yenta.js; what happens on its own (finding
   an interest, an introduction, a reply) is scheduled on the server, and the
   page reloads itself while something is due. */
'use strict';

const { BASE, esc, img, spacer, select, hidden } = require('./lib');

const label = {
  title: 'Matchmaking: Yenta',
  red: true,
  credit: 'Leonard Foner, 1995-1999 / Yenta 0.7.0',
  hint: 'Tick <i>Start finding interests</i>, press <i>Make changes</i> and watch the doors. Then read your <i>messages</i> and reply.'
};

const SECTIONS = ['news', 'messages', 'interests', 'attestations', 'requests', 'tune', 'help'];
const START = new Date(1999, 3, 20, 0, 37, 6).getTime();
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const TITLES = { news: 'Current status', messages: 'Recent messages', interests: 'Your interests', attestations: 'Attestations', requests: 'Special requests', tune: 'Tunable parameters', help: 'Help' };
const TUNE = [
  ['Accept interest threshold', '0.5', 'This determines how closely an interest sent to you has to be to one of your own interests in order for you to join it.'],
  ['Interest partial match threshold', '0.1', 'This determines how close an interest has to be to a rumor in order for me to follow up on the rumor.'],
  ['Interest matching threshold', '0.25', 'This determines how much a prospective match has to be similar to your own interest for me to decide that you share an interest.'],
  ['Single-document interest weight', '30', 'Weight for an interest specified with a single document.'],
  ['Undone-document similarity threshold', '0.25', 'Similarity required to put a document in an interest from the list of documents being processed'],
  ['Introduction throttle', '0', 'If there are likely candidates for introductions, this determines how often they will be suggested to you. This can keep you from getting a huge pile of suggested introductions if you happen to join a group where many people match you closely. It is a value in hours, and it may also be a fractional value, or zero. Yenta waits at least this many hours in between each introduction it suggests.']
];
const TOPICS = [
  ['Specifying a single file of your interests', 'Normally I work out what you are interested in by reading a whole tree of your files and mail. You can also point me at one particular file, such as a document you have just imported, and tell me to give it disproportionate weight. This makes it easier to say that you are interested in a particular subject, so that you may find a group of experts.'],
  ['How attestations work, and why to use them', 'An attestation is a short piece of text that you write about yourself. Other people may cryptographically sign it if they are willing to vouch for it. Nobody is told who you are; all anyone can check is that the same Yenta keeps saying the same things, and who has signed them. You can use attestations to decide whose messages you see.'],
  ['How to submit bug reports', 'This is a pilot release. If something goes wrong, please describe what you were doing and what you saw, and send it along. Statistics that I send home never include your interests, your messages or your identity.'],
  ['Yenta’s license and lack of warrantee', 'Yenta is distributed with its source code so that anyone may check that it does what it says. It comes with no warrantee of any kind.'],
  ['A quick description of Yenta, and where to get an updated copy', 'Yenta finds people who share your interests and introduces you to them, even if you have never said a word in public. Each Yenta talks only to other Yentas, one at a time, by word of mouth: there is no central server, and nothing I know about you leaves this machine unencrypted.']
];
const REQUESTS = [
  ['Save and quit', 'This is the proper way to shut down Yenta so that all of your settings, conversations, and interests are guaranteed to be properly saved.'],
  ['Change your passphrase.', 'If you think that someone may know your passphrase, you should change it.'],
  ['Talk to a particular Yenta.', 'This is the way to get in touch with a person you’ve heard about though a means other than Yenta. This lets you specify a Yenta that I don’t yet know about.'],
  ['Look up a particular Yenta by handle.', 'If you know the handle of a Yenta, but you don’t have a page handy that refers to that Yenta, use this form to get a list of possibilities.']
];
const REPLIES = ['Thanks. I will send you the name of the shop.', 'Good to hear from you. I thought I was the only one.', 'Yes! I was hoping somebody would write. Let me know what you think.'];

// ---- one visitor ---------------------------------------------------------
function create(now) {
  return {
    t0: now, note: '', last: null, events: [],
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
    tune: TUNE.map(function (t) { return t[1]; }),
    fresh: { interests: true, attestations: true },
    bookmarks: [], alpha: false, down: false
  };
}

function stamp(S, t) {
  var d = new Date(START + (t - S.t0));
  function z(n) { return (n < 10 ? '0' : '') + n; }
  return DAYS[d.getDay()] + ' ' + MON[d.getMonth()] + ' ' + d.getDate() + ' ' + z(d.getHours()) + ':' + z(d.getMinutes()) + ':' + z(d.getSeconds()) + ' ' + d.getFullYear();
}
function words(S, i) { return S.interests[i].words; }
function schedule(S, at, kind, data) { S.events.push({ at: at, kind: kind, data: data || {} }); S.events.sort(function (a, b) { return a.at - b.at; }); }

/* Whatever Yenta would have done on its own since the last page. */
function tick(S, now) {
  while (S.events.length && S.events[0].at <= now) {
    var e = S.events.shift(), t = e.at;
    if (e.kind === 'found') {
      S.finding = false; S.undone -= 12;
      S.interests.push({ title: '', words: 'dive scuba florida reef trip', size: 12, contacts: ['nitrox'], relevant: true });
      S.fresh.interests = true;
      S.news.unshift({ head: 'Interests:Single Update:[' + stamp(S, t) + ']', text: '264 documents examined; I found one new interest and joined a cluster for it.' });
      schedule(S, t + 5200, 'intro');
    } else if (e.kind === 'intro') {
      var i = S.interests.length - 1;
      if (!S.interests[i].relevant) continue;
      S.messages.push({ title: 'I think we should be introduced', sender: 'nitrox', interest: i, topic: 'dive scuba reef florida key', read: false,
        body: 'My Yenta noticed that you and I share an interest that hardly anybody else around here has, and suggested that I introduce myself. Did you realize there is another person here who is interested in going scuba diving in Florida?' });
      S.news.unshift({ head: 'Introduction:[' + stamp(S, t) + ']', text: 'I think you should introduce yourself to nitrox; you seem unusually close on one interest. See your messages.', go: 'messages' });
    } else if (e.kind === 'answer') {
      var title = e.data.title;
      S.messages.push({ title: /^Re: /.test(title) ? title : 'Re: ' + (title || 'your message'), sender: e.data.from, interest: e.data.interest,
        topic: words(S, e.data.interest), body: REPLIES[S.messages.length % REPLIES.length], read: false });
    } else if (e.kind === 'restart') {
      S.down = false;
      S.news.unshift({ head: 'Startup:[' + stamp(S, t) + ']', text: 'Yenta has been restarted. All settings, conversations and interests were restored.', go: 'news' });
    }
  }
}

function open(S, section) {
  if (S.down) return false;
  if (section === 'news') return S.news.length > 0;
  if (section === 'messages') return S.messages.some(function (m) { return !m.read; });
  return !!S.fresh[section];
}
function sectionOf(view) {
  return { message: 'messages', reply: 'messages', talk: 'messages', compose: 'messages', contacts: 'interests', topic: 'help', request: 'requests', shutdown: 'shutdown' }[view] || view;
}

// ---- pages ---------------------------------------------------------------
function pages(S, req, now) {
  var base = req.base;
  function href(p) { return base + '/' + p; }
  function act(p, fields) {
    var q = 'do=' + fields.do + '&n=' + req.n;
    Object.keys(fields).forEach(function (k) { if (k !== 'do') q += '&' + k + '=' + encodeURIComponent(fields[k]); });
    return href(p) + '?' + q;
  }
  function form(p, fields) { return '<form method="get" action="' + href(p) + '">' + hidden(Object.assign({ n: req.n }, fields)); }
  function ta(name) { return '<textarea name="' + name + '" rows="5" cols="40" wrap="virtual"></textarea>'; }

  return {
    interests: function () {
      var h = '<h1>Your currently known interests</h1>' + form('interests', { do: 'interests' }) +
        '<table border="1" cellspacing="2" cellpadding="1"><tr><th>Title</th><th>Some related words</th><th>Size</th><th>Contacts</th><th>Relevant?</th></tr>';
      S.interests.forEach(function (it, i) {
        h += '<tr><td><input type="text" name="title' + i + '" value="' + esc(it.title) + '" size="18"></td><td nowrap>' + it.words + '</td><td>' + it.size + '</td>' +
          '<td align="center"><a href="' + href('contacts/' + i) + '">' + it.contacts.length + '</a></td>' +
          '<td align="center"><input type="checkbox" name="rel' + i + '"' + (it.relevant ? ' checked' : '') + '></td></tr>';
      });
      h += '</table><p><b>I know about ' + S.undone + ' documents that I have not put into any of these interests. I am ' + (S.finding ? '' : 'not ') + 'currently working on these.</b></p>';
      if (!S.finding && S.undone > 0) h += '<p><input type="checkbox" name="find"> <b>Start finding interests.</b></p>';
      return h + '<input type="submit" value="Make changes"></form>';
    },
    contacts: function (i) {
      var it = S.interests[i];
      if (!it) return this.interests();
      return '<h1>Contacts for an interest</h1><p><b>Interest</b>: <i>' + it.words + '</i>' + (it.title ? ' (' + esc(it.title) + ')' : '') + '</p>' +
        '<p>I am in touch with ' + (it.contacts.length === 1 ? 'one other Yenta whose user shares' : it.contacts.length + ' other Yentas whose users share') + ' this interest:</p><ul>' +
        it.contacts.map(function (c) { return '<li><a href="' + href('talk/' + i + '/' + c) + '">' + c + '</a>'; }).join('') + '</ul>' +
        '<p>Compose a <a href="' + href('compose/' + i) + '">new message</a> to everyone who shares it.</p>';
    },
    messages: function () {
      var h = '<h1>Recent messages</h1>';
      if (S.note) h += '<p><b>' + S.note + '</b></p>';
      h += '<ul>';
      S.messages.forEach(function (m, i) {
        var lead = m.body.split(' ').slice(0, 3).join(' ');
        h += '<li><a href="' + href('message/' + i) + '">"' + esc(m.title) + '", by ' + m.sender + ': "' + esc(lead) + ',..."</a>';
      });
      return h + '</ul><p>Compose a <a href="' + href('compose/0') + '">new message</a> to a cluster.</p><p><a href="' + act('messages', { do: 'blockpage' }) + '">Block</a> an annoying Yenta.</p>';
    },
    message: function (i) {
      var m = S.messages[i];
      if (!m) return this.messages();
      m.read = true;
      return '<h1>Message ' + (i + 1) + '</h1><b>Relevant interest</b>: <a href="' + href('interests') + '">' + words(S, m.interest) + '</a><br>' +
        '<b>Topic</b>: &nbsp;<i>' + m.topic + '</i><br><b>Sender</b>: <a href="' + href('talk/' + m.interest + '/' + m.sender) + '">' + m.sender + '</a><br>' +
        '<b>Title</b>: ' + esc(m.title) + '<hr><p>' + esc(m.body) + '</p><hr>' +
        form('reply/' + i, {}) + '<p><input type="submit" value="Reply"></p><p><input type="radio" name="to" value="only" checked> to sender only<br>' +
        '<input type="radio" name="to" value="all"> to sender and all other recipients</p></form><hr>' +
        '<p><i>Is this Yenta annoying you? You can block it, and won’t be shown any more messages from it.</i></p>' +
        form('messages', { do: 'block', m: i }) + '<input type="submit" value="Block"></form>';
    },
    reply: function (o) {
      return '<h1>Reply to a message</h1>' + form('messages', { do: 'send', to: o.to, int: o.interest }) +
        '<b>Title</b>: <input type="text" name="title" size="30" value="' + esc(o.title) + '"><br>' +
        '<p><b>Message to ' + o.to + '</b><br>' + ta('body') + '</p><input type="submit" value="Send message"></form>';
    },
    compose: function (i) {
      return '<h1>Compose a message to an interest</h1>' + form('messages', { do: 'send' }) +
        '<b>Title</b>: <input type="text" name="title" size="30"><br>' +
        '<p><b>Message to all contacts for</b> &nbsp;' + select('int', S.interests.map(function (it, k) { return [k, it.words]; }), i) + '<br>' +
        ta('body') + '</p><input type="submit" value="Send message"></form>';
    },
    news: function () {
      var h = '<h1>Current status as of ' + stamp(S, now) + '</h1><p><b>I am ' + (S.finding ? '' : 'not ') + 'currently trying to find new interests.</b></p><h1>Things I’ve done lately</h1>';
      if (!S.news.length) h += '<p>Nothing new.</p>';
      else {
        h += '<p>Check the box beside each item when you’ve read it and I’ll know not to keep it.</p>' + form('news', { do: 'erase' });
        S.news.forEach(function (n, i) {
          h += '<p><input type="checkbox" name="news' + i + '"> &nbsp;<a href="' + href(n.go || 'interests') + '">' + n.head + '</a><br><b>' + n.text + '</b></p>';
        });
        h += '<p><input type="submit" value="Erase checked items"></p></form>';
      }
      return h + '<hr><p><b>This Yenta’s ID is PkCT eCV8 DQqK V30N 2Bla 0w3P 41g=<br>It is version 0.7.0.</b></p>';
    },
    attestations: function () {
      var h = '<table border="0" cellspacing="0" cellpadding="4"><tr><th>Status</th><th>Message</th><th>Signers</th><th>Oldest sig</th><th>Newest sig</th></tr>';
      S.attest.forEach(function (a, i) {
        h += '<tr><td nowrap valign="top"><b><font color="#0a6b1e">T</font></b> &nbsp;<a href="' + href('topic/1') + '">?</a> &nbsp;<a href="' + act('attestations', { do: 'unattest', i: i }) + '">X</a></td>' +
          '<td valign="top" width="176"><font size="1">' + esc(a.text) + '</font></td><td valign="top"><font size="1"><a href="' + href('attestations') + '">' + a.signers + '</a></font></td>' +
          '<td valign="top" nowrap><font size="1">' + a.oldest.replace(/ (\d\d:)/, '<br>$1') + '</font></td><td valign="top" nowrap><font size="1">' + a.newest.replace(/ (\d\d:)/, '<br>$1') + '</font></td></tr>';
      });
      return h + '</table><h2>Add an attestation</h2><p>To add an attestation, enter it in the box below and select "add".</p>' +
        form('attestations', { do: 'attest' }) + ta('attest') + '<br><input type="submit" value="add"></form>';
    },
    requests: function () {
      var h = '<h1>Special requests</h1><p>This page is a catch-all for a variety of commands that don’t naturally fit somewhere else.</p><dl>';
      REQUESTS.forEach(function (r, i) {
        var to = i ? href('request/' + i) : act('shutdown', { do: 'quit' });
        h += '<dt><b><a href="' + to + '">' + r[0].replace(/\.$/, '') + (i ? '.' : '') + '</a>' + (i ? '' : '.') + '</b><dd>' + r[1];
      });
      return h + '</dl>';
    },
    request: function (i) {
      if (i === 1) return '<h1>Change your passphrase</h1>' + form('news', { do: 'passphrase' }) +
        '<b>Old passphrase</b>: <input type="password" name="a" size="20"><br><b>New passphrase</b>: <input type="password" name="b" size="20"><br>' +
        '<b>New passphrase, again</b>: <input type="password" name="c" size="20"><p><input type="submit" value="Change passphrase"></p></form>';
      if (i === 2) return '<h1>Talk to a particular Yenta</h1><p>Enter the Yenta-ID of the Yenta you would like to talk to. I will try to find it and tell you in the news when I have.</p>' +
        form('news', { do: 'findyenta' }) + '<b>Yenta-ID</b>: <input type="text" name="yid" size="36"><p><input type="submit" value="Find this Yenta"></p></form>';
      return '<h1>Look up a Yenta by handle</h1>' + (S.note ? '<p><b>' + S.note + '</b></p>' : '') + form('request/3', { do: 'lookup' }) +
        '<b>Handle</b>: <input type="text" name="handle" size="20"><p><input type="submit" value="Look up"></p></form>';
    },
    tune: function () {
      var h = '<h1>Tunable parameters</h1><p><font size="1" class="tiny"><b>Some of these parameters might be useful to change. However, the documentation on their values is <i>not</i> currently guaranteed complete in this release, so you should know what you are doing or you may inadvertently disable some part of your Yenta. Additional documentation on these will appear in a later release.</b></font></p>' +
        form('tune', { do: 'tune' });
      TUNE.forEach(function (t, i) { h += '<b>' + t[0] + '</b> &nbsp;=&nbsp; <input type="text" name="tune' + i + '" value="' + esc(S.tune[i]) + '" size="10" class="small"><br><font size="1" class="tiny">' + t[2] + '</font><br>' + spacer(1, 1) + '<br>'; });
      return h + '<input type="submit" value="Make changes"></form>';
    },
    help: function () {
      return '<h1>Help on various topics</h1><p>This is <b>Yenta version 0.7.0,</b> running on <b>HP-UX-A.09.05.A-9000/725</b>.</p><p>Possible help topics:</p><ul>' +
        TOPICS.map(function (t, i) { return '<li><a href="' + href('topic/' + i) + '">' + t[0] + '</a>'; }).join('') + '</ul>';
    },
    topic: function (i) {
      var t = TOPICS[i] || TOPICS[0];
      return '<h1>' + t[0] + '</h1><p>' + t[1] + '</p><p><a href="' + href('help') + '">Other help topics</a></p>';
    },
    shutdown: function () { return '<p><b>Yenta has now shut down. In order to use it again, you will need to restart it.</b></p>'; }
  };
}

// ---- actions ---------------------------------------------------------------
function apply(S, q, view, now) {
  var d;
  switch (q.do) {
    case 'interests':
      S.interests.forEach(function (it, i) {
        if (q['title' + i] !== undefined) it.title = q['title' + i].trim().slice(0, 40);
        it.relevant = !!q['rel' + i];
      });
      if (q.find && !S.finding && S.undone > 0) { S.finding = true; schedule(S, now + 6500, 'found'); }
      return 'interests';
    case 'send':
      var to, interest = +q.int;
      if (!S.interests[interest]) interest = 0;
      if (q.to) {
        to = String(q.to).replace(/[^A-Za-z0-9_-]/g, '').slice(0, 20) || S.interests[interest].contacts[0];
        S.note = 'Your message to ' + to + ' has been sent.';
      } else {
        to = S.interests[interest].contacts[0];
        S.note = 'Your message has been sent to all contacts for <i>' + words(S, interest) + '</i>.';
      }
      schedule(S, now + 7000, 'answer', { from: to, interest: interest, title: String(q.title || '').trim().slice(0, 60) });
      return 'messages';
    case 'block':
      d = S.messages[+q.m];
      if (d) {
        S.messages = S.messages.filter(function (m) { return m.sender !== d.sender; });
        S.note = 'I will not show you any more messages from ' + d.sender + '.';
      }
      return 'messages';
    case 'blockpage':
      S.note = 'To block a Yenta, open one of its messages and choose Block.';
      return 'messages';
    case 'erase':
      S.news = S.news.filter(function (item, i) { return !q['news' + i]; });
      return 'news';
    case 'attest':
      d = String(q.attest || '').trim();
      if (d) { S.attest.push({ text: d.slice(0, 120), signers: 'foner [you]', oldest: stamp(S, now), newest: stamp(S, now) }); S.fresh.attestations = true; }
      return 'attestations';
    case 'unattest':
      if (+q.i > 0) S.attest.splice(+q.i, 1);
      return 'attestations';
    case 'tune':
      TUNE.forEach(function (t, i) { var v = String(q['tune' + i] || '').trim().slice(0, 12); if (v) S.tune[i] = v; });
      return 'tune';
    case 'passphrase':
      S.news.unshift({ head: 'Passphrase:[' + stamp(S, now) + ']', text: 'Your passphrase has been changed.', go: 'news' });
      return 'news';
    case 'findyenta':
      S.news.unshift({ head: 'Rumor:[' + stamp(S, now) + ']', text: 'I do not know that Yenta yet. I am asking the Yentas I do know whether they have heard of it.', go: 'news' });
      return 'news';
    case 'lookup':
      d = String(q.handle || '').trim().toLowerCase();
      var hits = [];
      S.interests.forEach(function (it, i) { it.contacts.forEach(function (c) { if (d && c.indexOf(d) >= 0) hits.push('<a href="{BASE}/talk/' + i + '/' + c + '">' + c + '</a>'); }); });
      S.note = hits.length ? 'I know of: ' + hits.join(', ') + '.' : 'No Yenta that I know of uses that handle.';
      return 'request';
    case 'quit':
      // An exhibit should not stay boarded up: Yenta restarts after a moment.
      S.down = true;
      schedule(S, now + 7000, 'restart');
      return 'shutdown';
  }
  return view;
}

function bookmark(S, k, path, name) {
  var here = S.bookmarks.filter(function (b) { return b.path === path; }).length > 0;
  if (k === 'add' && S.bookmarks.length < 6 && !here) S.bookmarks.push({ name: name, path: path });
  if (k === 'delete') S.bookmarks = here ? S.bookmarks.filter(function (b) { return b.path !== path; }) : S.bookmarks.slice(0, -1);
  if (k === 'reorder') S.alpha = !S.alpha;
}

const css =
  '.yn p, .yn td, .yn th, .yn li, .yn dd, .yn dt { font-family: Times, "Times New Roman", serif; font-size: 14px; line-height: 16px; }\n' +
  '.yn p { margin-top: 0px; margin-bottom: 8px; }\n' +
  '.yn h1 { font-family: Times, serif; font-size: 21px; line-height: 24px; font-weight: bold; margin-top: 0px; margin-bottom: 6px; }\n' +
  '.yn h2 { font-family: Times, serif; font-size: 17px; line-height: 20px; font-weight: bold; margin-top: 8px; margin-bottom: 4px; }\n' +
  '.yn ul { margin-top: 4px; margin-bottom: 8px; }\n' +
  '.yn dd { margin-bottom: 6px; }\n' +
  '.yn hr { margin-top: 4px; margin-bottom: 4px; }\n' +
  '.yn .small { font-size: 12px; line-height: 14px; }\n' +
  '.yn .tiny { font-size: 11px; line-height: 12px; }\n' +
  '.yn .bm { font-family: Geneva, Helvetica, sans-serif; font-size: 9px; }\n';

function respond(S, req) {
  var now = req.now, q = req.q;
  var view = req.path[0] || 'interests', arg = req.path[1];
  if (!pages(S, req, now)[view] && view !== 'talk') view = 'interests';
  tick(S, now);

  var path = req.path.join('/') || 'interests';
  if (req.fresh && q.do === 'bm') {
    var nm = view === 'message' ? 'Message ' + (+arg + 1) : view === 'topic' ? 'Help' : TITLES[sectionOf(view)] || 'Yenta';
    bookmark(S, q.k, path, nm);
  } else if (req.fresh && q.do && !S.down) {
    view = apply(S, q, view, now);
    if (view === 'request') arg = '3';
    path = view === 'request' ? 'request/3' : view;
  }
  if (S.down) { view = 'shutdown'; path = 'shutdown'; }

  // a door closes behind you once you have looked inside
  if (S.last && S.last !== path && S.fresh[sectionOf(S.last.split('/')[0])]) S.fresh[sectionOf(S.last.split('/')[0])] = false;
  S.last = path;

  var P = pages(S, req, now), main;
  if (view === 'reply') {
    var m = S.messages[+arg];
    main = m ? P.reply({ to: m.sender, interest: m.interest, title: 'Re: ' + m.title.replace(/^Re: /, '') }) : P.messages();
  } else if (view === 'talk') {
    var it = S.interests[+arg], who = decodeURIComponent(req.path[2] || '');
    main = it && it.contacts.indexOf(who) >= 0 ? P.reply({ to: who, interest: +arg, title: '' }) : P.interests();
  } else if (view === 'contacts' || view === 'message' || view === 'compose' || view === 'request' || view === 'topic') {
    main = P[view](+arg || 0);
  } else main = P[view]();
  main = main.split('{BASE}').join(req.base);
  S.note = '';

  // the frame: logo, the seven doors, the section picture, bookmarks
  var sec = sectionOf(view);
  var cells = SECTIONS.map(function (s, i) {
    return '<a href="' + req.base + '/' + s + '">' + img('yn-cell-' + s + '-' + (i < 4 && open(S, s) ? 'open' : 'closed') + '.gif', 80, 80, 'alt="' + s + '"') + '</a>';
  }).join('');
  var big = {
    news: 'big-news-open', messages: open(S, 'messages') ? 'big-messages-open' : 'big-messages-closed', interests: 'big-interests-closed',
    attestations: 'big-attestations-open', requests: 'big-requests', tune: 'big-tune', help: 'big-help', shutdown: 'big-shutdown'
  }[sec] || 'big-interests-closed';
  var list = S.bookmarks.slice();
  if (S.alpha) list.sort(function (a, b) { return a.name.localeCompare(b.name); });
  var marks = list.length ? list.map(function (b) { return '<a href="' + req.base + '/' + b.path + '">' + esc(b.name) + '</a>'; }).join('<br>') : '<i>[No bookmarks defined.]</i>';
  function bm(k) { return req.base + '/' + path + '?do=bm&k=' + k + '&n=' + req.n; }

  var html = '<table border="0" cellspacing="0" cellpadding="0" width="734" bgcolor="#ffffff" class="yn"><tr>' +
    '<td width="173" valign="top" bgcolor="#000000"><a href="' + req.base + '/interests">' + img('yn-logo.gif', 173, 95, 'alt="yenta"') + '</a></td>' +
    '<td width="1" bgcolor="#000000">' + spacer(1, 1) + '</td>' +
    '<td width="560" valign="top" bgcolor="#000000">' + img('yn-navlabels.gif', 560, 15) + '<br>' + cells + '</td></tr>' +
    '<tr><td valign="top" width="173">' + img('yn-' + big + '.gif', 171, 171, 'hspace="1"') + '<br>' +
    img('yn-bookmarks.gif', 173, 92, 'usemap="#marks" alt="add, delete, reorder"') +
    '<map name="marks"><area shape="rect" coords="4,18,58,92" href="' + bm('add') + '" alt="add">' +
    '<area shape="rect" coords="60,18,116,92" href="' + bm('delete') + '" alt="delete">' +
    '<area shape="rect" coords="118,18,170,92" href="' + bm('reorder') + '" alt="reorder"></map>' +
    '<center><font class="bm" size="1">' + marks + '</font></center></td>' +
    '<td width="1" bgcolor="#000000">' + spacer(1, 1) + '</td>' +
    '<td valign="top" width="560"><table border="0" cellspacing="0" cellpadding="7" width="560"><tr><td>' + main + '</td></tr></table></td></tr></table>';

  // While something is due, the page looks again by itself, except where the
  // visitor may be in the middle of typing.
  var refresh = null, typing = { reply: 1, talk: 1, compose: 1, attestations: 1, tune: 1, request: 1 };
  if (S.events.length && !typing[view]) {
    refresh = { secs: Math.max(2, Math.ceil((S.events[0].at - now) / 1000) + 1), url: req.base + '/' + (S.down ? 'news' : path) };
  }
  return {
    title: 'Yenta: ' + (TITLES[sec] || 'Yenta'),
    body: { bgcolor: '#ffffff', text: '#000000', link: '#0000cc', vlink: '#b00018', alink: '#ff0000' },
    css: css, refresh: refresh,
    html: '<center>' + html + '</center>'
  };
}

module.exports = { key: 'yenta', label: label, create: create, respond: respond };
