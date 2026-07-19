/**
 * GoTogether / VRON — script.js
 * Plain script (no ES modules) — works via file:// and http://
 */

(function () {
  'use strict';

  /* ── Theme switcher: Morning → Day → Night ── */
  var THEMES = ['morning', 'daytime', 'night'];
  var THEME_CLASSES = ['phone-morning', 'phone-daytime', 'phone-night'];

  var THEME_META = {
    morning: {
      icon: '🌅',
      label: 'Morning • Berlin',
      motto: '☕ The city feels like the first coffee.',
      suggests: 'SUNNY • THE CITY SUGGESTS',
      activities: [
        { icon: '🚶', label: 'Morning walk' },
        { icon: '🎲', label: 'Board games' },
        { icon: '☕', label: 'Coffee outside' },
      ],
      warmIcon: '☕',
    },
    daytime: {
      icon: '☀️',
      label: 'Day • Berlin',
      motto: '☕ The city feels like the first coffee.',
      suggests: 'SUNNY • THE CITY SUGGESTS',
      activities: [
        { icon: '🚶', label: 'Park walk' },
        { icon: '🎲', label: 'Board games' },
        { icon: '🍸', label: 'Terrace drinks' },
      ],
      warmIcon: '☕',
    },
    night: {
      icon: '🌙',
      label: 'Night • Berlin',
      motto: '🌃 The city feels like a good conversation.',
      suggests: 'NIGHT • THE CITY SUGGESTS',
      activities: [
        { icon: '🚶', label: 'Evening walk' },
        { icon: '🎵', label: 'Live music' },
        { icon: '🎲', label: 'Late board games' },
      ],
      warmIcon: '🍷',
    },
  };

  var themeIndex = 0;

  function renderActivities(themeName) {
    var row = document.getElementById('vgt-activities');
    if (!row) return;

    var meta = THEME_META[themeName];
    var buttons = row.querySelectorAll('.vgt-activity:not(.vgt-activity--add)');
    meta.activities.forEach(function (act, i) {
      if (!buttons[i]) return;
      var icon = buttons[i].querySelector('.vgt-activity__icon');
      var label = buttons[i].querySelector('.vgt-activity__label');
      if (icon) icon.textContent = act.icon;
      if (label) label.textContent = act.label;
    });
  }

  function applyTheme(themeName) {
    var phone = document.getElementById('app-phone');
    var btn = document.getElementById('theme-toggle-btn');
    if (!phone || !btn) return;

    THEME_CLASSES.forEach(function (cls) {
      phone.classList.remove(cls);
    });
    phone.classList.add('phone-' + themeName);

    var meta = THEME_META[themeName];

    var iconEl = btn.querySelector('.theme-toggle-btn__icon');
    var labelEl = btn.querySelector('.theme-toggle-btn__label');
    if (iconEl) iconEl.textContent = meta.icon;
    if (labelEl) labelEl.textContent = meta.label;
    btn.setAttribute('aria-label', 'Текущий режим: ' + meta.label);

    var motto = document.getElementById('vgt-motto');
    if (motto) motto.textContent = meta.motto;

    var suggestsTitle = document.getElementById('vgt-suggests-title');
    if (suggestsTitle) suggestsTitle.textContent = meta.suggests;

    var warmIcon = document.querySelector('.vgt-warm__icon');
    if (warmIcon) warmIcon.textContent = meta.warmIcon;

    renderActivities(themeName);
  }

  function initThemeToggle() {
    var btn = document.getElementById('theme-toggle-btn');
    if (!btn) {
      console.warn('[VRON] #theme-toggle-btn not found');
      return;
    }

    applyTheme(THEMES[themeIndex]);

    btn.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      themeIndex = (themeIndex + 1) % THEMES.length;
      applyTheme(THEMES[themeIndex]);
    });
  }

  /* ── In-phone tab bar (Map ↔ Pulse ↔ Alerts) ── */
  var VGT_TABS = ['map', 'pulse', 'alerts'];
  var VGT_DEFAULT_TAB = 'map';

  function switchVgtView(tabId) {
    var phone = document.getElementById('app-phone');
    if (!phone) return;

    if (VGT_TABS.indexOf(tabId) === -1) return;

    phone.querySelectorAll('.vgt-view[data-vgt-view]').forEach(function (view) {
      var viewId = view.getAttribute('data-vgt-view');
      var isActive = viewId === tabId;
      view.classList.toggle('is-active', isActive);
      view.setAttribute('aria-hidden', String(!isActive));
    });

    phone.querySelectorAll('.vgt-tabbar__btn[data-vgt-tab]').forEach(function (btn) {
      var btnTab = btn.getAttribute('data-vgt-tab');
      var isActive = btnTab === tabId;
      btn.classList.toggle('vgt-tabbar__btn--active', isActive);
      btn.setAttribute('aria-current', isActive ? 'page' : 'false');
    });
  }

  function initPulseControls() {
    var grid = document.getElementById('vgt-pulse-grid');
    if (grid) {
      grid.querySelectorAll('.vgt-pulse-cat').forEach(function (btn) {
        btn.addEventListener('click', function () {
          grid.querySelectorAll('.vgt-pulse-cat').forEach(function (b) {
            b.classList.remove('vgt-pulse-cat--selected');
          });
          btn.classList.add('vgt-pulse-cat--selected');
        });
      });
    }

    var visibility = document.getElementById('vgt-pulse-visibility');
    if (visibility) {
      visibility.querySelectorAll('.vgt-pulse-seg').forEach(function (btn) {
        btn.addEventListener('click', function () {
          visibility.querySelectorAll('.vgt-pulse-seg').forEach(function (b) {
            b.classList.remove('vgt-pulse-seg--active');
          });
          btn.classList.add('vgt-pulse-seg--active');
        });
      });
    }

    var expires = document.getElementById('vgt-pulse-expires');
    if (expires) {
      expires.querySelectorAll('.vgt-pulse-pill').forEach(function (btn) {
        btn.addEventListener('click', function () {
          expires.querySelectorAll('.vgt-pulse-pill').forEach(function (b) {
            b.classList.remove('vgt-pulse-pill--active');
          });
          btn.classList.add('vgt-pulse-pill--active');
        });
      });
    }

    var pulseBack = document.querySelector('.vgt-pulse-head__sub');
    if (pulseBack) {
      pulseBack.style.cursor = 'pointer';
      pulseBack.addEventListener('click', function () {
        switchVgtView('map');
      });
    }
  }

  function initVgtTabBar() {
    var tabbar = document.getElementById('vgt-tabbar');
    if (!tabbar) return;

    switchVgtView(VGT_DEFAULT_TAB);

    tabbar.querySelectorAll('.vgt-tabbar__btn[data-vgt-tab]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var tabId = btn.getAttribute('data-vgt-tab');
        if (VGT_TABS.indexOf(tabId) !== -1) {
          switchVgtView(tabId);
        }
      });
    });

    initPulseControls();
  }

  /* ── Phone screen switcher (landing header nav) ── */
  var DEFAULT_SCREEN = 'map';

  function switchAppScreen(screenId) {
    var phone = document.getElementById('app-phone');
    if (!phone) return;

    phone.querySelectorAll('.app-screen').forEach(function (screen) {
      var isActive = screen.getAttribute('data-screen') === screenId;
      screen.classList.toggle('is-active', isActive);
      screen.setAttribute('aria-hidden', String(!isActive));
    });

    document.querySelectorAll('.nav__link[data-screen]').forEach(function (link) {
      var isActive = link.getAttribute('data-screen') === screenId;
      link.classList.toggle('nav__link--active', isActive);
      link.setAttribute('aria-current', isActive ? 'page' : 'false');
    });

    if (screenId === 'map') {
      switchVgtView(VGT_DEFAULT_TAB);
    }
  }

  function initPhoneScreens() {
    var phone = document.getElementById('app-phone');
    var navLinks = document.querySelectorAll('.nav__link[data-screen]');
    if (!phone || !navLinks.length) return;

    switchAppScreen(DEFAULT_SCREEN);

    navLinks.forEach(function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        var screenId = link.getAttribute('data-screen');
        if (!screenId) return;
        switchAppScreen(screenId);
        phone.scrollIntoView({ behavior: 'smooth', block: 'center' });
        phone.classList.add('phone--highlight');
        setTimeout(function () {
          phone.classList.remove('phone--highlight');
        }, 1200);
      });
    });

    var backBtn = phone.querySelector('.app-profile__back');
    if (backBtn) {
      backBtn.addEventListener('click', function () {
        switchAppScreen('map');
      });
    }
  }

  /* ── Mobile nav ── */
  function initMobileNav() {
    var toggle = document.querySelector('.nav-toggle');
    var nav = document.getElementById('main-nav');
    if (!toggle || !nav) return;

    function closeNav() {
      toggle.setAttribute('aria-expanded', 'false');
      nav.classList.remove('is-open');
      document.body.style.overflow = '';
    }

    toggle.addEventListener('click', function () {
      var isOpen = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!isOpen));
      nav.classList.toggle('is-open', !isOpen);
      document.body.style.overflow = isOpen ? '' : 'hidden';
    });

    nav.querySelectorAll('.nav__link').forEach(function (link) {
      link.addEventListener('click', closeNav);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeNav();
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 768) closeNav();
    });
  }

  /* ── Scroll reveal ── */
  function initScrollReveal() {
    var sections = ['.hero__content', '.phones', '.why', '.steps', '.premium', '.download'];
    sections.forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (el) {
        el.classList.add('reveal');
      });
    });

    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('.reveal').forEach(function (el) {
        el.classList.add('is-visible');
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    document.querySelectorAll('.reveal').forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ── Header shadow ── */
  function initHeaderScroll() {
    var header = document.getElementById('header');
    if (!header) return;

    function onScroll() {
      header.classList.toggle('header--scrolled', window.scrollY > 10);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ── Bootstrap ── */
  function init() {
    initThemeToggle();
    initVgtTabBar();
    initPhoneScreens();
    initMobileNav();
    initScrollReveal();
    initHeaderScroll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
