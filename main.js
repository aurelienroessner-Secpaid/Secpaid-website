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
  var navScrollY = 0;

  // Fully pin the page behind the full-screen mobile menu: overflow:hidden
  // alone still lets iOS Safari rubber-band/scroll the page underneath, so
  // the body is pinned in place with a negative top offset and restored
  // (scroll position included) when the menu closes.
  function lockBodyScroll() {
    navScrollY = window.scrollY || document.documentElement.scrollTop || 0;
    document.body.style.position = 'fixed';
    document.body.style.top = -navScrollY + 'px';
    document.body.style.left = '0';
    document.body.style.right = '0';
  }
  function unlockBodyScroll() {
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    window.scrollTo(0, navScrollY);
  }

  function setNavOpen(open) {
    nav.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    if (open) lockBodyScroll(); else unlockBodyScroll();
  }

  toggle.addEventListener('click', function () {
    setNavOpen(!nav.classList.contains('open'));
  });
  nav.querySelectorAll('.nav-links a, .nav-cta a').forEach(function (a) {
    a.addEventListener('click', function () { setNavOpen(false); });
  });

  // Industries dropdown in the header: close others when one opens,
  // and close on outside click or Escape.
  document.querySelectorAll('.nav-dropdown details').forEach(function (d) {
    d.addEventListener('toggle', function () {
      if (d.open) {
        document.querySelectorAll('.nav-dropdown details').forEach(function (o) { if (o !== d) o.open = false; });
      }
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

  // Demo tiles (QR codes, Payment links) autoplay a couple of times on load,
  // then rest on their final frame and only replay when hovered, instead of
  // looping forever in the background.
  var DEMO_ANIM_MAX_AUTO_RUNS = 2;

  // QR codes tile: invoice -> zoom -> phone checkout, where the phone
  // types in fake card details, "pays", and shows a success screen.
  var qrAnim = document.querySelector('.qr-anim');
  if (qrAnim) {
    var qrPhases = qrAnim.querySelectorAll('.qr-phase');
    var qrScreen = qrAnim.querySelector('.qr-phone-screen');
    var qrPayBtn = qrAnim.querySelector('.qr-pf-pay');
    var qrTypeFields = {
      name: qrAnim.querySelector('.qr-pf-type[data-field="name"]'),
      card: qrAnim.querySelector('.qr-pf-type[data-field="card"]'),
      exp: qrAnim.querySelector('.qr-pf-type[data-field="exp"]'),
      cvv: qrAnim.querySelector('.qr-pf-type[data-field="cvv"]')
    };
    var qrRunning = false;
    var qrAutoRuns = 0;

    function qrType(field, text, charDelay) {
      var el = qrTypeFields[field];
      var i = 0;
      el.textContent = '';
      var iv = setInterval(function () {
        i++;
        el.textContent = text.slice(0, i);
        if (i >= text.length) clearInterval(iv);
      }, charDelay);
    }

    function runQrSequence() {
      qrRunning = true;

      // Suspend the card-form/success transitions for a frame so the old
      // cycle's typed text and "paid" state reset instantly instead of
      // visibly popping back to the empty form while the phone phase is
      // still fading out.
      qrAnim.classList.add('qr-resetting');
      qrPhases.forEach(function (p) { p.classList.remove('active'); });
      qrScreen.classList.remove('paid');
      qrPayBtn.classList.remove('pressed');
      Object.keys(qrTypeFields).forEach(function (k) { qrTypeFields[k].textContent = ''; });
      void qrAnim.offsetWidth;
      requestAnimationFrame(function () { qrAnim.classList.remove('qr-resetting'); });

      var t = 300;
      var at = function (delay, fn) { setTimeout(fn, t); t += delay; };

      at(2200, function () { qrPhases[0].classList.add('active'); });                 // invoice
      at(2200, function () {                                                          // zoom
        qrPhases[0].classList.remove('active');
        qrPhases[1].classList.add('active');
      });
      at(1600, function () {                                                          // phone, empty form
        qrPhases[1].classList.remove('active');
        qrPhases[2].classList.add('active');
      });
      at(560, function () { qrType('name', 'Jane Doe', 70); });                        // type cardholder name
      at(900, function () { qrType('card', '4242 4242 4242 4242', 45); });             // type card number
      at(950, function () { qrType('exp', '12/28', 50); });                            // type expiry
      at(350, function () { qrType('cvv', '123', 60); });                              // type CVV
      at(500, function () { qrPayBtn.classList.add('pressed'); });                     // press pay
      at(400, function () {
        qrPayBtn.classList.remove('pressed');
        qrScreen.classList.add('paid');                                                // show success
      });
      at(3600, function () {                                                          // pause on the success screen
        qrRunning = false;
        qrAutoRuns++;
        if (qrAutoRuns < DEMO_ANIM_MAX_AUTO_RUNS) runQrSequence();
      });
    }
    runQrSequence();

    qrAnim.closest('.cell').addEventListener('mouseenter', function () {
      if (!qrRunning) runQrSequence();
    });
  }

  // Payment links tile: chat messages appear one by one (with a typing
  // indicator between turns), the link gets a tap animation, then the tile
  // crossfades through checkout -> paid.
  var plAnim = document.querySelector('.pl-anim');
  if (plAnim) {
    var plPhaseChat = plAnim.querySelector('.pl-phase-chat');
    var plPhaseCheckout = plAnim.querySelector('.pl-phase-checkout');
    var plPhasePaid = plAnim.querySelector('.pl-phase-paid');
    var plCheck = plAnim.querySelector('.pl-check');
    var plSteps = Array.prototype.slice.call(plPhaseChat.children);
    var plLink = plSteps[6];
    var plRipple = plLink.querySelector('.pl-tap-ripple');
    var plRunning = false;
    var plAutoRuns = 0;

    function runPlSequence() {
      plRunning = true;

      // Reset with transitions suspended for a frame, so bubbles from the
      // previous cycle disappear instantly instead of fading out on top of
      // the chat phase fading back in (which briefly showed the full,
      // already-completed conversation before the reveal restarted).
      plAnim.classList.add('pl-resetting');
      plPhaseChat.classList.add('active');
      plPhaseCheckout.classList.remove('active');
      plPhasePaid.classList.remove('active');
      plCheck.classList.remove('animate');
      plLink.classList.remove('pressed');
      plRipple.classList.remove('tap');
      plSteps.forEach(function (s) { s.classList.remove('show'); });
      void plAnim.offsetWidth; // force the no-transition state to apply before re-enabling it
      requestAnimationFrame(function () { plAnim.classList.remove('pl-resetting'); });

      var t = 400;
      var at = function (delay, fn) { setTimeout(fn, t); t += delay; };

      at(700, function () { plSteps[0].classList.add('show'); });              // client: question
      at(900, function () { plSteps[1].classList.add('show'); });              // typing...
      at(900, function () {                                                    // agent reply
        plSteps[1].classList.remove('show');
        plSteps[2].classList.add('show');
      });
      at(700, function () { plSteps[3].classList.add('show'); });              // client: how do I pay?
      at(900, function () { plSteps[4].classList.add('show'); });              // typing...
      at(900, function () {                                                    // agent: follow the link below
        plSteps[4].classList.remove('show');
        plSteps[5].classList.add('show');
      });
      at(700, function () { plLink.classList.add('show'); });                  // agent sends link
      at(700, function () {
        plLink.classList.add('pressed');                                      // tap the link...
        plRipple.classList.add('tap');
      });
      at(450, function () {
        plLink.classList.remove('pressed');
        plPhaseChat.classList.remove('active');
        plPhaseCheckout.classList.add('active');                              // ...before moving to checkout
      });
      at(1800, function () {
        plPhaseCheckout.classList.remove('active');
        plPhasePaid.classList.add('active');
        plCheck.classList.add('animate');                                     // animate the checkmark in
      });
      at(3600, function () {                                                  // pause on "Paid" before looping
        plRunning = false;
        plAutoRuns++;
        if (plAutoRuns < DEMO_ANIM_MAX_AUTO_RUNS) runPlSequence();
      });
    }
    runPlSequence();

    plAnim.closest('.cell').addEventListener('mouseenter', function () {
      if (!plRunning) runPlSequence();
    });
  }

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

      var recaptchaField = partnerForm.querySelector('.recaptcha-field');
      var recaptchaValid = window.grecaptcha ? !!grecaptcha.getResponse().length : true;
      if (recaptchaField) recaptchaField.classList.toggle('invalid', !recaptchaValid);

      if (!name.value.trim() || !emailValid || !recaptchaValid) return;

      var payload = {
        reason: 'Become a partner',
        name: name.value.trim(),
        email: email.value.trim(),
        phone: phone.value.trim(),
        company: company.value.trim(),
        url: url.value.trim(),
        note: note.value.trim()
      };

      function mailtoFallback() {
        var subject = 'Partner inquiry: ' + (payload.company || payload.name);
        var body = 'Reason: ' + payload.reason +
          '\nName: ' + payload.name +
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
        if (window.grecaptcha) grecaptcha.reset();
        partnerForm.hidden = true;
        document.getElementById('partnerDone').hidden = false;
      }).catch(function () {
        if (window.grecaptcha) grecaptcha.reset();
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

  // Contact reason: links across the site can carry data-reason="merchant"
  // etc. so the "What can we help with?" dropdown on the homepage contact
  // form is preselected based on which CTA the visitor clicked, even across
  // a page navigation. sessionStorage carries the value across that
  // navigation; it's consumed (removed) as soon as the form picks it up.
  var CONTACT_REASON_KEY = 'secpaid-contact-reason';
  document.querySelectorAll('a[data-reason]').forEach(function (a) {
    a.addEventListener('click', function () {
      try { sessionStorage.setItem(CONTACT_REASON_KEY, a.getAttribute('data-reason')); } catch (e) {}
    });
  });

  // Contact form (homepage): validates, then POSTs to the Zapier catch
  // hook, which fans the submission out to Slack. Falls back to a
  // pre-filled mailto if the request fails (e.g. offline, hook removed).
  var CONTACT_WEBHOOK = 'https://hooks.zapier.com/hooks/catch/19990653/41vyna2/';
  var contactForm = document.getElementById('contactForm');
  if (contactForm) {
    var reasonSelect = document.getElementById('cReason');
    if (reasonSelect) {
      var savedReason = null;
      try { savedReason = sessionStorage.getItem(CONTACT_REASON_KEY); } catch (e) {}
      if (savedReason && reasonSelect.querySelector('option[value="' + savedReason + '"]')) {
        reasonSelect.value = savedReason;
      }
      try { sessionStorage.removeItem(CONTACT_REASON_KEY); } catch (e) {}
    }

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

      var recaptchaField = contactForm.querySelector('.recaptcha-field');
      var recaptchaValid = window.grecaptcha ? !!grecaptcha.getResponse().length : true;
      if (recaptchaField) recaptchaField.classList.toggle('invalid', !recaptchaValid);

      if (!name.value.trim() || !emailValid || !recaptchaValid) return;

      var payload = {
        name: name.value.trim(),
        email: email.value.trim(),
        phone: phone.value.trim(),
        company: company.value.trim(),
        url: url.value.trim(),
        note: note.value.trim(),
        reason: reasonSelect && reasonSelect.selectedIndex > -1 ? reasonSelect.options[reasonSelect.selectedIndex].text : ''
      };

      function mailtoFallback() {
        var subject = 'Contact form: ' + payload.name;
        var body = 'Reason: ' + (payload.reason || '-') +
          '\nName: ' + payload.name +
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
        if (window.grecaptcha) grecaptcha.reset();
        contactForm.hidden = true;
        document.getElementById('contactDone').hidden = false;
      }).catch(function () {
        if (window.grecaptcha) grecaptcha.reset();
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
