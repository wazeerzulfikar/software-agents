/* Kasbah for 1990s browsers. Kasbah was a web marketplace served by CGI
   (http://jeeves.media.mit.edu:82/cgi-bin/dispatch?...), so here it is one
   again, in whatever browser the visitor has. The marketplace is the one in
   js/kasbah.js: the selling agent's asking price decays from the start price
   to the minimum by the deadline, linearly, quadratically or cubically,
   while simulated buying agents raise their bids. The server advances the
   negotiation by the clock, and the page reloads itself while it runs. */
'use strict';

const { esc, rng, img, spacer, select, hidden } = require('./lib');

const label = {
  title: 'Transactions: Kasbah',
  credit: 'Anthony Chavez & Pattie Maes, 1996',
  about: 'Kasbah is a marketplace where you do not haggle yourself: you tell an agent what to sell, what to ask and how low it may go, and it bargains with other people’s buying agents for you.',
  hint: 'Go to <i>agents</i>, then <i>Create a new selling agent</i>, and press <i>Create Agent</i> at the foot of the form. Left blank, it sells <i>The Joshua Tree</i> by U2 for $12.'
};

const USER = 'pattie';
const TODAY = new Date(1997, 0, 9);
const TICK_MS = 650;
const RUN_TICKS = 52;
const REFRESH_S = 3;
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const OWNERS = ['jdoe', 'msmith', 'rkim', 'lchen', 'apatel', 'tnguyen', 'bjones', 'cwu', 'dgarcia', 'emiller'];
const OTHERS = [
  ['Sell', 'Kind of Blue (CD) by Miles Davis', 'lchen', 11], ['Buy', 'Nevermind (CD) by Nirvana', 'jdoe', 7],
  ['Sell', 'Structure and Interpretation of Computer Programs', 'cwu', 30], ['Buy', 'OK Computer (CD) by Radiohead', 'apatel', 10],
  ['Sell', 'Automatic for the People (CD) by R.E.M.', 'emiller', 8], ['Buy', 'The Society of Mind', 'bjones', 9],
  ['Sell', 'Macintosh IIci', 'dgarcia', 900], ['Buy', 'Blue (CD) by Joni Mitchell', 'tnguyen', 6]
];
const CURVE = { 'anxious': 1, 'cool-headed': 2, 'tough bargainer': 3 };
const FORM = {
  kind: ['CD', 'Cassette', 'LP'],
  genre: ['-', 'Rock', 'Pop', 'Alternative', 'Jazz', 'Classical', 'Folk', 'Rap', 'Soundtrack', 'Other'],
  condition: ['New, still in the wrapper', 'Like new', 'Used but not damaged', 'Scratched but plays'],
  days: ['1 week', '2 weeks', '1 month', '2 months'],
  strategy: ['anxious', 'cool-headed', 'tough bargainer'],
  location: ['local', 'anywhere'],
  autonomy: ['check before transaction', 'complete transaction'],
  reporting: ['event driven', 'daily summary']
};
const DEFAULTS = { kind: 'CD', genre: '-', condition: 'Used but not damaged', days: '2 months', strategy: 'tough bargainer', location: 'local', autonomy: 'check before transaction', reporting: 'event driven' };

function money(v) { return '$' + v.toFixed(2); }
function dayDate(d) { var x = new Date(TODAY.getTime()); x.setDate(x.getDate() + Math.floor(d)); return x; }
function longDate(d) {
  var x = dayDate(d), n = x.getDate(), suf = (n % 10 === 1 && n !== 11) ? 'st' : (n % 10 === 2 && n !== 12) ? 'nd' : (n % 10 === 3 && n !== 13) ? 'rd' : 'th';
  return MONTHS[x.getMonth()] + ' ' + n + suf + ', ' + x.getFullYear();
}
function shortDate(d) { var x = dayDate(d); return MONTHS[x.getMonth()].slice(0, 3) + ' ' + x.getDate(); }

// ---- one visitor's marketplace ---------------------------------------------
function create() {
  return { agents: [], messages: [], day: 0, unread: 0, agentNo: 20, rnd: rng(82), lastTick: null };
}

