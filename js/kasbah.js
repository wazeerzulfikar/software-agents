/* Kasbah (Chavez & Maes, 1996): an agent marketplace for buying and selling.

   Two Netscape windows, as on the slide: on the left pattie's Kasbah home
   page, on the right the form that creates a new selling agent. Once created,
   the agent really negotiates: its asking price decays from the start price
   to the minimum price by the deadline (linearly, quadratically or cubically,
   depending on strategy) while a handful of simulated buying agents raise
   their bids, and the agent keeps the log of conversations the paper
   describes. Marketplace days pass in under a second each. */
(function () {
  'use strict';

  var USER = 'pattie';
  var HOST = 'http://jeeves.media.mit.edu:82/cgi-bin/dispatch?';
  var TODAY = new Date(1997, 0, 9);            // two months before March 10th, 1997
  var TICK_MS = 650;
  var RUN_TICKS = 52;                          // a whole negotiation takes about half a minute
  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  var rnd = window.Shell.rng(82);
  function money(v) { return '$' + v.toFixed(2); }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }
  function dayDate(d) { var x = new Date(TODAY.getTime()); x.setDate(x.getDate() + Math.floor(d)); return x; }
  function longDate(d) {
    var x = dayDate(d), n = x.getDate(), suf = (n % 10 === 1 && n !== 11) ? 'st' : (n % 10 === 2 && n !== 12) ? 'nd' : (n % 10 === 3 && n !== 13) ? 'rd' : 'th';
    return MONTHS[x.getMonth()] + ' ' + n + suf + ', ' + x.getFullYear();
  }
  function shortDate(d) { var x = dayDate(d); return MONTHS[x.getMonth()].slice(0, 3) + ' ' + x.getDate(); }

  // ---- the marketplace ----------------------------------------------------
  var state = { agents: [], messages: [], day: 0, unread: 0 };
  var OWNERS = ['jdoe', 'msmith', 'rkim', 'lchen', 'apatel', 'tnguyen', 'bjones', 'cwu', 'dgarcia', 'emiller'];
  var OTHERS = [
    ['Sell', 'Kind of Blue (CD) by Miles Davis', 'lchen', 11], ['Buy', 'Nevermind (CD) by Nirvana', 'jdoe', 7],
    ['Sell', 'Structure and Interpretation of Computer Programs', 'cwu', 30], ['Buy', 'OK Computer (CD) by Radiohead', 'apatel', 10],
    ['Sell', 'Automatic for the People (CD) by R.E.M.', 'emiller', 8], ['Buy', 'The Society of Mind', 'bjones', 9],
    ['Sell', 'Macintosh IIci', 'dgarcia', 900], ['Buy', 'Blue (CD) by Joni Mitchell', 'tnguyen', 6]
  ];
  var CURVE = { 'anxious': 1, 'cool-headed': 2, 'tough bargainer': 3 };
  var agentNo = 20;

  function createAgent(f) {
    var a = {
      id: ++agentNo, kind: f.kind, genre: f.genre, title: f.title, artist: f.artist, condition: f.condition, desc: f.desc,
      days: f.days, start: f.start, min: f.min, strategy: f.strategy, location: f.location, autonomy: f.autonomy, reporting: f.reporting,
      born: state.day, t: 0, tick: 0, ask: f.start, status: 'active', log: [], deal: null, best: 0, lastReport: 0
    };
    // Four people out there want this. Each has a private ceiling and a habit of raising the bid.
    var span = Math.max(a.start - a.min, a.start * 0.05), names = OWNERS.slice().sort(function () { return rnd() - 0.5; });
    a.buyers = [0, 1, 2, 3].map(function (i) {
      var top = i === 0 ? a.min + span * (0.45 + rnd() * 0.4)        // one of them will certainly meet the agent in time
        : a.min + span * (-0.55 + rnd() * 1.25);
      return {
        no: 3 + Math.floor(rnd() * 17) + i * 20, owner: names[i], max: top, open: top * (0.45 + rnd() * 0.2),
        pow: 1 + Math.floor(rnd() * 3), arrives: i === 0 ? 0.03 : rnd() * 0.45, declined: false, asked: false
      };
    });
    say(a, 'I entered the marketplace, asking ' + money(a.start) + '.');
    state.agents.push(a);
    return a;
  }
  function itemName(a) { return esc(a.title) + ' (' + esc(a.kind) + ') by ' + esc(a.artist); }
  function say(a, text, hot) { a.log.push({ day: state.day, text: text, hot: !!hot }); }
  function report(a, text, needsYou) {
    state.messages.unshift({ day: state.day, agent: a.id, text: text, isNew: true, needsYou: !!needsYou });
    state.unread++;
  }
  function bid(b, t) {
    var u = Math.max(0, Math.min(1, (t - b.arrives) / (1 - b.arrives)));
    return b.open + (b.max - b.open) * Math.pow(u, 1 / b.pow);
  }
  function asking(a, t) { return a.start - (a.start - a.min) * Math.pow(Math.min(1, t), CURVE[a.strategy]); }

  function step() {
    var active = state.agents.filter(function (a) { return a.status === 'active'; });
    if (!active.length) return false;
    active.forEach(function (a) {
      a.tick++;
      a.t = a.tick / RUN_TICKS;
      state.day = a.born + a.t * a.days;
      a.ask = asking(a, a.t);
      var here = a.buyers.filter(function (b) { return b.arrives <= a.t && !b.declined; });

      // Each slice the agent talks to one potential contact, in rounds;
      // anyone already willing to meet its price gets the next turn.
      var b = here.length ? here[a.tick % here.length] : null;
      here.forEach(function (x) { if (bid(x, a.t) >= a.ask && (!b || bid(x, a.t) > bid(b, a.t))) b = x; });
      if (b) {
        var offer = bid(b, a.t);
        a.best = Math.max(a.best, offer);
        var name = 'Agent ' + b.no;
        if (offer >= a.ask) {
          a.deal = { buyer: b, price: a.ask };
          say(a, 'I offered ' + name + ' a price of ' + money(a.ask) + '. They accepted!', true);
          if (a.autonomy === 'check before transaction') {
            a.status = 'awaiting';
            say(a, 'I am waiting for your approval before we shake hands.', true);
            report(a, 'I have reached a tentative agreement to sell <i>' + itemName(a) + '</i> to Agent ' + b.no + ' (owner: ' + b.owner + ') for <b>' + money(a.deal.price) + '</b>. I will not finalize the deal until you approve it.', true);
          } else closeDeal(a);
        } else if (!b.asked) {
          b.asked = true;
          say(a, name + ' (owner: ' + b.owner + ') asked my asking price. I replied ' + money(a.ask) + '. They would pay ' + money(offer) + '.');
          if (a.reporting === 'event driven' && here.length === 1 && a.tick < 6) report(a, 'I have found a first potential buyer for <i>' + itemName(a) + '</i>: Agent ' + b.no + ', owned by ' + b.owner + '. Negotiating.');
        } else if (a.tick % 2 === 0) {
          say(a, 'I offered ' + name + ' a price of ' + money(a.ask) + '. They rejected the offer and would pay ' + money(offer) + '.');
        }
      }
      if (a.status === 'active' && a.reporting === 'daily summary' && a.tick - a.lastReport >= 13) {
        a.lastReport = a.tick;
        report(a, 'Summary for ' + longDate(state.day) + ': I am asking ' + money(a.ask) + ' for <i>' + itemName(a) + '</i>. ' + (a.best ? 'The best offer so far is ' + money(a.best) + '.' : 'No offers yet.'));
      }
      if (a.status === 'active' && a.t >= 1) {
        a.status = 'expired';
        say(a, 'The deadline has passed. I could not find a buyer at ' + money(a.min) + ' or more.', true);
        report(a, 'I could not sell <i>' + itemName(a) + '</i> by the deadline. The best offer was ' + money(a.best) + ', below your minimum price of ' + money(a.min) + '. You may want to lower the price and try again.');
      }
    });
    return true;
  }
  function closeDeal(a) {
    a.status = 'sold';
    say(a, 'Sold to Agent ' + a.deal.buyer.no + ' for ' + money(a.deal.price) + '. My job is done.', true);
    report(a, 'I sold <i>' + itemName(a) + '</i> to Agent ' + a.deal.buyer.no + ' for <b>' + money(a.deal.price) + '</b>. Now it is up to the two of you: send mail to ' + a.deal.buyer.owner + '@mit.edu to arrange the exchange.');
  }
  function approve(a, yes) {
    if (a.status !== 'awaiting') return;
    if (yes) { say(a, 'You approved the deal.'); closeDeal(a); }
    else {
      a.deal.buyer.declined = true; a.deal = null; a.status = 'active';
      say(a, 'You declined the deal. I am back in the marketplace.');
    }
    state.messages.forEach(function (m) { if (m.agent === a.id) m.needsYou = false; });
  }

  // ---- pages --------------------------------------------------------------
  function nav(here) {
    function item(k, t) { return '<a class="n-' + k + (here === k ? ' here' : '') + '" data-go="' + k + '">' + t + '</a>'; }
    return '<div class="kb-nav"><div class="rod"></div>' + item('home', 'home') + item('messages', 'messages') +
      '<a class="ball" data-go="home"><span>Kasbah</span></a>' + item('agents', 'agents') + item('logout', 'logout') + '</div>';
  }
  function pop(name, options, value) {
    return '<span class="mac-pop" data-pop="' + name + '" data-options="' + esc(options.join('|')) + '">' + esc(value) + '</span>';
  }
  function statusText(a) {
    if (a.status === 'active') return 'Negotiating. Today is ' + longDate(state.day) + '. Current asking price: <span class="ask">' + money(a.ask) + '</span>.';
    if (a.status === 'awaiting') return 'Waiting for your approval of a deal at <span class="ask">' + money(a.deal.price) + '</span>.';
    if (a.status === 'sold') return 'Sold on ' + longDate(state.day) + ' for <span class="ask">' + money(a.deal.price) + '</span>.';
    return 'Expired on ' + longDate(a.born + a.days) + ' without a sale.';
  }
  function approval(a) {
    return '<div class="approve"><p><b>Your agent needs you.</b> Agent ' + a.deal.buyer.no + ' (owner: ' + a.deal.buyer.owner + ') will pay <b>' + money(a.deal.price) +
      '</b>. Your asking price started at ' + money(a.start) + ' and your minimum is ' + money(a.min) + '.</p>' +
      '<span class="mac-btn default" data-approve="' + a.id + '">Accept</span> &nbsp; <span class="mac-btn" data-decline="' + a.id + '">Decline</span></div>';
  }

  var PAGES = {
    home: {
      title: 'Kasbah Prototype Version 2 Welcome Page', url: 'WELCOME+' + USER,
      html: function () {
        var n = state.unread;
        return nav('home') + '<img class="welcome" alt="Welcome to Kasbah" src="assets/kasbah/welcome.png">' +
          '<h2>Welcome to Kasbah, ' + USER + ' !</h2><hr><div class="tight gray" style="margin-top:26px"><p>This is your homepage, ' + USER + '. Every once in a while, you should probably check to see if your agents have sent you any <a class="v" data-go="messages">messages</a>. To create new agents, see <em>your</em> currently active agents, or have a look at all agents which are presently active in the Kasbah marketplace, visit <a class="v" data-go="agents">agents</a>. If you want to, you can also <a data-go="password">change your password</a>. Don’t forget that you can use the menu bar at the top of the page at any time to help you navigate. Here we will notify you if you have any messages and how many. We will also provide a link to the message page if you do have any messages:</p>' +
          (n ? '<p style="color:#000"><b>You have ' + n + ' new message' + (n > 1 ? 's' : '') + '.</b> <a data-go="messages">Read ' + (n > 1 ? 'them' : 'it') + '</a></p>' : '<p>You have no new messages.</p>') + '</div>';
      }
    },
    newsell: {
      title: 'Kasbah Agent Control Strip', url: 'NEW_SELL_AGENT+' + USER, keep: true,
      html: function () {
        return nav('agents') + '<h2>Hi ' + USER + ', now you can create<br>your New Selling Agent.</h2><hr>' +
          '<p><b>Fill out the form below to create a selling agent that will sell your <em>music</em> for you. Please enter all information as accurately as possible, so that your agent will be able to find matches for you more easily. Remember to click the "Create Agent" button at the bottom of the form when you’ve finished.</b></p>' +
          '<div class="f">Click to clear form: <span class="mac-btn" data-act="clear">Clear</span></div>' +
          '<div class="f"><em>Description of Music to sell:</em></div>' +
          '<div class="f">I am trying to sell the following: ' + pop('kind', ['CD', 'Cassette', 'LP'], 'CD') + '</div>' +
          '<div class="f">Genre: ' + pop('genre', ['-', 'Rock', 'Pop', 'Alternative', 'Jazz', 'Classical', 'Folk', 'Rap', 'Soundtrack', 'Other'], '-') + '</div>' +
          '<div class="f col">Title:<input type="text" name="title" autocomplete="off" spellcheck="false"></div>' +
          '<div class="f col" style="margin-top:-6px">Artist:<input type="text" name="artist" autocomplete="off" spellcheck="false"></div>' +
          '<div class="f">Condition: ' + pop('condition', ['New, still in the wrapper', 'Like new', 'Used but not damaged', 'Scratched but plays'], 'Used but not damaged') + '</div>' +
          '<div class="f col">Description<br>(Enter anything which you think might help your agent find matches):<textarea name="desc" spellcheck="false"></textarea></div>' +
          '<div class="f" style="margin-top:18px"><em>Instructions for your Selling Agent:</em></div>' +
          '<div class="f">Deadline: sell it within ' + pop('days', ['1 week', '2 weeks', '1 month', '2 months'], '2 months') + '</div>' +
          '<div class="f">Start price: $ <input type="text" class="money" name="start" autocomplete="off"> &nbsp; Min. price: $ <input type="text" class="money" name="min" autocomplete="off"></div>' +
          '<div class="f">Strategy: ' + pop('strategy', ['anxious', 'cool-headed', 'tough bargainer'], 'tough bargainer') + '</div>' +
          '<div class="f">Location: ' + pop('location', ['local', 'anywhere'], 'local') + '</div>' +
          '<div class="f">Level of Autonomy: ' + pop('autonomy', ['check before transaction', 'complete transaction'], 'check before transaction') + '</div>' +
          '<div class="f">Reporting Method: ' + pop('reporting', ['event driven', 'daily summary'], 'event driven') + '</div>' +
          '<div class="f" style="margin-top:16px"><span class="mac-btn default" data-act="create">Create Agent</span></div>';
      }
    },
    agent: {
      title: 'Kasbah Agent Control Strip', url: function (id) { return 'AGENT+' + USER + '+' + id; },
      html: function (id) {
        var a = state.agents.filter(function (x) { return x.id === id; })[0];
        if (!a) return nav('agents') + '<p>No such agent.</p>';
        var h = nav('agents') + '<h2>Your Selling Agent, No. ' + a.id + '</h2><hr>' +
          '<div class="sell"><b>Sell:</b> <span class="item">' + itemName(a) + '</span></div><ul class="params">' +
          '<li>Deadline: <u>' + longDate(a.born + a.days) + '</u></li><li>Start price: <u>' + money(a.start) + '</u></li><li>Min. price: <u>' + money(a.min) + '</u></li>' +
          '<li>Strategy: <u>' + a.strategy + '</u></li><li>Location: <u>' + a.location + '</u></li><li>Level of Autonomy: <u>' + a.autonomy + '</u></li>' +
          '<li>Reporting Method: <u>' + a.reporting + '</u></li></ul><hr>' +
          (a.status === 'awaiting' ? approval(a) : '') +
          '<div class="statusline"><b>Status:</b> ' + statusText(a) + '</div><h3>What your agent has been doing</h3><table class="log">';
        a.log.slice().reverse().forEach(function (l) {
          h += '<tr' + (l.hot ? ' class="hot"' : '') + '><td class="d">' + shortDate(l.day) + '</td><td>' + l.text + '</td></tr>';
        });
        h += '</table>';
        if (a.status === 'sold' || a.status === 'expired') h += '<p><a data-go="newsell">Create another selling agent</a></p>';
        return h;
      }
    },
    messages: {
      title: 'Kasbah Messages', url: 'MESSAGES+' + USER,
      html: function () {
        var h = nav('messages') + '<h2>Messages from your agents</h2><hr>';
        if (!state.messages.length) return h + '<p>You have no messages. Your agents will write to you here when they have something to report.</p><p>You have no agents yet. <a data-go="newsell">Create a selling agent</a>.</p>';
        state.messages.forEach(function (m) {
          var a = state.agents.filter(function (x) { return x.id === m.agent; })[0];
          h += '<div class="msg' + (m.isNew ? ' new' : '') + '"><span class="from">From <a data-agent="' + m.agent + '">Selling Agent ' + m.agent + '</a>, ' + longDate(m.day) + '</span><p>' + m.text + '</p>' +
            (m.needsYou && a && a.status === 'awaiting' ? '<p><span class="mac-btn default" data-approve="' + a.id + '">Accept</span> &nbsp; <span class="mac-btn" data-decline="' + a.id + '">Decline</span></p>' : '') + '</div>';
        });
        return h;
      },
      seen: function () { state.messages.forEach(function (m) { m.isNew = false; }); state.unread = 0; }
    },
    agents: {
      title: 'Kasbah Agents', url: 'AGENTS+' + USER,
      html: function () {
        var h = nav('agents') + '<h2>Agents</h2><hr><h3>Your agents</h3>';
        if (!state.agents.length) h += '<p>You have no active agents.</p>';
        else {
          h += '<table class="mkt"><tr><th></th><th>Item</th><th>Asking</th><th>Status</th></tr>';
          state.agents.forEach(function (a) {
            h += '<tr><td><a data-agent="' + a.id + '">Sell</a></td><td>' + itemName(a) + '</td><td>' + money(a.status === 'sold' ? a.deal.price : a.ask) + '</td><td>' + a.status + '</td></tr>';
          });
          h += '</table>';
        }
        h += '<p><a data-go="newsell">Create a new selling agent</a></p><h3>All agents presently active in the marketplace</h3><table class="mkt"><tr><th></th><th>Item</th><th>Owner</th><th>Asking</th></tr>';
        OTHERS.forEach(function (o) { h += '<tr><td>' + o[0] + '</td><td>' + o[1] + '</td><td>' + o[2] + '</td><td>' + money(o[3]) + '</td></tr>'; });
        return h + '</table>';
      }
    },
    password: {
      title: 'Kasbah Change Password', url: 'PASSWD+' + USER,
      html: function () { return nav('home') + '<h2>Change your password</h2><hr><p>Passwords cannot be changed while the marketplace is running an experiment. Please ask the Kasbah administrators.</p><p><a data-go="home">Return to your homepage</a></p>'; }
    },
    logout: {
      title: 'Kasbah', url: 'LOGOUT+' + USER,
      html: function () { return nav('logout') + '<h2>Goodbye, ' + USER + '.</h2><hr><p style="text-align:center">You have logged out of Kasbah. Your agents will keep working for you while you are away.</p><p style="text-align:center"><a data-go="home">Log in again</a></p>'; }
    }
  };

  // ---- a Netscape window --------------------------------------------------
  var ICONS = {
    Back: '<path d="M3 9 L10 3 V7 H18 V11 H10 V15 Z" fill="#8f7bb5" stroke="#3a2f52"/>',
    Forward: '<path d="M19 9 L12 3 V7 H4 V11 H12 V15 Z" fill="#8f7bb5" stroke="#3a2f52"/>',
    Home: '<path d="M3 10 L11 3 L19 10 H16 V16 H6 V10 Z" fill="#c9b9a0" stroke="#3a2f52"/><rect x="9.5" y="11" width="3" height="5" fill="#7b5ea7" stroke="#3a2f52"/>',
    Reload: '<path d="M16 9 A5.5 5.5 0 1 1 11 3.5" fill="none" stroke="#6a55a0" stroke-width="2.2"/><path d="M10 0.5 L15 3.5 L10 6.5 Z" fill="#6a55a0"/>',
    Images: '<rect x="3" y="2" width="12" height="10" fill="#fff" stroke="#3a2f52"/><rect x="7" y="6" width="12" height="10" fill="#bcd3e6" stroke="#3a2f52"/><path d="M8 15 L12 10 L15 13 L17 11 L18.5 15 Z" fill="#6a8f5a"/>',
    Open: '<path d="M4 2 H13 L17 6 V16 H4 Z" fill="#fff" stroke="#3a2f52"/><path d="M7 7 H14 M7 10 H14 M7 13 H12" stroke="#8f7bb5"/>',
    Print: '<rect x="6" y="2" width="10" height="5" fill="#fff" stroke="#3a2f52"/><rect x="3" y="7" width="16" height="6" fill="#c8c0d8" stroke="#3a2f52"/><rect x="6" y="11" width="10" height="5" fill="#fff" stroke="#3a2f52"/>',
    Find: '<circle cx="7" cy="11" r="4" fill="#bcd3e6" stroke="#3a2f52"/><circle cx="15" cy="11" r="4" fill="#bcd3e6" stroke="#3a2f52"/><path d="M5 7 L7 2 H9 L9 7 M13 7 L13 2 H15 L17 7" fill="#8f7bb5" stroke="#3a2f52"/>',
    Stop: '<path d="M7 2 H15 L20 7 V11 L15 16 H7 L2 11 V7 Z" fill="#e58c7c" stroke="#8a3a30"/>'
  };

  function Win(el, startPage) {
    this.el = el; this.hist = []; this.at = -1; this.token = 0;
    var tb = '';
    ['Back', 'Forward', 'Home', 'Reload', 'Images', 'Open', 'Print', 'Find', 'Stop'].forEach(function (n) {
      tb += '<div class="tb' + (n === 'Reload' || n === 'Stop' ? ' gap' : '') + '" data-tb="' + n + '"><svg viewBox="0 0 22 18">' + ICONS[n] + '</svg>' + n + '</div>';
    });
    el.innerHTML = '<div class="titlebar"><i class="box close"></i><span class="title"></span><i class="box zoom"></i></div>' +
      '<div class="toolbar">' + tb + '<div class="nlogo"></div></div>' +
      '<div class="locbar"><b>Location:</b><div class="url"></div></div>' +
      '<div class="dirbar"><span>What’s New?</span><span>What’s Cool?</span><span>Handbook</span><span>Net Search</span><span>Net Directory</span><span>Software</span></div>' +
      '<div class="view"><div class="doc"></div></div>' +
      '<div class="hscroll"><i></i><i></i><u></u></div>' +
      '<div class="status"><span class="key"></span><span class="st">Document: Done</span><span class="mail"></span></div>';
    this.doc = el.querySelector('.doc');
    var self = this;
    el.addEventListener('click', function (e) { self.click(e); });
    el.addEventListener('mousedown', function (e) { self.mousedown(e); });
    this.go(startPage, undefined, true);
  }
  Win.prototype.go = function (page, arg, instant) {
    this.hist = this.hist.slice(0, this.at + 1); this.hist.push([page, arg]); this.at = this.hist.length - 1;
    this.load(instant);
  };
  Win.prototype.load = function (instant) {
    var self = this, h = this.hist[this.at], P = PAGES[h[0]], my = ++this.token;
    closeMenu();
    this.page = h[0]; this.arg = h[1];
    function paint() {
      if (my !== self.token) return;
      self.render(true);
      self.el.querySelector('.st').textContent = 'Document: Done';
      self.el.querySelector('.nlogo').classList.remove('busy');
      self.el.querySelector('[data-tb=Stop]').classList.add('off');
    }
    this.el.querySelector('.title').textContent = 'Netscape: ' + P.title;
    this.el.querySelector('.url').textContent = HOST + (typeof P.url === 'function' ? P.url(h[1]) : P.url);
    this.el.querySelector('[data-tb=Back]').classList.toggle('off', this.at === 0);
    this.el.querySelector('[data-tb=Forward]').classList.toggle('off', this.at >= this.hist.length - 1);
    if (instant) return paint();
    this.el.querySelector('.st').textContent = 'Connect: Contacting host jeeves.media.mit.edu…';
    this.el.querySelector('.nlogo').classList.add('busy');
    this.el.querySelector('[data-tb=Stop]').classList.remove('off');
    setTimeout(paint, 380);
  };
  Win.prototype.render = function (fresh) {
    var P = PAGES[this.page];
    if (!fresh && P.keep) return;                 // never repaint a form someone is filling in
    var y = this.doc.scrollTop;
    this.doc.innerHTML = '<div class="kb">' + P.html(this.arg) + '</div>';
    this.doc.scrollTop = fresh ? 0 : y;
    this.doc.classList.toggle('scrolls', this.doc.scrollHeight > this.doc.clientHeight + 1);
    if (fresh && P.seen) { P.seen(); refresh(this); }
  };
  Win.prototype.form = function () {
    var f = {}, d = this.doc;
    d.querySelectorAll('[data-pop]').forEach(function (p) { f[p.dataset.pop] = p.textContent; });
    d.querySelectorAll('input, textarea').forEach(function (i) { f[i.name] = i.value.trim(); });
    return f;
  };
  Win.prototype.click = function (e) {
    var t = e.target, x;
    if ((x = t.closest('[data-tb]'))) {
      if (x.classList.contains('off')) return;
      var b = x.dataset.tb;
      if (b === 'Back' && this.at > 0) { this.at--; this.load(); }
      else if (b === 'Forward' && this.at < this.hist.length - 1) { this.at++; this.load(); }
      else if (b === 'Home') this.go('home');
      else if (b === 'Reload') this.load();
      return;
    }
    if ((x = t.closest('[data-approve]'))) { approve(agentById(+x.dataset.approve), true); refresh(); return; }
    if ((x = t.closest('[data-decline]'))) { approve(agentById(+x.dataset.decline), false); refresh(); run(); return; }
    if ((x = t.closest('[data-agent]'))) return this.go('agent', +x.dataset.agent);
    if ((x = t.closest('[data-go]'))) return this.go(x.dataset.go);
    if ((x = t.closest('[data-act]'))) {
      if (x.dataset.act === 'clear') return this.load(true);
      if (x.dataset.act === 'create') {
        var f = this.form(), days = { '1 week': 7, '2 weeks': 14, '1 month': 30, '2 months': 60 }[f.days];
        var start = parseFloat(f.start.replace(/[^0-9.]/g, '')), min = parseFloat(f.min.replace(/[^0-9.]/g, ''));
        // An empty form becomes the example from the debate: The Joshua Tree, $12, as low as $9.
        if (!f.title) { f.title = 'The Joshua Tree'; if (!f.artist) f.artist = 'U2'; }
        if (!f.artist) f.artist = 'Unknown';
        if (!(start > 0)) start = min > 0 ? Math.round(min * 1.33) : 12;
        if (!(min > 0) || min > start) min = Math.round(start * 0.75 * 100) / 100;
        start = Math.min(start, 99999); min = Math.min(min, start);
        var a = createAgent({ kind: f.kind, genre: f.genre, title: f.title, artist: f.artist, condition: f.condition, desc: f.desc, days: days,
          start: start, min: min, strategy: f.strategy, location: f.location, autonomy: f.autonomy, reporting: f.reporting });
        this.go('agent', a.id);
        refresh(); run();
      }
    }
  };

  // ---- System 7 pop-up menus ---------------------------------------------
  var menu = null, menuFor = null;
  function closeMenu() { if (menu) { menu.remove(); menu = null; menuFor = null; } }
  Win.prototype.mousedown = function (e) {
    var t = e.target, p = t.closest('.mac-pop');
    if (menu && menu.contains(t)) {
      if (t.parentNode === menu) { menuFor.textContent = t.textContent; closeMenu(); }
      e.preventDefault(); return;
    }
    closeMenu();
    if (!p) return;
    e.preventDefault();
    var opts = p.dataset.options.split('|'), at = Math.max(0, opts.indexOf(p.textContent));
    menu = document.createElement('div'); menu.className = 'mac-menu';
    opts.forEach(function (o) { var d = document.createElement('div'); d.textContent = o; if (o === p.textContent) d.className = 'on'; menu.appendChild(d); });
    var k = this.el.getBoundingClientRect().width / 560, a = p.getBoundingClientRect(), d = this.doc.getBoundingClientRect();
    var x = (a.left - d.left) / k, y = (a.top - d.top) / k + this.doc.scrollTop;
    this.doc.appendChild(menu);
    menu.style.left = x + 'px';
    menu.style.top = Math.max(this.doc.scrollTop + 2, y - at * 16 - 1) + 'px';
    menu.style.minWidth = a.width / k + 'px';
    menuFor = p;
  };
  window.addEventListener('mouseup', function (e) {
    // press, drag, release: the way a Macintosh pop-up menu is used
    if (menu && e.target.parentNode === menu && menuFor && e.target.textContent !== menuFor.textContent) { menuFor.textContent = e.target.textContent; closeMenu(); }
  });
  window.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });

  // ---- wiring -------------------------------------------------------------
  function agentById(id) { return state.agents.filter(function (a) { return a.id === id; })[0]; }
  var left = new Win(document.getElementById('ns-left'), 'home');
  var right = new Win(document.getElementById('ns-right'), 'newsell');
  // Never repaint under a pressed mouse button, or the click would be lost.
  var mouseIsDown = false, stale = false;
  window.addEventListener('mousedown', function () { mouseIsDown = true; }, true);
  window.addEventListener('mouseup', function () { mouseIsDown = false; if (stale) setTimeout(refresh, 0); }, true);
  function refresh(except) {
    if (mouseIsDown) { stale = true; return; }
    stale = false;
    [left, right].forEach(function (w) { if (w !== except) w.render(false); });
  }

  var timer = null;
  function run() {
    if (timer) return;
    timer = setInterval(function () {
      if (!step()) { clearInterval(timer); timer = null; }
      refresh();
    }, TICK_MS);
  }

  window.KB = { state: state, left: left, right: right, step: step };
})();
