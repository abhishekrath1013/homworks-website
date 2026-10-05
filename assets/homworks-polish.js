/* Homworks polish layer: brochure button, abstract background, process carousel. */
(function () {
  'use strict';
  var doc = document;

  /* ---------- Floating brochure button (every page except the brochure page) ---------- */
  function addBrochureButton() {
    if (doc.querySelector('.hw-brochure-fab')) return;
    if (/brochure\.html$/.test(location.pathname)) return;
    var a = doc.createElement('a');
    a.className = 'hw-brochure-fab';
    a.href = 'brochure.html';
    a.setAttribute('aria-label', 'Download the Homworks brochure');
    a.innerHTML = '<svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 3v9"/><path d="M6.5 8.8 10 12.3l3.5-3.5"/><path d="M4 15.5h12"/></svg><span>Brochure</span>';
    doc.body.appendChild(a);
    if (doc.querySelector('.floating, .fab')) doc.body.classList.add('has-wa');
  }

  /* ---------- Abstract background ---------- */
  var shapes = [
    function (c) { // concentric rings
      return '<circle cx="100" cy="100" r="96" fill="none" stroke="' + c[0] + '" stroke-width="1.5"/><circle cx="100" cy="100" r="68" fill="none" stroke="' + c[1] + '" stroke-width="1.5"/><circle cx="100" cy="100" r="40" fill="' + c[2] + '"/>';
    },
    function (c) { // dot grid
      var s = '';
      for (var y = 0; y < 8; y++) for (var x = 0; x < 8; x++) s += '<circle cx="' + (14 + x * 24) + '" cy="' + (14 + y * 24) + '" r="2.6" fill="' + c[0] + '"/>';
      return s;
    },
    function (c) { // soft blob
      return '<path d="M150 30c26 18 38 52 28 82-10 31-40 56-74 58-34 2-66-20-72-52-6-32 14-62 44-80 25-15 49-22 74-8z" fill="' + c[2] + '"/>';
    },
    function (c) { // arcs
      return '<path d="M10 150a90 90 0 0 1 180 0" fill="none" stroke="' + c[0] + '" stroke-width="1.5"/><path d="M34 150a66 66 0 0 1 132 0" fill="none" stroke="' + c[1] + '" stroke-width="1.5"/><path d="M58 150a42 42 0 0 1 84 0" fill="none" stroke="' + c[0] + '" stroke-width="1.5"/>';
    },
    function (c) { // plus marks
      return '<path d="M40 20v40M20 40h40M150 110v40M130 130h40M70 150v28M56 164h28" fill="none" stroke="' + c[1] + '" stroke-width="2" stroke-linecap="round"/>';
    }
  ];
  var palettes = [
    ['#bfe3e3', '#f3c9cf', '#e3f3f3'],
    ['#9fd5d6', '#d8eeee', '#f9e6e9'],
    ['#f0b9c1', '#bfe3e3', '#eaf6f6']
  ];

  function buildAbstract() {
    var host = doc.querySelector('.hw-abstract');
    if (!host) {
      host = doc.createElement('div');
      host.className = 'hw-abstract';
      host.setAttribute('aria-hidden', 'true');
      doc.body.insertBefore(host, doc.body.firstChild);
    }
    var h = Math.max(doc.documentElement.scrollHeight, doc.body.scrollHeight);
    host.style.height = h + 'px';
    var step = Math.max(520, Math.min(760, window.innerHeight * 0.85));
    var count = Math.floor(h / step);
    if (host.dataset.n === String(count) && host.dataset.w === String(window.innerWidth)) return;
    host.dataset.n = count;
    host.dataset.w = window.innerWidth;
    var narrow = window.innerWidth < 700, html = '';
    for (var i = 0; i < count; i++) {
      var left = i % 2 === 0;
      var size = narrow ? 110 + (i % 3) * 30 : 170 + (i % 3) * 70;
      var top = 120 + i * step + (i % 3) * 60;
      var edge = narrow ? -size * 0.45 : -size * 0.25 + (i % 4) * 18;
      var kind = i % shapes.length;
      var pal = palettes[i % palettes.length];
      html += '<svg class="hw-float' + (i % 2 ? ' b' : '') + '" viewBox="0 0 200 200" width="' + size + '" height="' + size + '" style="top:' + top + 'px;' + (left ? 'left:' : 'right:') + edge + 'px">' + shapes[kind](pal) + '</svg>';
      if (!narrow && i % 2 === 1) { // a second, smaller accent on the opposite edge
        var s2 = 90 + (i % 3) * 25;
        html += '<svg class="hw-float" viewBox="0 0 200 200" width="' + s2 + '" height="' + s2 + '" style="top:' + (top + step * 0.45) + 'px;' + (left ? 'right:' : 'left:') + (3 + (i % 3) * 2) + '%">' + shapes[(kind + 2) % shapes.length](palettes[(i + 1) % palettes.length]) + '</svg>';
      }
    }
    host.innerHTML = html;
  }

  var abstractTimer;
  function queueAbstract() { clearTimeout(abstractTimer); abstractTimer = setTimeout(buildAbstract, 150); }

  /* ---------- Process carousel ---------- */
  function buildCarousel() {
    var track = doc.querySelector('.hiw-steps');
    if (!track || track.classList.contains('is-carousel')) return;
    var slides = track.querySelectorAll('.hiw-step');
    if (slides.length < 2) return;
    var head = doc.querySelector('.hiw-head');
    var nav = doc.createElement('div');
    nav.className = 'hiw-nav';
    nav.innerHTML = '<button type="button" data-prev aria-label="Previous step">&larr;</button><span class="hiw-count" aria-live="polite"></span><button type="button" data-next aria-label="Next step">&rarr;</button>';
    var cta = head.querySelector('.button');
    var group = doc.createElement('div');
    group.style.cssText = 'display:flex;align-items:center;gap:20px;flex-wrap:wrap';
    if (cta) group.appendChild(cta);
    group.appendChild(nav);
    head.appendChild(group);
    track.classList.add('is-carousel');
    doc.querySelector('.hiw').classList.add('hiw-carousel-on');
    track.setAttribute('tabindex', '0');
    track.setAttribute('aria-label', 'How Homworks works, step by step');
    var prev = nav.querySelector('[data-prev]'), next = nav.querySelector('[data-next]'), count = nav.querySelector('.hiw-count');
    function idx() { return Math.round(track.scrollLeft / track.clientWidth); }
    function update() {
      var i = idx();
      count.textContent = (i + 1) + ' / ' + slides.length;
      prev.disabled = i <= 0;
      next.disabled = i >= slides.length - 1;
    }
    function go(d) { track.scrollTo({ left: (idx() + d) * track.clientWidth, behavior: 'smooth' }); }
    prev.addEventListener('click', function () { go(-1); });
    next.addEventListener('click', function () { go(1); });
    track.addEventListener('scroll', function () { window.requestAnimationFrame(update); }, { passive: true });
    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
    });
    update();
  }

  function init() {
    addBrochureButton();
    buildCarousel();
    buildAbstract();
    window.addEventListener('resize', queueAbstract);
    window.addEventListener('load', queueAbstract);
    if ('ResizeObserver' in window) new ResizeObserver(queueAbstract).observe(doc.body);
    setTimeout(queueAbstract, 1200);
    setTimeout(queueAbstract, 3500);
  }
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', init); else init();
})();
