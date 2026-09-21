/**
 * GoTogether — i18n bootstrap (i18next + browser language detector)
 * Vanilla JS stack — no React; exposes window.GoTogetherI18n
 */
(function () {
  'use strict';

  var SUPPORTED = ['en', 'uk', 'ru', 'de', 'cs', 'pl'];
  var DEFAULT_LANG = 'en';
  var USER_NAME = 'Anna';
  var LANG_SWITCH_LABELS = {
    en: 'EN',
    uk: 'UA',
    ru: 'RU',
    de: 'DE',
    cs: 'CS',
    pl: 'PL',
  };

  var THEME_GREETING_KEYS = {
    morning: { title: 'good_morning', lead: 'home_greeting_lead', trending: 'trending_morning' },
    daytime: { title: 'good_afternoon', lead: 'home_greeting_lead', trending: 'trending_afternoon' },
    night: { title: 'good_evening', lead: 'home_greeting_lead', trending: 'trending_night' },
  };

  var THEME_LABEL_KEYS = {
    morning: 'theme_morning',
    daytime: 'theme_day',
    night: 'theme_night',
  };

  function normalizeLang(lng) {
    if (!lng) return DEFAULT_LANG;
    var base = String(lng).toLowerCase().split('-')[0];
    if (base === 'ua') base = 'uk';
    return SUPPORTED.indexOf(base) !== -1 ? base : DEFAULT_LANG;
  }

  function loadLocale(lang) {
    return fetch('locales/' + lang + '.json')
      .then(function (res) {
        if (!res.ok) throw new Error('Locale load failed: ' + lang);
        return res.json();
      });
  }

  function loadAllLocales() {
    return Promise.all(
      SUPPORTED.map(function (lang) {
        return loadLocale(lang).then(function (data) {
          return { lang: lang, data: data };
        });
      })
    ).then(function (entries) {
      var resources = {};
      entries.forEach(function (entry) {
        resources[entry.lang] = { translation: entry.data };
      });
      return resources;
    });
  }

  function resolveTranslation(key, el) {
    if (!window.i18next || !key) return '';

    var value = window.i18next.t(key);
    if (value && value !== key) return value;

    var fallback = el && el.getAttribute('data-i18n-fallback');
    if (fallback) return fallback;

    return value || key;
  }

  function syncLangSwitcherLabels() {
    document.querySelectorAll('.vgt-lang-switch__btn[data-lang]').forEach(function (btn) {
      var lang = btn.getAttribute('data-lang');
      var label =
        btn.getAttribute('data-lang-label') ||
        LANG_SWITCH_LABELS[lang] ||
        (lang ? lang.toUpperCase() : '');

      if (!label) return;

      btn.textContent = label;
      btn.setAttribute('aria-label', label);
    });
  }

  function applyDomTranslations() {
    if (!window.i18next) {
      syncLangSwitcherLabels();
      return;
    }

    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      if (el.classList.contains('vgt-lang-switch__btn')) return;

      var key = el.getAttribute('data-i18n');
      if (!key) return;

      var value = resolveTranslation(key, el);
      if (!value) return;

      if (el.hasAttribute('data-i18n-html')) {
        el.innerHTML = value;
      } else {
        el.textContent = value;
      }
    });

    document.querySelectorAll('[data-i18n-aria]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-aria');
      if (!key) return;
      var value = resolveTranslation(key, el);
      if (value) el.setAttribute('aria-label', value);
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-placeholder');
      if (!key) return;
      var value = resolveTranslation(key, el);
      if (value) el.setAttribute('placeholder', value);
    });

    syncLangSwitcherLabels();
  }

  function syncDocumentLang() {
    if (!window.i18next) return;
    document.documentElement.lang = window.i18next.language || DEFAULT_LANG;
  }

  function t(key, options) {
    if (!window.i18next) return key;
    return window.i18next.t(key, options);
  }

  function getThemeLabel(themeName) {
    var key = THEME_LABEL_KEYS[themeName] || THEME_LABEL_KEYS.morning;
    return t(key);
  }

  function updateLangSwitcherUi(lang) {
    var active = normalizeLang(lang);
    document.querySelectorAll('.vgt-lang-switch__btn[data-lang]').forEach(function (btn) {
      var isActive = btn.getAttribute('data-lang') === active;
      btn.classList.toggle('is-active', isActive);
      btn.setAttribute('aria-pressed', String(isActive));
    });
    syncLangSwitcherLabels();
  }

  function persistUiLanguage(lang) {
    var client =
      window.supabaseClient || (window.GO_SUPABASE && window.GO_SUPABASE.client) || null;
    if (!client) return Promise.resolve();

    return client.auth.getUser().then(function (result) {
      var user = result.data && result.data.user;
      if (!user) return null;
      return client
        .from('profiles')
        .update({ ui_language: normalizeLang(lang), updated_at: new Date().toISOString() })
        .eq('id', user.id);
    });
  }

  function syncProfileInterfaceLanguage(lang) {
    if (window.VGT_USER_PROFILE) {
      window.VGT_USER_PROFILE.interfaceLanguage = normalizeLang(lang);
    }
  }

  function changeLanguage(lang) {
    if (!window.i18next) return Promise.resolve();

    var next = normalizeLang(lang);
    return window.i18next.changeLanguage(next).then(function () {
      syncDocumentLang();
      applyDomTranslations();
      updateLangSwitcherUi(next);
      syncProfileInterfaceLanguage(next);
      persistUiLanguage(next);

      if (typeof window.GoTogetherI18n.onLanguageChanged === 'function') {
        window.GoTogetherI18n.onLanguageChanged(next);
      }

      return next;
    });
  }

  function initLangSwitcher() {
    var switchers = document.querySelectorAll('.vgt-lang-switch');
    if (!switchers.length) return;

    updateLangSwitcherUi(window.i18next ? window.i18next.language : DEFAULT_LANG);

    switchers.forEach(function (switcher) {
      if (switcher.getAttribute('data-bound')) return;
      switcher.setAttribute('data-bound', 'true');

      switcher.querySelectorAll('.vgt-lang-switch__btn[data-lang]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var lang = btn.getAttribute('data-lang');
          if (!lang) return;
          changeLanguage(lang);
        });
      });
    });
  }

  function setUserName(name) {
    if (name && String(name).trim()) {
      USER_NAME = String(name).trim();
    }
  }

  function applyHomeI18n(themeName, nearbyCount) {
    var keys = THEME_GREETING_KEYS[themeName] || THEME_GREETING_KEYS.morning;
    var titleEl = document.getElementById('vgt-greeting-title');
    var leadEl = document.getElementById('vgt-greeting-lead');
    var nearbyEl = document.getElementById('vgt-nearby-text');
    var trendingEl = document.getElementById('vgt-trending-title');

    if (titleEl) titleEl.textContent = t(keys.title, { name: USER_NAME });
    if (leadEl) leadEl.textContent = t(keys.lead);
    if (nearbyEl) nearbyEl.innerHTML = t('people_nearby', { count: nearbyCount });
    if (trendingEl) trendingEl.textContent = t(keys.trending);
  }

  function initI18n() {
    if (typeof window.i18next === 'undefined') {
      return Promise.reject(new Error('i18next is not loaded'));
    }

    return loadAllLocales()
      .catch(function (err) {
        console.warn('[GoTogether] Fetch locales failed — using inline fallback', err);
        return loadLocale('en').then(function (data) {
          return { en: { translation: data } };
        });
      })
      .then(function (resources) {
        return new Promise(function (resolve) {
          window.i18next
            .use(window.i18nextBrowserLanguageDetector)
            .init(
              {
                resources: resources,
                fallbackLng: DEFAULT_LANG,
                supportedLngs: SUPPORTED,
                nonExplicitSupportedLngs: true,
                load: 'languageOnly',
                returnEmptyString: false,
                interpolation: { escapeValue: false },
                detection: {
                  order: ['localStorage', 'navigator', 'htmlTag', 'cookie'],
                  caches: ['localStorage'],
                  lookupLocalStorage: 'vgt-lang',
                },
              },
              function (err) {
                if (err) console.warn('[GoTogether] i18next init error', err);
                syncDocumentLang();
                applyDomTranslations();
                syncProfileInterfaceLanguage(window.i18next.language);
                updateLangSwitcherUi(window.i18next.language);
                initLangSwitcher();
                document.body.classList.add('vgt-i18n-ready');
                resolve(window.i18next);
              }
            );
        });
      });
  }

  window.GoTogetherI18n = {
    init: initI18n,
    t: t,
    applyDom: applyDomTranslations,
    applyHome: applyHomeI18n,
    getThemeLabel: getThemeLabel,
    setUserName: setUserName,
    changeLanguage: changeLanguage,
    initLangSwitcher: initLangSwitcher,
    syncLangSwitcherLabels: syncLangSwitcherLabels,
    normalizeLang: normalizeLang,
    USER_NAME: USER_NAME,
    onLanguageChanged: null,
  };

  syncLangSwitcherLabels();
})();