function itemName(a) { return esc(a.title) + ' (' + esc(a.kind) + ') by ' + esc(a.artist); }
function say(st, a, text, hot) { a.log.push({ day: st.day, text: text, hot: !!hot }); }
function report(st, a, text, needsYou) {
  st.messages.unshift({ day: st.day, agent: a.id, text: text, isNew: true, needsYou: !!needsYou });
  st.unread++;
}
function bid(b, t) {
  var u = Math.max(0, Math.min(1, (t - b.arrives) / (1 - b.arrives)));
  return b.open + (b.max - b.open) * Math.pow(u, 1 / b.pow);
}
function asking(a, t) { return a.start - (a.start - a.min) * Math.pow(Math.min(1, t), CURVE[a.strategy]); }
function agentById(st, id) { return st.agents.filter(function (a) { return a.id === id; })[0]; }

function createAgent(st, f) {
  var rnd = st.rnd;
  var a = {
    id: ++st.agentNo, kind: f.kind, genre: f.genre, title: f.title, artist: f.artist, condition: f.condition, desc: f.desc,
    days: f.days, start: f.start, min: f.min, strategy: f.strategy, location: f.location, autonomy: f.autonomy, reporting: f.reporting,
    born: st.day, t: 0, tick: 0, ask: f.start, status: 'active', log: [], deal: null, best: 0, lastReport: 0
  };
  // Four people out there want this. Each has a private ceiling and a habit of raising the bid.
  var span = Math.max(a.start - a.min, a.start * 0.05), names = OWNERS.slice().sort(function () { return rnd() - 0.5; });
  a.buyers = [0, 1, 2, 3].map(function (i) {
    var top = i === 0 ? a.min + span * (0.45 + rnd() * 0.4)
      : a.min + span * (-0.55 + rnd() * 1.25);
    return {
      no: 3 + Math.floor(rnd() * 17) + i * 20, owner: names[i], max: top, open: top * (0.45 + rnd() * 0.2),
      pow: 1 + Math.floor(rnd() * 3), arrives: i === 0 ? 0.03 : rnd() * 0.45, declined: false, asked: false
    };
  });
  say(st, a, 'I entered the marketplace, asking ' + money(a.start) + '.');
  st.agents.push(a);
  return a;
}

function step(st) {
  var active = st.agents.filter(function (a) { return a.status === 'active'; });
  if (!active.length) return false;
  active.forEach(function (a) {
    a.tick++;
    a.t = a.tick / RUN_TICKS;
    st.day = a.born + a.t * a.days;
    a.ask = asking(a, a.t);
    var here = a.buyers.filter(function (b) { return b.arrives <= a.t && !b.declined; });
    var b = here.length ? here[a.tick % here.length] : null;
    here.forEach(function (x) { if (bid(x, a.t) >= a.ask && (!b || bid(x, a.t) > bid(b, a.t))) b = x; });
    if (b) {
      var offer = bid(b, a.t);
      a.best = Math.max(a.best, offer);
      var name = 'Agent ' + b.no;
      if (offer >= a.ask) {
        a.deal = { buyer: b, price: a.ask };
        say(st, a, 'I offered ' + name + ' a price of ' + money(a.ask) + '. They accepted!', true);
        if (a.autonomy === 'check before transaction') {
          a.status = 'awaiting';
          say(st, a, 'I am waiting for your approval before we shake hands.', true);
          report(st, a, 'I have reached a tentative agreement to sell <i>' + itemName(a) + '</i> to Agent ' + b.no + ' (owner: ' + b.owner + ') for <b>' + money(a.deal.price) + '</b>. I will not finalize the deal until you approve it.', true);
        } else closeDeal(st, a);
      } else if (!b.asked) {
        b.asked = true;
        say(st, a, name + ' (owner: ' + b.owner + ') asked my asking price. I replied ' + money(a.ask) + '. They would pay ' + money(offer) + '.');
        if (a.reporting === 'event driven' && here.length === 1 && a.tick < 6) report(st, a, 'I have found a first potential buyer for <i>' + itemName(a) + '</i>: Agent ' + b.no + ', owned by ' + b.owner + '. Negotiating.');
      } else if (a.tick % 2 === 0) {
        say(st, a, 'I offered ' + name + ' a price of ' + money(a.ask) + '. They rejected the offer and would pay ' + money(offer) + '.');
      }
    }
    if (a.status === 'active' && a.reporting === 'daily summary' && a.tick - a.lastReport >= 13) {
      a.lastReport = a.tick;
      report(st, a, 'Summary for ' + longDate(st.day) + ': I am asking ' + money(a.ask) + ' for <i>' + itemName(a) + '</i>. ' + (a.best ? 'The best offer so far is ' + money(a.best) + '.' : 'No offers yet.'));
    }
    if (a.status === 'active' && a.t >= 1) {
      a.status = 'expired';
      say(st, a, 'The deadline has passed. I could not find a buyer at ' + money(a.min) + ' or more.', true);
      report(st, a, 'I could not sell <i>' + itemName(a) + '</i> by the deadline. The best offer was ' + money(a.best) + ', below your minimum price of ' + money(a.min) + '. You may want to lower the price and try again.');
    }
  });
  return true;
}
function closeDeal(st, a) {
  a.status = 'sold';
  say(st, a, 'Sold to Agent ' + a.deal.buyer.no + ' for ' + money(a.deal.price) + '. My job is done.', true);
  report(st, a, 'I sold <i>' + itemName(a) + '</i> to Agent ' + a.deal.buyer.no + ' for <b>' + money(a.deal.price) + '</b>. Now it is up to the two of you: send mail to ' + a.deal.buyer.owner + '@mit.edu to arrange the exchange.');
}
function approve(st, a, yes) {
  if (!a || a.status !== 'awaiting') return;
  if (yes) { say(st, a, 'You approved the deal.'); closeDeal(st, a); }
  else {
    a.deal.buyer.declined = true; a.deal = null; a.status = 'active';
    say(st, a, 'You declined the deal. I am back in the marketplace.');
  }
  st.messages.forEach(function (m) { if (m.agent === a.id) m.needsYou = false; });
}

