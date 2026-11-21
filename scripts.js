// KSQ Studios. Motion for the home page. It stores nothing and sends
// nothing.
//
// 1. The entrance: the headline's words rise in while the fan deck flicks
//    open. This is the only thing that moves on its own.
// 2. The deck follows the pointer: strips near it rise in a wave, the
//    nearest is named underneath, and the page takes a wash of its color.
//    Keyboard focus does the same for the focused strip.
// 3. Choosing a strip jumps to that app and draws its colors across the
//    top of its row.
// 4. The spectrum band slides sideways as the page scrolls.
// 5. Each app's five-color chip fills in when its row comes into view.
//
// With reduced motion on, everything is shown in its final state and only
// the pointer and focus responses remain.

(function () {
  var still = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement;

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

  // Two frames so the closed state paints before anything opens.
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      root.classList.add('is-loaded');
      if (deck) deck.classList.add('is-open');
    });
  });

  // The deck answers the pointer only after it has finished opening, so the
  // entrance is never interrupted halfway.
  if (deck) {
    setTimeout(function () { deck.classList.add('is-live'); }, still ? 0 : 1700);
  }

  // ---------- 2. Following the pointer ----------

  var current = null;

  function name(s) {
    if (!caption) return;
    if (!s) { caption.innerHTML = resting; return; }
    caption.innerHTML = '';
    var b = document.createElement('b');
    b.textContent = s.dataset.name + '.';
    caption.appendChild(b);
    caption.appendChild(document.createTextNode(' ' + s.dataset.tag));
  }

  function tint(s) {
    var c = s ? s.querySelectorAll('i')[2].style.getPropertyValue('--c') : '#ffffff';
    root.style.setProperty('--tint', c);
  }

  // Lift each strip by how close its angle is to `angle`, in a bell curve
  // about two strips wide. Pass null to settle the whole deck.
  function wave(angle) {
    var spread = parseFloat(getComputedStyle(deck).getPropertyValue('--spread')) || 9;
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
      name(nearest);
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
    // Ignore the pointer below the rivet or well outside the fan.
    if (dy > 10 || Math.hypot(dx, dy) > r.height * 1.05) return null;
    return Math.atan2(dx, -dy) * 180 / Math.PI;
  }

  if (deck) {
    var wrap = deck.parentElement;
    wrap.addEventListener('pointermove', function (e) {
      if (!deck.classList.contains('is-live')) return;
      wave(angleFrom(e));
    });
    wrap.addEventListener('pointerleave', function () { wave(null); });

    strips.forEach(function (s, i) {
      s.addEventListener('focus', function () {
        var spread = parseFloat(getComputedStyle(deck).getPropertyValue('--spread')) || 9;
        wave((i - 4.5) * spread);
      });
      s.addEventListener('blur', function () { wave(null); });

      // ---------- 3. Jumping to an app ----------
      s.addEventListener('click', function () {
        var target = document.querySelector(s.getAttribute('href'));
        if (!target) return;
        target.classList.remove('is-arrived');
        setTimeout(function () {
          void target.offsetWidth;
          target.classList.add('is-arrived');
          target.classList.add('is-seen');
        }, still ? 0 : 650);
      });
    });
  }

  // ---------- 4. Spectrum ----------

  var track = document.getElementById('spectrum');
  if (track && !still) {
    var ticking = false;
    function slide() {
      var half = track.scrollWidth / 2;
      var x = -((window.scrollY * 0.6) % half);
      track.style.setProperty('--x', x.toFixed(1) + 'px');
      ticking = false;
    }
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
