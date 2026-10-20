// KSQ Studios. Two small things, neither of which stores or sends anything.
//
// 1. The wall: the ten apps' arcs rise when the page opens, and each
//    one's reading drifts to a new place now and then, as if live.
//    Pointing at an arc names its app.
// 2. Each app entry draws its arc in when it scrolls into view.

(function () {
  var still = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- 1. The wall ----------

  var wall = document.getElementById('wall');
  if (wall) {
    var pipes = Array.prototype.slice.call(wall.querySelectorAll('.pipe'));
    var caption = document.getElementById('wall-caption');
    var resting = caption.innerHTML;

    // Where each arc reads to begin with, top 0 to bottom 1.
    var start = [0.62, 0.3, 0.74, 0.55, 0.85, 0.2, 0.4, 0.66, 0.48, 0.36];
    pipes.forEach(function (p, i) {
      p.style.setProperty('--at', start[i]);
      p.style.setProperty('--delay', (i * 0.07) + 's');
    });

    requestAnimationFrame(function () { wall.classList.add('is-up'); });

    if (!still) {
      setInterval(function () {
        var p = pipes[Math.floor(Math.random() * pipes.length)];
        var now = parseFloat(p.style.getPropertyValue('--at'));
        var next = Math.min(0.9, Math.max(0.1, now + (Math.random() - 0.5) * 0.5));
        p.style.setProperty('--at', next.toFixed(3));
      }, 900);
    }

    function point(p) {
      pipes.forEach(function (o) { o.classList.toggle('is-on', o === p); });
      wall.classList.toggle('is-pointing', !!p);
      if (p) {
        caption.innerHTML = '';
        var b = document.createElement('b');
        b.textContent = p.dataset.name + '.';
        var s = document.createElement('span');
        s.textContent = ' ' + p.dataset.tag;
        caption.appendChild(b);
        caption.appendChild(s);
      } else {
        caption.innerHTML = resting;
      }
    }

    pipes.forEach(function (p) {
      p.addEventListener('mouseenter', function () { point(p); });
      p.addEventListener('focus', function () { point(p); });
      p.addEventListener('mouseleave', function () { point(null); });
      p.addEventListener('blur', function () { point(null); });
    });
  }

  // ---------- 2. The entries ----------

  var apps = document.querySelectorAll('.app');
  if (still || !('IntersectionObserver' in window)) {
    apps.forEach(function (a) { a.classList.add('is-seen'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-seen'); io.unobserve(e.target); }
      });
    }, { threshold: 0.4 });
    apps.forEach(function (a) { io.observe(a); });
  }
})();