/* The marketplace's clock: one slice of a negotiation every 650 ms, as in
   the modern version, worked out whenever a page is asked for. */
function advance(st, now) {
  while (st.lastTick !== null && now - st.lastTick >= TICK_MS) {
    st.lastTick += TICK_MS;
    if (!step(st)) st.lastTick = null;
  }
}
function run(st, now) { if (st.lastTick === null) st.lastTick = now; }

function readForm(q) {
  var f = {};
  Object.keys(FORM).forEach(function (k) { f[k] = FORM[k].indexOf(q[k]) >= 0 ? q[k] : DEFAULTS[k]; });
  ['title', 'artist', 'desc'].forEach(function (k) { f[k] = String(q[k] || '').trim().slice(0, k === 'desc' ? 400 : 60); });
  var days = { '1 week': 7, '2 weeks': 14, '1 month': 30, '2 months': 60 }[f.days];
  var start = parseFloat(String(q.start || '').replace(/[^0-9.]/g, '')), min = parseFloat(String(q.min || '').replace(/[^0-9.]/g, ''));
  // An empty form becomes the example from the debate: The Joshua Tree, $12, as low as $9.
  if (!f.title) { f.title = 'The Joshua Tree'; if (!f.artist) f.artist = 'U2'; }
  if (!f.artist) f.artist = 'Unknown';
  if (!(start > 0)) start = min > 0 ? Math.round(min * 1.33) : 12;
  if (!(min > 0) || min > start) min = Math.round(start * 0.75 * 100) / 100;
  start = Math.min(start, 99999); min = Math.min(min, start);
  f.days = days; f.start = start; f.min = min;
  return f;
}

