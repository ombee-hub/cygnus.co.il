(() => {
  const header = document.getElementById('siteHeader');
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.primary-nav');
  const yearEl = document.getElementById('year');

  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const onScroll = () => {
    if (header) header.classList.toggle('scrolled', window.scrollY > 12);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    nav.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Contact form
  const form = document.getElementById('contactForm');
  if (form) {
    const success = form.querySelector('.form-success');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      form.reset();
      if (success) {
        success.hidden = false;
        success.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  }

  // ============ Cookie Banner ============
  const COOKIE_KEY = 'cygnus_cookie_v1';
  if (!localStorage.getItem(COOKIE_KEY)) {
    const banner = document.createElement('div');
    banner.className = 'cookie-banner';
    banner.id = 'cookieBanner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'הודעת עוגיות');
    banner.innerHTML = `
      <div class="container cookie-wrap">
        <div class="cookie-content">
          <span class="cookie-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5z"/>
              <circle cx="8.5" cy="9.5" r="1" fill="currentColor"/>
              <circle cx="15.5" cy="14" r="1" fill="currentColor"/>
              <circle cx="11" cy="14.5" r="1" fill="currentColor"/>
              <circle cx="14.5" cy="9" r=".8" fill="currentColor"/>
            </svg>
          </span>
          <p>
            <strong>האתר משתמש באחסון מקומי בדפדפן</strong>
            לשמירת העדפות הנגישות שלכם בלבד. איננו אוספים נתונים אישיים.
            <a href="privacy.html">למדיניות הפרטיות המלאה</a>
          </p>
        </div>
        <div class="cookie-actions">
          <button class="btn btn-primary btn-sm cookie-accept" type="button">הבנתי</button>
          <button class="cookie-close" type="button" aria-label="סגירה">×</button>
        </div>
      </div>
    `;
    document.body.appendChild(banner);
    document.body.classList.add('cookie-shown');
    requestAnimationFrame(() => {
      setTimeout(() => banner.classList.add('is-visible'), 200);
    });

    const dismiss = () => {
      try { localStorage.setItem(COOKIE_KEY, 'accepted'); } catch {}
      banner.classList.remove('is-visible');
      setTimeout(() => {
        banner.remove();
        document.body.classList.remove('cookie-shown');
      }, 400);
    };
    banner.querySelector('.cookie-accept').addEventListener('click', dismiss);
    banner.querySelector('.cookie-close').addEventListener('click', dismiss);
  }

  // Nav Dropdown (פתרונות)
  const dropdowns = Array.from(document.querySelectorAll('.nav-dropdown'));
  if (dropdowns.length) {
    const closeAll = () => {
      dropdowns.forEach(dd => {
        dd.classList.remove('is-open');
        const t = dd.querySelector('.nav-dropdown-toggle');
        if (t) t.setAttribute('aria-expanded', 'false');
      });
    };
    dropdowns.forEach(dd => {
      const toggleBtn = dd.querySelector('.nav-dropdown-toggle');
      if (!toggleBtn) return;
      toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const wasOpen = dd.classList.contains('is-open');
        closeAll();
        if (!wasOpen) {
          dd.classList.add('is-open');
          toggleBtn.setAttribute('aria-expanded', 'true');
        }
      });
      // close on inner link click
      dd.querySelectorAll('.nav-dropdown-menu a').forEach(a => {
        a.addEventListener('click', () => closeAll());
      });
    });
    document.addEventListener('click', (e) => {
      if (!dropdowns.some(dd => dd.contains(e.target))) closeAll();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeAll();
    });
  }

  // ============ Accessibility Widget ============
  const a11yWidget = document.getElementById('a11yWidget');
  const a11yToggle = document.getElementById('a11yToggle');
  const a11yPanel = document.getElementById('a11yPanel');
  const a11yClose = document.getElementById('a11yClose');
  const a11yCells = Array.from(document.querySelectorAll('.a11y-cell'));
  const a11yResetBtn = document.querySelector('.a11y-reset-btn');
  const a11yBigSwitch = document.querySelector('input[data-acc="big-widget"]');

  const ACC_KEY = 'cygnus_acc_v2';

  // Map of toggleable features → body class names
  const TOGGLES = {
    links: 'acc-links',
    contrast: 'acc-contrast',
    spacing: 'acc-spacing',
    'big-text': 'acc-big-text',         // applied on <html>
    'hide-images': 'acc-hide-images',
    'no-anim': 'acc-no-anim',
    cursor: 'acc-cursor',
    dyslexia: 'acc-dyslexia',
    'line-height': 'acc-line-height',
    tooltips: 'acc-tooltips',
    calm: 'acc-calm',
    'text-align': 'acc-text-align'
  };
  const HTML_TOGGLES = new Set(['big-text']);

  const loadAcc = () => {
    try { return JSON.parse(localStorage.getItem(ACC_KEY) || '{}'); }
    catch { return {}; }
  };
  const saveAcc = (s) => {
    try { localStorage.setItem(ACC_KEY, JSON.stringify(s)); } catch {}
  };

  const applyAcc = (s) => {
    const html = document.documentElement;
    const body = document.body;
    Object.entries(TOGGLES).forEach(([key, cls]) => {
      const target = HTML_TOGGLES.has(key) ? html : body;
      target.classList.toggle(cls, !!s[key]);
    });
    a11yCells.forEach(btn => {
      const k = btn.dataset.acc;
      if (TOGGLES[k]) {
        const on = !!s[k];
        btn.classList.toggle('is-on', on);
        btn.setAttribute('aria-pressed', String(on));
      }
    });
    if (a11yWidget) a11yWidget.classList.toggle('is-big', !!s['big-widget']);
    if (a11yBigSwitch) a11yBigSwitch.checked = !!s['big-widget'];
  };

  let acc = loadAcc();
  applyAcc(acc);

  if (a11yToggle && a11yPanel) {
    // Make sure starting state is closed (panel hidden via class, not attribute)
    a11yPanel.removeAttribute('hidden');
    a11yPanel.classList.remove('is-open');
    a11yPanel.setAttribute('aria-hidden', 'true');

    const setOpen = (open) => {
      a11yPanel.classList.toggle('is-open', open);
      a11yPanel.setAttribute('aria-hidden', String(!open));
      a11yToggle.setAttribute('aria-expanded', String(open));
    };
    a11yToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      setOpen(!a11yPanel.classList.contains('is-open'));
    });
    if (a11yClose) a11yClose.addEventListener('click', () => setOpen(false));
    document.addEventListener('click', (e) => {
      if (a11yPanel.classList.contains('is-open') && !a11yPanel.contains(e.target) && e.target !== a11yToggle && !a11yToggle.contains(e.target)) {
        setOpen(false);
      }
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && a11yPanel.classList.contains('is-open')) setOpen(false);
    });
  }

  // Cell toggles
  a11yCells.forEach(btn => {
    btn.addEventListener('click', () => {
      const k = btn.dataset.acc;
      if (TOGGLES[k]) {
        acc[k] = !acc[k];
        saveAcc(acc);
        applyAcc(acc);
      }
    });
  });

  // Big-widget switch
  if (a11yBigSwitch) {
    a11yBigSwitch.addEventListener('change', () => {
      acc['big-widget'] = a11yBigSwitch.checked;
      saveAcc(acc);
      applyAcc(acc);
    });
  }

  // Reset button
  if (a11yResetBtn) {
    a11yResetBtn.addEventListener('click', () => {
      acc = {};
      saveAcc(acc);
      applyAcc(acc);
    });
  }
})();
