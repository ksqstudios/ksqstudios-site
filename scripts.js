// KSQ Studios. Motion and the deck for the home page. It stores nothing
// and sends nothing.
//
// 1. The entrance: the headline's words rise in while the fan deck flicks
//    open. This is the only thing that moves on its own.
// 2. The deck follows the pointer: strips near it rise in a wave, the
//    nearest prints its five stages under the deck like a paint chip, and
//    the page takes a wash of its color. Keyboard focus does the same.
// 3. Choosing a strip unfolds it into a card for that app, in place.
// 4. The spectrum band slides sideways as the page scrolls.
// 5. Each app's five-color chip fills in when its row comes into view.
// 6. Double-click the rivet (or press it from the keyboard) and the deck
//    riffles shut and open again.
//
// With reduced motion on, everything is shown in its final state; the
// pointer, focus and card still work, without animation.

(function () {
  var still = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement;
  var stages = {};
  try {
    var blob = document.getElementById('stage-data');
    if (blob) stages = JSON.parse(blob.textContent);
  } catch (e) { stages = {}; }

  // ---------- 1. Entrance ----------

  var headline = document.getElementById('headline');
  if (headline) {
    var words = headline.textContent.trim().split(/\s+/);
    headline.setAttribute('aria-label', headline.textContent.trim());
    headline.textContent = '';
    words.forEach(function (w, n) {
      var span = document.createElement('span');
      span.className = 'w';
      span.setAttribute('aria-hidden', 'true');
      span.style.setProperty('--n', n);
      span.textContent = w;
      headline.appendChild(span);
      if (n < words.length - 1) headline.appendChild(document.createTextNode(' '));
    });
  }

  var deck = document.getElementById('deck');
  var caption = document.getElementById('deck-caption');
  var strips = deck ? Array.prototype.slice.call(deck.querySelectorAll('.strip')) : [];
  var resting = caption ? caption.innerHTML : '';

  strips.forEach(function (s, i) { s.style.setProperty('--i', i); });

  function colorsOf(s) {
    return Array.prototype.map.call(s.querySelectorAll('i'), function (i) {
      return i.style.getPropertyValue('--c').trim();
    });
  }

  function idOf(s) { return s.getAttribute('href').slice(1); }

  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      root.classList.add('is-loaded');
      if (deck) deck.classList.add('is-open');
    });
  });

  if (deck) setTimeout(function () { deck.classList.add('is-live'); }, still ? 0 : 1700);

  // ---------- 2. Following the pointer, and the printed chip ----------

  var current = null;

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text) e.textContent = text;
    return e;
  }

  function stageList(s, listClass) {
    var data = stages[idOf(s)];
    var cols = colorsOf(s);
    var ol = el('ol', listClass);
    if (!data) return ol;
    data.stages.forEach(function (st, k) {
      var li = el('li');
      var sw = el('span', 'sw');
      sw.style.setProperty('--c', cols[k]);
      li.appendChild(sw);
      li.appendChild(el('span', 'nm', st[0]));
      if (st[1]) li.appendChild(el('span', 'th', st[1]));
      ol.appendChild(li);
    });
    return ol;
  }

  function print(s) {
    if (!caption) return;
    if (!s) { caption.innerHTML = resting; return; }
    caption.innerHTML = '';
    var head = el('p', 'head');
    head.appendChild(el('b', null, s.dataset.name + '.'));
    var data = stages[idOf(s)];
    head.appendChild(document.createTextNode(' ' + (data ? data.measure : s.dataset.tag)));
    caption.appendChild(head);
    caption.appendChild(stageList(s, 'printed'));
  }

  function tint(s) {
    if (s) root.style.setProperty('--tint', colorsOf(s)[2]);
    else root.style.removeProperty('--tint');
  }

  function spreadDeg() {
    return parseFloat(getComputedStyle(deck).getPropertyValue('--spread')) || 9;
  }

  // Lift each strip by how close its angle is to `angle`, in a bell curve
  // about two strips wide. Pass null to settle the whole deck.
  function wave(angle) {
    var spread = spreadDeg();
    var nearest = null, best = Infinity;
    strips.forEach(function (s, i) {
      var a = (i - 4.5) * spread;
      var d = angle === null ? Infinity : Math.abs(angle - a);
      var lift = angle === null ? 0 : Math.exp(-Math.pow(d / (spread * 1.3), 2));
      s.style.setProperty('--lift', (-2.6 * lift).toFixed(3) + 'rem');
      if (d < best) { best = d; nearest = s; }
    });
    if (angle === null || best > spread * 1.5) nearest = null;
    if (nearest !== current) {
      strips.forEach(function (s) { s.classList.toggle('is-on', s === nearest); });
      deck.classList.toggle('is-pointing', !!nearest);
      print(nearest);
      tint(nearest);
      current = nearest;
    }
  }

  function angleFrom(e) {
    var r = deck.getBoundingClientRect();
    var rivet = deck.querySelector('.rivet').getBoundingClientRect();
    var cx = rivet.left + rivet.width / 2;
    var cy = rivet.top + rivet.height / 2;
    var dx = e.clientX - cx, dy = e.clientY - cy;
    if (dy > 10 || Math.hypot(dx, dy) > r.height * 1.05) return null;
    return Math.atan2(dx, -dy) * 180 / Math.PI;
  }

  // ---------- 3. The unfolded card ----------

  var card = document.getElementById('card');
  var opener = null;

  function fill(s) {
    var id = idOf(s);
    var row = document.getElementById(id);
    var cols = colorsOf(s);
    cols.forEach(function (c, k) { card.style.setProperty('--s' + (k + 1), c); });
    document.getElementById('card-shot').src = '/images/screens/' + id + '.jpg';
    document.getElementById('card-shot').alt = s.dataset.name + ' on iPhone';
    document.getElementById('card-name').textContent = s.dataset.name;
    document.getElementById('card-tag').textContent = s.dataset.tag;
    document.getElementById('card-desc').textContent = row ? row.querySelector('.desc').textContent : '';
    var data = stages[id];
    document.getElementById('card-measure').textContent = data ? data.measure : '';
    var old = document.getElementById('card-stages');
    var list = stageList(s, 'stages');
    list.id = 'card-stages';
    old.replaceWith(list);
    var links = document.getElementById('card-links');
    links.innerHTML = row ? row.querySelector('.links').innerHTML : '';
  }

  function openCard(s) {
    if (!card || typeof card.showModal !== 'function') return false;
    opener = s;
    fill(s);
    var show = function () { card.showModal(); };
    if (!still && document.startViewTransition) {
      s.style.viewTransitionName = 'unfold';
      var t = document.startViewTransition(function () {
        s.style.viewTransitionName = '';
        card.style.viewTransitionName = 'unfold';
        show();
      });
      t.finished.then(function () { card.style.viewTransitionName = ''; });
    } else {
      show();
    }
    return true;
  }

  function closeCard() {
    if (!card || !card.open) return;
    var done = function () { card.close(); };
    if (!still && document.startViewTransition && opener) {
      card.style.viewTransitionName = 'unfold';
      var t = document.startViewTransition(function () {
        card.style.viewTransitionName = '';
        opener.style.viewTransitionName = 'unfold';
        done();
      });
      t.finished.then(function () { if (opener) opener.style.viewTransitionName = ''; });
    } else {
      done();
    }
  }

  if (card) {
    document.getElementById('card-close').addEventListener('click', closeCard);
    // A click on the backdrop lands on the dialog element itself.
    card.addEventListener('click', function (e) { if (e.target === card) closeCard(); });
    card.addEventListener('cancel', function (e) { e.preventDefault(); closeCard(); });
    card.addEventListener('close', function () { if (opener) opener.focus(); });
  }

  // ---------- 6. Riffle ----------

  function riffle() {
    if (!deck || still) return;
    deck.classList.remove('is-live');
    wave(null);
    deck.classList.remove('is-open');
    setTimeout(function () { deck.classList.add('is-open'); }, 650);
    setTimeout(function () { deck.classList.add('is-live'); }, 650 + 1700);
  }

  if (deck) {
    var wrap = deck.parentElement;
    wrap.addEventListener('pointermove', function (e) {
      if (!deck.classList.contains('is-live')) return;
      wave(angleFrom(e));
    });
    wrap.addEventListener('pointerleave', function () { wave(null); });

    strips.forEach(function (s, i) {
      s.addEventListener('focus', function () { wave((i - 4.5) * spreadDeg()); });
      s.addEventListener('blur', function () { wave(null); });
      s.addEventListener('click', function (e) {
        if (openCard(s)) e.preventDefault();
      });
    });

    var rivet = document.getElementById('rivet');
    if (rivet) {
      rivet.addEventListener('dblclick', riffle);
      rivet.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); riffle(); }
      });
    }
  }

  // ---------- 4. Spectrum ----------

  var track = document.getElementById('spectrum');
  if (track && !still) {
    var ticking = false;
    var slide = function () {
      var half = track.scrollWidth / 2;
      var x = -((window.scrollY * 0.6) % half);
      track.style.setProperty('--x', x.toFixed(1) + 'px');
      ticking = false;
    };
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(slide); }
    }, { passive: true });
    slide();
  }

  // ---------- 5. Chips ----------

  var apps = document.querySelectorAll('.app');
  if (still || !('IntersectionObserver' in window)) {
    apps.forEach(function (a) { a.classList.add('is-seen'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-seen'); io.unobserve(e.target); }
      });
    }, { threshold: 0.5 });
    apps.forEach(function (a) { io.observe(a); });
  }
})();
