/* ===== Homworks homepage widgets =====
   - [data-guide]  the Interior Guide: one detail card driven by 12 chips.
   - [data-tabs]   the room-model tabs.

   Both start life as plain, fully readable markup. Each adds its own
   .is-ready / .tabs-ready class only after it has wired itself up, so a
   script failure leaves the content visible.
*/
(function () {
  'use strict';

  var reduceMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var canHover = !!(window.matchMedia && window.matchMedia('(hover: hover)').matches);
  var refreshTimer = null;

  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  // Swapping content changes page height, so triggers further down need a fresh measure.
  function refreshScroll() {
    if (!window.ScrollTrigger) return;
    clearTimeout(refreshTimer);
    refreshTimer = setTimeout(function () { window.ScrollTrigger.refresh(); }, 250);
  }

  function pad(n) { return n < 10 ? '0' + n : String(n); }

  function initGuide() {
    var root = document.querySelector('[data-guide]');
    if (!root) return;
    var list = root.querySelector('.guide-list');
    var chips = Array.prototype.slice.call(root.querySelectorAll('.guide-chip'));
    var detail = root.querySelector('.guide-detail');
    if (!list || !chips.length || !detail) return;

    var nEl = detail.querySelector('[data-gd-n]');
    var tEl = detail.querySelector('[data-gd-title]');
    var pEl = detail.querySelector('[data-gd-text]');
    var prev = detail.querySelector('[data-gd-prev]');
    var next = detail.querySelector('[data-gd-next]');
    var total = chips.length;
    var current = 0;

    function show(i, opts) {
      opts = opts || {};
      current = (i + total) % total;
      chips.forEach(function (chip, j) {
        var on = j === current;
        chip.setAttribute('aria-pressed', on ? 'true' : 'false');
        chip.tabIndex = on ? 0 : -1;
      });
      var chip = chips[current];
      nEl.textContent = pad(current + 1);
      detail.setAttribute('data-n', pad(current + 1));
      tEl.textContent = chip.querySelector('span').textContent;
      pEl.textContent = chip.parentNode.querySelector('p').textContent;

      if (!reduceMotion) {
        detail.classList.remove('is-in');
        void detail.offsetWidth;
        detail.classList.add('is-in');
      }
      // Only the chip strip scrolls, never the page.
      if (opts.scroll && list.scrollWidth > list.clientWidth + 2) {
        var left = chip.parentNode.offsetLeft - (list.clientWidth - chip.parentNode.offsetWidth) / 2;
        list.scrollTo({ left: left, behavior: reduceMotion ? 'auto' : 'smooth' });
      }
      if (opts.focus) chip.focus({ preventScroll: true });
    }

    chips.forEach(function (chip, i) {
      chip.addEventListener('click', function () { show(i, { scroll: true }); });
      if (canHover) chip.addEventListener('mouseenter', function () { show(i); });
      chip.addEventListener('keydown', function (e) {
        var k = e.key;
        if (k === 'ArrowRight' || k === 'ArrowDown') { e.preventDefault(); show(current + 1, { focus: true, scroll: true }); }
        else if (k === 'ArrowLeft' || k === 'ArrowUp') { e.preventDefault(); show(current - 1, { focus: true, scroll: true }); }
        else if (k === 'Home') { e.preventDefault(); show(0, { focus: true, scroll: true }); }
        else if (k === 'End') { e.preventDefault(); show(total - 1, { focus: true, scroll: true }); }
      });
    });
    if (prev) prev.addEventListener('click', function () { show(current - 1, { scroll: true }); });
    if (next) next.addEventListener('click', function () { show(current + 1, { scroll: true }); });

    show(0);
    root.classList.add('is-ready');
  }

  function initTabs() {
    var roots = document.querySelectorAll('[data-tabs]');
    Array.prototype.forEach.call(roots, function (root) {
      var tabs = Array.prototype.slice.call(root.querySelectorAll('[role="tab"]'));
      var panels = tabs.map(function (t) { return document.getElementById(t.getAttribute('aria-controls')); });
      if (!tabs.length || panels.some(function (p) { return !p; })) return;

      function select(i, opts) {
        opts = opts || {};
        tabs.forEach(function (tab, j) {
          var on = j === i;
          tab.setAttribute('aria-selected', on ? 'true' : 'false');
          tab.tabIndex = on ? 0 : -1;
          panels[j].hidden = !on;
        });
        if (opts.scroll) {
          var strip = tabs[i].parentNode;
          if (strip.scrollWidth > strip.clientWidth + 2) {
            strip.scrollTo({
              left: tabs[i].offsetLeft - (strip.clientWidth - tabs[i].offsetWidth) / 2,
              behavior: reduceMotion ? 'auto' : 'smooth'
            });
          }
        }
        if (opts.focus) tabs[i].focus({ preventScroll: true });
        if (opts.user) refreshScroll();
      }

      tabs.forEach(function (tab, i) {
        tab.addEventListener('click', function () { select(i, { user: true, scroll: true }); });
        tab.addEventListener('keydown', function (e) {
          var k = e.key, n = tabs.length, to = -1;
          if (k === 'ArrowRight' || k === 'ArrowDown') to = (i + 1) % n;
          else if (k === 'ArrowLeft' || k === 'ArrowUp') to = (i - 1 + n) % n;
          else if (k === 'Home') to = 0;
          else if (k === 'End') to = n - 1;
          if (to < 0) return;
          e.preventDefault();
          select(to, { user: true, focus: true, scroll: true });
        });
      });

      select(0);
      root.classList.add('tabs-ready');
    });
  }

  ready(function () {
    try { initGuide(); } catch (err) { /* leave the static list in place */ }
    try { initTabs(); } catch (err) { /* leave every panel visible */ }
  });
})();
