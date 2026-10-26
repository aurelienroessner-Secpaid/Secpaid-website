(function () {
  'use strict';

  // ---- Language toggle (EN/DE) ----
  // Every translatable element carries data-de="<German HTML>". The first time a
  // language switch touches an element we cache its current (English) markup so we
  // can restore it later, instead of hardcoding the English copy twice in the file.
  var LANG_KEY = 'secpaid-lang';
  var i18nCache = new WeakMap();
  var i18nNodes = document.querySelectorAll('[data-de]');
  var titleEl = document.querySelector('title');
  var descEl = document.querySelector('meta[name="description"]');

  function applyLang(lang) {
    i18nNodes.forEach(function (el) {
      var isField = el.tagName === 'INPUT' || el.tagName === 'TEXTAREA';
      var prop = isField ? 'placeholder' : 'innerHTML';
      if (!i18nCache.has(el)) i18nCache.set(el, isField ? el.placeholder : el.innerHTML);
      el[prop] = lang === 'de' ? el.getAttribute('data-de') : i18nCache.get(el);
    });
    if (titleEl && titleEl.hasAttribute('data-de')) {
      if (!i18nCache.has(titleEl)) i18nCache.set(titleEl, titleEl.textContent);
      titleEl.textContent = lang === 'de' ? titleEl.getAttribute('data-de') : i18nCache.get(titleEl);
    }
    if (descEl && descEl.hasAttribute('data-de')) {
      if (!i18nCache.has(descEl)) i18nCache.set(descEl, descEl.getAttribute('content'));
      descEl.setAttribute('content', lang === 'de' ? descEl.getAttribute('data-de') : i18nCache.get(descEl));
    }
    document.documentElement.lang = lang;
    document.querySelectorAll('.lang button').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.textContent.trim().toUpperCase() === lang.toUpperCase()));
    });
    window.SECPAID_LANG = lang;
    try { localStorage.setItem(LANG_KEY, lang); } catch (e) {}
  }

  document.querySelectorAll('.lang button').forEach(function (btn) {
    btn.addEventListener('click', function () {
      applyLang(btn.textContent.trim().toLowerCase() === 'de' ? 'de' : 'en');
    });
  });

  var savedLang = null;
  try { savedLang = localStorage.getItem(LANG_KEY); } catch (e) {}
  window.SECPAID_LANG = savedLang === 'de' ? 'de' : 'en';
  if (savedLang === 'de') applyLang('de');

  // ---- Day/night toggle ----
  // The saved choice is applied by a tiny inline script in <head> (before first
  // paint). With no saved choice the page follows the system colour scheme.
  var THEME_KEY = 'secpaid-theme';
  var themeBtn = document.getElementById('themeToggle');
  var darkQuery = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  function isDark() {
    var t = document.documentElement.getAttribute('data-theme');
    return t ? t === 'dark' : !!(darkQuery && darkQuery.matches);
  }
  function syncThemeBtn() { if (themeBtn) themeBtn.setAttribute('aria-pressed', String(isDark())); }
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var next = isDark() ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
      syncThemeBtn();
    });
    if (darkQuery && darkQuery.addEventListener) darkQuery.addEventListener('change', syncThemeBtn);
    syncThemeBtn();
  }

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

  // Code tabs
  document.querySelectorAll('.code-tabs button').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var lang = btn.getAttribute('data-lang');
      document.querySelectorAll('.code-tabs button').forEach(function (b) { b.setAttribute('aria-selected', String(b === btn)); });
      document.querySelectorAll('.code pre').forEach(function (p) { p.hidden = p.getAttribute('data-lang') !== lang; });
    });
  });

  // Partner inquiry form (partners page): validates, then POSTs to the
  // same Zapier catch hook as the contact form. Falls back to a
  // pre-filled mailto to partners@secpaid.com if the request fails.
  var partnerForm = document.getElementById('partnerForm');
  if (partnerForm) {
    partnerForm.addEventListener('submit', function (e) {
      e.preventDefault();

      // Honeypot: real visitors never fill this hidden field.
      var honeypot = document.getElementById('pWebsite');
      if (honeypot && honeypot.value.trim()) return;

      var name = document.getElementById('pName');
      var email = document.getElementById('pEmail');
      var phone = document.getElementById('pPhone');
      var company = document.getElementById('pCompany');
      var url = document.getElementById('pUrl');
      var note = document.getElementById('pNote');

      var emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
      name.closest('.field').classList.toggle('invalid', !name.value.trim());
      email.closest('.field').classList.toggle('invalid', !emailValid);
      if (!name.value.trim() || !emailValid) return;

      var payload = {
        form: 'partner',
        name: name.value.trim(),
        email: email.value.trim(),
        phone: phone.value.trim(),
        company: company.value.trim(),
        url: url.value.trim(),
        note: note.value.trim()
      };

      function mailtoFallback() {
        var subject = 'Partner inquiry: ' + (payload.company || payload.name);
        var body = 'Name: ' + payload.name +
          '\nEmail: ' + payload.email +
          '\nPhone number: ' + (payload.phone || '-') +
          '\nCompany: ' + (payload.company || '-') +
          '\nURL: ' + (payload.url || '-') +
          '\nNote: ' + (payload.note || '-');
        window.location.href = 'mailto:partners@secpaid.com?subject=' +
          encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
      }

      var submitBtn = partnerForm.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;

      fetch(CONTACT_WEBHOOK, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).then(function () {
        partnerForm.hidden = true;
        document.getElementById('partnerDone').hidden = false;
      }).catch(function () {
        mailtoFallback();
        var msg = document.getElementById('partnerDoneMsg');
        if (msg) msg.textContent = "We couldn't reach our server, so we've opened your email app with your inquiry ready to go. Send the email, and our team will get back to you.";
        partnerForm.hidden = true;
        document.getElementById('partnerDone').hidden = false;
      }).finally(function () {
        if (submitBtn) submitBtn.disabled = false;
      });
    });
  }

  // Contact form (homepage): validates, then POSTs to the Zapier catch
  // hook, which fans the submission out to Slack. Falls back to a
  // pre-filled mailto if the request fails (e.g. offline, hook removed).
  var CONTACT_WEBHOOK = 'https://hooks.zapier.com/hooks/catch/19990653/41vyna2/';
  var contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();

      // Honeypot: real visitors never fill this hidden field.
      var honeypot = document.getElementById('cWebsite');
      if (honeypot && honeypot.value.trim()) return;

      var name = document.getElementById('cName');
      var email = document.getElementById('cEmail');
      var phone = document.getElementById('cPhone');
      var company = document.getElementById('cCompany');
      var url = document.getElementById('cUrl');
      var note = document.getElementById('cNote');

      var emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
      name.closest('.field').classList.toggle('invalid', !name.value.trim());
      email.closest('.field').classList.toggle('invalid', !emailValid);
      if (!name.value.trim() || !emailValid) return;

      var payload = {
        name: name.value.trim(),
        email: email.value.trim(),
        phone: phone.value.trim(),
        company: company.value.trim(),
        url: url.value.trim(),
        note: note.value.trim()
      };

      function mailtoFallback() {
        var subject = 'Contact form: ' + payload.name;
        var body = 'Name: ' + payload.name +
          '\nEmail: ' + payload.email +
          '\nPhone number: ' + (payload.phone || '-') +
          '\nCompany: ' + (payload.company || '-') +
          '\nURL: ' + (payload.url || '-') +
          '\nNote: ' + (payload.note || '-');
        window.location.href = 'mailto:contact@secpaid.com?subject=' +
          encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
      }

      var submitBtn = contactForm.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;

      fetch(CONTACT_WEBHOOK, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).then(function () {
        contactForm.hidden = true;
        document.getElementById('contactDone').hidden = false;
      }).catch(function () {
        mailtoFallback();
        var msg = document.getElementById('contactDoneMsg');
        if (msg) msg.textContent = "We couldn't reach our server, so we've opened your email app with your inquiry ready to go. Send the email, and our team will get back to you.";
        contactForm.hidden = true;
        document.getElementById('contactDone').hidden = false;
      }).finally(function () {
        if (submitBtn) submitBtn.disabled = false;
      });
    });
  }

  // Form fields: hide placeholder text as soon as a field is focused,
  // not just once typing starts, and restore it on blur if left empty.
  document.querySelectorAll('.field input[placeholder], .field textarea[placeholder]').forEach(function (el) {
    el.addEventListener('focus', function () {
      el.dataset.placeholder = el.getAttribute('placeholder');
      el.setAttribute('placeholder', '');
    });
    el.addEventListener('blur', function () {
      if (!el.value && el.dataset.placeholder) el.setAttribute('placeholder', el.dataset.placeholder);
    });
  });

})();
