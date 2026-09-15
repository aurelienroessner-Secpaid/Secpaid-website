(function () {
  'use strict';

  // Mobile nav
  var nav = document.getElementById('nav');
  var toggle = document.getElementById('navToggle');
  var navLinksEl = document.querySelector('.nav-links');
  var navCtaEl = document.querySelector('.nav-cta');

  // The mobile menu's Apply now / Sign in row sits right below the link list.
  // The Industries dropdown can grow or shrink that list's height, so its
  // position is calculated from the real rendered height instead of a fixed number.
  function syncMobileCta() {
    if (!navCtaEl) return;
    if (!nav.classList.contains('open') || window.innerWidth > 960) { navCtaEl.style.top = ''; return; }
    var navH = nav.getBoundingClientRect().height;
    navCtaEl.style.top = (navH + (navLinksEl ? navLinksEl.offsetHeight : 0)) + 'px';
  }

  toggle.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
    syncMobileCta();
  });
  nav.querySelectorAll('.nav-links a, .nav-cta a').forEach(function (a) {
    a.addEventListener('click', function () { nav.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); });
  });

  // Industries dropdown in the header: close others when one opens, sync the
  // mobile CTA row, and close on outside click or Escape.
  document.querySelectorAll('.nav-dropdown details').forEach(function (d) {
    d.addEventListener('toggle', function () {
      if (d.open) {
        document.querySelectorAll('.nav-dropdown details').forEach(function (o) { if (o !== d) o.open = false; });
      }
      syncMobileCta();
    });
  });
  document.addEventListener('click', function (e) {
    document.querySelectorAll('.nav-dropdown details[open]').forEach(function (d) {
      if (!d.contains(e.target)) d.open = false;
    });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') document.querySelectorAll('.nav-dropdown details[open]').forEach(function (d) { d.open = false; });
  });
  window.addEventListener('resize', syncMobileCta);

  // Payment methods marquee: both copies are already in the HTML (see index.html),
  // so the CSS loop (translateX(-50%)) is seamless from first paint with no JS timing dependency.

  // Scroll reveal (IntersectionObserver, no scroll listeners)
  var reveals = document.querySelectorAll('.reveal');
  function revealAll() { reveals.forEach(function (el) { el.classList.add('in'); }); }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    reveals.forEach(function (el) { io.observe(el); });
    // Safety net: never leave content invisible if the observer is throttled or never fires.
    setTimeout(revealAll, 3000);
  } else {
    revealAll();
  }

  // Subscription feature tabs swap the screenshot
  var shot = document.getElementById('subsShot');
  document.querySelectorAll('.feature-tab').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.feature-tab').forEach(function (b) { b.setAttribute('aria-selected', 'false'); });
      btn.setAttribute('aria-selected', 'true');
      var src = btn.getAttribute('data-shot');
      if (shot.getAttribute('src') === src) return;
      shot.classList.add('fade');
      var img = new Image();
      img.onload = function () { shot.src = src; shot.alt = btn.querySelector('b').textContent + ' in the SecPaid dashboard'; shot.classList.remove('fade'); };
      img.src = src;
    });
  });

  // Code tabs
  document.querySelectorAll('.code-tabs button').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var lang = btn.getAttribute('data-lang');
      document.querySelectorAll('.code-tabs button').forEach(function (b) { b.setAttribute('aria-selected', String(b === btn)); });
      document.querySelectorAll('.code pre').forEach(function (p) { p.hidden = p.getAttribute('data-lang') !== lang; });
    });
  });

  // Self-serve checkout modal (main page only)
  var dlg = document.getElementById('checkout');
  if (dlg) {
  var formWrap = document.getElementById('checkoutForm');
  var done = document.getElementById('checkoutDone');
  var form = document.getElementById('signup');
  var lastTrigger = null;

  function openCheckout(plan, fee) {
    document.getElementById('mPlan').textContent = plan;
    document.getElementById('mSummary').textContent = plan + ' tier';
    document.getElementById('mPrice').textContent = fee;
    formWrap.hidden = false; done.hidden = true;
    form.reset();
    form.querySelectorAll('.field').forEach(function (f) { f.classList.remove('invalid'); });
    if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
    document.getElementById('company').focus();
  }
  function closeCheckout() {
    if (dlg.open) dlg.close();
    if (lastTrigger) lastTrigger.focus();
  }
  document.querySelectorAll('.choose').forEach(function (btn) {
    btn.addEventListener('click', function () {
      lastTrigger = btn;
      openCheckout(btn.getAttribute('data-plan'), btn.getAttribute('data-fee'));
    });
  });
  document.getElementById('closeModal').addEventListener('click', closeCheckout);
  document.getElementById('closeDone').addEventListener('click', closeCheckout);
  dlg.addEventListener('click', function (e) { if (e.target === dlg) closeCheckout(); });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var ok = true;
    var company = document.getElementById('company');
    var email = document.getElementById('email');
    company.closest('.field').classList.toggle('invalid', !company.value.trim());
    var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value);
    email.closest('.field').classList.toggle('invalid', !emailOk);
    ok = company.value.trim() && emailOk;
    if (!ok) return;
    // TODO: POST form data to your signup/billing backend here.
    formWrap.hidden = true; done.hidden = false;
    document.getElementById('closeDone').focus();
  });
  }

  // Language toggle (visual only; wire to your DE content)
  document.querySelectorAll('.lang button').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.lang button').forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
    });
  });

  // Live routing panel (hero visual — illustrative data, not a real feed)
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var rows = document.getElementById('routeRows');
  if (rows) {
    var METHODS = ['Visa', 'Mastercard', 'SEPA', 'iDEAL', 'PayPal', 'Apple Pay', 'Google Pay', 'EPS', 'Klarna'];
    var ROUTES = ['route/de-1', 'route/de-berlin', 'route/eu-a', 'route/eu-b', 'route/at-1', 'route/nl-2', 'route/ch-1'];
    function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
    function euro() {
      var n = Math.random() * 1980 + 20;
      var whole = Math.floor(n), cents = Math.round((n - whole) * 100);
      if (cents === 100) { whole += 1; cents = 0; }
      var w = String(whole);
      if (w.length > 3) w = w.slice(0, -3) + '.' + w.slice(-3);
      return '\u20AC' + w + ',' + (cents < 10 ? '0' + cents : cents);
    }
    function mkRow(isNew) {
      var tr = document.createElement('tr');
      if (isNew) tr.className = 'rp-new';
      var threeDS = Math.random() < 0.14;
      tr.innerHTML = '<td>' + euro() + '</td><td>' + pick(METHODS) + '</td><td>' + pick(ROUTES) +
        '</td><td class="' + (threeDS ? '' : 'ok') + '">' + (threeDS ? '3-D SECURE' : 'AUTH') + '</td>';
      return tr;
    }
    for (var i = 0; i < 6; i++) rows.appendChild(mkRow(false));
    if (!reduce) {
      setInterval(function () {
        if (document.hidden) return;
        if (rows.firstChild) rows.removeChild(rows.firstChild);
        rows.appendChild(mkRow(true));
      }, 2400);
    }
    // count up the transactions figure
    document.querySelectorAll('.route-panel__stats b[data-count]').forEach(function (el) {
      var target = parseInt(el.getAttribute('data-count'), 10);
      if (reduce) { el.textContent = target.toLocaleString('en-US'); return; }
      var start = null, dur = 1400, from = Math.round(target * 0.985);
      function step(ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        var val = Math.round(from + (target - from) * (1 - Math.pow(1 - p, 3)));
        el.textContent = val.toLocaleString('en-US');
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }
})();
