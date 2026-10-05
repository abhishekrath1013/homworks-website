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
  /* Looping line-art interior pieces: sofa, pendant lamp, TV, bookshelf, plant, wardrobe, armchair, bed, kitchen. */
  var T = '#2aaeb3', D = '#16555a', P = '#E3929E';
  function st(c, w, o) { return 'fill="none" stroke="' + c + '" stroke-width="' + (w || 2) + '" stroke-linecap="round" stroke-linejoin="round"' + (o ? ' opacity="' + o + '"' : ''); }
  var shapes = [
    function () { // sofa, cushions bounce
      return '<g ' + st(D, 2, .7) + '><rect x="40" y="74" width="120" height="48" rx="16" fill="' + P + '" fill-opacity=".18"/><rect x="28" y="106" width="144" height="36" rx="12" fill="' + P + '" fill-opacity=".12"/>' +
        '<rect x="20" y="90" width="24" height="54" rx="11"/><rect x="156" y="90" width="24" height="54" rx="11"/><path d="M44 144v14M156 144v14"/></g>' +
        '<g class="hw-bob"><rect x="56" y="86" width="40" height="26" rx="9" fill="' + T + '" fill-opacity=".3" ' + st(T, 1.8) + '/></g>' +
        '<g class="hw-bob d2"><rect x="104" y="86" width="40" height="26" rx="9" fill="' + P + '" fill-opacity=".35" ' + st(P, 1.8) + '/></g>';
    },
    function () { // pendant lamp, swinging with a pulsing glow
      return '<g class="hw-swing"><path d="M100 0v50" ' + st(D, 2, .7) + '/><path d="M72 100 84 50h32l12 50Z" fill="' + P + '" fill-opacity=".3" ' + st(D, 2, .75) + '/><path d="M88 100q12 10 24 0" ' + st(T, 2) + '/>' +
        '<path class="hw-glow" d="M80 108 44 180h112l-36-72Z" fill="' + T + '" fill-opacity=".14"/></g>';
    },
    function () { // TV on a unit with an equaliser on screen
      var bars = '';
      for (var i = 0; i < 6; i++) bars += '<rect x="' + (50 + i * 17) + '" y="82" width="9" height="40" rx="3" fill="' + (i % 2 ? P : T) + '" fill-opacity=".6"/>';
      return '<g ' + st(D, 2, .7) + '><rect x="24" y="44" width="152" height="92" rx="9"/><rect x="33" y="53" width="134" height="74" rx="5" fill="' + T + '" fill-opacity=".1"/><path d="M100 136v16M68 156h64"/><path d="M14 176h172"/></g>' +
        '<g class="hw-eq">' + bars + '</g>';
    },
    function () { // bookshelf, one book pops out, plant sways
      var rows = [[40, 44], [88, 44], [134, 44]], bk = '', x, i;
      var ws = [10, 8, 12, 9, 11, 8, 10, 12], hs = [30, 38, 28, 34, 26, 36, 31, 28];
      for (i = 0; i < 8; i++) { x = 46 + ws.slice(0, i).reduce(function (a, b) { return a + b + 3; }, 0); if (i === 3) { continue; } bk += '<rect x="' + x + '" y="' + (78 - hs[i]) + '" width="' + ws[i] + '" height="' + hs[i] + '" rx="2" fill="' + (i % 3 === 0 ? P : T) + '" fill-opacity=".38" ' + st(D, 1.4, .6) + '/>'; }
      var px = 46 + [10, 8, 12].reduce(function (a, b) { return a + b + 3; }, 0);
      return '<g ' + st(D, 2, .7) + '><rect x="34" y="28" width="132" height="146" rx="7"/><path d="M34 80h132M34 126h132"/></g>' + bk +
        '<g class="hw-pop"><rect x="' + px + '" y="46" width="9" height="32" rx="2" fill="' + P + '" fill-opacity=".5" ' + st(D, 1.4, .6) + '/></g>' +
        '<g ' + st(D, 1.6, .6) + '><rect x="62" y="104" width="22" height="22" rx="3" fill="' + T + '" fill-opacity=".2"/><rect x="104" y="110" width="40" height="16" rx="3" fill="' + P + '" fill-opacity=".25"/></g>' +
        '<g class="hw-sway"><path d="M73 104c-8-10-8-20-2-26 6 8 8 18 2 26ZM73 104c8-10 10-18 6-24-8 6-9 16-6 24Z" fill="' + T + '" fill-opacity=".45" ' + st(T, 1.4) + '/></g>';
    },
    function () { // potted plant, leaves sway
      return '<g ' + st(D, 2, .7) + '><path d="M70 150h60l-7 30H77Z" fill="' + P + '" fill-opacity=".25"/><path d="M66 150h68"/></g>' +
        '<g class="hw-sway"><path d="M100 150C98 112 70 100 60 66c30 6 42 40 40 84Z" fill="' + T + '" fill-opacity=".32" ' + st(T, 1.8) + '/><path d="M100 150c2-50 30-58 42-96-32 10-46 50-42 96Z" fill="' + P + '" fill-opacity=".3" ' + st(P, 1.8) + '/><path d="M100 150V82" ' + st(D, 1.6, .6) + '/><path d="M100 150c-10-20-30-26-44-24 8 14 24 24 44 24Z" fill="' + T + '" fill-opacity=".25" ' + st(T, 1.6) + '/></g>';
    },
    function () { // wardrobe, doors open and close
      return '<g ' + st(D, 2, .7) + '><rect x="40" y="24" width="120" height="146" rx="6"/><path d="M52 170v10M148 170v10"/></g>' +
        '<g ' + st(D, 1.6, .5) + '><path d="M100 40v118"/><path d="M64 58h72" /><path d="M72 58l6 24h-12ZM100 58l6 24H94ZM128 58l6 24h-12Z" fill="' + P + '" fill-opacity=".3"/></g>' +
        '<g class="hw-door-l"><rect x="44" y="28" width="56" height="138" rx="3" fill="' + T + '" fill-opacity=".22" ' + st(D, 1.8, .7) + '/><path d="M92 90v20" ' + st(D, 2.4, .8) + '/></g>' +
        '<g class="hw-door-r"><rect x="100" y="28" width="56" height="138" rx="3" fill="' + P + '" fill-opacity=".22" ' + st(D, 1.8, .7) + '/><path d="M108 90v20" ' + st(D, 2.4, .8) + '/></g>';
    },
    function () { // armchair with a bobbing cushion
      return '<g ' + st(D, 2, .7) + '><path d="M54 76a26 26 0 0 1 26-26h40a26 26 0 0 1 26 26v48H54Z" fill="' + T + '" fill-opacity=".14"/><rect x="38" y="92" width="24" height="52" rx="11"/><rect x="138" y="92" width="24" height="52" rx="11"/><rect x="52" y="118" width="96" height="28" rx="10" fill="' + P + '" fill-opacity=".14"/><path d="M60 146l-6 22M140 146l6 22"/></g>' +
        '<g class="hw-bob"><rect x="68" y="96" width="64" height="24" rx="9" fill="' + P + '" fill-opacity=".38" ' + st(P, 1.8) + '/></g>';
    },
    function () { // bed with pillows and rising z's
      return '<g ' + st(D, 2, .7) + '><rect x="26" y="70" width="14" height="92" rx="5"/><rect x="40" y="108" width="136" height="32" rx="8" fill="' + T + '" fill-opacity=".14"/><path d="M40 140v18M176 140v18"/><path d="M40 108q50-12 136 2" fill="' + P + '" fill-opacity=".3"/></g>' +
        '<g class="hw-bob"><rect x="48" y="90" width="42" height="20" rx="9" fill="' + P + '" fill-opacity=".38" ' + st(P, 1.8) + '/></g>' +
        '<g class="hw-rise" ' + st(T, 2.2) + '><path d="M120 70h14l-14 16h14"/></g><g class="hw-rise d2" ' + st(P, 2) + '><path d="M146 46h10l-10 12h10"/></g>';
    },
    function () { // cooking pot with steam
      return '<g ' + st(D, 2, .7) + '><rect x="30" y="140" width="140" height="28" rx="6"/><path d="M60 140v-8M140 140v-8"/><path d="M56 132h88" /><path d="M64 132V92h72v40" fill="' + T + '" fill-opacity=".16"/><path d="M58 92h84"/><path d="M92 82h16"/><path d="M64 108H48M136 108h16"/></g>' +
        '<g class="hw-steam" ' + st(T, 2.2) + '><path d="M84 72c-6-8 6-14 0-24"/></g><g class="hw-steam d2" ' + st(P, 2.2) + '><path d="M100 70c-6-8 6-14 0-26"/></g><g class="hw-steam d3" ' + st(T, 2.2) + '><path d="M116 72c-6-8 6-14 0-24"/></g>';
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
      var size = narrow ? 120 + (i % 3) * 30 : 190 + (i % 3) * 60;
      var top = 120 + i * step + (i % 3) * 60;
      var edge = narrow ? -size * 0.55 : -size * 0.74;
      var kind = i % shapes.length;
      html += '<svg class="hw-float' + (i % 2 ? ' b' : '') + '" viewBox="0 0 200 200" width="' + size + '" height="' + size + '" style="top:' + top + 'px;' + (left ? 'left:' : 'right:') + edge + 'px">' + shapes[kind]('a' + i) + '</svg>';
      if (!narrow && i % 2 === 1) { // a second, smaller accent on the opposite edge
        var s2 = 120 + (i % 3) * 25;
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
