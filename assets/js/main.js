(function () {
  'use strict';

  /* ---------- Header shadow on scroll ---------- */
  var header = document.querySelector('.site-header');
  function onScroll() { header.classList.toggle('is-scrolled', window.scrollY > 10); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var menu = document.getElementById('mobile-menu');
  function setMenu(open) {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menu.hidden = !open;
    document.body.style.overflow = open ? 'hidden' : '';
  }
  toggle.addEventListener('click', function () { setMenu(menu.hidden); });
  menu.addEventListener('click', function (e) { if (e.target.tagName === 'A') setMenu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !menu.hidden) setMenu(false); });
  window.matchMedia('(min-width: 901px)').addEventListener('change', function (m) { if (m.matches) setMenu(false); });

  /* ---------- Floating CTA: hide when enquiry form is on screen ---------- */
  var cta = document.querySelector('.cta-leasing');
  var enq = document.getElementById('enquiries');
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      cta.classList.toggle('is-hidden', entries[0].isIntersecting);
    }, { threshold: 0.15 }).observe(enq);
  }

  /* Phone: tuck the round CTA away while scrolling down, bring it back on scroll-up / pause */
  var phone = window.matchMedia('(max-width: 640px)');
  var lastY = window.scrollY, idle;
  window.addEventListener('scroll', function () {
    if (!phone.matches) { cta.classList.remove('is-tucked'); return; }
    var y = window.scrollY;
    if (y > lastY + 4) cta.classList.add('is-tucked');
    else if (y < lastY - 4) cta.classList.remove('is-tucked');
    lastY = y;
    clearTimeout(idle);
    idle = setTimeout(function () { cta.classList.remove('is-tucked'); }, 1200);
  }, { passive: true });

  /* ---------- Horizontal scroller helper ---------- */
  function scroller(track, prev, next, onUpdate) {
    function step() {
      var first = track.children[0];
      var gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      return Math.min(track.clientWidth, first ? first.getBoundingClientRect().width + gap : track.clientWidth);
    }
    function update() {
      var max = track.scrollWidth - track.clientWidth;
      prev.disabled = track.scrollLeft <= 2;
      next.disabled = track.scrollLeft >= max - 2;
      if (onUpdate) onUpdate(max);
    }
    prev.addEventListener('click', function () { track.scrollBy({ left: -step(), behavior: 'smooth' }); });
    next.addEventListener('click', function () { track.scrollBy({ left: step(), behavior: 'smooth' }); });
    track.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    Array.prototype.forEach.call(track.querySelectorAll('img'), function (img) {
      if (!img.complete) img.addEventListener('load', update);
    });
    update();
    return update;
  }

  /* Suite galleries (one image per view + counter) */
  var galleryUpdaters = [];
  document.querySelectorAll('[data-gallery]').forEach(function (g) {
    var track = g.querySelector('.suite__track');
    var cur = g.querySelector('[data-current]');
    galleryUpdaters.push(scroller(track, g.querySelector('.arrow--prev'), g.querySelector('.arrow--next'), function () {
      cur.textContent = Math.round(track.scrollLeft / Math.max(1, track.clientWidth)) + 1;
    }));
  });

  /* Features carousel (progress bar) */
  document.querySelectorAll('[data-carousel]').forEach(function (c) {
    var track = c.querySelector('.features__track');
    var bar = c.querySelector('.progress__bar');
    scroller(track, c.querySelector('.arrow--prev'), c.querySelector('.arrow--next'), function (max) {
      var ratio = track.clientWidth / Math.max(track.scrollWidth, 1);
      var w = Math.max(ratio * 100, 12);
      var pos = max > 0 ? track.scrollLeft / max : 0;
      bar.style.width = w + '%';
      bar.style.left = (pos * (100 - w)) + '%';
    });
  });

  /* ---------- Suite tabs ---------- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.tabs__btn'));
  function selectTab(tab, focus) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.classList.toggle('is-active', on);
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      var panel = document.getElementById(t.getAttribute('aria-controls'));
      if (on && panel.hidden) {
        panel.classList.remove('is-switching'); void panel.offsetWidth; panel.classList.add('is-switching');
      }
      panel.hidden = !on;
    });
    if (focus) tab.focus();
    galleryUpdaters.forEach(function (u) { u(); });
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { selectTab(t); });
    t.addEventListener('keydown', function (e) {
      var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (d) { e.preventDefault(); selectTab(tabs[(i + d + tabs.length) % tabs.length], true); }
    });
  });

  /* =========================================================
     Motion: scroll reveals, banner parallax, hero dim
     ========================================================= */
  var root = document.documentElement;
  if (root.classList.contains('anim')) {

    // [selector, reveal type, stagger ms, group-size for stagger reset]
    var plan = [
      ['.intro__title', ''],
      ['.intro__body p', '', 140],
      ['.reserve__media', 'img'],
      ['.reserve__text', '', 0, 0, 500],
      ['.suites > .label', ''],
      ['.tabs', '', 0, 0, 150],
      ['#panel-standard .suite__gallery', 'img'],
      ['#panel-standard .suite__info > *', '', 90, 0, 250],
      ['#panel-standard .suite__count', '', 0, 0, 900],
      ['.features', 'line'],
      ['.features__title', ''],
      ['.features__lead', '', 0, 0, 100],
      ['.features .dash-list li, .features__note, .features__sub', '', 45],
      ['.features__track img', 'right', 130],
      ['.progress', 'fade', 0, 0, 500],
      ['.amenities > .label', ''],
      ['.amenities__lead', '', 0, 0, 120],
      ['.amenities__grid li', '', 140, 3],
      ['.locations > .label', ''],
      ['.locations__address', '', 0, 0, 120],
      ['.locations__map', '', 0, 0, 200],
      ['.enquiries > .label', ''],
      ['.enquiries__contact', '', 0, 0, 120],
      ['.form .field, .form .btn--send', '', 110],
      ['.site-footer > *', '', 100]
    ];
    var targets = [];
    plan.forEach(function (p) {
      var els = document.querySelectorAll(p[0]);
      Array.prototype.forEach.call(els, function (el, i) {
        if (p[1] === 'line') { targets.push(el); el.dataset.line = ''; return; }
        el.setAttribute('data-reveal', p[1] || '');
        var idx = p[3] ? i % p[3] : i;
        el.style.setProperty('--d', ((p[4] || 0) + idx * (p[2] || 0)) + 'ms');
        targets.push(el);
      });
    });

    function reveal(el) { el.classList.add('is-in'); io.unobserve(el); }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) reveal(e.target); });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.01 });

    // Safety sweep: anything on screen that hasn't animated in yet gets revealed
    // (covers the footer at page end, very tall screens, fast jumps, missed IO callbacks).
    var sweeping = false, observing = false;
    function sweep() {
      if (!observing) return;
      var vh = window.innerHeight;
      var atEnd = vh + window.scrollY >= document.documentElement.scrollHeight - 4;
      targets.forEach(function (el) {
        if (el.classList.contains('is-in')) return;
        var r = el.getBoundingClientRect();
        if (r.bottom > 0 && r.top < (atEnd ? vh : vh * 0.92)) reveal(el);
      });
    }
    function onSweep() { if (!sweeping) { sweeping = true; setTimeout(function () { sweeping = false; sweep(); }, 120); } }
    window.addEventListener('scroll', onSweep, { passive: true });
    window.addEventListener('resize', onSweep);

    /* ---------- Landing intro sequence ---------- */
    var short = root.classList.contains('intro-short');
    var T = short
      ? { logoIn: 0, logoOut: 0, image: 50, menu: 350, cta: 800, done: 1400 }
      : { logoIn: 150, logoOut: 1700, image: 2400, menu: 2900, cta: 3600, done: 4200 };
    function step(cls, at, fn) { setTimeout(function () { if (cls) root.classList.add(cls); if (fn) fn(); }, at); }
    function startIntro() {
      if (!short) step('st-logo-in', T.logoIn);
      if (!short) step('st-logo-out', T.logoOut);
      step('st-image', T.image, function () { root.classList.remove('is-intro'); window.scrollTo(window.scrollX, window.scrollY); });
      // content reveals start once the image is up, so the intro text animates in after it
      step('st-menu', T.menu, function () {
        observing = true;
        targets.forEach(function (el) { io.observe(el); });
        setTimeout(sweep, 400);
      });
      step('st-cta', T.cta);
      step(null, T.done, function () {
        var l = document.querySelector('.loader'); if (l) l.remove();
        try { sessionStorage.setItem('hws-intro', '1'); } catch (e) {}
      });
    }
    // wait for the hero photo + fonts (max 2.5s) so nothing pops in half-loaded
    var heroImg = document.querySelector('.hero img');
    var ready = [document.fonts ? document.fonts.ready : Promise.resolve()];
    if (heroImg && !heroImg.complete) ready.push(new Promise(function (r) { heroImg.addEventListener('load', r); heroImg.addEventListener('error', r); }));
    var started = false;
    function go() { if (!started) { started = true; startIntro(); } }
    Promise.all(ready).then(go);
    setTimeout(go, 2500);

    // Banner parallax + hero dim, rAF-throttled
    var media = document.querySelector('.reserve__media');
    var mediaImg = media && media.querySelector('img');
    var hero = document.querySelector('.hero');
    var ticking = false;
    function frame() {
      ticking = false;
      var vh = window.innerHeight;
      if (media) {
        var r = media.getBoundingClientRect();
        if (r.bottom > 0 && r.top < vh) {
          // -1 (entering bottom) .. 1 (leaving top)
          var p = ((r.top + r.height / 2) - vh / 2) / (vh / 2 + r.height / 2);
          media.style.setProperty('--py', (p * r.height * 0.07).toFixed(1) + 'px');
        }
      }
      if (hero) {
        var h = hero.offsetHeight || 1;
        hero.style.setProperty('--hero-dim', Math.min(window.scrollY / h, 1) * 0.35);
      }
    }
    function onTick() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
    window.addEventListener('scroll', onTick, { passive: true });
    window.addEventListener('resize', onTick);
    frame();
    // after the reveal transition, let parallax track the scroll 1:1
    if (media) media.addEventListener('transitionend', function (e) {
      if (e.target === mediaImg && e.propertyName === 'transform' && media.classList.contains('is-in')) media.classList.add('is-settled');
    });
  }

  /* ---------- Enquiry form (opens mail client; swap for a backend endpoint later) ---------- */
  var form = document.getElementById('enquiry-form');
  var status = form.querySelector('.form__status');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var ok = true;
    form.querySelectorAll('input, textarea').forEach(function (el) {
      var valid = el.value.trim() !== '' && el.checkValidity();
      el.closest('.field').classList.toggle('is-invalid', !valid);
      if (!valid) ok = false;
    });
    if (!ok) { status.textContent = 'Please complete all fields with a valid email.'; return; }
    var d = new FormData(form);
    var body = 'Name: ' + d.get('name') + '\nEmail: ' + d.get('email') + '\n\n' + d.get('message');
    window.location.href = 'mailto:enquiry@7hingwan.com?subject=' +
      encodeURIComponent('Leasing enquiry – ' + d.get('name')) + '&body=' + encodeURIComponent(body);
    status.textContent = 'Thank you – your email app should now open to send the enquiry.';
  });
})();
