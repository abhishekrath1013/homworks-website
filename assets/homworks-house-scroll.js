/* ===== HomworksHouseScroll =====
   Reusable pinned scroll-scrub frame-sequence journey.

   Markup contract (drop this anywhere, any page):
   <section class="hw-house-scroll" data-hw-house-root aria-label="...">
     <div class="hw-house-pin">
       <div class="hw-house-stage" data-hw-house-stage
            data-hw-frame-sets='[{"base":"path/to/seq1/","count":73}, ...]'>
         <canvas class="hw-house-canvas" data-hw-house-canvas aria-hidden="true"></canvas>
       </div>
     </div>
   </section>

   The component never assumes filenames — it only reads whatever frame sets
   are declared in data-hw-frame-sets on [data-hw-house-stage]. Each set is
   {base, count}: frames are loaded as base + i + '.jpg' for i in [0, count).
   Optionally set data-hw-bounds="0,0.35,0.5,0.65,0.8,1" on the stage to
   control how much of the total scroll each set occupies (N sets need N+1
   numbers, 0 to 1). Sequences are expected to cut seamlessly at their
   boundaries (last frame of set N ~= first frame of set N+1), so frames are
   drawn as a hard cut — no crossfade — which is what keeps scrubbing cheap
   and smooth.

   Optional side copy (independent of frame-set count — e.g. one set can span
   two room checkpoints): give the root a data-hw-room-bounds="0,0.15,0.35,..."
   list, then add matching [data-hw-titles] and [data-hw-quotes] wrappers,
   each holding one [data-room-index="N"] element per room. They crossfade
   via the .active class as scroll crosses each room boundary — no JS-side
   text content is ever hardcoded here.
*/
(function () {
  'use strict';

  function makeSequence(base, count) {
    return { base: base, count: count, images: new Array(count), requested: new Array(count) };
  }

  function loadFrame(seq, i) {
    if (i < 0 || i >= seq.count || seq.requested[i]) return;
    seq.requested[i] = true;
    var img = new Image();
    img.decoding = 'async';
    function mark() { seq.images[i] = img; }
    img.onload = function () {
      if (typeof img.decode === 'function') {
        img.decode().then(mark).catch(mark);
      } else {
        mark();
      }
    };
    img.onerror = function () { seq.requested[i] = false; };
    img.src = seq.base + i + '.jpg';
  }

  function preloadSequence(seq) {
    for (var i = 0; i < seq.count; i++) loadFrame(seq, i);
  }

  function initHouseScroll(root) {
    if (!root || root._hwHouseScrollInited) return;
    root._hwHouseScrollInited = true;

    var pinEl = root.querySelector('.hw-house-pin');
    var stage = root.querySelector('[data-hw-house-stage]');
    var canvas = root.querySelector('[data-hw-house-canvas]');
    if (!pinEl || !stage || !canvas) return;

    var setsAttr = stage.getAttribute('data-hw-frame-sets');
    var setDefs;
    try { setDefs = setsAttr ? JSON.parse(setsAttr) : []; } catch (e) { setDefs = []; }
    if (!setDefs.length) return;

    var sequences = setDefs.map(function (d) { return makeSequence(d.base, d.count); });

    var titleBlocks = Array.prototype.slice.call(root.querySelectorAll('[data-hw-titles] [data-room-index]'));
    var quoteBlocks = Array.prototype.slice.call(root.querySelectorAll('[data-hw-quotes] [data-room-index]'));

    var reduceMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    var hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';

    var ctx = canvas.getContext('2d');
    var cssW = 0, cssH = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resizeCanvas() {
      var rect = stage.getBoundingClientRect();
      cssW = rect.width;
      cssH = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(cssW * dpr));
      canvas.height = Math.max(1, Math.round(cssH * dpr));
    }
    resizeCanvas();

    var lastSeg = -1, lastFrame = -1;

    function drawImageContain(img) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      var iw = img.naturalWidth, ih = img.naturalHeight;
      if (!iw || !ih) return;
      var scale = Math.min(canvas.width / iw, canvas.height / ih);
      var dw = iw * scale, dh = ih * scale;
      var dx = (canvas.width - dw) / 2, dy = (canvas.height - dh) / 2;
      ctx.drawImage(img, dx, dy, dw, dh);
    }

    function redrawCurrent() {
      if (lastSeg < 0 || lastSeg >= sequences.length) return;
      var img = sequences[lastSeg].images[lastFrame];
      if (img) drawImageContain(img);
    }

    if (reduceMotion || !hasGsap) {
      root.classList.add('hw-static');
      loadFrame(sequences[0], 0);
      var poll = setInterval(function () {
        if (sequences[0].images[0]) {
          lastSeg = 0; lastFrame = 0;
          drawImageContain(sequences[0].images[0]);
          clearInterval(poll);
        }
      }, 50);
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    var mq = window.matchMedia('(max-width: 800px)');
    var isMobile = mq.matches;
    var scrollDistance = isMobile ? 5000 : 6200;

    var boundsAttr = stage.getAttribute('data-hw-bounds');
    var bounds;
    if (boundsAttr) {
      bounds = boundsAttr.split(',').map(Number);
    } else if (sequences.length === 5) {
      bounds = [0, 0.35, 0.5, 0.65, 0.8, 1];
    } else {
      bounds = sequences.map(function (_, i) { return i / sequences.length; });
      bounds.push(1);
    }

    var loadTriggered = sequences.map(function () { return false; });
    function ensureLoaded(i) {
      if (i < 0 || i >= sequences.length || loadTriggered[i]) return;
      loadTriggered[i] = true;
      preloadSequence(sequences[i]);
    }
    ensureLoaded(0);

    var roomBoundsAttr = root.getAttribute('data-hw-room-bounds');
    var roomBounds = roomBoundsAttr ? roomBoundsAttr.split(',').map(Number) : null;
    var roomCount = Math.max(titleBlocks.length, quoteBlocks.length);
    if (!roomBounds && roomCount) {
      roomBounds = titleBlocks.map(function (_, i) { return i / roomCount; });
      roomBounds.push(1);
    }
    var activeRoom = -1;
    function setActiveRoom(p) {
      if (!roomBounds || !roomCount) return;
      var idx = roomCount - 1;
      for (var r = 0; r < roomCount; r++) {
        if (p < roomBounds[r + 1] || r === roomCount - 1) { idx = r; break; }
      }
      if (idx === activeRoom) return;
      activeRoom = idx;
      titleBlocks.forEach(function (el) {
        el.classList.toggle('active', Number(el.getAttribute('data-room-index')) === idx);
      });
      quoteBlocks.forEach(function (el) {
        el.classList.toggle('active', Number(el.getAttribute('data-room-index')) === idx);
      });
    }

    function segmentForProgress(p) {
      for (var i = 0; i < sequences.length; i++) {
        if (p < bounds[i + 1] || i === sequences.length - 1) return i;
      }
      return sequences.length - 1;
    }

    function applyProgress(p) {
      setActiveRoom(p);

      var seg = segmentForProgress(p);
      ensureLoaded(seg);
      if (seg + 1 < sequences.length) ensureLoaded(seg + 1);

      var segStart = bounds[seg], segEnd = bounds[seg + 1];
      var span = segEnd - segStart;
      var local = span > 0 ? (p - segStart) / span : 0;
      local = local < 0 ? 0 : local > 1 ? 1 : local;

      var seq = sequences[seg];
      var frame = Math.round(local * (seq.count - 1));
      if (frame === lastFrame && seg === lastSeg) return;

      var img = seq.images[frame];
      if (!img) {
        // Not decoded yet — hold whatever is already on the canvas rather
        // than risk a blank frame; the canvas naturally keeps its last
        // drawn pixels, so simply skipping this tick is enough.
        return;
      }
      lastSeg = seg;
      lastFrame = frame;
      drawImageContain(img);
    }

    var proxy = { p: 0 };
    var tl = gsap.timeline({
      scrollTrigger: {
        trigger: pinEl,
        start: 'top top',
        end: '+=' + scrollDistance,
        pin: true,
        scrub: 1,
        anticipatePin: 1,
        invalidateOnRefresh: true
      }
    });
    tl.to(proxy, {
      p: 1,
      ease: 'none',
      duration: 1,
      onUpdate: function () { applyProgress(proxy.p); }
    });

    var pendingFirstDraw = setInterval(function () {
      if (sequences[0].images[0]) {
        applyProgress(proxy.p);
        clearInterval(pendingFirstDraw);
      }
    }, 30);

    var resizeRaf = null;
    function onResize() {
      if (resizeRaf) return;
      resizeRaf = requestAnimationFrame(function () {
        resizeRaf = null;
        resizeCanvas();
        redrawCurrent();
      });
    }
    window.addEventListener('resize', onResize);
    ScrollTrigger.refresh();

    // Web fonts (esp. the handwritten quote font) swap in after this initial
    // refresh and reflow text throughout the page, which shifts every later
    // section's document position. Left uncorrected, a *later* GSAP-internal
    // refresh (e.g. on window resize) would recompute this pin's absolute
    // scroll range against the shifted layout and could re-activate the pin
    // wherever the user happens to have scrolled to by then. Refreshing again
    // as soon as fonts settle keeps the cached range accurate long before
    // that can happen.
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { ScrollTrigger.refresh(); }).catch(function () {});
    }
    window.addEventListener('load', function () { ScrollTrigger.refresh(); }, { once: true });

    function cleanup() {
      if (tl.scrollTrigger) tl.scrollTrigger.kill();
      tl.kill();
      window.removeEventListener('resize', onResize);
      clearInterval(pendingFirstDraw);
    }
    root._hwHouseScrollCleanup = cleanup;
    window.addEventListener('pagehide', cleanup, { once: true });
  }

  function init() {
    var roots = document.querySelectorAll('[data-hw-house-root]');
    for (var i = 0; i < roots.length; i++) initHouseScroll(roots[i]);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.HomworksHouseScroll = { init: initHouseScroll };
})();
