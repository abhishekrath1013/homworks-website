/* ===== HomworksGsapScroll =====
   Reusable, drop-anywhere GSAP + ScrollTrigger scroll component. Loads on
   any page that includes gsap.min.js + ScrollTrigger.min.js before this
   file, and wires up whichever of these data-attributes it finds — pages
   that don't use a given attribute simply skip that feature.

   - [data-gsap-stack]      Direct children animate in as a staggered,
                             scroll-scrubbed "stack of cards" — each one
                             settling into place as the section scrolls
                             through view. Give each child data-num="01"
                             etc. if it should show a ghost numeral (see
                             .install-stage:before in index.html).

   - [data-gsap-float]      Slow scroll-parallax drift, magnitude set by
                             data-speed (negative floats up, positive
                             floats down as the page scrolls).

   - [data-gsap-count]      Counts up from 0 to data-to when it scrolls
                             into view. Optional data-decimals="1" and
                             data-format="comma" (thousands separator).

   - [data-gsap-spotlight]  Cursor-follow radial glow — the container's
                             --sx/--sy custom properties track the
                             pointer for a CSS background to key off.

   - [data-gsap-cursor-dot] / [data-gsap-cursor-ring]
                             A two-part custom cursor (small dot + a
                             lagging ring) that grows on hover of
                             interactive elements. Needs both elements
                             present in the DOM to activate.

   - [data-gsap-lines]      Splits a heading on its <br> tags and rises
                             each line out of its own mask, staggered.

   - [data-hero-in]         Above-the-fold elements that fade up on load
                             rather than on scroll, in document order.

   - [data-gsap-reveal]     Staggers this element's direct children up
                             into view. data-stagger overrides the step;
                             data-gsap-self animates the element itself.

   - [data-gsap-draw]       A rule that draws left-to-right, scrubbed to
                             the scroll position of its parent.

   - [data-gsap-image]      Slow cinematic scale-down across the whole
                             time its section is on screen.

   Every feature checks prefers-reduced-motion and bails to the page's
   normal static CSS state rather than leaving anything half-animated.
   Nothing is hidden until GSAP is confirmed present, so a blocked CDN
   leaves a plain, fully readable page instead of an empty one.
*/
(function () {
  'use strict';

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  function initLines() {
    var els = document.querySelectorAll('[data-gsap-lines]');
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      var parts = el.innerHTML.split(/<br\s*\/?>/i);
      el.innerHTML = parts.map(function (part) {
        return '<span class="hw-line"><span>' + part + '</span></span>';
      }).join('');
      var inner = el.querySelectorAll('.hw-line > span');
      gsap.set(inner, { yPercent: 118 });
      gsap.to(inner, {
        yPercent: 0,
        duration: 1.15,
        ease: 'power4.out',
        stagger: .085,
        delay: .18,
        scrollTrigger: { trigger: el, start: 'top 94%', once: true }
      });
    }
  }

  function initHeroIn() {
    var els = document.querySelectorAll('[data-hero-in]');
    if (!els.length) return;
    gsap.set(els, { opacity: 0, y: 26 });
    gsap.to(els, {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: 'power3.out',
      stagger: .1,
      delay: .3
    });
  }

  function initReveals() {
    var groups = document.querySelectorAll('[data-gsap-reveal]');
    for (var i = 0; i < groups.length; i++) {
      var group = groups[i];
      var items = group.hasAttribute('data-gsap-self')
        ? [group]
        : Array.prototype.slice.call(group.children);
      if (!items.length) continue;
      var stagger = parseFloat(group.getAttribute('data-stagger'));
      gsap.set(items, { opacity: 0, y: 34 });
      gsap.to(items, {
        opacity: 1,
        y: 0,
        duration: .9,
        ease: 'power3.out',
        stagger: isNaN(stagger) ? .09 : stagger,
        scrollTrigger: { trigger: group, start: 'top 86%', once: true }
      });
    }
  }

  function initDraws() {
    var els = document.querySelectorAll('[data-gsap-draw]');
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      gsap.fromTo(el, { scaleX: 0 }, {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: el.parentElement || el,
          start: 'top 88%',
          end: 'bottom 55%',
          scrub: .5
        }
      });
    }
  }

  function initImages() {
    var els = document.querySelectorAll('[data-gsap-image]');
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      gsap.fromTo(el, { scale: 1.16 }, {
        scale: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: el.closest('section') || el.parentElement || el,
          start: 'top bottom',
          end: 'bottom top',
          scrub: .8
        }
      });
    }
  }

  function initStacks() {
    var groups = document.querySelectorAll('[data-gsap-stack]');
    for (var i = 0; i < groups.length; i++) {
      var container = groups[i];
      var cards = Array.prototype.slice.call(container.children);
      if (!cards.length) continue;
      gsap.set(cards, { opacity: 0, y: 56, scale: .95 });
      gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: 'top 85%',
          end: 'bottom 60%',
          scrub: .6
        }
      }).to(cards, { opacity: 1, y: 0, scale: 1, stagger: .25, ease: 'power2.out' });
    }
  }

  function initFloat() {
    var els = document.querySelectorAll('[data-gsap-float]');
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      var speed = parseFloat(el.getAttribute('data-speed')) || .1;
      gsap.to(el, {
        y: function () { return speed * 260; },
        ease: 'none',
        scrollTrigger: {
          trigger: el.closest('section') || el.parentElement || el,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true
        }
      });
    }
  }

  function formatCount(value, decimals, comma) {
    var out = decimals ? value.toFixed(decimals) : Math.round(value).toString();
    if (comma) out = Number(out).toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    return out;
  }

  function initCounts(reduceMotion) {
    var els = document.querySelectorAll('[data-gsap-count]');
    for (var i = 0; i < els.length; i++) {
      (function (el) {
        var to = parseFloat(el.getAttribute('data-to')) || 0;
        var decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
        var comma = el.getAttribute('data-format') === 'comma';
        if (reduceMotion) {
          el.textContent = formatCount(to, decimals, comma);
          return;
        }
        var proxy = { v: 0 };
        ScrollTrigger.create({
          trigger: el,
          start: 'top 92%',
          once: true,
          onEnter: function () {
            el.textContent = formatCount(0, decimals, comma);
            gsap.to(proxy, {
              v: to,
              duration: 1.6,
              ease: 'power2.out',
              onUpdate: function () { el.textContent = formatCount(proxy.v, decimals, comma); }
            });
          }
        });
      })(els[i]);
    }
  }

  function initSpotlight() {
    var zones = document.querySelectorAll('[data-gsap-spotlight]');
    for (var i = 0; i < zones.length; i++) {
      (function (zone) {
        var raf = null, mx = 50, my = 35;
        function apply() {
          raf = null;
          zone.style.setProperty('--sx', mx + '%');
          zone.style.setProperty('--sy', my + '%');
        }
        zone.addEventListener('pointermove', function (e) {
          var r = zone.getBoundingClientRect();
          if (!r.width || !r.height) return;
          mx = (e.clientX - r.left) / r.width * 100;
          my = (e.clientY - r.top) / r.height * 100;
          if (!raf) raf = requestAnimationFrame(apply);
        });
        zone.addEventListener('pointerleave', function () {
          mx = 50; my = 35;
          if (!raf) raf = requestAnimationFrame(apply);
        });
      })(zones[i]);
    }
  }

  function initCursor() {
    var dot = document.querySelector('[data-gsap-cursor-dot]');
    var ring = document.querySelector('[data-gsap-cursor-ring]');
    if (!dot || !ring) return;
    document.body.classList.add('hw-cursor-on');
    gsap.set([dot, ring], { xPercent: -50, yPercent: -50 });
    var dotX = gsap.quickTo(dot, 'x', { duration: .1, ease: 'power3' });
    var dotY = gsap.quickTo(dot, 'y', { duration: .1, ease: 'power3' });
    var ringX = gsap.quickTo(ring, 'x', { duration: .35, ease: 'power3' });
    var ringY = gsap.quickTo(ring, 'y', { duration: .35, ease: 'power3' });
    window.addEventListener('pointermove', function (e) {
      dotX(e.clientX); dotY(e.clientY);
      ringX(e.clientX); ringY(e.clientY);
    });
    var hoverables = 'a,button,.button,.room,.style-card,.craft-card,.connect-card,.lab-card,.whyhw-card,input,select,textarea';
    document.addEventListener('pointerover', function (e) {
      if (e.target.closest && e.target.closest(hoverables)) ring.classList.add('hover');
    });
    document.addEventListener('pointerout', function (e) {
      if (e.target.closest && e.target.closest(hoverables)) ring.classList.remove('hover');
    });
  }

  function init() {
    var hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
    var reduceMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    var pointerFine = !!(window.matchMedia && window.matchMedia('(pointer: fine)').matches);

    // Tells the page's CSS gate that motion is settled, so anything the
    // gate was holding back can be shown either way.
    window.__hwMotionReady = true;
    if (!hasGsap || reduceMotion) {
      document.documentElement.classList.add('motion-off');
    }

    if (!hasGsap) return;
    gsap.registerPlugin(ScrollTrigger);

    if (reduceMotion) {
      initCounts(true);
      return;
    }

    initLines();
    initHeroIn();
    initReveals();
    initDraws();
    initImages();
    initStacks();
    initFloat();
    initCounts(false);

    if (pointerFine) {
      initSpotlight();
      initCursor();
    }
  }

  ready(init);
  window.HomworksGsapScroll = { init: init };
})();
