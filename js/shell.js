/* The Original Agents — shared page shell.
   Scales the 1920x1080 stage to the window, wires the navigation between the
   prototypes, and sends an unattended screen back to the start. */
(function () {
  var DECK = ['homr.html', 'remembrance.html', 'yenta.html', 'kasbah.html'];
  var IDLE_MS = 150000;      // back to the start after 2.5 minutes untouched
  var WARN_MS = 15000;       // ...with a 15 second notice

  var params = new URLSearchParams(location.search);
  var THUMB = params.has('thumb');
  if (THUMB) document.documentElement.classList.add('thumb');

  var stage;

  function fit() {
    if (!stage) return;
    var s = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
    var x = Math.round((window.innerWidth - 1920 * s) / 2);
    var y = Math.round((window.innerHeight - 1080 * s) / 2);
    stage.style.transform = 'translate(' + x + 'px,' + y + 'px) scale(' + s + ')';
    stage.style.visibility = 'visible';
  }

  function page() {
    var p = location.pathname.split('/').pop();
    return p || 'index.html';
  }

  function buildDeckNav() {
    var here = DECK.indexOf(page());
    if (here < 0 || THUMB) return;

    var back = document.createElement('a');
    back.className = 'deck-back';
    back.href = 'index.html';
    back.innerHTML = '<span class="arrow">&larr;</span>The Original Agents';
    stage.appendChild(back);

    var count = document.createElement('div');
    count.className = 'deck-count';
    var prev = DECK[(here + DECK.length - 1) % DECK.length];
    var next = DECK[(here + 1) % DECK.length];
    count.innerHTML =
      '<a class="again" href="' + page() + '">Start over</a>' +
      '<a href="' + prev + '">&larr;</a>' +
      '<span><span class="n">' + (here + 1) + '</span> / ' + DECK.length + '</span>' +
      '<a href="' + next + '">&rarr;</a>';
    stage.appendChild(count);
  }

  function idleReset() {
    if (THUMB || params.has('noidle')) return;
    if (params.has('idle')) IDLE_MS = Math.max(20, +params.get('idle')) * 1000;   // ?idle=30 for testing
    var home = page() === 'index.html';
    var veil = document.createElement('div');
    veil.id = 'idle-veil';
    veil.innerHTML = '<span>Returning to the start in a moment. Move the mouse to stay.</span>';
    stage.appendChild(veil);

    var warnT, goT;
    function arm() {
      clearTimeout(warnT); clearTimeout(goT);
      veil.classList.remove('on');
      if (home) {
        // The start page just refreshes its live previews now and then.
        goT = setTimeout(function () { location.reload(); }, 15 * 60000);
        return;
      }
      warnT = setTimeout(function () { veil.classList.add('on'); }, IDLE_MS - WARN_MS);
      goT = setTimeout(function () { location.href = 'index.html'; }, IDLE_MS);
    }
    ['mousemove', 'mousedown', 'keydown', 'wheel', 'touchstart'].forEach(function (ev) {
      window.addEventListener(ev, arm, { passive: true, capture: true });
    });
    arm();
  }

  document.addEventListener('DOMContentLoaded', function () {
    stage = document.getElementById('stage');
    buildDeckNav();
    idleReset();
    fit();
  });
  window.addEventListener('resize', fit);
  window.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  // A kiosk should never get stuck on a dragged image or a stray text selection.
  window.addEventListener('dragstart', function (e) { e.preventDefault(); });

  window.Shell = {
    thumb: THUMB,
    /* Where `el` sits inside `frame`, in the frame's own CSS pixels, whatever
       zoom and scaling lie in between. `frameWidth` is the frame's CSS width. */
    place: function (el, frame, frameWidth) {
      var a = el.getBoundingClientRect(), b = frame.getBoundingClientRect(), k = b.width / frameWidth;
      return { x: (a.left - b.left) / k, y: (a.top - b.top) / k, w: a.width / k, h: a.height / k, k: k };
    },
    /* Deterministic pseudo-random numbers so every visitor meets the same world. */
    rng: function (seed) {
      var s = seed >>> 0;
      return function () {
        s = (s + 0x6D2B79F5) >>> 0;
        var t = Math.imul(s ^ (s >>> 15), 1 | s);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    }
  };
})();