// ---- pages ---------------------------------------------------------------
function pages(st, req) {
  var base = req.base;
  function go(cmd) { return base + '/dispatch?' + cmd + '+' + USER; }
  function nav(here) {
    return '<center>' + img('kb-nav-' + here + '.gif', 540, 80, 'usemap="#kbnav" alt="home - messages - Kasbah - agents - logout"') + '</center>' +
      '<map name="kbnav"><area shape="rect" coords="4,0,92,80" href="' + go('WELCOME') + '" alt="home">' +
      '<area shape="rect" coords="92,0,240,80" href="' + go('MESSAGES') + '" alt="messages">' +
      '<area shape="rect" coords="240,0,308,80" href="' + go('WELCOME') + '" alt="Kasbah">' +
      '<area shape="rect" coords="308,0,452,80" href="' + go('AGENTS') + '" alt="agents">' +
      '<area shape="rect" coords="452,0,540,80" href="' + go('LOGOUT') + '" alt="logout"></map>';
  }
  function decide(a) {
    return '<form method="get" action="' + base + '/dispatch">' + hidden({ cmd: 'DECIDE', id: a.id, n: req.n }) +
      '<input type="submit" name="choice" value="Accept"> &nbsp; <input type="submit" name="choice" value="Decline"></form>';
  }
  function statusText(a) {
    if (a.status === 'active') return 'Negotiating. Today is ' + longDate(st.day) + '. Current asking price: <b>' + money(a.ask) + '</b>.';
    if (a.status === 'awaiting') return 'Waiting for your approval of a deal at <b>' + money(a.deal.price) + '</b>.';
    if (a.status === 'sold') return 'Sold on ' + longDate(st.day) + ' for <b>' + money(a.deal.price) + '</b>.';
    return 'Expired on ' + longDate(a.born + a.days) + ' without a sale.';
  }

  return {
    home: {
      title: 'Kasbah Prototype Version 2 Welcome Page',
      html: function () {
        var n = st.unread;
        return nav('home') + '<center>' + spacer(1, 30) + '<br>' + img('kb-welcome.jpg', 240, 216, 'alt="Welcome to Kasbah"') + '</center>' +
          '<h2 align="center">Welcome to Kasbah, ' + USER + ' !</h2><hr>' + spacer(1, 14) +
          '<p><font color="#444444">This is your homepage, ' + USER + '. Every once in a while, you should probably check to see if your agents have sent you any <a href="' + go('MESSAGES') + '">messages</a>. To create new agents, see <i>your</i> currently active agents, or have a look at all agents which are presently active in the Kasbah marketplace, visit <a href="' + go('AGENTS') + '">agents</a>. If you want to, you can also <a href="' + go('PASSWD') + '">change your password</a>. Don’t forget that you can use the menu bar at the top of the page at any time to help you navigate. Here we will notify you if you have any messages and how many. We will also provide a link to the message page if you do have any messages:</font></p>' +
          (n ? '<p><b>You have ' + n + ' new message' + (n > 1 ? 's' : '') + '.</b> <a href="' + go('MESSAGES') + '">Read ' + (n > 1 ? 'them' : 'it') + '</a></p>' : '<p><font color="#444444">You have no new messages.</font></p>');
      }
    },
    newsell: {
      title: 'Kasbah Agent Control Strip',
      html: function () {
        function pop(k) { return select(k, FORM[k].map(function (o) { return [o, o]; }), DEFAULTS[k]); }
        return nav('agents') + '<h2 align="center">Hi ' + USER + ', now you can create<br>your New Selling Agent.</h2><hr>' +
          '<form method="get" action="' + base + '/dispatch">' + hidden({ cmd: 'CREATE', id: st.agentNo + 1, n: req.n }) +
          '<p><b>Fill out the form below to create a selling agent that will sell your <i>music</i> for you. Please enter all information as accurately as possible, so that your agent will be able to find matches for you more easily. Remember to click the "Create Agent" button at the bottom of the form when you’ve finished.</b></p>' +
          '<p>Click to clear form: <input type="reset" value="Clear"></p>' +
          '<p><i>Description of Music to sell:</i></p>' +
          '<p>I am trying to sell the following: ' + pop('kind') + '</p>' +
          '<p>Genre: ' + pop('genre') + '</p>' +
          '<p>Title:<br><input type="text" name="title" size="40" maxlength="60"></p>' +
          '<p>Artist:<br><input type="text" name="artist" size="40" maxlength="60"></p>' +
          '<p>Condition: ' + pop('condition') + '</p>' +
          '<p>Description<br>(Enter anything which you think might help your agent find matches):<br><textarea name="desc" rows="5" cols="44" wrap="virtual"></textarea></p>' +
          '<p>' + spacer(1, 6) + '<br><i>Instructions for your Selling Agent:</i></p>' +
          '<p>Deadline: sell it within ' + pop('days') + '</p>' +
          '<p>Start price: $ <input type="text" name="start" size="7" maxlength="8"> &nbsp; Min. price: $ <input type="text" name="min" size="7" maxlength="8"></p>' +
          '<p>Strategy: ' + pop('strategy') + '</p>' +
          '<p>Location: ' + pop('location') + '</p>' +
          '<p>Level of Autonomy: ' + pop('autonomy') + '</p>' +
          '<p>Reporting Method: ' + pop('reporting') + '</p>' +
          '<p>' + spacer(1, 4) + '<br><input type="submit" value="Create Agent"></p></form>';
      }
    },
    agent: {
      title: 'Kasbah Agent Control Strip',
      html: function (id) {
        var a = agentById(st, id);
        if (!a) return nav('agents') + '<p>No such agent.</p>';
        var h = nav('agents') + '<h2 align="center">Your Selling Agent, No. ' + a.id + '</h2><hr>' +
          '<p class="sell">Sell: <font color="#b5651d">' + itemName(a) + '</font></p><ul>' +
          '<li>Deadline: <u>' + longDate(a.born + a.days) + '</u><li>Start price: <u>' + money(a.start) + '</u><li>Min. price: <u>' + money(a.min) + '</u>' +
          '<li>Strategy: <u>' + a.strategy + '</u><li>Location: <u>' + a.location + '</u><li>Level of Autonomy: <u>' + a.autonomy + '</u>' +
          '<li>Reporting Method: <u>' + a.reporting + '</u></ul><hr>';
        if (a.status === 'awaiting') {
          h += '<table border="0" cellspacing="0" cellpadding="2" width="100%" bgcolor="#000000"><tr><td><table border="0" cellspacing="0" cellpadding="8" width="100%" bgcolor="#ffffff"><tr><td>' +
            '<p><b>Your agent needs you.</b> Agent ' + a.deal.buyer.no + ' (owner: ' + a.deal.buyer.owner + ') will pay <b>' + money(a.deal.price) +
            '</b>. Your asking price started at ' + money(a.start) + ' and your minimum is ' + money(a.min) + '.</p>' + decide(a) + '</td></tr></table></td></tr></table><br>';
        }
        h += '<table border="0" cellspacing="0" cellpadding="6" width="100%" bgcolor="#f0efe2"><tr><td><b>Status:</b> ' + statusText(a) + '</td></tr></table>' +
          '<h3>What your agent has been doing</h3><table border="0" cellspacing="0" cellpadding="2" width="100%">';
        a.log.slice().reverse().forEach(function (l) {
          h += '<tr><td valign="top" nowrap width="46"><font color="#555555">' + shortDate(l.day) + '</font></td><td valign="top">' + (l.hot ? '<b>' + l.text + '</b>' : l.text) + '</td></tr>';
        });
        h += '</table>';
        if (a.status === 'sold' || a.status === 'expired') h += '<p><a href="' + go('NEW_SELL_AGENT') + '">Create another selling agent</a></p>';
        return h;
      }
    },
    messages: {
      title: 'Kasbah Messages',
      html: function () {
        var h = nav('messages') + '<h2 align="center">Messages from your agents</h2><hr>';
        if (!st.messages.length) {
          return h + '<p>You have no messages. Your agents will write to you here when they have something to report.</p>' +
            (st.agents.length ? '' : '<p>You have no agents yet. <a href="' + go('NEW_SELL_AGENT') + '">Create a selling agent</a>.</p>');
        }
        st.messages.forEach(function (m) {
          var a = agentById(st, m.agent);
          h += '<hr size="1" noshade><p><b>From <a href="' + go('AGENT') + '+' + m.agent + '">Selling Agent ' + m.agent + '</a>, ' + longDate(m.day) + '</b>' +
            (m.isNew ? ' &nbsp;<font size="1" color="#c00000"><b>NEW</b></font>' : '') + '<br>' + m.text + '</p>' +
            (m.needsYou && a && a.status === 'awaiting' ? decide(a) : '');
        });
        // reading the page marks them read
        st.messages.forEach(function (m) { m.isNew = false; });
        st.unread = 0;
        return h;
      }
    },
    agents: {
      title: 'Kasbah Agents',
      html: function () {
        var h = nav('agents') + '<h2 align="center">Agents</h2><hr><h3>Your agents</h3>';
        if (!st.agents.length) h += '<p>You have no active agents.</p>';
        else {
          h += '<table border="0" cellspacing="0" cellpadding="2"><tr><th align="left"></th><th align="left">Item &nbsp; &nbsp;</th><th align="left">Asking &nbsp; &nbsp;</th><th align="left">Status</th></tr>';
          st.agents.forEach(function (a) {
            h += '<tr><td><a href="' + go('AGENT') + '+' + a.id + '">Sell</a> &nbsp;</td><td>' + itemName(a) + ' &nbsp; &nbsp;</td><td>' + money(a.status === 'sold' ? a.deal.price : a.ask) + '</td><td>' + a.status + '</td></tr>';
          });
          h += '</table>';
        }
        h += '<p><a href="' + go('NEW_SELL_AGENT') + '">Create a new selling agent</a></p><h3>All agents presently active in the marketplace</h3>' +
          '<table border="0" cellspacing="0" cellpadding="2"><tr><th align="left"></th><th align="left">Item</th><th align="left">Owner &nbsp;</th><th align="left">Asking</th></tr>';
        OTHERS.forEach(function (o) { h += '<tr><td>' + o[0] + ' &nbsp;</td><td>' + o[1] + ' &nbsp; &nbsp;</td><td>' + o[2] + '</td><td>' + money(o[3]) + '</td></tr>'; });
        return h + '</table>';
      }
    },
    password: {
      title: 'Kasbah Change Password',
      html: function () { return nav('home') + '<h2 align="center">Change your password</h2><hr><p>Passwords cannot be changed while the marketplace is running an experiment. Please ask the Kasbah administrators.</p><p><a href="' + go('WELCOME') + '">Return to your homepage</a></p>'; }
    },
    logout: {
      title: 'Kasbah',
      html: function () { return nav('logout') + '<h2 align="center">Goodbye, ' + USER + '.</h2><hr><center><p>You have logged out of Kasbah. Your agents will keep working for you while you are away.</p><p><a href="' + go('WELCOME') + '">Log in again</a></p></center>'; }
    }
  };
}

