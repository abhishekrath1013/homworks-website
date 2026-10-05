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
  /* Looping, animated abstract shapes (no plain circles). `u` is a unique id for gradients. */
  var T = '#2aaeb3', D = '#16555a', P = '#E3929E';
  var shapes = [
    function (u) { // orbit system: tilted ellipses with travelling light
      var e1 = 'M20 100a80 32 0 1 0 160 0a80 32 0 1 0-160 0', e2 = 'M30 100a70 28 0 1 0 140 0a70 28 0 1 0-140 0';
      return '<defs><linearGradient id="g' + u + '" x1="0" x2="1"><stop offset="0" stop-color="' + T + '"/><stop offset="1" stop-color="' + P + '"/></linearGradient></defs>' +
        '<g class="hw-spin" style="animation-duration:26s"><ellipse cx="100" cy="100" rx="80" ry="32" fill="none" stroke="url(#g' + u + ')" stroke-width="1.6" opacity=".7"/>' +
        '<circle r="5" fill="' + P + '"><animateMotion dur="7s" repeatCount="indefinite" path="' + e1 + '"/></circle></g>' +
        '<g class="hw-spin rev" style="animation-duration:34s"><ellipse cx="100" cy="100" rx="70" ry="28" transform="rotate(60 100 100)" fill="none" stroke="' + T + '" stroke-width="1.4" opacity=".6"/>' +
        '<g transform="rotate(60 100 100)"><circle r="4" fill="' + T + '"><animateMotion dur="9s" repeatCount="indefinite" path="' + e2 + '"/></circle></g></g>' +
        '<polygon points="100,84 114,100 100,116 86,100" fill="url(#g' + u + ')" class="hw-pulse"/>';
    },
    function (u) { // Homworks-style stacked blocks, turning and breathing
      return '<defs><linearGradient id="g' + u + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + P + '"/><stop offset="1" stop-color="' + T + '"/></linearGradient></defs>' +
        '<g class="hw-spin" style="animation-duration:30s"><rect x="58" y="58" width="84" height="84" rx="14" fill="none" stroke="' + D + '" stroke-width="1.4" opacity=".4"/></g>' +
        '<g class="hw-spin rev" style="animation-duration:22s"><rect x="58" y="58" width="84" height="84" rx="14" fill="none" stroke="url(#g' + u + ')" stroke-width="2" opacity=".75"/></g>' +
        '<g class="hw-pulse"><rect x="82" y="46" width="36" height="56" rx="8" fill="' + P + '" opacity=".55"/><rect x="82" y="98" width="36" height="56" rx="8" fill="' + T + '" opacity=".55"/></g>';
    },
    function (u) { // flowing wave lines that draw themselves in a loop
      var s = '<defs><linearGradient id="g' + u + '" x1="0" x2="1"><stop offset="0" stop-color="' + T + '" stop-opacity="0"/><stop offset=".5" stop-color="' + T + '"/><stop offset="1" stop-color="' + P + '" stop-opacity="0"/></linearGradient></defs>';
      for (var i = 0; i < 6; i++) {
        var y = 40 + i * 24;
        s += '<path class="hw-flow" style="animation-delay:' + (-i * 1.1) + 's;animation-duration:' + (7 + i) + 's" d="M0 ' + y + 'C40 ' + (y - 26) + ' 70 ' + (y + 26) + ' 100 ' + y + 'S160 ' + (y - 26) + ' 200 ' + y + '" fill="none" stroke="url(#g' + u + ')" stroke-width="2" stroke-linecap="round" pathLength="100"/>';
      }
      return s;
    },
    function (u) { // morphing gradient blob
      var d1 = 'M150 34c26 18 38 52 28 82-10 31-40 56-74 58-34 2-66-20-72-52-6-32 14-62 44-80 25-15 49-22 74-8z';
      var d2 = 'M160 52c20 24 22 58 6 84-16 27-48 42-78 36-31-6-56-32-56-62 0-32 24-60 54-72 26-10 54-12 74 14z';
      var d3 = 'M146 40c30 12 44 46 34 78-9 30-36 52-68 54-32 2-64-18-72-50-8-32 8-64 38-80 28-14 38-14 68-2z';
      return '<defs><radialGradient id="g' + u + '" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="' + P + '" stop-opacity=".55"/><stop offset=".6" stop-color="' + T + '" stop-opacity=".28"/><stop offset="1" stop-color="' + T + '" stop-opacity=".05"/></radialGradient></defs>' +
        '<path fill="url(#g' + u + ')" d="' + d1 + '"><animate attributeName="d" dur="14s" repeatCount="indefinite" values="' + d1 + ';' + d2 + ';' + d3 + ';' + d1 + '" calcMode="spline" keySplines=".45 0 .55 1;.45 0 .55 1;.45 0 .55 1"/></path>' +
        '<g class="hw-spin" style="animation-duration:40s"><path d="M30 120Q100 20 170 120" fill="none" stroke="' + D + '" stroke-width="1.2" opacity=".35" stroke-dasharray="3 7"/></g>';
    },
    function (u) { // counter-rotating hexagon and triangle
      var hex = '100,22 168,61 168,139 100,178 32,139 32,61', tri = '100,56 146,136 54,136';
      return '<defs><linearGradient id="g' + u + '" x1="0" x2="1" y2="1"><stop offset="0" stop-color="' + T + '"/><stop offset="1" stop-color="' + P + '"/></linearGradient></defs>' +
        '<g class="hw-spin" style="animation-duration:36s"><polygon points="' + hex + '" fill="none" stroke="url(#g' + u + ')" stroke-width="1.6" stroke-dasharray="6 8" opacity=".7"/></g>' +
        '<g class="hw-spin rev" style="animation-duration:18s"><polygon points="' + tri + '" fill="none" stroke="' + D + '" stroke-width="1.6" opacity=".5"/></g>' +
        '<g class="hw-spin" style="animation-duration:12s"><path d="M100 70v60M70 100h60" stroke="' + P + '" stroke-width="2" stroke-linecap="round" opacity=".8"/></g>';
    }
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
      var edge = narrow ? -size * 0.55 : -size * 0.62;
      var kind = i % shapes.length;
      html += '<svg class="hw-float' + (i % 2 ? ' b' : '') + '" viewBox="0 0 200 200" width="' + size + '" height="' + size + '" style="top:' + top + 'px;' + (left ? 'left:' : 'right:') + edge + 'px">' + shapes[kind]('a' + i) + '</svg>';
      if (!narrow && i % 2 === 1) { // a second, smaller accent on the opposite edge
        var s2 = 90 + (i % 3) * 25;
        html += '<svg class="hw-float" viewBox="0 0 200 200" width="' + s2 + '" height="' + s2 + '" style="top:' + (top + step * 0.45) + 'px;' + (left ? "right:" : "left:") + (1 + (i % 3)) + '%">' + shapes[(kind + 2) % shapes.length]('b' + i) + '</svg>';
      }
    }
    host.innerHTML = html;
    if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) {
      host.querySelectorAll('svg').forEach(function (v) { if (v.pauseAnimations) v.pauseAnimations(); });
    }
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
    nav.innerHTML = '<button type="button" data-prev aria-label="Previous step"><svg class=\'hw-i\' viewBox=\'0 0 24 24\' aria-hidden=\'true\' focusable=\'false\'><path d=\'M19 12H5M11 6l-6 6 6 6\'/></svg></button><span class="hiw-count" aria-live="polite"></span><button type="button" data-next aria-label="Next step"><svg class=\'hw-i\' viewBox=\'0 0 24 24\' aria-hidden=\'true\' focusable=\'false\'><path d=\'M5 12h14M13 6l6 6-6 6\'/></svg></button>';
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