const VIEWS = { WELCOME: 'home', NEW_SELL_AGENT: 'newsell', AGENT: 'agent', MESSAGES: 'messages', AGENTS: 'agents', PASSWD: 'password', LOGOUT: 'logout' };

const css =
  '.kb p, .kb td, .kb th, .kb li { font-family: Palatino, "Book Antiqua", Times, serif; font-size: 13px; line-height: 16px; }\n' +
  '.kb h2 { font-family: Palatino, Times, serif; font-size: 19px; line-height: 23px; font-weight: bold; text-align: center; }\n' +
  '.kb h3 { font-family: Palatino, Times, serif; font-size: 15px; line-height: 19px; font-weight: bold; }\n' +
  '.kb .sell { font-size: 16px; line-height: 21px; }\n';

function respond(st, req) {
  var now = req.now, q = req.q, view = 'home', id = null;
  advance(st, now);

  if (q.cmd === 'CREATE') {
    if (req.fresh) { id = createAgent(st, readForm(q)).id; run(st, now); }
    else id = +q.id;
    view = agentById(st, id) ? 'agent' : 'newsell';
  } else if (q.cmd === 'DECIDE') {
    id = +q.id;
    var a = agentById(st, id);
    if (req.fresh && a) { approve(st, a, q.choice === 'Accept'); run(st, now); }
    view = 'agent';
  } else {
    var words = (req.raw || '').split('+');
    view = VIEWS[words[0]] || 'home';
    if (view === 'agent') id = +words[2];
  }

  var P = pages(st, req)[view];
  var html = P.html(id);
  var running = st.agents.some(function (a) { return a.status === 'active'; });
  // While an agent is bargaining, any page that shows it looks again by itself.
  var refresh = running && view !== 'newsell' ? { secs: REFRESH_S, url: req.base + '/dispatch?' + ({ home: 'WELCOME', agent: 'AGENT', messages: 'MESSAGES', agents: 'AGENTS', password: 'PASSWD', logout: 'LOGOUT' }[view]) + '+' + USER + (view === 'agent' ? '+' + id : '') } : null;
  return {
    title: P.title,
    body: { bgcolor: '#ffffff', text: '#000000', link: '#1a1ac8', vlink: '#8a4a86', alink: '#ff0000' },
    css: css, refresh: refresh,
    html: '<center><table border="0" cellspacing="0" cellpadding="10" width="560" class="kb"><tr><td>' + html + '</td></tr></table></center>'
  };
}

module.exports = { key: 'kasbah', label: label, create: create, respond: respond, _test: { advance: advance } };
