/**
 * GoTogether — script.js
 * Home + Map screens, synced across Morning / Day / Night
 */

(function () {
  'use strict';

  var THEME_CLASSES = ['phone-morning', 'phone-daytime', 'phone-night'];

  var GEO_SLOTS = [
    { theme: 'morning', city: 'berlin', cityName: 'Berlin' },
    { theme: 'daytime', city: 'berlin', cityName: 'Berlin' },
    { theme: 'night', city: 'berlin', cityName: 'Berlin' },
  ];

  var THEME_META = {
    morning: {
      icon: '🌅',
      timeLabel: 'Morning',
      nearbyCount: 18,
      warmIcon: '☕',
      warmTitle: 'Morning Coffee',
      warmMeta: 'Sofie • Prenzlauer Berg • 6 min walk',
      warmPersonId: 'sofie',
      warmMatch: '92% match',
      warmGoing: '3 going',
      trends: [
        {
          emoji: '🌅',
          label: 'Sunrise Walk',
          thumbClass: 'sunrise',
          img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80',
          gradient: 'linear-gradient(145deg, #fb923c 0%, #9a3412 100%)',
        },
        {
          emoji: '🗣️',
          label: 'Language Exchange',
          thumbClass: 'language',
          img: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&q=80',
          gradient: 'linear-gradient(145deg, #38bdf8 0%, #1d4ed8 100%)',
        },
        {
          emoji: '🧘',
          label: 'Park Yoga',
          thumbClass: 'yoga',
          img: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&q=80',
          gradient: 'linear-gradient(145deg, #4ade80 0%, #166534 100%)',
        },
        {
          emoji: '🍿',
          label: 'Cinema Vibe',
          thumbClass: 'cinema',
          img: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&q=80',
          gradient: 'linear-gradient(145deg, #a78bfa 0%, #5b21b6 100%)',
        },
      ],
      moodIcon: '☀️',
      moodTitle: 'Bright & Calm',
      moodDesc: 'Soft light, quiet streets — perfect for a slow start.',
      moodVibe: '85% vibe',
      mapCenter: [52.52, 13.405],
      mapZoom: 12,
    },
    daytime: {
      icon: '☀️',
      timeLabel: 'Day',
      nearbyCount: 24,
      warmIcon: '☕',
      warmTitle: 'Terrace Coffee',
      warmMeta: 'Emil • Kreuzberg • 8 min walk',
      warmPersonId: 'emil',
      warmMatch: '88% match',
      warmGoing: '5 going',
      trends: [
        { label: 'Lake Walk', img: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=320&q=80' },
        { label: 'Board Games', img: 'https://images.unsplash.com/photo-1611996577252-0c4c8c8b8f8e?w=320&q=80' },
        { label: 'Rooftop Drinks', img: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=320&q=80' },
        { label: 'Art Gallery', img: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a2b?w=320&q=80' },
      ],
      moodIcon: '🌤',
      moodTitle: 'Warm & Social',
      moodDesc: 'Sun on the facades — people are stepping outside.',
      moodVibe: '91% vibe',
      mapCenter: [41.8781, -87.6298],
      mapZoom: 12,
    },
    night: {
      icon: '🌙',
      timeLabel: 'Night',
      nearbyCount: 12,
      warmIcon: '🍷',
      warmTitle: 'Late Wine & Talk',
      warmMeta: 'Андrey • Vinohrady • 7 min walk',
      warmPersonId: 'andrey',
      warmMatch: '94% match',
      warmGoing: '2 going',
      trends: [
        { label: 'Jazz Bar', img: 'https://images.unsplash.com/photo-1511192338945-5e0f4c8c8b8e?w=320&q=80' },
        { label: 'Night Walk', img: 'https://images.unsplash.com/photo-1514565131-fce08012aa87?w=320&q=80' },
        { label: 'Cinema', img: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=320&q=80' },
        { label: 'Live Music', img: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=320&q=80' },
      ],
      moodIcon: '🌙',
      moodTitle: 'Velvet & Intimate',
      moodDesc: 'Low lights, deep conversations — the city slows down.',
      moodVibe: '78% vibe',
      mapCenter: [50.0755, 14.4378],
      mapZoom: 12,
    },
  };

  var geoIndex = 0;

  var VGT_TABS = ['home', 'map', 'pulse', 'companion', 'you'];
  var VGT_VIEWS = ['home', 'map', 'pulse', 'companion', 'chat', 'you'];
  var COMPANION_LOW_EVENT_THRESHOLD = 2;
  var VGT_DEFAULT_TAB = 'home';
  var appUnlocked = false;
  var STARTUP_LEAVE_MS = 500;

  /** User profile language preferences (UI + spoken) */
  var VGT_USER_PROFILE = {
    interfaceLanguage: 'en',
    spokenLanguages: ['UKR', 'DEU'],
    practiceLanguages: ['DEU', 'ENG'],
    displayName: 'Anna',
    full_name: '',
    bio: '',
    hobbies: [],
    avatar_url: '',
    email: '',
  };
  window.VGT_USER_PROFILE = VGT_USER_PROFILE;

  var vgtProfile = {
    userId: null,
    email: '',
    full_name: '',
    bio: '',
    hobbies: [],
    avatar_url: '',
    pendingAvatarFile: null,
    pendingAvatarPreview: '',
    saving: false,
  };

  var PLACEHOLDER_AVATAR_PATTERNS = [
    'unsplash.com',
    'placeholder',
    'gravatar.com/avatar/?',
  ];

  var vgtMap = {
    map: null,
    tileLayer: null,
    initialized: false,
    markers: [],
    activeFilter: 'all',
    selectedEventId: null,
    userLocation: null,
    userMarker: null,
    routingControl: null,
    routeLoading: false,
    routeRequestId: 0,
    pendingRouteRequestId: 0,
    lastRouteSummary: null,
    geocoder: null,
    searchDebounce: null,
    activeCityKey: 'berlin',
  };

  var MAP_FLY_DURATION = 2.5;
  var MAP_CITY_ZOOM = 13;

  /** Quick-travel destinations (European cities) */
  var MAP_QUICK_CITIES = {
    berlin: { key: 'berlin', labelKey: 'city_berlin', fallback: 'Berlin', center: [52.52, 13.405] },
    kyiv: { key: 'kyiv', labelKey: 'city_kyiv', fallback: 'Kyiv', center: [50.4501, 30.5234] },
    prague: { key: 'prague', labelKey: 'city_prague', fallback: 'Prague', center: [50.0755, 14.4378] },
    warsaw: { key: 'warsaw', labelKey: 'city_warsaw', fallback: 'Warsaw', center: [52.2297, 21.0122] },
    vienna: { key: 'vienna', labelKey: 'city_vienna', fallback: 'Vienna', center: [48.2082, 16.3738] },
    paris: { key: 'paris', labelKey: 'city_paris', fallback: 'Paris', center: [48.8566, 2.3522] },
    barcelona: {
      key: 'barcelona',
      labelKey: 'city_barcelona',
      fallback: 'Barcelona',
      center: [41.3851, 2.1734],
    },
    valencia: {
      key: 'valencia',
      labelKey: 'city_valencia',
      fallback: 'Valencia',
      center: [39.4699, -0.3763],
    },
  };

  var CITY_SHEET_KEYS = [
    'berlin',
    'kyiv',
    'prague',
    'warsaw',
    'valencia',
    'barcelona',
    'vienna',
    'paris',
  ];

  /** Berlin Mitte — default route origin when geolocation is unavailable */
  var BERLIN_MITTE = [52.520008, 13.404954];

  /** Berlin — default map viewport (events are placed here) */
  var BERLIN_MAP = {
    center: [52.52, 13.405],
    zoom: 13,
    cityKey: 'berlin',
  };

  function getMapCityLabel() {
    var key = vgtMap.activeCityKey || 'berlin';
    if (key === 'my-location') {
      return tMap('map_my_location').replace(/^📍\s*/, '');
    }

    var city = MAP_QUICK_CITIES[key];
    if (!city) return tMap('city_berlin');

    var translated = tMap(city.labelKey);
    return translated !== city.labelKey ? translated : city.fallback;
  }

  function setActiveMapCity(cityKey) {
    vgtMap.activeCityKey = cityKey || 'berlin';

    var sheetList = $('vgt-city-sheet-list');
    if (sheetList) {
      sheetList.querySelectorAll('[data-map-city]').forEach(function (btn) {
        btn.classList.toggle('is-active', btn.getAttribute('data-map-city') === vgtMap.activeCityKey);
      });
    }

    var fab = $('vgt-map-city-fab');
    if (fab) {
      fab.setAttribute('title', getMapCityLabel());
      fab.setAttribute('aria-label', (tMap('city_sheet_choose') || 'Choose city') + ': ' + getMapCityLabel());
    }

    var phone = $('app-phone');
    if (phone) phone.setAttribute('data-vgt-city', resolveCityKey(vgtMap.activeCityKey));

    updateThemePillLabels(getCurrentTheme());
    updateCompanionDashboard();
  }

  function openCitySheet() {
    var sheet = $('vgt-city-sheet');
    if (!sheet) return;
    sheet.hidden = false;
    document.body.classList.add('vgt-city-sheet-open');
    setActiveMapCity(vgtMap.activeCityKey);
  }

  function closeCitySheet() {
    var sheet = $('vgt-city-sheet');
    if (!sheet) return;
    sheet.hidden = true;
    document.body.classList.remove('vgt-city-sheet-open');
  }

  function selectCityFromSheet(cityKey) {
    if (!cityKey) return;
    flyToMapQuick(cityKey);
    closeCitySheet();
  }

  function flyToMapQuick(quickKey) {
    if (!vgtMap.map) return;

    if (quickKey === 'my-location') {
      setActiveMapCity('my-location');
      refreshUserLocation(false);
      var loc = vgtMap.userLocation || BERLIN_MITTE;
      vgtMap.map.flyTo(loc, MAP_CITY_ZOOM, { animate: true, duration: MAP_FLY_DURATION });
      return;
    }

    var city = MAP_QUICK_CITIES[quickKey];
    if (!city) return;

    setActiveMapCity(quickKey);
    vgtMap.map.flyTo(city.center, MAP_CITY_ZOOM, { animate: true, duration: MAP_FLY_DURATION });
  }

  function initCitySheetModal() {
    var fab = $('vgt-map-city-fab');
    var sheet = $('vgt-city-sheet');
    if (!fab || !sheet || sheet.getAttribute('data-bound')) return;

    sheet.setAttribute('data-bound', 'true');

    if (typeof L !== 'undefined' && L.DomEvent) {
      L.DomEvent.disableClickPropagation(fab);
    }

    fab.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      openCitySheet();
    });

    sheet.querySelectorAll('[data-city-sheet-close]').forEach(function (btn) {
      btn.addEventListener('click', function (event) {
        event.preventDefault();
        closeCitySheet();
      });
    });

    var list = $('vgt-city-sheet-list');
    if (list) {
      list.querySelectorAll('[data-map-city]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          selectCityFromSheet(btn.getAttribute('data-map-city'));
        });
      });
    }

    setActiveMapCity(vgtMap.activeCityKey || 'berlin');
  }

  function updateThemePillLabels(themeName) {
    var phone = $('app-phone');
    if (!phone) return;

    var meta = THEME_META[themeName] || THEME_META.morning;
    var timeLabel =
      window.GoTogetherI18n && GoTogetherI18n.getThemeLabel
        ? GoTogetherI18n.getThemeLabel(themeName)
        : meta.timeLabel;
    var pillLabel = timeLabel + ' • ' + getMapCityLabel();

    phone.querySelectorAll('[data-vgt-theme-toggle]').forEach(function (btn) {
      var iconEl = btn.querySelector('.theme-toggle-btn__icon');
      var labelEl = btn.querySelector('.theme-toggle-btn__label');
      if (iconEl) iconEl.textContent = meta.icon;
      if (labelEl) labelEl.textContent = pillLabel;
      btn.setAttribute('aria-label', pillLabel);
    });
  }

  /** CartoDB basemaps — Positron (light) / Dark Matter (night) */
  var MAP_TILES = {
    light: {
      label: 'CartoDB Positron',
      url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
      subdomains: 'abcd',
      maxZoom: 18,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    },
    dark: {
      label: 'CartoDB Dark Matter',
      url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      subdomains: 'abcd',
      maxZoom: 18,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    },
  };

  function getMapTileConfig(themeName) {
    return themeName === 'night' ? MAP_TILES.dark : MAP_TILES.light;
  }

  var MAP_EVENTS = [];

  var CATEGORY_ICONS = {
    coffee: '☕',
    games: '🎲',
    language: '💬',
    walks: '🚶',
    yoga: '🧘',
  };

  var goModalState = {
    selectedCategory: 'coffee',
    publishing: false,
  };

  function getSupabaseClient() {
    return window.supabaseClient || (window.GO_SUPABASE && window.GO_SUPABASE.client) || null;
  }

  function getCategoryIcon(category) {
    return CATEGORY_ICONS[category] || '📍';
  }

  function normalizeDbEvent(row) {
    var profile = row.profiles || null;
    var creatorName =
      profile && profile.full_name
        ? profile.full_name
        : row.profiles && row.profiles.full_name
          ? row.profiles.full_name
          : null;
    var metaBase = creatorName
      ? creatorName + (row.time_text ? ' • ' + row.time_text : '')
      : row.time_text || row.title;

    return {
      id: row.id,
      category: row.category,
      icon: getCategoryIcon(row.category),
      title: row.title,
      metaBase: metaBase,
      meta: metaBase,
      personId: null,
      lat: row.latitude,
      lng: row.longitude,
      creatorId: row.creator_id,
      creatorName: creatorName,
    };
  }

  function isDbColumnMissingError(err, columnName) {
    if (!err) return false;
    var msg = String(err.message || err.details || err.hint || '').toLowerCase();
    var col = String(columnName || '').toLowerCase();
    return msg.indexOf(col) !== -1 && (msg.indexOf('column') !== -1 || msg.indexOf('schema') !== -1);
  }

  function fetchActiveEvents(client) {
    return client
      .from('events')
      .select('*, profiles:creator_id (id, full_name, avatar_url)')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .then(function (result) {
        if (result.error && isDbColumnMissingError(result.error, 'is_active')) {
          console.warn('[GoTogether] is_active column missing — loading all events. Run schema migration.');
          return client
            .from('events')
            .select('*, profiles:creator_id (id, full_name, avatar_url)')
            .order('created_at', { ascending: false });
        }
        return result;
      });
  }

  function buildEventInsertPayload(userId, title, category, lat, lng) {
    return {
      creator_id: userId,
      title: title,
      category: category,
      latitude: lat,
      longitude: lng,
      time_text: 'Just now',
      is_active: true,
    };
  }

  function insertMapEvent(client, payload) {
    return client
      .from('events')
      .insert(payload)
      .select('*')
      .single()
      .then(function (result) {
        if (result.error && isDbColumnMissingError(result.error, 'is_active') && payload.is_active !== undefined) {
          console.warn('[GoTogether] is_active column missing — run schema migration. Inserting without it.');
          var fallback = {
            creator_id: payload.creator_id,
            title: payload.title,
            category: payload.category,
            latitude: payload.latitude,
            longitude: payload.longitude,
            time_text: payload.time_text,
          };
          return client.from('events').insert(fallback).select('*').single();
        }
        return result;
      });
  }

  function loadMapEventsFromSupabase() {
    var client = getSupabaseClient();

    if (!client) {
      MAP_EVENTS = [];
      return Promise.resolve(MAP_EVENTS);
    }

    return fetchActiveEvents(client)
      .then(function (result) {
        if (result.error) {
          console.warn('[GoTogether] Failed to load events from Supabase', result.error);
          MAP_EVENTS = [];
          return MAP_EVENTS;
        }

        MAP_EVENTS = (result.data || []).map(normalizeDbEvent);
        return MAP_EVENTS;
      })
      .catch(function (err) {
        console.warn('[GoTogether] Events fetch error', err);
        MAP_EVENTS = [];
        return MAP_EVENTS;
      });
  }

  function refreshMapMarkers() {
    return loadMapEventsFromSupabase().then(function () {
      if (vgtMap.map) renderMapEventMarkers();
      return MAP_EVENTS;
    });
  }

  function getActiveSessionUser() {
    var client = getSupabaseClient();
    if (!client) return Promise.resolve(null);

    return client.auth.getUser().then(function (result) {
      if (result.error) {
        console.warn('[GoTogether] getUser failed', result.error);
        return null;
      }
      return result.data && result.data.user ? result.data.user : null;
    });
  }

  function ensureUserProfile(user) {
    var client = getSupabaseClient();
    if (!client || !user) {
      applyAuthenticatedUser(user, null);
      return Promise.resolve(null);
    }

    return client
      .from('profiles')
      .select('id, full_name, avatar_url, bio, hobbies, ui_language, spoken_languages')
      .eq('id', user.id)
      .maybeSingle()
      .then(function (result) {
        if (result.error) {
          console.warn('[GoTogether] Profile lookup failed', result.error);
        }

        if (result.data) {
          return loadUserProfile(user);
        }

        var metaName = user.user_metadata && user.user_metadata.full_name;
        var fallbackName =
          metaName && !isEmailLikeName(metaName, user.email) ? String(metaName).trim() : '';

        return client
          .from('profiles')
          .upsert(
            {
              id: user.id,
              full_name: fallbackName,
              ui_language: VGT_USER_PROFILE.interfaceLanguage || 'en',
              spoken_languages: VGT_USER_PROFILE.spokenLanguages || [],
            },
            { onConflict: 'id' }
          )
          .then(function (upsertResult) {
            if (upsertResult.error) {
              console.warn('[GoTogether] Profile upsert failed', upsertResult.error);
            }
            return loadUserProfile(user);
          });
      });
  }

  var TRENDING_THUMB_CLASSES = ['sunrise', 'language', 'yoga', 'cinema'];

  function isPlaceholderDisplayName(name) {
    if (!name || !String(name).trim()) return true;
    var trimmed = String(name).trim();
    if (/^guest$/i.test(trimmed)) return true;
    return false;
  }

  function getUserDisplayName(user, profile) {
    var name = '';
    if (profile && profile.full_name) name = String(profile.full_name).trim();
    if (!name && vgtProfile.full_name) name = String(vgtProfile.full_name).trim();
    if (!name && user && user.user_metadata && user.user_metadata.full_name) {
      name = String(user.user_metadata.full_name).trim();
    }
    if (name && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(name)) name = '';
    if (isPlaceholderDisplayName(name)) name = '';
    if (name) return name;
    if (!user) return 'Anna';
    return 'Anna';
  }

  function refreshHomeGreetingName() {
    if (!window.GoTogetherI18n) return;
    var name = vgtProfile.full_name && String(vgtProfile.full_name).trim();
    if (isPlaceholderDisplayName(name)) name = '';
    if (!name && VGT_USER_PROFILE.full_name) {
      name = String(VGT_USER_PROFILE.full_name).trim();
      if (isPlaceholderDisplayName(name)) name = '';
    }
    if (name) {
      GoTogetherI18n.setUserName(name);
      GoTogetherI18n.applyHome(getCurrentTheme(), getThemeMeta().nearbyCount);
    }
  }

  function initGreetingSparkle() {
    var el = $('vgt-greeting-badge');
    if (!el) return;
    el.className = 'vgt-greeting-sparkle';
    el.textContent = '✨';
    el.hidden = false;
    el.setAttribute('aria-hidden', 'true');
  }

  function buildTrendingThumbBackground(item) {
    var gradient =
      item.gradient || 'linear-gradient(145deg, #475569 0%, #0f172a 100%)';
    var overlay =
      'linear-gradient(180deg, rgba(15, 23, 42, 0.38) 0%, rgba(15, 23, 42, 0.78) 100%)';
    if (item.img) {
      return overlay + ', url("' + item.img + '"), ' + gradient;
    }
    return overlay + ', ' + gradient;
  }

  function profileT(key, options) {
    if (window.GoTogetherI18n) return GoTogetherI18n.t(key, options);
    return key;
  }

  function isEmailLikeName(name, email) {
    if (!name || !String(name).trim()) return true;
    var trimmed = String(name).trim();
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return true;
    if (email && trimmed.toLowerCase() === String(email).trim().toLowerCase()) return true;
    if (email) {
      var localPart = String(email).trim().split('@')[0].toLowerCase();
      if (localPart && trimmed.toLowerCase() === localPart) return true;
    }
    return false;
  }

  function hasRealAvatar(url) {
    if (!url || !String(url).trim()) return false;
    var lower = String(url).toLowerCase();
    for (var i = 0; i < PLACEHOLDER_AVATAR_PATTERNS.length; i++) {
      if (lower.indexOf(PLACEHOLDER_AVATAR_PATTERNS[i]) !== -1) return false;
    }
    return true;
  }

  function getSelectedHobbiesFromDom() {
    var grid = $('vgt-you-hobbies-grid');
    if (!grid) return [];
    var selected = [];
    grid.querySelectorAll('.vgt-you-hobby[aria-pressed="true"]').forEach(function (btn) {
      var key = btn.getAttribute('data-hobby');
      if (key) selected.push(key);
    });
    return selected;
  }

  function getProfileDraftFromDom() {
    var nameInput = $('vgt-you-name-input');
    var bioInput = $('vgt-you-bio-input');
    return {
      full_name: nameInput ? nameInput.value.trim() : vgtProfile.full_name,
      bio: bioInput ? bioInput.value.trim() : vgtProfile.bio,
      hobbies: getSelectedHobbiesFromDom(),
      avatar_url: vgtProfile.pendingAvatarPreview || vgtProfile.avatar_url,
    };
  }

  function computeVerificationLevel(profile) {
    var name = profile.full_name || '';
    var bio = (profile.bio || '').trim();
    var hobbies = Array.isArray(profile.hobbies) ? profile.hobbies : [];
    var avatar = profile.avatar_url || '';

    if (!hasRealAvatar(avatar) || isEmailLikeName(name, vgtProfile.email)) {
      return 'red';
    }
    if (!bio || hobbies.length === 0) {
      return 'yellow';
    }
    if (hasRealAvatar(avatar) && name && bio && hobbies.length >= 2) {
      return 'blue';
    }
    return 'yellow';
  }

  function applyVerificationBadgeEl(el, level) {
    if (!el) return;
    el.hidden = false;
    el.classList.remove('vgt-verify-badge--red', 'vgt-verify-badge--yellow', 'vgt-verify-badge--blue');
    el.classList.add('vgt-verify-badge--' + level);
    var labelKey = 'verify_label_' + level;
    el.setAttribute('aria-label', profileT(labelKey));
    el.setAttribute('title', profileT(labelKey));
  }

  function updateVerificationBadges() {
    var draft = getProfileDraftFromDom();
    var level = computeVerificationLevel(draft);

    applyVerificationBadgeEl($('vgt-you-verify-badge'), level);

    var greetingSparkle = $('vgt-greeting-badge');
    if (greetingSparkle) initGreetingSparkle();

    var hint = $('vgt-you-verify-hint');
    if (hint) {
      hint.textContent = profileT('verify_hint_' + level);
    }
  }

  function syncProfileStateFromRow(profile, user) {
    if (user) {
      vgtProfile.userId = user.id;
      vgtProfile.email = user.email || '';
    }
    if (!profile) return;

    vgtProfile.full_name = profile.full_name || '';
    vgtProfile.bio = profile.bio || '';
    vgtProfile.hobbies = Array.isArray(profile.hobbies) ? profile.hobbies.slice() : [];
    vgtProfile.avatar_url = profile.avatar_url || '';
    vgtProfile.pendingAvatarFile = null;
    vgtProfile.pendingAvatarPreview = '';

    VGT_USER_PROFILE.full_name = vgtProfile.full_name;
    VGT_USER_PROFILE.bio = vgtProfile.bio;
    VGT_USER_PROFILE.hobbies = vgtProfile.hobbies.slice();
    VGT_USER_PROFILE.avatar_url = vgtProfile.avatar_url;
    if (user && user.email) VGT_USER_PROFILE.email = user.email;

    if (vgtProfile.full_name && window.GoTogetherI18n) {
      var syncedName = String(vgtProfile.full_name).trim();
      if (!isPlaceholderDisplayName(syncedName)) {
        GoTogetherI18n.setUserName(syncedName);
      }
    }
  }

  function updateAvatarPreview(url) {
    var img = $('vgt-you-avatar-preview');
    var placeholder = $('vgt-you-avatar-placeholder');
    if (!img || !placeholder) return;

    if (url && hasRealAvatar(url)) {
      img.src = url;
      img.alt = vgtProfile.full_name || 'Profile photo';
      img.hidden = false;
      placeholder.hidden = true;
    } else {
      img.hidden = true;
      img.removeAttribute('src');
      placeholder.hidden = false;
    }
  }

  function populateProfileForm(profile, user) {
    syncProfileStateFromRow(profile, user);

    var nameInput = $('vgt-you-name-input');
    var bioInput = $('vgt-you-bio-input');
    var displayName = $('vgt-you-display-name');
    var bioCount = $('vgt-you-bio-count');

    if (nameInput) nameInput.value = vgtProfile.full_name;
    if (bioInput) bioInput.value = vgtProfile.bio;
    if (bioCount) bioCount.textContent = String(vgtProfile.bio.length);
    if (displayName) {
      displayName.textContent = vgtProfile.full_name || profileT('you_name_label');
    }

    var grid = $('vgt-you-hobbies-grid');
    if (grid) {
      grid.querySelectorAll('.vgt-you-hobby[data-hobby]').forEach(function (btn) {
        var key = btn.getAttribute('data-hobby');
        var active = vgtProfile.hobbies.indexOf(key) !== -1;
        btn.classList.toggle('is-selected', active);
        btn.setAttribute('aria-pressed', String(active));
      });
    }

    updateAvatarPreview(vgtProfile.avatar_url);
    updateVerificationBadges();
  }

  function readFileAsDataUrl(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () {
        resolve(reader.result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function uploadProfileAvatar(file) {
    var client = getSupabaseClient();
    if (!client || !vgtProfile.userId || !file) {
      return Promise.resolve(vgtProfile.avatar_url || '');
    }

    var ext = (file.name && file.name.split('.').pop()) || 'jpg';
    var path = vgtProfile.userId + '/avatar-' + Date.now() + '.' + ext;

    return client.storage
      .from('avatars')
      .upload(path, file, { upsert: true, contentType: file.type || 'image/jpeg' })
      .then(function (result) {
        if (result.error) throw result.error;
        var pub = client.storage.from('avatars').getPublicUrl(path);
        return pub.data.publicUrl;
      })
      .catch(function (err) {
        console.warn('[GoTogether] Avatar storage upload failed, using inline preview', err);
        if (file.size > 512000) {
          return Promise.reject(new Error('Image too large'));
        }
        return readFileAsDataUrl(file);
      });
  }

  function saveUserProfile(event) {
    if (event) event.preventDefault();
    if (vgtProfile.saving) return Promise.resolve();

    if (!appUnlocked || !vgtProfile.userId) {
      showYouToast(profileT('you_sign_in_profile'));
      return Promise.resolve();
    }

    var client = getSupabaseClient();
    if (!client) return Promise.resolve();

    var name = ($('vgt-you-name-input') && $('vgt-you-name-input').value.trim()) || '';
    var bio = ($('vgt-you-bio-input') && $('vgt-you-bio-input').value.trim()) || '';
    var hobbies = getSelectedHobbiesFromDom();

    vgtProfile.saving = true;
    var saveBtn = $('vgt-you-save-btn');
    if (saveBtn) saveBtn.disabled = true;

    var avatarPromise = vgtProfile.pendingAvatarFile
      ? uploadProfileAvatar(vgtProfile.pendingAvatarFile)
      : Promise.resolve(vgtProfile.avatar_url || '');

    return avatarPromise
      .then(function (avatarUrl) {
        var payload = {
          full_name: name,
          bio: bio,
          hobbies: hobbies,
          updated_at: new Date().toISOString(),
        };
        if (avatarUrl) payload.avatar_url = avatarUrl;

        return client.from('profiles').update(payload).eq('id', vgtProfile.userId).select().single();
      })
      .then(function (result) {
        if (result.error) throw result.error;

        vgtProfile.full_name = name;
        vgtProfile.bio = bio;
        vgtProfile.hobbies = hobbies.slice();
        if (result.data && result.data.avatar_url) {
          vgtProfile.avatar_url = result.data.avatar_url;
        }
        vgtProfile.pendingAvatarFile = null;
        vgtProfile.pendingAvatarPreview = '';

        VGT_USER_PROFILE.full_name = name;
        VGT_USER_PROFILE.bio = bio;
        VGT_USER_PROFILE.hobbies = hobbies.slice();
        VGT_USER_PROFILE.avatar_url = vgtProfile.avatar_url;
        VGT_USER_PROFILE.displayName = name || VGT_USER_PROFILE.displayName;

        var greetingName = name && String(name).trim() ? String(name).trim() : '';
        if (isPlaceholderDisplayName(greetingName)) greetingName = '';
        if (!greetingName) {
          greetingName = getUserDisplayName(
            { id: vgtProfile.userId, email: vgtProfile.email },
            { full_name: name }
          );
        }
        if (window.GoTogetherI18n) GoTogetherI18n.setUserName(greetingName);
        applyHomeContent(getCurrentTheme());
        populateProfileForm(result.data || { full_name: name, bio: bio, hobbies: hobbies, avatar_url: vgtProfile.avatar_url }, {
          id: vgtProfile.userId,
          email: vgtProfile.email,
        });
        showYouToast(profileT('you_profile_saved'));
      })
      .catch(function (err) {
        console.warn('[GoTogether] Profile save failed', err);
        showYouToast(profileT('you_profile_save_error'));
      })
      .finally(function () {
        vgtProfile.saving = false;
        if (saveBtn) saveBtn.disabled = false;
      });
  }

  function applyAuthenticatedUser(user, profile) {
    var displayName = getUserDisplayName(user, profile);

    if (window.GoTogetherI18n) GoTogetherI18n.setUserName(displayName);

    VGT_USER_PROFILE.displayName = displayName;
    if (user && user.email) {
      vgtProfile.email = user.email;
      VGT_USER_PROFILE.email = user.email;
    }
    if (profile && profile.ui_language && window.GoTogetherI18n) {
      GoTogetherI18n.changeLanguage(profile.ui_language);
    }
    if (profile && profile.spoken_languages) {
      VGT_USER_PROFILE.spokenLanguages = profile.spoken_languages;
    }

    populateProfileForm(profile, user);
    refreshHomeGreetingName();
    applyHomeContent(getCurrentTheme());
    if (user && user.id) {
      vgtChat.currentUserId = user.id;
      initChatCurrentUser();
    }
  }

  function loadUserProfile(user) {
    var client = getSupabaseClient();
    if (!client || !user) {
      applyAuthenticatedUser(user, null);
      return Promise.resolve(null);
    }

    return client
      .from('profiles')
      .select('full_name, avatar_url, bio, hobbies, ui_language, spoken_languages')
      .eq('id', user.id)
      .maybeSingle()
      .then(function (result) {
        if (result.error) {
          console.warn('[GoTogether] Profile load failed', result.error);
        }
        applyAuthenticatedUser(user, result.data || null);
        return result.data || null;
      });
  }

  var authMode = 'login';

  var AUTH_FALLBACKS = {
    auth_welcome: 'Welcome to the city',
    auth_sign_in: 'Sign in',
    auth_create_account: 'Create account',
    auth_reset_password: 'Reset password',
    auth_choose_new_password: 'Choose a new password',
    auth_send_reset_link: 'Send reset link',
    auth_save_new_password: 'Save new password',
    auth_password: 'Password',
    auth_new_password: 'New password',
    auth_error_required: 'Please enter your email and password.',
    auth_error_email_required: 'Please enter your email address.',
    auth_error_password_length: 'Password must contain at least 6 characters.',
    auth_error_password_mismatch: 'Passwords do not match.',
    auth_error_invalid_credentials: 'Incorrect email or password.',
    auth_error_registered: 'An account with this email already exists. Sign in or reset your password.',
    auth_error_email_unconfirmed: 'Confirm your email address before signing in.',
    auth_error_network: 'The service is temporarily unavailable. Please try again in a few minutes.',
    auth_error_generic: 'Could not complete the request. Please try again.',
    auth_reset_sent: 'Password reset link sent. Check your email.',
    auth_registration_check_email: 'Account created. Check your email to confirm registration.',
    auth_password_updated: 'Password updated successfully.',
  };

  function authText(key) {
    if (window.GoTogetherI18n) {
      var translated = GoTogetherI18n.t(key);
      if (translated && translated !== key) return translated;
    }
    return AUTH_FALLBACKS[key] || key;
  }

  function setAuthStatus(message, type) {
    var errorEl = $('vgt-auth-error');
    if (!errorEl) return;

    if (!message) {
      errorEl.textContent = '';
      errorEl.hidden = true;
      errorEl.classList.remove('is-success');
      return;
    }

    errorEl.textContent = message;
    errorEl.hidden = false;
    errorEl.classList.toggle('is-success', type === 'success');
  }

  function setAuthError(message) {
    setAuthStatus(message, 'error');
  }

  function setAuthLoading(isLoading) {
    var btn = $('vgt-auth-go-btn');
    if (btn) {
      btn.disabled = !!isLoading;
      btn.setAttribute('aria-busy', String(!!isLoading));
    }
    document.querySelectorAll('.vgt-auth__tab, .vgt-auth__link').forEach(function (control) {
      control.disabled = !!isLoading;
    });
  }

  function setAuthElementText(id, key) {
    var el = $(id);
    if (!el) return;
    el.setAttribute('data-i18n', key);
    el.textContent = authText(key);
  }

  function setAuthMode(nextMode, keepStatus) {
    authMode = nextMode || 'login';

    var tabs = $('vgt-auth-tabs');
    var emailField = $('vgt-auth-email-field');
    var passwordField = $('vgt-auth-password-field');
    var confirmField = $('vgt-auth-confirm-field');
    var emailInput = $('vgt-auth-email');
    var passwordInput = $('vgt-auth-password');
    var confirmInput = $('vgt-auth-confirm-password');
    var forgotBtn = $('vgt-auth-forgot-btn');
    var backBtn = $('vgt-auth-back-btn');
    var isRegister = authMode === 'register';
    var isForgot = authMode === 'forgot';
    var isReset = authMode === 'reset';

    if (!keepStatus) setAuthStatus('');
    if (tabs) tabs.hidden = isForgot || isReset;
    if (emailField) emailField.hidden = isReset;
    if (passwordField) passwordField.hidden = isForgot;
    if (confirmField) confirmField.hidden = !(isRegister || isReset);
    if (forgotBtn) forgotBtn.hidden = authMode !== 'login';
    if (backBtn) backBtn.hidden = !isForgot;

    if (emailInput) {
      emailInput.required = !isReset;
      emailInput.disabled = isReset;
    }
    if (passwordInput) {
      passwordInput.required = !isForgot;
      passwordInput.disabled = isForgot;
      passwordInput.autocomplete = authMode === 'login' ? 'current-password' : 'new-password';
      if (isForgot) passwordInput.value = '';
    }
    if (confirmInput) {
      confirmInput.required = isRegister || isReset;
      confirmInput.disabled = !(isRegister || isReset);
      if (!(isRegister || isReset)) confirmInput.value = '';
    }

    document.querySelectorAll('.vgt-auth__tab[data-auth-mode]').forEach(function (tab) {
      var isActive = tab.getAttribute('data-auth-mode') === authMode;
      tab.classList.toggle('is-active', isActive);
      tab.setAttribute('aria-selected', String(isActive));
    });

    if (authMode === 'register') {
      setAuthElementText('vgt-auth-title', 'auth_create_account');
      setAuthElementText('vgt-auth-go-btn', 'auth_create_account');
      setAuthElementText('vgt-auth-password-label', 'auth_password');
    } else if (authMode === 'forgot') {
      setAuthElementText('vgt-auth-title', 'auth_reset_password');
      setAuthElementText('vgt-auth-go-btn', 'auth_send_reset_link');
    } else if (authMode === 'reset') {
      setAuthElementText('vgt-auth-title', 'auth_choose_new_password');
      setAuthElementText('vgt-auth-go-btn', 'auth_save_new_password');
      setAuthElementText('vgt-auth-password-label', 'auth_new_password');
    } else {
      setAuthElementText('vgt-auth-title', 'auth_welcome');
      setAuthElementText('vgt-auth-go-btn', 'auth_sign_in');
      setAuthElementText('vgt-auth-password-label', 'auth_password');
    }
  }

  function normalizeAuthError(error) {
    var message = String((error && error.message) || '').toLowerCase();
    if (message.indexOf('invalid login credentials') !== -1) {
      return authText('auth_error_invalid_credentials');
    }
    if (message.indexOf('already registered') !== -1 || message.indexOf('already been registered') !== -1) {
      return authText('auth_error_registered');
    }
    if (message.indexOf('email not confirmed') !== -1) {
      return authText('auth_error_email_unconfirmed');
    }
    if (
      message.indexOf('load failed') !== -1 ||
      message.indexOf('failed to fetch') !== -1 ||
      message.indexOf('network') !== -1
    ) {
      return authText('auth_error_network');
    }
    return authText('auth_error_generic');
  }

  function getAuthClient() {
    var client = getSupabaseClient();
    if (!client) {
      return Promise.reject(new Error('Supabase is not initialized'));
    }
    return client;
  }

  function signInWithSupabase(email, password) {
    var client = getAuthClient();
    if (client && typeof client.then === 'function') return client;

    var cleanEmail = String(email || '')
      .trim()
      .replace(/[\r\n\t]+/g, '');
    var cleanPassword = String(password || '');

    if (!cleanEmail || !cleanPassword) {
      return Promise.reject(new Error('Please enter your email and password.'));
    }

    return client.auth.signInWithPassword({ email: cleanEmail, password: cleanPassword }).then(function (result) {
      if (result.error) throw result.error;
      if (!result.data || !result.data.session) throw new Error('No session returned');
      return result.data;
    });
  }

  function signUpWithSupabase(email, password) {
    var client = getAuthClient();
    if (client && typeof client.then === 'function') return client;
    return client.auth
      .signUp({
        email: String(email || '').trim().replace(/[\r\n\t]+/g, ''),
        password: String(password || ''),
        options: { data: { full_name: '' } },
      })
      .then(function (result) {
        if (result.error) throw result.error;
        return result.data || {};
      });
  }

  function requestPasswordReset(email) {
    var client = getAuthClient();
    if (client && typeof client.then === 'function') return client;
    var redirectTo = window.location.origin + window.location.pathname;
    return client.auth
      .resetPasswordForEmail(String(email || '').trim().replace(/[\r\n\t]+/g, ''), {
        redirectTo: redirectTo,
      })
      .then(function (result) {
        if (result.error) throw result.error;
        return result.data;
      });
  }

  function updatePassword(password) {
    var client = getAuthClient();
    if (client && typeof client.then === 'function') return client;
    return client.auth.updateUser({ password: String(password || '') }).then(function (result) {
      if (result.error) throw result.error;
      return result.data;
    });
  }

  function hasPasswordRecoveryUrl() {
    return /(?:^|[?#&])type=recovery(?:&|$)/.test(window.location.search + window.location.hash);
  }

  function initAuthSession() {
    var client = getSupabaseClient();
    if (!client) return Promise.resolve(false);

    return client.auth.getSession().then(function (sessionResult) {
      var session = sessionResult.data && sessionResult.data.session;
      if (!session || !session.user) return false;

      return ensureUserProfile(session.user).then(function () {
        appUnlocked = true;
        vgtChat.currentUserId = session.user.id;
        showInPhoneScreen('map');
        switchVgtView('map');
        initChatCurrentUser();
        return true;
      });
    });
  }

  /** Speaking-club language profiles (shared across YOU, Map, Alerts) */
  var VGT_PROFILES = {
    anna: {
      speak: [
        { flag: '🇺🇦', code: 'UKR' },
        { flag: '🇩🇪', code: 'DEU', level: 'A2' },
      ],
      practice: [
        { flag: '🇩🇪', code: 'DEU' },
        { flag: '🇺🇸', code: 'ENG' },
      ],
    },
    andrey: {
      speak: [
        { flag: '🇬🇧', code: 'ENG' },
        { flag: '🇨🇿', code: 'CZE' },
      ],
    },
    sofie: {
      speak: [
        { flag: '🇩🇪', code: 'DEU' },
        { flag: '🇬🇧', code: 'ENG' },
      ],
    },
    emil: {
      speak: [
        { flag: '🇩🇪', code: 'DEU' },
        { flag: '🇫🇷', code: 'FRA' },
      ],
    },
    lisa: {
      speak: [
        { flag: '🇩🇪', code: 'DEU' },
        { flag: '🇬🇧', code: 'ENG' },
      ],
    },
  };

  var youToastTimer = null;

  var vgtChat = {
    currentUserId: null,
    activePartnerId: null,
    activePartnerName: null,
    profilesById: {},
    threads: [],
    messages: [],
    channel: null,
    sending: false,
    profileTargetId: null,
  };

  var vgtChatAwareness = {
    companionSeenAt: null,
    threadSeenAt: {},
  };

  function chatT(key, options) {
    if (window.GoTogetherI18n) return GoTogetherI18n.t(key, options);
    return key;
  }

  function getProfileInitials(name) {
    if (!name) return '?';
    var parts = String(name).trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return String(name).slice(0, 2).toUpperCase();
  }

  function formatChatTime(iso) {
    if (!iso) return '';
    var then = new Date(iso).getTime();
    var diffMs = Date.now() - then;
    if (diffMs < 60000) return chatT('chat_time_now');
    var mins = Math.floor(diffMs / 60000);
    if (mins < 60) return chatT('chat_time_min', { count: mins });
    var hours = Math.floor(mins / 60);
    if (hours < 24) return chatT('chat_time_hour', { count: hours });
    return new Date(iso).toLocaleDateString();
  }

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function renderMessageText(text) {
    return escapeHtml(text || '').replace(/\n/g, '<br>');
  }

  function cacheChatProfiles(rows) {
    (rows || []).forEach(function (row) {
      if (row && row.id) vgtChat.profilesById[row.id] = row;
    });
  }

  function getChatPartnerName(partnerId) {
    var profile = vgtChat.profilesById[partnerId];
    return (profile && profile.full_name) || vgtChat.activePartnerName || 'User';
  }

  function buildChatThreads(messages, currentUserId) {
    var map = {};
    (messages || []).forEach(function (msg) {
      var partnerId = msg.sender_id === currentUserId ? msg.receiver_id : msg.sender_id;
      if (!partnerId) return;
      var existing = map[partnerId];
      if (!existing || new Date(msg.created_at) > new Date(existing.lastAt)) {
        map[partnerId] = {
          partnerId: partnerId,
          partnerName: getChatPartnerName(partnerId),
          preview: msg.text,
          lastAt: msg.created_at,
          lastFromPartner: msg.sender_id !== currentUserId,
        };
      }
    });
    return Object.keys(map)
      .map(function (key) {
        return map[key];
      })
      .sort(function (a, b) {
        return new Date(b.lastAt) - new Date(a.lastAt);
      });
  }

  function loadChatProfiles(partnerIds) {
    var client = getSupabaseClient();
    if (!client || !partnerIds.length) return Promise.resolve();

    return client
      .from('profiles')
      .select('id, full_name, avatar_url')
      .in('id', partnerIds)
      .then(function (result) {
        if (!result.error) cacheChatProfiles(result.data || []);
        return result;
      });
  }

  function loadChatThreads() {
    var client = getSupabaseClient();
    if (!client || !vgtChat.currentUserId) {
      vgtChat.threads = [];
      renderChatThreads();
      return Promise.resolve([]);
    }

    return client
      .from('messages')
      .select('id, sender_id, receiver_id, text, created_at')
      .or(
        'sender_id.eq.' +
          vgtChat.currentUserId +
          ',receiver_id.eq.' +
          vgtChat.currentUserId
      )
      .order('created_at', { ascending: false })
      .limit(200)
      .then(function (result) {
        if (result.error) {
          console.warn('[GoTogether] Chat threads load failed', result.error);
          vgtChat.threads = [];
          renderChatThreads();
          return [];
        }

        var rows = Array.isArray(result.data) ? result.data : [];
        var partnerIds = [];
        rows.forEach(function (msg) {
          if (!msg) return;
          var partnerId =
            msg.sender_id === vgtChat.currentUserId ? msg.receiver_id : msg.sender_id;
          if (partnerId && partnerIds.indexOf(partnerId) === -1) partnerIds.push(partnerId);
        });

        return loadChatProfiles(partnerIds).then(function () {
          vgtChat.threads = buildChatThreads(rows, vgtChat.currentUserId);
          renderChatThreads();
          return vgtChat.threads;
        });
      })
      .catch(function (err) {
        console.warn('[GoTogether] Chat threads error', err);
        vgtChat.threads = [];
        renderChatThreads();
        return [];
      });
  }

  function renderHomeChatAvatar(partnerId, partnerName) {
    var profile = vgtChat.profilesById[partnerId];
    if (profile && profile.avatar_url) {
      return (
        '<img class="vgt-home-messages__avatar-img" src="' +
        escapeHtml(profile.avatar_url) +
        '" alt="" width="20" height="20" loading="lazy">'
      );
    }
    return (
      '<span class="vgt-home-messages__avatar" aria-hidden="true">' +
      escapeHtml(getProfileInitials(partnerName)) +
      '</span>'
    );
  }

  function truncatePreview(text, maxLen) {
    var raw = String(text || '').replace(/\s+/g, ' ').trim();
    if (raw.length <= maxLen) return raw;
    return raw.slice(0, maxLen - 1) + '…';
  }

  function renderAigoHomeAvatar() {
    return (
      '<span class="vgt-home-messages__avatar vgt-home-messages__avatar--aigo" aria-hidden="true">' +
      '<svg class="vgt-home-messages__avatar-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
      '<rect x="5" y="8" width="14" height="10" rx="3" stroke="currentColor" stroke-width="1.4"/>' +
      '<circle cx="9.5" cy="13" r="1" fill="currentColor"/>' +
      '<circle cx="14.5" cy="13" r="1" fill="currentColor"/>' +
      '<path d="M12 4v3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>' +
      '<circle cx="12" cy="3" r="1.2" fill="currentColor"/>' +
      '</svg></span>'
    );
  }

  function getAigoDisplayName() {
    if (window.GoTogetherI18n) return GoTogetherI18n.t('companion_name');
    return 'AIGO';
  }

  function getLastCompanionAiMessage() {
    var msgs = vgtCompanion && Array.isArray(vgtCompanion.messages) ? vgtCompanion.messages : [];
    for (var i = msgs.length - 1; i >= 0; i--) {
      if (msgs[i].role === 'ai') return msgs[i];
    }
    return null;
  }

  function getLatestCompanionPreview() {
    var lastAi = getLastCompanionAiMessage();
    if (lastAi) {
      return truncatePreview(resolveCompanionMessageText(lastAi), 120);
    }
    if (window.GoTogetherI18n) {
      return truncatePreview(GoTogetherI18n.t('home_messages_aigo_preview'), 120);
    }
    return 'Hey! I\'m AIGO…';
  }

  function getLatestIncomingPreview() {
    var latest = null;
    var latestTime = -1;

    var lastAi = getLastCompanionAiMessage();
    if (lastAi) {
      latest = {
        name: getAigoDisplayName(),
        preview: truncatePreview(resolveCompanionMessageText(lastAi), 120),
        route: 'companion',
        partnerId: null,
      };
      latestTime = lastAi.createdAt ? new Date(lastAi.createdAt).getTime() : 0;
    } else {
      var fallback = getLatestCompanionPreview();
      if (fallback) {
        latest = {
          name: getAigoDisplayName(),
          preview: fallback,
          route: 'companion',
          partnerId: null,
        };
        latestTime = 0;
      }
    }

    (vgtChat.threads || []).forEach(function (thread) {
      if (!thread || !thread.lastFromPartner || !thread.lastAt) return;
      var threadTime = new Date(thread.lastAt).getTime();
      if (threadTime >= latestTime) {
        latestTime = threadTime;
        latest = {
          name: thread.partnerName || 'User',
          preview: truncatePreview(thread.preview || '', 96),
          route: 'chat',
          partnerId: thread.partnerId,
        };
      }
    });

    return latest;
  }

  function formatHomeChatMicroLine(preview) {
    if (!preview) return '';
    return '\uD83D\uDCAC ' + preview.name + ': ' + preview.preview;
  }

  function hasUnreadChatActivity() {
    var incoming = getLatestIncomingPreview();
    if (!incoming) return false;

    if (incoming.route === 'companion') {
      var lastAi = getLastCompanionAiMessage();
      if (lastAi) {
        if (!vgtChatAwareness.companionSeenAt) return true;
        return new Date(lastAi.createdAt) > new Date(vgtChatAwareness.companionSeenAt);
      }
      if (!vgtChatAwareness.companionSeenAt) return true;
      return false;
    }

    if (incoming.route === 'chat' && incoming.partnerId) {
      var thread = (vgtChat.threads || []).find(function (t) {
        return t && t.partnerId === incoming.partnerId;
      });
      if (!thread || !thread.lastFromPartner) return false;
      var seenAt = vgtChatAwareness.threadSeenAt[incoming.partnerId];
      if (!seenAt) return true;
      return new Date(thread.lastAt) > new Date(seenAt);
    }

    return false;
  }

  function markChatAwarenessRead(route, partnerId) {
    if (route === 'companion') {
      var lastAi = getLastCompanionAiMessage();
      vgtChatAwareness.companionSeenAt = lastAi
        ? lastAi.createdAt
        : new Date().toISOString();
    } else if (partnerId) {
      var thread = (vgtChat.threads || []).find(function (t) {
        return t && t.partnerId === partnerId;
      });
      vgtChatAwareness.threadSeenAt[partnerId] = thread
        ? thread.lastAt
        : new Date().toISOString();
    }
    updateChatAwarenessUi();
  }

  function openChatAwarenessTarget() {
    var incoming = getLatestIncomingPreview();
    if (!incoming) {
      openHomeAigoWidget();
      return;
    }

    if (incoming.route === 'chat' && incoming.partnerId) {
      openHomeChatWidget(incoming.partnerId);
      return;
    }

    openHomeAigoWidget();
  }

  function updateChatAwarenessUi() {
    var badge = $('vgt-head-chat-badge');
    var unread = hasUnreadChatActivity();

    if (badge) {
      badge.hidden = !unread;
      badge.setAttribute('aria-hidden', String(!unread));
    }
  }

  function renderHomeChatPreview() {
    var widget = $('vgt-home-messages');
    var emptyEl = $('vgt-home-messages-empty');
    var listEl = $('vgt-home-messages-list');
    if (!widget || !emptyEl || !listEl) {
      updateChatAwarenessUi();
      return;
    }

    if (window.GoTogetherI18n) {
      var titleEl = widget.querySelector('.vgt-home-messages__title');
      if (titleEl) titleEl.textContent = GoTogetherI18n.t('home_messages_title');
      widget.setAttribute('aria-label', GoTogetherI18n.t('home_messages_title'));
    }

    var threads = Array.isArray(vgtChat.threads) ? vgtChat.threads.slice(0, 2) : [];

    emptyEl.hidden = true;
    listEl.hidden = false;
    listEl.innerHTML = '';

    var aigoLi = document.createElement('li');
    aigoLi.className = 'vgt-home-messages__item vgt-home-messages__item--aigo';
    aigoLi.setAttribute('data-home-msg', 'aigo');
    aigoLi.innerHTML =
      renderAigoHomeAvatar() +
      '<div class="vgt-home-messages__content">' +
      '<p class="vgt-home-messages__name">' +
      escapeHtml(getAigoDisplayName()) +
      '</p>' +
      '<p class="vgt-home-messages__preview">' +
      renderMessageText(getLatestCompanionPreview()) +
      '</p>' +
      '</div>' +
      '<time class="vgt-home-messages__time">' +
      escapeHtml(chatT('chat_time_now')) +
      '</time>';
    listEl.appendChild(aigoLi);

    threads.forEach(function (thread) {
      if (!thread || !thread.partnerId) return;
      var li = document.createElement('li');
      li.className = 'vgt-home-messages__item';
      li.setAttribute('data-partner-id', thread.partnerId);

      li.innerHTML =
        renderHomeChatAvatar(thread.partnerId, thread.partnerName) +
        '<div class="vgt-home-messages__content">' +
        '<p class="vgt-home-messages__name">' +
        escapeHtml(thread.partnerName || 'User') +
        '</p>' +
        '<p class="vgt-home-messages__preview">' +
        renderMessageText(truncatePreview(thread.preview, 96)) +
        '</p>' +
        '</div>' +
        '<time class="vgt-home-messages__time">' +
        escapeHtml(formatChatTime(thread.lastAt)) +
        '</time>';

      listEl.appendChild(li);
    });

    updateChatAwarenessUi();
  }

  function openHomeAigoWidget() {
    if (!appUnlocked) {
      showYouToast(chatT('chat_sign_in'));
      transitionInPhoneScreen('promo', 'auth');
      return;
    }
    switchVgtView('companion');
    markChatAwarenessRead('companion');
  }

  function openHomeChatWidget(partnerId) {
    if (!appUnlocked) {
      showYouToast(chatT('chat_sign_in'));
      transitionInPhoneScreen('promo', 'auth');
      return;
    }
    closeChatThread();
    switchVgtView('chat');
    if (partnerId) {
      var profile = vgtChat.profilesById[partnerId];
      var name = profile && profile.full_name ? profile.full_name : 'User';
      openDirectChat(partnerId, name);
      markChatAwarenessRead('chat', partnerId);
    }
  }

  function initHomeMessagesWidget() {
    var headChatBtn = $('vgt-head-chat-btn');
    if (headChatBtn && !headChatBtn.getAttribute('data-bound')) {
      headChatBtn.setAttribute('data-bound', 'true');
      headChatBtn.addEventListener('click', function () {
        openChatAwarenessTarget();
      });
    }

    var widget = $('vgt-home-messages');
    if (widget && !widget.getAttribute('data-bound')) {
      widget.setAttribute('data-bound', 'true');

      widget.addEventListener('click', function (event) {
        var aigoItem = event.target.closest('.vgt-home-messages__item--aigo');
        if (aigoItem) {
          openHomeAigoWidget();
          return;
        }
        var threadItem = event.target.closest('.vgt-home-messages__item[data-partner-id]');
        if (threadItem) {
          var partnerId = threadItem.getAttribute('data-partner-id');
          openHomeChatWidget(partnerId);
          return;
        }
        openHomeAigoWidget();
      });

      widget.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openHomeAigoWidget();
        }
      });
    }

    renderHomeChatPreview();
  }

  function renderChatThreads() {
    var list = $('vgt-chat-list');
    var empty = $('vgt-chat-empty');
    var listPanel = $('vgt-chat-list-panel');
    if (!list) return;

    list.innerHTML = '';

    var threads = Array.isArray(vgtChat.threads) ? vgtChat.threads : [];
    var showEmpty = threads.length === 0;

    if (empty) {
      empty.classList.toggle('is-visible', showEmpty);
      if (showEmpty && window.GoTogetherI18n) {
        var textEl = empty.querySelector('.vgt-chat-empty__text');
        if (textEl) textEl.textContent = GoTogetherI18n.t('chat_empty');
      }
    }

    if (listPanel) listPanel.classList.toggle('vgt-chat-list-panel--empty', showEmpty);
    list.setAttribute('aria-hidden', showEmpty ? 'true' : 'false');

    if (showEmpty) return;

    threads.forEach(function (thread) {
      if (!thread || !thread.partnerId) return;
      var li = document.createElement('li');
      li.className = 'vgt-chat-item';
      li.setAttribute('data-partner-id', thread.partnerId);

      li.innerHTML =
        '<span class="vgt-chat-item__avatar" aria-hidden="true">' +
        escapeHtml(getProfileInitials(thread.partnerName)) +
        '</span>' +
        '<div class="vgt-chat-item__body">' +
        '<p class="vgt-chat-item__title">' +
        escapeHtml(thread.partnerName || 'User') +
        '</p>' +
        '<p class="vgt-chat-item__preview">' +
        renderMessageText(thread.preview || '') +
        '</p>' +
        '</div>' +
        '<div class="vgt-chat-item__meta">' +
        '<time class="vgt-chat-item__time">' +
        escapeHtml(formatChatTime(thread.lastAt)) +
        '</time>' +
        '</div>';

      li.addEventListener('click', function () {
        openDirectChat(thread.partnerId, thread.partnerName);
      });

      list.appendChild(li);
    });

    renderHomeChatPreview();
  }

  function showChatThreadPanel(showThread) {
    var listPanel = $('vgt-chat-list-panel');
    var threadPanel = $('vgt-chat-thread');
    if (listPanel) listPanel.hidden = !!showThread;
    if (threadPanel) threadPanel.hidden = !showThread;
  }

  function renderChatMessages() {
    var container = $('vgt-chat-messages');
    if (!container) return;

    container.innerHTML = '';
    vgtChat.messages.forEach(function (msg) {
      var isMine = msg.sender_id === vgtChat.currentUserId;
      var bubble = document.createElement('div');
      bubble.className =
        'vgt-chat-bubble' + (isMine ? ' vgt-chat-bubble--mine' : ' vgt-chat-bubble--theirs');
      bubble.innerHTML =
        '<p class="vgt-chat-bubble__text">' +
        renderMessageText(msg.text) +
        '</p>' +
        '<time class="vgt-chat-bubble__time">' +
        escapeHtml(formatChatTime(msg.created_at)) +
        '</time>';
      container.appendChild(bubble);
    });

    container.scrollTop = container.scrollHeight;
  }

  function loadChatMessages(partnerId) {
    var client = getSupabaseClient();
    if (!client || !vgtChat.currentUserId || !partnerId) return Promise.resolve([]);

    var uid = vgtChat.currentUserId;
    return client
      .from('messages')
      .select('id, sender_id, receiver_id, text, created_at')
      .or(
        'and(sender_id.eq.' +
          uid +
          ',receiver_id.eq.' +
          partnerId +
          '),and(sender_id.eq.' +
          partnerId +
          ',receiver_id.eq.' +
          uid +
          ')'
      )
      .order('created_at', { ascending: true })
      .limit(300)
      .then(function (result) {
        if (result.error) {
          console.warn('[GoTogether] Chat messages load failed', result.error);
          vgtChat.messages = [];
          renderChatMessages();
          return [];
        }
        vgtChat.messages = result.data || [];
        renderChatMessages();
        return vgtChat.messages;
      });
  }

  function unsubscribeChatRealtime() {
    var client = getSupabaseClient();
    if (client && vgtChat.channel) {
      client.removeChannel(vgtChat.channel);
      vgtChat.channel = null;
    }
  }

  function subscribeChatRealtime() {
    var client = getSupabaseClient();
    if (!client || !vgtChat.currentUserId) return;

    unsubscribeChatRealtime();

    var uid = vgtChat.currentUserId;
    vgtChat.channel = client
      .channel('vgt-chat-' + uid)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: 'receiver_id=eq.' + uid,
        },
        function (payload) {
          handleIncomingChatMessage(payload.new);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: 'sender_id=eq.' + uid,
        },
        function (payload) {
          handleIncomingChatMessage(payload.new);
        }
      )
      .subscribe();
  }

  function handleIncomingChatMessage(msg) {
    if (!msg) return;

    var partnerId =
      msg.sender_id === vgtChat.currentUserId ? msg.receiver_id : msg.sender_id;

    if (vgtChat.activePartnerId && partnerId === vgtChat.activePartnerId) {
      var exists = vgtChat.messages.some(function (m) {
        return m.id === msg.id;
      });
      if (!exists) {
        vgtChat.messages.push(msg);
        renderChatMessages();
      }
    }

    loadChatThreads();
  }

  function openDirectChat(partnerId, partnerName) {
    if (!appUnlocked) {
      showYouToast(chatT('chat_sign_in'));
      transitionInPhoneScreen('promo', 'auth');
      return;
    }

    if (!partnerId) {
      showYouToast(chatT('chat_no_host'));
      return;
    }

    if (partnerId === vgtChat.currentUserId) return;

    vgtChat.activePartnerId = partnerId;
    vgtChat.activePartnerName = partnerName || getChatPartnerName(partnerId);

    switchVgtView('chat');
    showChatThreadPanel(true);

    var nameEl = $('vgt-chat-thread-name');
    var avatarEl = $('vgt-chat-thread-avatar');
    if (nameEl) nameEl.textContent = vgtChat.activePartnerName;
    if (avatarEl) avatarEl.textContent = getProfileInitials(vgtChat.activePartnerName);

    loadChatProfiles([partnerId]).then(function () {
      if (nameEl && vgtChat.profilesById[partnerId]) {
        vgtChat.activePartnerName = vgtChat.profilesById[partnerId].full_name || vgtChat.activePartnerName;
        nameEl.textContent = vgtChat.activePartnerName;
        if (avatarEl) avatarEl.textContent = getProfileInitials(vgtChat.activePartnerName);
      }
      return loadChatMessages(partnerId);
    });

    var input = $('vgt-chat-input');
    if (input) setTimeout(function () { input.focus(); }, 150);
  }

  function closeChatThread() {
    vgtChat.activePartnerId = null;
    vgtChat.activePartnerName = null;
    vgtChat.messages = [];
    showChatThreadPanel(false);
  }

  function insertChatEmoji(emoji) {
    var input = $('vgt-chat-input');
    if (!input) return;
    var start = input.selectionStart == null ? input.value.length : input.selectionStart;
    var end = input.selectionEnd == null ? start : input.selectionEnd;
    input.value = input.value.slice(0, start) + emoji + input.value.slice(end);
    input.focus();
    input.selectionStart = input.selectionEnd = start + emoji.length;
  }

  function sendChatMessage(text) {
    var body = String(text || '').trim();
    if (!body || vgtChat.sending) return Promise.resolve();

    if (!appUnlocked || !vgtChat.currentUserId) {
      showYouToast(chatT('chat_sign_in'));
      return Promise.resolve();
    }

    if (!vgtChat.activePartnerId) return Promise.resolve();

    var client = getSupabaseClient();
    if (!client) return Promise.resolve();

    vgtChat.sending = true;
    var sendBtn = $('vgt-chat-send');
    if (sendBtn) sendBtn.disabled = true;

    return client
      .from('messages')
      .insert({
        sender_id: vgtChat.currentUserId,
        receiver_id: vgtChat.activePartnerId,
        text: body,
      })
      .select('id, sender_id, receiver_id, text, created_at')
      .single()
      .then(function (result) {
        if (result.error) {
          console.warn('[GoTogether] Send message failed', result.error);
          showYouToast(chatT('chat_send_failed'));
          return;
        }
        if (result.data) {
          vgtChat.messages.push(result.data);
          renderChatMessages();
          loadChatThreads();
        }
        var input = $('vgt-chat-input');
        if (input) input.value = '';
      })
      .finally(function () {
        vgtChat.sending = false;
        if (sendBtn) sendBtn.disabled = false;
      });
  }

  function initChatCurrentUser() {
    return getActiveSessionUser().then(function (user) {
      vgtChat.currentUserId = user ? user.id : null;
      if (vgtChat.currentUserId) {
        subscribeChatRealtime();
        return loadChatThreads();
      }
      return [];
    });
  }

  function messageSelectedMapEventHost() {
    var event = getMapEventById(vgtMap.selectedEventId);
    if (!event || !event.creatorId) {
      showYouToast(chatT('chat_no_host'));
      return;
    }
    openDirectChat(event.creatorId, event.creatorName || 'Host');
  }

  function initChat() {
    showChatThreadPanel(false);
    renderChatThreads();

    var backBtn = $('vgt-chat-thread-back');
    if (backBtn && !backBtn.getAttribute('data-bound')) {
      backBtn.setAttribute('data-bound', 'true');
      backBtn.addEventListener('click', function () {
        closeChatThread();
        loadChatThreads();
      });
    }

    var form = $('vgt-chat-form');
    if (form && !form.getAttribute('data-bound')) {
      form.setAttribute('data-bound', 'true');
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = $('vgt-chat-input');
        sendChatMessage(input ? input.value : '');
      });
    }

    var emojiBar = $('vgt-chat-emoji-bar');
    if (emojiBar && !emojiBar.getAttribute('data-bound')) {
      emojiBar.setAttribute('data-bound', 'true');
      emojiBar.querySelectorAll('.vgt-chat-emoji-bar__btn[data-emoji]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var emoji = btn.getAttribute('data-emoji');
          if (!emoji) return;
          insertChatEmoji(emoji);
        });
      });
    }

    var mapMsgBtn = $('vgt-map-float-message');
    if (mapMsgBtn && !mapMsgBtn.getAttribute('data-bound')) {
      mapMsgBtn.setAttribute('data-bound', 'true');
      mapMsgBtn.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        messageSelectedMapEventHost();
      });
    }

    var profileMsgBtn = $('vgt-profile-message-btn');
    if (profileMsgBtn && !profileMsgBtn.getAttribute('data-bound')) {
      profileMsgBtn.setAttribute('data-bound', 'true');
      profileMsgBtn.addEventListener('click', function () {
        if (vgtChat.profileTargetId) {
          openDirectChat(vgtChat.profileTargetId, 'User');
        } else {
          showYouToast(chatT('chat_no_host'));
        }
      });
    }

    if (appUnlocked) initChatCurrentUser();
    initHomeMessagesWidget();
  }

  var vgtCompanion = {
    messages: [],
    sessionStarted: false,
    empathyDelivered: false,
    proactiveShown: false,
    msgSeq: 0,
  };

  var COMPANION_MOOD_PATTERNS = [
    'груст', 'скуч', 'одинок', 'один', 'занят', 'тоск', 'не с кем', 'некому', 'никому', 'плохо на душе',
    'сумн', 'нудн', 'самотн', 'зайнят', 'самотн',
    'sad', 'lonely', 'alone', 'bored', 'boring', 'nobody', 'no one', 'depressed', 'miserable',
    'traurig', 'einsam', 'langweil', 'allein', 'niemand',
    'smutn', 'nud', 'osaměl', 'osaměl', 'sam ',
    'smutn', 'samotn', 'nud', 'sam ',
  ];

  function companionT(key, options) {
    if (window.GoTogetherI18n) return GoTogetherI18n.t(key, options);
    return key;
  }

  function remapClonedSvgIds(root, prefix) {
    if (!root) return;
    var svg = root.querySelector('svg');
    if (!svg) return;

    var nodes = svg.querySelectorAll('[id]');
    var idMap = {};
    nodes.forEach(function (node) {
      idMap[node.id] = prefix + node.id;
    });
    nodes.forEach(function (node) {
      node.id = idMap[node.id];
    });

    var html = svg.outerHTML;
    Object.keys(idMap).forEach(function (oldId) {
      var escaped = oldId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      html = html.replace(new RegExp('url\\(#' + escaped + '\\)', 'g'), 'url(#' + idMap[oldId] + ')');
      html = html.replace(new RegExp('href="#' + escaped + '"', 'g'), 'href="#' + idMap[oldId] + '"');
    });

    var temp = document.createElement('div');
    temp.innerHTML = html;
    if (temp.firstChild) svg.parentNode.replaceChild(temp.firstChild, svg);
  }

  function mountCompanionGoLogo() {
    var mount = $('vgt-companion-go-logo-mount');
    var source = $('vgt-go-logo');
    if (!mount || !source || mount.getAttribute('data-mounted') === 'true') return;

    var clone = source.cloneNode(true);
    clone.removeAttribute('id');
    clone.classList.add('vgt-go-city', 'vgt-companion-go-logo');
    remapClonedSvgIds(clone, 'cmp-');

    mount.innerHTML = '';
    mount.appendChild(clone);
    mount.setAttribute('data-mounted', 'true');
  }

  function updateCompanionDashboard() {
    var radarEl = $('vgt-companion-radar-text');
    var vibeEl = $('vgt-companion-vibe-text');
    if (!radarEl && !vibeEl) return;

    var city = getMapCityLabel();
    var count = getMapActivityCount();
    var track = getSoundtrackTrack(getCurrentTheme());
    var trackLabel = soundtrackT(track.labelKey, track.fallback);
    var aigoName = companionT('companion_name');

    if (radarEl) {
      radarEl.textContent = companionT('companion_radar_status', {
        city: city,
        count: count,
      });
    }

    if (vibeEl) {
      vibeEl.textContent = companionT('companion_vibe_status', {
        name: aigoName,
        track: trackLabel,
      });
    }
  }

  function nextCompanionMsgId() {
    vgtCompanion.msgSeq += 1;
    return 'cmp-' + vgtCompanion.msgSeq;
  }

  function getMapActivityCount() {
    var markerCount = 0;
    if (vgtMap.markerLayer && typeof vgtMap.markerLayer.getLayers === 'function') {
      markerCount = vgtMap.markerLayer.getLayers().length;
    }
    return Math.max(MAP_EVENTS.length, markerCount);
  }

  function isMapActivityLow() {
    return getMapActivityCount() <= COMPANION_LOW_EVENT_THRESHOLD;
  }

  function detectCompanionLonelyMood(text) {
    var raw = String(text || '').toLowerCase();
    if (!raw.trim()) return false;
    for (var i = 0; i < COMPANION_MOOD_PATTERNS.length; i++) {
      if (raw.indexOf(COMPANION_MOOD_PATTERNS[i]) !== -1) return true;
    }
    return false;
  }

  function pushCompanionMessage(entry) {
    var msg = {
      id: nextCompanionMsgId(),
      role: entry.role || 'ai',
      text: entry.text || '',
      textKey: entry.textKey || null,
      showPulseCta: !!entry.showPulseCta,
      createdAt: new Date().toISOString(),
    };
    vgtCompanion.messages.push(msg);
    return msg;
  }

  function resolveCompanionMessageText(msg) {
    if (!msg) return '';
    if (msg.textKey) return companionT(msg.textKey);
    return msg.text || '';
  }

  function renderCompanionMessages() {
    var container = $('vgt-companion-messages');
    if (!container) return;

    container.innerHTML = '';

    vgtCompanion.messages.forEach(function (msg) {
      var isUser = msg.role === 'user';
      var wrap = document.createElement('div');
      wrap.className =
        'vgt-companion-bubble' +
        (isUser ? ' vgt-companion-bubble--user' : ' vgt-companion-bubble--ai');

      var textEl = document.createElement('p');
      textEl.className = 'vgt-companion-bubble__text';
      textEl.textContent = resolveCompanionMessageText(msg);
      wrap.appendChild(textEl);

      if (msg.showPulseCta && !isUser) {
        var actionBtn = document.createElement('button');
        actionBtn.type = 'button';
        actionBtn.className = 'vgt-companion-action';
        actionBtn.setAttribute('data-action', 'pulse');
        actionBtn.textContent = companionT('companion_pulse_cta');
        actionBtn.addEventListener('click', function () {
          openGoEventModal();
        });
        wrap.appendChild(actionBtn);
      }

      container.appendChild(wrap);
    });

    scrollCompanionToBottom(false);
    if (document.activeElement === $('vgt-companion-input')) {
      scheduleCompanionSmoothScroll();
    }
    renderHomeChatPreview();
  }

  var companionKeyboardState = {
    resizeTimeout: null,
    scrollTimeout: null,
    scrollRaf: null,
    lastHeight: null,
    lastTop: null,
    keyboardOpen: false,
  };

  var COMPANION_KEYBOARD_RESIZE_DELAY = 200;
  var COMPANION_KEYBOARD_SCROLL_DELAY = 250;

  function scrollCompanionToBottom(smooth) {
    var container = $('vgt-companion-messages');
    if (!container) return;

    var top = container.scrollHeight;
    if (typeof container.scrollTo === 'function') {
      container.scrollTo({
        top: top,
        behavior: smooth ? 'smooth' : 'auto',
      });
    } else {
      container.scrollTop = top;
    }
  }

  function scheduleCompanionSmoothScroll() {
    if (!isCompanionKeyboardContext()) return;

    if (companionKeyboardState.scrollTimeout) {
      clearTimeout(companionKeyboardState.scrollTimeout);
    }
    if (companionKeyboardState.scrollRaf) {
      cancelAnimationFrame(companionKeyboardState.scrollRaf);
    }

    companionKeyboardState.scrollTimeout = window.setTimeout(function () {
      companionKeyboardState.scrollRaf = requestAnimationFrame(function () {
        scrollCompanionToBottom(true);
      });
    }, COMPANION_KEYBOARD_SCROLL_DELAY);
  }

  function applyCompanionKeyboardLayout(vv, keyboardOpen) {
    var view = $('vgt-view-companion');
    if (!view) return;

    if (keyboardOpen && vv) {
      var nextHeight = Math.round(vv.height);
      var nextTop = Math.round(vv.offsetTop);

      if (
        companionKeyboardState.lastHeight === nextHeight &&
        companionKeyboardState.lastTop === nextTop
      ) {
        return;
      }

      companionKeyboardState.lastHeight = nextHeight;
      companionKeyboardState.lastTop = nextTop;

      document.body.classList.add('vgt-keyboard-open');
      setCompanionKeyboardOpen(true);
      syncTabbarVisibility();

      view.style.height = nextHeight + 'px';
      view.style.top = nextTop + 'px';
      view.style.bottom = 'auto';

      scheduleCompanionSmoothScroll();
      return;
    }

    companionKeyboardState.lastHeight = null;
    companionKeyboardState.lastTop = null;
    companionKeyboardState.keyboardOpen = false;

    view.style.height = '';
    view.style.top = '';
    view.style.bottom = '';

    if (!isCompanionKeyboardContext()) {
      setCompanionKeyboardOpen(false);
      document.body.classList.remove('vgt-keyboard-open');
      syncTabbarVisibility();
    }
  }

  function syncCompanionKeyboardViewportNow() {
    var vv = window.visualViewport;
    var keyboardHeight = vv ? window.innerHeight - vv.height : 0;
    var keyboardOpen = keyboardHeight > 80 && isCompanionKeyboardContext();

    companionKeyboardState.keyboardOpen = keyboardOpen;
    applyCompanionKeyboardLayout(vv, keyboardOpen);
  }

  function scheduleCompanionKeyboardViewportSync() {
    if (!isCompanionKeyboardContext()) return;

    if (companionKeyboardState.resizeTimeout) {
      clearTimeout(companionKeyboardState.resizeTimeout);
    }

    companionKeyboardState.resizeTimeout = window.setTimeout(function () {
      syncCompanionKeyboardViewportNow();
    }, COMPANION_KEYBOARD_RESIZE_DELAY);
  }

  function resetCompanionKeyboardViewport() {
    if (companionKeyboardState.resizeTimeout) {
      clearTimeout(companionKeyboardState.resizeTimeout);
      companionKeyboardState.resizeTimeout = null;
    }
    if (companionKeyboardState.scrollTimeout) {
      clearTimeout(companionKeyboardState.scrollTimeout);
      companionKeyboardState.scrollTimeout = null;
    }
    if (companionKeyboardState.scrollRaf) {
      cancelAnimationFrame(companionKeyboardState.scrollRaf);
      companionKeyboardState.scrollRaf = null;
    }

    companionKeyboardState.lastHeight = null;
    companionKeyboardState.lastTop = null;
    companionKeyboardState.keyboardOpen = false;
    syncCompanionKeyboardViewportNow();
  }

  function setCompanionKeyboardOpen(open) {
    var view = $('vgt-view-companion');
    if (view) view.classList.toggle('is-keyboard-open', !!open);
  }

  function isCompanionKeyboardContext() {
    var input = $('vgt-companion-input');
    return !!(input && document.activeElement === input);
  }

  function initCompanionKeyboard() {
    var input = $('vgt-companion-input');
    var view = $('vgt-view-companion');
    if (!input || !view || input.getAttribute('data-keyboard-bound')) return;

    input.setAttribute('data-keyboard-bound', 'true');

    input.addEventListener('focus', function () {
      setCompanionKeyboardOpen(true);
      scheduleCompanionKeyboardViewportSync();
      scheduleCompanionSmoothScroll();
    });

    input.addEventListener('blur', function () {
      window.setTimeout(function () {
        if (document.activeElement === input) return;
        resetCompanionKeyboardViewport();
      }, 120);
    });

    if (window.visualViewport && !window.__vgtCompanionVvBound) {
      window.__vgtCompanionVvBound = true;
      window.visualViewport.addEventListener('resize', scheduleCompanionKeyboardViewportSync);
    }
  }

  function maybeStartCompanionProactive() {
    if (vgtCompanion.proactiveShown || vgtCompanion.messages.length > 0) return;

    if (!isMapActivityLow()) return;

    pushCompanionMessage({ role: 'ai', textKey: 'companion_open_low_map' });
    vgtCompanion.proactiveShown = true;
    vgtCompanion.sessionStarted = true;
    renderCompanionMessages();
  }

  function onCompanionTabOpen() {
    mountCompanionGoLogo();
    updateCompanionDashboard();
    markChatAwarenessRead('companion');

    var client = getSupabaseClient();
    var afterCheck = function () {
      updateCompanionDashboard();
      maybeStartCompanionProactive();
      renderCompanionMessages();
    };

    if (client && appUnlocked) {
      loadMapEventsFromSupabase().then(afterCheck).catch(afterCheck);
    } else {
      afterCheck();
    }
  }

  function respondCompanionToUser(userText) {
    if (detectCompanionLonelyMood(userText) && !vgtCompanion.empathyDelivered) {
      pushCompanionMessage({
        role: 'ai',
        textKey: 'companion_empathy_response',
        showPulseCta: true,
      });
      vgtCompanion.empathyDelivered = true;
      return;
    }

    pushCompanionMessage({ role: 'ai', textKey: 'companion_reply_default' });
  }

  function sendCompanionMessage(rawText) {
    var text = String(rawText || '').trim();
    if (!text) return;

    vgtCompanion.sessionStarted = true;
    pushCompanionMessage({ role: 'user', text: text });
    renderCompanionMessages();

    window.setTimeout(function () {
      respondCompanionToUser(text);
      renderCompanionMessages();
    }, 480);
  }

  function initCompanion() {
    mountCompanionGoLogo();
    updateCompanionDashboard();
    initCompanionKeyboard();

    var form = $('vgt-companion-form');
    var input = $('vgt-companion-input');
    if (!form || form.getAttribute('data-bound')) return;

    form.setAttribute('data-bound', 'true');
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var value = input ? input.value : '';
      if (input) input.value = '';
      sendCompanionMessage(value);
    });
  }

  function refreshCompanionOnLanguageChange() {
    updateCompanionDashboard();
    if (!vgtCompanion.messages.length) return;
    renderCompanionMessages();
  }

  function setPulseMode(mode) {
    var phone = $('app-phone');
    if (!phone) return;
    phone.classList.remove('vgt-audio-beat', 'vgt-audio-breathe');
    if (mode === 'breathe') phone.classList.add('vgt-audio-breathe');
    if (mode === 'beat') phone.classList.add('vgt-audio-beat');
  }

  var SOUNDTRACK_TRACKS = {
    morning: {
      labelKey: 'soundtrack_morning',
      fallback: 'Morning Lo-Fi',
      src: 'https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3',
    },
    daytime: {
      labelKey: 'soundtrack_daytime',
      fallback: 'Daytime Lounge',
      src: 'https://prod-1.storage.jamendo.com/?trackid=1785569&format=mp32',
    },
    night: {
      labelKey: 'soundtrack_night',
      fallback: 'Night Deep House',
      src: 'https://prod-1.storage.jamendo.com/?trackid=1407464&format=mp32',
    },
  };

  var profileSoundtrack = {
    isPlaying: false,
    theme: null,
    fadeMs: 1200,
    targetVolume: 0.38,
    fadeFrame: null,
  };

  function soundtrackT(key, fallback) {
    if (window.GoTogetherI18n) return GoTogetherI18n.t(key);
    return fallback || key;
  }

  function getSoundtrackTrack(themeName) {
    return SOUNDTRACK_TRACKS[themeName] || SOUNDTRACK_TRACKS.morning;
  }

  function updateSoundtrackUi(themeName) {
    var track = getSoundtrackTrack(themeName || getCurrentTheme());
    var label = $('vgt-soundtrack-label');
    var player = $('vgt-home-soundtrack');
    var btn = $('vgt-soundtrack-play');
    if (label) label.textContent = soundtrackT(track.labelKey, track.fallback);
    if (player) player.classList.toggle('is-playing', profileSoundtrack.isPlaying);
    if (btn) btn.setAttribute('aria-pressed', String(profileSoundtrack.isPlaying));
    updateCompanionDashboard();
  }

  function fadeProfileSoundtrackVolume(audio, toVolume, durationMs, onDone) {
    if (!audio) {
      if (onDone) onDone();
      return;
    }
    if (profileSoundtrack.fadeFrame) cancelAnimationFrame(profileSoundtrack.fadeFrame);
    var from = audio.volume;
    var start = performance.now();
    var duration = durationMs || profileSoundtrack.fadeMs;

    function step(now) {
      var t = Math.min(1, (now - start) / duration);
      audio.volume = from + (toVolume - from) * t;
      if (t < 1) {
        profileSoundtrack.fadeFrame = requestAnimationFrame(step);
      } else if (onDone) {
        onDone();
      }
    }

    profileSoundtrack.fadeFrame = requestAnimationFrame(step);
  }

  function playProfileSoundtrack(themeName) {
    var audio = $('vgt-soundtrack-audio');
    if (!audio) return;

    var theme = themeName || getCurrentTheme();
    var track = getSoundtrackTrack(theme);
    profileSoundtrack.theme = theme;

    if (audio.dataset.src !== track.src) {
      audio.pause();
      audio.src = track.src;
      audio.dataset.src = track.src;
      audio.load();
    }

    audio.volume = 0;
    var playPromise = audio.play();
    if (playPromise && playPromise.catch) {
      playPromise.catch(function (err) {
        console.warn('[GoTogether] Soundtrack play failed', err);
      });
    }

    fadeProfileSoundtrackVolume(audio, profileSoundtrack.targetVolume, profileSoundtrack.fadeMs);
    profileSoundtrack.isPlaying = true;
    updateSoundtrackUi(theme);
    setPulseMode('beat');
  }

  function pauseProfileSoundtrack() {
    var audio = $('vgt-soundtrack-audio');
    if (!audio) return;

    fadeProfileSoundtrackVolume(audio, 0, profileSoundtrack.fadeMs, function () {
      audio.pause();
    });
    profileSoundtrack.isPlaying = false;
    updateSoundtrackUi(profileSoundtrack.theme);
    setPulseMode('breathe');
  }

  function toggleProfileSoundtrack() {
    if (profileSoundtrack.isPlaying) pauseProfileSoundtrack();
    else playProfileSoundtrack(getCurrentTheme());
  }

  function onSoundtrackThemeChange(themeName) {
    updateSoundtrackUi(themeName);
    if (profileSoundtrack.isPlaying) playProfileSoundtrack(themeName);
  }

  function initHomeSoundtrack() {
    var btn = $('vgt-soundtrack-play');
    if (!btn || btn.getAttribute('data-bound')) return;

    btn.setAttribute('data-bound', 'true');
    btn.addEventListener('click', function (event) {
      event.preventDefault();
      toggleProfileSoundtrack();
    });

    updateSoundtrackUi(getCurrentTheme());
    if (!profileSoundtrack.isPlaying) setPulseMode('breathe');
  }

  function $(id) {
    return document.getElementById(id);
  }

  function resolveCityKey(cityName) {
    var known = {
      berlin: 'berlin',
      chicago: 'chicago',
      prague: 'prague',
      kyiv: 'berlin',
      warsaw: 'berlin',
      vienna: 'berlin',
      paris: 'berlin',
      barcelona: 'berlin',
      'my-location': 'berlin',
    };
    return known[String(cityName || '').toLowerCase()] || 'berlin';
  }

  function getCurrentTheme() {
    return GEO_SLOTS[geoIndex].theme;
  }

  function getThemeMeta() {
    return THEME_META[getCurrentTheme()];
  }

  function setText(id, text) {
    var el = $(id);
    if (el) el.textContent = text;
  }

  function formatLangChip(lang) {
    var label = (lang.flag ? lang.flag + ' ' : '') + lang.code;
    if (lang.level) label += ' (' + lang.level + ')';
    return label;
  }

  function formatSpeakShort(personId) {
    var profile = VGT_PROFILES[personId];
    if (!profile || !profile.speak || !profile.speak.length) return '';
    var codes = profile.speak.map(function (lang) {
      return lang.code;
    });
    return '🗣 Speaks: ' + codes.join(', ');
  }

  function formatSpeakLine(personId) {
    var profile = VGT_PROFILES[personId];
    if (!profile || !profile.speak || !profile.speak.length) return '';
    return (
      '<span class="vgt-you-lang__label">I speak:</span> ' +
      profile.speak.map(formatLangChip).join(', ')
    );
  }

  function formatPracticeLine(personId) {
    var profile = VGT_PROFILES[personId];
    if (!profile || !profile.practice || !profile.practice.length) return '';
    return (
      '<span class="vgt-you-lang__label">I want to practice:</span> ' +
      profile.practice.map(formatLangChip).join(', ')
    );
  }

  function renderAnnaLanguages() {
    var block = $('vgt-you-lang-block');
    if (!block) return;

    var rows = [formatSpeakLine('anna'), formatPracticeLine('anna')].filter(Boolean);
    block.innerHTML = rows
      .map(function (row) {
        return '<p class="vgt-you-lang__row">' + row + '</p>';
      })
      .join('');
  }

  function renderMapFloatLanguages(personId) {
    setText('vgt-map-float-langs', formatSpeakShort(personId));
  }

  function renderAlertsLanguages() {
    document.querySelectorAll('.vgt-alert[data-vgt-person]').forEach(function (item) {
      var personId = item.getAttribute('data-vgt-person');
      var langEl = item.querySelector('.vgt-alert__langs');
      if (!langEl || !personId) return;
      langEl.textContent = formatSpeakShort(personId);
    });
  }

  function renderProfileLanguages(personId) {
    setText('vgt-profile-langs', formatSpeakShort(personId));
  }

  function initLanguages() {
    renderAnnaLanguages();
    renderAlertsLanguages();
    renderProfileLanguages('andrey');
  }

  function renderTrending(themeName) {
    var row = $('vgt-trending-row');
    if (!row) return;

    var meta = THEME_META[themeName] || THEME_META.morning;
    if (!meta || !meta.trends || !meta.trends.length) return;

    row.innerHTML = '';
    meta.trends.slice(0, 4).forEach(function (item, index) {
      var btn = document.createElement('button');
      btn.className = 'vgt-trending__item';
      btn.type = 'button';
      btn.setAttribute('role', 'listitem');
      var thumbClass =
        item.thumbClass || TRENDING_THUMB_CLASSES[index] || 'sunrise';
      btn.innerHTML =
        '<span class="vgt-trending__thumb vgt-trending__thumb--' +
        thumbClass +
        '">' +
        '<span class="vgt-trending__emoji" aria-hidden="true">' +
        (item.emoji || '✨') +
        '</span>' +
        '<span class="vgt-trending__label">' +
        escapeHtml(item.label) +
        '</span></span>';
      var thumb = btn.querySelector('.vgt-trending__thumb');
      if (thumb) {
        thumb.style.backgroundImage = buildTrendingThumbBackground(item);
      }
      row.appendChild(btn);
    });
  }

  function applyHomeContent(themeName) {
    var meta = THEME_META[themeName];

    if (window.GoTogetherI18n) {
      GoTogetherI18n.applyHome(themeName, meta.nearbyCount);
    }

    setText('vgt-warm-icon', meta.warmIcon);
    setText('vgt-warm-title', meta.warmTitle);
    setText('vgt-warm-meta', meta.warmMeta);
    setText('vgt-warm-match', meta.warmMatch);
    setText('vgt-warm-going', meta.warmGoing);
    setText('vgt-mood-icon', meta.moodIcon);
    setText('vgt-mood-title', meta.moodTitle);
    setText('vgt-mood-desc', meta.moodDesc);
    setText('vgt-mood-vibe', meta.moodVibe);

    var themeEvent = null;
    for (var i = 0; i < MAP_EVENTS.length; i++) {
      if (MAP_EVENTS[i].personId === meta.warmPersonId) {
        themeEvent = MAP_EVENTS[i];
        break;
      }
    }
    if (themeEvent) updateMapFloatCard(themeEvent);

    renderTrending(themeName);
  }

  function syncNightGoLogo(themeName) {
    var go = $('vgt-go-logo');
    if (!go) return;

    var isNight = themeName === 'night';
    go.classList.toggle('go-logo--night', isNight);
    go.classList.remove('go-logo--ember');
    go.setAttribute('data-go-mode', isNight ? 'night-city' : 'day-city');
  }

  function applyGeoSlot(index) {
    var phone = $('app-phone');
    if (!phone) return;

    var slot = GEO_SLOTS[index];
    if (!slot) return;

    var themeName = slot.theme;

    THEME_CLASSES.forEach(function (cls) {
      phone.classList.remove(cls);
    });
    phone.classList.add('phone-' + themeName);
    phone.setAttribute('data-vgt-city', resolveCityKey(vgtMap.activeCityKey || BERLIN_MAP.cityKey));

    var meta = THEME_META[themeName];
    updateThemePillLabels(themeName);

    applyHomeContent(themeName);
    updateMapTheme(themeName);
    syncNightGoLogo(themeName);

    if (vgtMap.map) {
      updateMapTheme(themeName);
    }

    onSoundtrackThemeChange(themeName);
  }

  function updateMapTheme(themeName) {
    if (!vgtMap.map || typeof L === 'undefined') return;

    var cfg = getMapTileConfig(themeName);
    if (vgtMap.tileLayer) vgtMap.map.removeLayer(vgtMap.tileLayer);
    vgtMap.tileLayer = L.tileLayer(cfg.url, {
      subdomains: cfg.subdomains,
      maxZoom: cfg.maxZoom,
      attribution: cfg.attribution,
    }).addTo(vgtMap.map);

    setTimeout(refreshLeafletMapSize, 120);
  }

  function getMapEventById(eventId) {
    for (var i = 0; i < MAP_EVENTS.length; i++) {
      if (MAP_EVENTS[i].id === eventId) return MAP_EVENTS[i];
    }
    return null;
  }

  function tMap(key, options) {
    if (window.GoTogetherI18n) return GoTogetherI18n.t(key, options);
    if (key === 'map_route_calc') return 'Calculating route…';
    if (key === 'map_min_walk') return (options && options.count ? options.count : 0) + ' min walk';
    return key;
  }

  function getEventMetaBase(event) {
    if (!event) return '';
    if (event.metaBase) return event.metaBase;
    return String(event.meta || '')
      .replace(/\s•\s[\d.]+\s*(km|m)\s*•\s*\d+\s*min walk\s*$/i, '')
      .replace(/\s•\s\d+\s*min walk\s*$/i, '')
      .trim();
  }

  function formatWalkDistance(meters) {
    if (!meters || meters < 0) return '';
    if (meters >= 1000) {
      var km = meters / 1000;
      return (km >= 10 ? km.toFixed(0) : km.toFixed(1).replace(/\.0$/, '')) + ' km';
    }
    return Math.round(meters) + ' m';
  }

  function formatWalkTime(seconds) {
    if (!seconds || seconds < 0) return '';
    var mins = Math.max(1, Math.round(seconds / 60));
    return tMap('map_min_walk', { count: mins });
  }

  function buildRouteMetaLabel(summary) {
    if (!summary) return '';
    return formatWalkDistance(summary.totalDistance) + ' • ' + formatWalkTime(summary.totalTime);
  }

  function getRouteLineStyle() {
    var isNight = getCurrentTheme() === 'night';
    return {
      color: isNight ? '#d4af37' : '#c4784a',
      weight: 4,
      opacity: 0.72,
      dashArray: '7, 11',
      lineCap: 'round',
      lineJoin: 'round',
    };
  }

  function ensureRoutingControl() {
    if (!vgtMap.map || typeof L === 'undefined' || typeof L.Routing === 'undefined') return null;
    if (vgtMap.routingControl) return vgtMap.routingControl;

    vgtMap.routingControl = L.Routing.control({
      waypoints: [],
      router: L.Routing.osrmv1({
        serviceUrl: 'https://router.project-osrm.org/route/v1',
        profile: 'foot',
      }),
      show: false,
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: false,
      lineOptions: {
        addWaypoints: false,
        styles: [getRouteLineStyle()],
      },
      createMarker: function () {
        return null;
      },
    }).addTo(vgtMap.map);

    vgtMap.routingControl.on('routesfound', function (e) {
      if (!e.routes || !e.routes.length) return;
      if (vgtMap.pendingRouteRequestId !== vgtMap.routeRequestId) return;

      var route = e.routes[0];
      vgtMap.routeLoading = false;
      vgtMap.lastRouteSummary = route.summary;

      var event = getMapEventById(vgtMap.selectedEventId);
      if (event) updateMapFloatCard(event, route.summary);
      fitRouteInView(route);
    });

    vgtMap.routingControl.on('routingerror', function () {
      if (vgtMap.pendingRouteRequestId !== vgtMap.routeRequestId) return;
      vgtMap.routeLoading = false;
      vgtMap.lastRouteSummary = null;
      var event = getMapEventById(vgtMap.selectedEventId);
      if (event) updateMapFloatCard(event);
    });

    return vgtMap.routingControl;
  }

  function fitRouteInView(route) {
    if (!vgtMap.map || !route || !route.coordinates || !route.coordinates.length) return;
    var bounds = L.latLngBounds(route.coordinates);
    vgtMap.map.fitBounds(bounds, { padding: [52, 52], maxZoom: 16, animate: true });
  }

  function planPedestrianRoute(event) {
    if (!event || !vgtMap.map) return;
    var routing = ensureRoutingControl();
    if (!routing) return;

    var origin = vgtMap.userLocation || BERLIN_MITTE;
    vgtMap.routeRequestId += 1;
    vgtMap.pendingRouteRequestId = vgtMap.routeRequestId;
    vgtMap.routeLoading = true;
    vgtMap.lastRouteSummary = null;
    updateMapFloatCard(event);

    routing.setWaypoints([
      L.latLng(origin[0], origin[1]),
      L.latLng(event.lat, event.lng),
    ]);
  }

  function updateUserMarker() {
    if (!vgtMap.map || !vgtMap.userLocation) return;

    var latlng = L.latLng(vgtMap.userLocation[0], vgtMap.userLocation[1]);
    var icon = L.divIcon({
      className: 'vgt-user-loc-wrap',
      html: '<span class="vgt-user-loc" aria-hidden="true"></span>',
      iconSize: [10, 10],
      iconAnchor: [5, 5],
    });

    if (!vgtMap.userMarker) {
      vgtMap.userMarker = L.marker(latlng, {
        icon: icon,
        zIndexOffset: 900,
        interactive: false,
      }).addTo(vgtMap.map);
      return;
    }

    vgtMap.userMarker.setLatLng(latlng);
    if (!vgtMap.map.hasLayer(vgtMap.userMarker)) vgtMap.userMarker.addTo(vgtMap.map);
  }

  function setUserLocation(latlng, reroute) {
    vgtMap.userLocation = latlng;
    updateUserMarker();
    if (reroute && vgtMap.selectedEventId) {
      var event = getMapEventById(vgtMap.selectedEventId);
      if (event) planPedestrianRoute(event);
    }
  }

  function initUserLocation(onReady) {
    function finish(coords) {
      setUserLocation(coords, false);
      if (typeof onReady === 'function') onReady();
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        function (pos) {
          finish([pos.coords.latitude, pos.coords.longitude]);
        },
        function () {
          finish(BERLIN_MITTE);
        },
        { enableHighAccuracy: false, timeout: 8000, maximumAge: 120000 }
      );
      return;
    }

    finish(BERLIN_MITTE);
  }

  function refreshUserLocation(reroute) {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      function (pos) {
        setUserLocation([pos.coords.latitude, pos.coords.longitude], reroute);
      },
      function () {},
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 30000 }
    );
  }

  function hideMapSearchResults() {
    var resultsEl = $('vgt-map-search-results');
    var input = $('vgt-map-search-input');
    if (!resultsEl) return;

    resultsEl.innerHTML = '';
    resultsEl.hidden = true;
    if (input) input.setAttribute('aria-expanded', 'false');
  }

  function initMapAddressSearch() {
    var controls = $('vgt-map-controls');
    var wrap = $('vgt-map-search');
    var input = $('vgt-map-search-input');
    var resultsEl = $('vgt-map-search-results');
    if (!wrap || !input || !resultsEl || wrap.getAttribute('data-bound')) return;

    wrap.setAttribute('data-bound', 'true');
    if (typeof L === 'undefined' || !L.Control || !L.Control.Geocoder) return;

    vgtMap.geocoder = L.Control.Geocoder.nominatim();

    if (typeof L.DomEvent !== 'undefined') {
      if (controls) {
        L.DomEvent.disableClickPropagation(controls);
        L.DomEvent.disableScrollPropagation(controls);
      } else {
        L.DomEvent.disableClickPropagation(wrap);
        L.DomEvent.disableScrollPropagation(wrap);
      }
    }

    function selectResult(result) {
      if (!result || !vgtMap.map) return;

      hideMapSearchResults();
      input.value = result.name || '';
      input.blur();

      if (result.bbox) {
        vgtMap.map.flyToBounds(result.bbox, { padding: [40, 40], maxZoom: 16, duration: 0.85 });
      } else if (result.center) {
        vgtMap.map.flyTo(result.center, 16, { duration: 0.85 });
      }
    }

    function renderResults(results) {
      resultsEl.innerHTML = '';
      if (!results || !results.length) {
        hideMapSearchResults();
        return;
      }

      results.slice(0, 5).forEach(function (result, index) {
        var li = document.createElement('li');
        var btn = document.createElement('button');
        var detail =
          result.properties && result.properties.display_name
            ? result.properties.display_name
            : '';

        btn.type = 'button';
        btn.className = 'vgt-map-search__result' + (index === 0 ? ' is-active' : '');
        btn.setAttribute('role', 'option');
        btn.textContent = result.name || detail || '';
        if (detail && detail !== btn.textContent) {
          var small = document.createElement('small');
          small.textContent = detail;
          btn.appendChild(small);
        }
        btn.addEventListener('click', function () {
          selectResult(result);
        });
        li.appendChild(btn);
        resultsEl.appendChild(li);
      });

      resultsEl.hidden = false;
      input.setAttribute('aria-expanded', 'true');
    }

    input.addEventListener('input', function () {
      clearTimeout(vgtMap.searchDebounce);
      var query = input.value.trim();
      if (query.length < 3) {
        hideMapSearchResults();
        return;
      }

      vgtMap.searchDebounce = setTimeout(function () {
        vgtMap.geocoder.geocode(query, function (results) {
          renderResults(results);
        });
      }, 280);
    });

    input.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') hideMapSearchResults();
    });

    document.addEventListener('click', function (event) {
      var root = controls || wrap;
      if (!root.contains(event.target)) hideMapSearchResults();
    });
  }

  function updateMapFloatCard(event, routeSummary) {
    if (!event) return;
    setText('vgt-map-float-icon', event.icon);
    setText('vgt-map-float-title', event.title);

    var meta = getEventMetaBase(event);
    if (routeSummary) {
      meta += ' • ' + buildRouteMetaLabel(routeSummary);
    } else if (vgtMap.routeLoading) {
      meta += ' • ' + tMap('map_route_calc');
    }

    setText('vgt-map-float-meta', meta);
    renderMapFloatLanguages(event.personId);
  }

  function syncMapPinActiveStates() {
    vgtMap.markers.forEach(function (entry) {
      var el = entry.marker.getElement();
      var isActive = entry.event.id === vgtMap.selectedEventId;
      entry.marker.setZIndexOffset(isActive ? 800 : 0);
      if (!el) return;
      var pin = el.querySelector('.vgt-map-pin');
      if (pin) pin.classList.toggle('is-active', isActive);
    });
  }

  function selectMapEvent(eventId) {
    var event = getMapEventById(eventId);
    if (!event) return;

    vgtMap.selectedEventId = eventId;
    updateMapFloatCard(event);
    syncMapPinActiveStates();
    planPedestrianRoute(event);
  }

  function applyMapCategoryFilter(category) {
    if (!vgtMap.map) return;

    vgtMap.activeFilter = category || 'all';
    var firstVisible = null;

    vgtMap.markers.forEach(function (entry) {
      var visible = vgtMap.activeFilter === 'all' || entry.event.category === vgtMap.activeFilter;

      if (visible) {
        if (!vgtMap.map.hasLayer(entry.marker)) entry.marker.addTo(vgtMap.map);
        if (!firstVisible) firstVisible = entry.event;
      } else if (vgtMap.map.hasLayer(entry.marker)) {
        vgtMap.map.removeLayer(entry.marker);
      }
    });

    if (firstVisible) {
      selectMapEvent(firstVisible.id);
    }
  }

  function buildCategoryPin(event, isActive) {
    return (
      '<button type="button" class="vgt-map-pin vgt-map-pin--' +
      event.category +
      (isActive ? ' is-active' : '') +
      ' vgt-pulse-target" data-event-id="' +
      event.id +
      '" aria-label="' +
      event.title +
      '">' +
      '<span class="vgt-map-pin__icon" aria-hidden="true">' +
      event.icon +
      '</span></button>'
    );
  }

  function bindMapMarkerEvents(marker, event) {
    marker.on('click', function () {
      selectMapEvent(event.id);
    });

    marker.on('add', function () {
      var el = marker.getElement();
      if (!el) return;
      L.DomEvent.disableClickPropagation(el);
      var pin = el.querySelector('.vgt-map-pin');
      if (pin) {
        pin.addEventListener('click', function (e) {
          e.preventDefault();
          selectMapEvent(event.id);
        });
      }
    });
  }

  function renderMapEventMarkers() {
    if (!vgtMap.map) return;

    vgtMap.markers.forEach(function (entry) {
      if (vgtMap.map.hasLayer(entry.marker)) {
        vgtMap.map.removeLayer(entry.marker);
      }
    });

    vgtMap.markers = [];

    MAP_EVENTS.forEach(function (event) {
      var isActive = vgtMap.selectedEventId === event.id;
      var icon = L.divIcon({
        className: 'vgt-map-pin-wrap',
        html: buildCategoryPin(event, isActive),
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      });
      var marker = L.marker([event.lat, event.lng], {
        icon: icon,
        riseOnHover: true,
      });
      bindMapMarkerEvents(marker, event);
      vgtMap.markers.push({ event: event, marker: marker });
    });

    applyMapCategoryFilter(vgtMap.activeFilter);

    if (!vgtMap.selectedEventId && MAP_EVENTS.length) {
      selectMapEvent(MAP_EVENTS[0].id);
    } else if (vgtMap.selectedEventId) {
      var current = getMapEventById(vgtMap.selectedEventId);
      if (current) {
        updateMapFloatCard(current, vgtMap.lastRouteSummary);
        syncMapPinActiveStates();
      }
    }
  }

  function initLeafletMap() {
    if (typeof L === 'undefined') {
      console.warn('[GoTogether] Leaflet.js not loaded');
      return;
    }

    var el = $('vgt-leaflet-map');
    if (!el || vgtMap.map) return;

    vgtMap.map = L.map(el, {
      zoomControl: false,
      attributionControl: false,
      dragging: true,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      boxZoom: false,
      keyboard: false,
      minZoom: 2,
      maxZoom: 18,
    }).setView(BERLIN_MAP.center, BERLIN_MAP.zoom);

    setActiveMapCity('berlin');

    updateMapTheme(getCurrentTheme());

    loadMapEventsFromSupabase().then(function () {
      if (!vgtMap.map) return;

      renderMapEventMarkers();

      initMapAddressSearch();
      initCitySheetModal();
      initUserLocation(function () {
        var selected = getMapEventById(vgtMap.selectedEventId);
        if (selected) planPedestrianRoute(selected);
      });

      vgtMap.initialized = true;
      refreshLeafletMapSize();
    });
  }

  function refreshLeafletMapSize() {
    if (!vgtMap.map) return;
    setTimeout(function () {
      vgtMap.map.invalidateSize();
    }, 180);
  }

  function initThemeToggle() {
    var phone = $('app-phone');
    if (!phone) return;

    applyGeoSlot(geoIndex);

    phone.querySelectorAll('[data-vgt-theme-toggle]').forEach(function (btn) {
      btn.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        geoIndex = (geoIndex + 1) % GEO_SLOTS.length;
        applyGeoSlot(geoIndex);
      });
    });
  }

  function showInPhoneScreen(screenId) {
    var phone = $('app-phone');
    if (!phone) return;

    phone.querySelectorAll('.app-screen').forEach(function (screen) {
      var id = screen.getAttribute('data-screen');
      var isActive = id === screenId;
      screen.classList.remove('is-leaving');
      screen.classList.toggle('is-active', isActive);
      screen.setAttribute('aria-hidden', String(!isActive));
    });

    syncTabbarVisibility();
    syncShellMetrics();
  }

  function transitionInPhoneScreen(fromId, toId, onDone) {
    var phone = $('app-phone');
    if (!phone) return;

    var fromScreen = phone.querySelector('.app-screen[data-screen="' + fromId + '"]');
    var toScreen = phone.querySelector('.app-screen[data-screen="' + toId + '"]');
    if (!fromScreen || !toScreen) return;

    fromScreen.classList.add('is-leaving');

    setTimeout(function () {
      fromScreen.classList.remove('is-active', 'is-leaving');
      fromScreen.setAttribute('aria-hidden', 'true');
      toScreen.classList.add('is-active');
      toScreen.setAttribute('aria-hidden', 'false');
      syncTabbarVisibility();
      syncShellMetrics();
      if (onDone) onDone();
    }, STARTUP_LEAVE_MS);
  }

  function unlockMainApp() {
    appUnlocked = true;
    transitionInPhoneScreen('auth', 'map', function () {
      switchVgtView('map');
      if (!vgtMap.initialized) initLeafletMap();
      else refreshLeafletMapSize();
      syncAppViewport();
      syncTabbarVisibility();
      initChatCurrentUser();
    });
  }

  function submitAuthForm() {
    var emailInput = $('vgt-auth-email');
    var passwordInput = $('vgt-auth-password');
    var confirmInput = $('vgt-auth-confirm-password');
    if (!emailInput || !passwordInput || !confirmInput) return;

    var cleanEmail = emailInput.value.trim().replace(/[\r\n\t]+/g, '');
    var cleanPassword = passwordInput.value;
    var confirmPassword = confirmInput.value;

    emailInput.value = cleanEmail;

    if (authMode !== 'reset' && !cleanEmail) {
      setAuthError(authText('auth_error_email_required'));
      return;
    }
    if (authMode !== 'forgot' && !cleanPassword) {
      setAuthError(authText('auth_error_required'));
      return;
    }
    if (authMode !== 'forgot' && cleanPassword.length < 6) {
      setAuthError(authText('auth_error_password_length'));
      return;
    }
    if ((authMode === 'register' || authMode === 'reset') && cleanPassword !== confirmPassword) {
      setAuthError(authText('auth_error_password_mismatch'));
      return;
    }

    setAuthStatus('');
    setAuthLoading(true);

    var authRequest;
    if (authMode === 'register') {
      authRequest = signUpWithSupabase(cleanEmail, cleanPassword).then(function (authData) {
        var user = authData.user || (authData.session && authData.session.user);
        if (authData.session && user) {
          return ensureUserProfile(user).then(function () {
            unlockMainApp();
          });
        }
        setAuthStatus(authText('auth_registration_check_email'), 'success');
        passwordInput.value = '';
        confirmInput.value = '';
        return null;
      });
    } else if (authMode === 'forgot') {
      authRequest = requestPasswordReset(cleanEmail).then(function () {
        setAuthStatus(authText('auth_reset_sent'), 'success');
      });
    } else if (authMode === 'reset') {
      authRequest = updatePassword(cleanPassword).then(function (authData) {
        var user = authData && authData.user;
        setAuthStatus(authText('auth_password_updated'), 'success');
        return ensureUserProfile(user).then(function () {
          unlockMainApp();
        });
      });
    } else {
      authRequest = signInWithSupabase(cleanEmail, cleanPassword).then(function (authData) {
        var user = authData.user || (authData.session && authData.session.user);
        if (!user) throw new Error('No user returned');
        return ensureUserProfile(user).then(function () {
          unlockMainApp();
        });
      });
    }

    authRequest
      .catch(function (err) {
        console.error('Auth failure:', err && err.message ? err.message : err);
        setAuthError(normalizeAuthError(err));
      })
      .finally(function () {
        setAuthLoading(false);
      });
  }


  function initStartupFlow() {
    var enterBtn = $('vgt-enter-city-btn');
    if (enterBtn && !enterBtn.getAttribute('data-bound')) {
      enterBtn.setAttribute('data-bound', 'true');
      enterBtn.addEventListener('click', function () {
        setAuthError('');
        transitionInPhoneScreen('promo', 'auth', function () {
          var emailInput = $('vgt-auth-email');
          if (emailInput) emailInput.focus();
        });
      });
    }

    var authBtn = $('vgt-auth-go-btn');
    if (authBtn && !authBtn.getAttribute('data-bound')) {
      authBtn.setAttribute('data-bound', 'true');
      authBtn.addEventListener('click', function () {
        submitAuthForm();
      });
    }

    document.querySelectorAll('.vgt-auth__tab[data-auth-mode]').forEach(function (tab) {
      if (tab.getAttribute('data-bound')) return;
      tab.setAttribute('data-bound', 'true');
      tab.addEventListener('click', function () {
        setAuthMode(tab.getAttribute('data-auth-mode') || 'login');
      });
    });

    var forgotBtn = $('vgt-auth-forgot-btn');
    if (forgotBtn && !forgotBtn.getAttribute('data-bound')) {
      forgotBtn.setAttribute('data-bound', 'true');
      forgotBtn.addEventListener('click', function () {
        setAuthMode('forgot');
        var emailInput = $('vgt-auth-email');
        if (emailInput) emailInput.focus();
      });
    }

    var backBtn = $('vgt-auth-back-btn');
    if (backBtn && !backBtn.getAttribute('data-bound')) {
      backBtn.setAttribute('data-bound', 'true');
      backBtn.addEventListener('click', function () {
        setAuthMode('login');
      });
    }

    var authForm = $('vgt-auth-form');
    if (authForm && !authForm.getAttribute('data-bound')) {
      authForm.setAttribute('data-bound', 'true');
      authForm.addEventListener('submit', function (event) {
        event.preventDefault();
        submitAuthForm();
      });
    }

    setAuthMode(authMode);
  }

  function setShellHeaderVisible(visible) {
    var head = $('vgt-app-head');
    if (!head) return;
    head.hidden = !visible;
    head.setAttribute('aria-hidden', String(!visible));
  }

  function switchVgtView(tabId) {
    var phone = $('app-phone');
    if (!phone) return;
    if (VGT_VIEWS.indexOf(tabId) === -1) return;

    phone.querySelectorAll('.vgt-view[data-vgt-view]').forEach(function (view) {
      var viewId = view.getAttribute('data-vgt-view');
      var isActive = viewId === tabId;
      view.classList.toggle('is-active', isActive);
      view.setAttribute('aria-hidden', String(!isActive));
    });

    phone.querySelectorAll('.vgt-tabbar__btn[data-vgt-tab]').forEach(function (btn) {
      var btnTab = btn.getAttribute('data-vgt-tab');
      var isTabRoute = VGT_TABS.indexOf(tabId) !== -1;
      var isActive = isTabRoute && btnTab === tabId;
      btn.classList.toggle('vgt-tabbar__btn--active', isActive);
      btn.setAttribute('aria-current', isActive ? 'page' : 'false');
    });

    setShellHeaderVisible(tabId === 'home' || tabId === 'map');

    if (tabId === 'chat') {
      closeChatThread();
      showChatThreadPanel(false);
      loadChatThreads();
    }

    if (tabId === 'you') {
      if (appUnlocked) {
        getActiveSessionUser().then(function (user) {
          if (user) return loadUserProfile(user);
          updateVerificationBadges();
        });
      } else {
        updateVerificationBadges();
      }
    }

    if (tabId === 'map') {
      if (!vgtMap.initialized) initLeafletMap();
      refreshLeafletMapSize();
    }

    if (tabId === 'companion') {
      onCompanionTabOpen();
    }
  }

  function initMapChips() {
    var chips = $('vgt-map-chips');
    if (!chips || chips.getAttribute('data-bound')) return;

    chips.setAttribute('data-bound', 'true');
    chips.addEventListener('click', function (event) {
      var chip = event.target.closest('.vgt-map-chip');
      if (!chip || !chips.contains(chip)) return;

      chips.querySelectorAll('.vgt-map-chip').forEach(function (c) {
        c.classList.remove('is-active');
        c.setAttribute('aria-selected', 'false');
      });
      chip.classList.add('is-active');
      chip.setAttribute('aria-selected', 'true');

      var category = chip.getAttribute('data-map-cat') || 'all';
      applyMapCategoryFilter(category);
    });
  }

  function initMapLocate() {
    var btn = $('vgt-map-locate');
    if (!btn || btn.getAttribute('data-bound')) return;

    btn.setAttribute('data-bound', 'true');
    btn.addEventListener('click', function () {
      if (!vgtMap.map) return;
      refreshUserLocation(true);
      setActiveMapCity('my-location');
      var loc = vgtMap.userLocation || BERLIN_MITTE;
      vgtMap.map.flyTo(loc, MAP_CITY_ZOOM, { animate: true, duration: MAP_FLY_DURATION });
    });
  }

  function setGoModalError(message) {
    var errorEl = $('vgt-go-modal-error');
    if (!errorEl) return;

    if (!message) {
      errorEl.textContent = '';
      errorEl.hidden = true;
      return;
    }

    errorEl.textContent = message;
    errorEl.hidden = false;
  }

  function setGoModalPublishing(isPublishing) {
    goModalState.publishing = !!isPublishing;
    var btn = $('vgt-go-publish-btn');
    if (btn) {
      btn.disabled = !!isPublishing;
      btn.setAttribute('aria-busy', String(!!isPublishing));
    }
  }

  function openGoEventModal() {
    if (!appUnlocked) {
      transitionInPhoneScreen('promo', 'auth', function () {
        var emailInput = $('vgt-auth-email');
        if (emailInput) emailInput.focus();
      });
      return;
    }

    var modal = $('vgt-go-modal');
    var titleInput = $('vgt-go-event-title');
    if (!modal) return;

    setGoModalError('');
    goModalState.selectedCategory = 'coffee';

    var cats = $('vgt-go-modal-cats');
    if (cats) {
      cats.querySelectorAll('.vgt-go-modal__cat').forEach(function (btn) {
        var isCoffee = btn.getAttribute('data-go-cat') === 'coffee';
        btn.classList.toggle('is-active', isCoffee);
        btn.setAttribute('aria-checked', String(isCoffee));
      });
    }

    if (titleInput) titleInput.value = '';

    modal.hidden = false;
    document.body.classList.add('vgt-go-modal-open');

    if (!vgtMap.map) initLeafletMap();
    if (titleInput) setTimeout(function () { titleInput.focus(); }, 120);
  }

  function closeGoEventModal() {
    var modal = $('vgt-go-modal');
    if (!modal) return;

    modal.hidden = true;
    document.body.classList.remove('vgt-go-modal-open');
    setGoModalError('');
    setGoModalPublishing(false);
  }

  function ensureMapInstance() {
    if (!vgtMap.map) initLeafletMap();
    if (!vgtMap.map) return Promise.reject(new Error('Map is not available'));
    return Promise.resolve(vgtMap.map);
  }

  function publishGoEvent() {
    if (goModalState.publishing) return;

    var titleInput = $('vgt-go-event-title');
    var title = titleInput ? titleInput.value.trim() : '';
    var category = goModalState.selectedCategory || 'coffee';

    if (!title) {
      setGoModalError(tMap('go_modal_error_title') || 'Please enter an event title.');
      return;
    }

    if (!appUnlocked) {
      setGoModalError(tMap('go_modal_error_auth') || 'Please sign in first.');
      return;
    }

    setGoModalError('');
    setGoModalPublishing(true);

    ensureMapInstance()
      .then(function (map) {
        return getActiveSessionUser().then(function (user) {
          if (!user) throw new Error(tMap('go_modal_error_auth') || 'Please sign in first.');
          return ensureUserProfile(user).then(function () {
            return { user: user, map: map };
          });
        });
      })
      .then(function (ctx) {
        var center = ctx.map.getCenter();
        var client = getSupabaseClient();
        if (!client) throw new Error('Supabase is not initialized');

        var payload = buildEventInsertPayload(
          ctx.user.id,
          title,
          category,
          center.lat,
          center.lng
        );

        return insertMapEvent(client, payload).then(function (insertResult) {
          if (insertResult.error) throw insertResult.error;
          return insertResult.data;
        });
      })
      .then(function (createdEvent) {
        closeGoEventModal();
        return refreshMapMarkers().then(function () {
          switchVgtView('map');
          if (createdEvent && vgtMap.map) {
            vgtMap.map.flyTo(
              [createdEvent.latitude, createdEvent.longitude],
              Math.max(MAP_CITY_ZOOM, 14),
              { animate: true, duration: MAP_FLY_DURATION }
            );
          }
          if (createdEvent && createdEvent.id) selectMapEvent(createdEvent.id);
          showYouToast(tMap('go_event_published') || 'Event published!');
        });
      })
      .catch(function (err) {
        var message =
          (err && err.message) ||
          tMap('go_modal_error_publish') ||
          'Could not publish event. Try again.';
        setGoModalError(message);
      })
      .finally(function () {
        setGoModalPublishing(false);
      });
  }

  function initGoEventModal() {
    var modal = $('vgt-go-modal');
    if (!modal || modal.getAttribute('data-bound')) return;

    modal.setAttribute('data-bound', 'true');

    modal.querySelectorAll('[data-go-modal-close]').forEach(function (btn) {
      btn.addEventListener('click', closeGoEventModal);
    });

    var cats = $('vgt-go-modal-cats');
    if (cats) {
      cats.querySelectorAll('.vgt-go-modal__cat').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var category = btn.getAttribute('data-go-cat');
          if (!category) return;

          goModalState.selectedCategory = category;
          cats.querySelectorAll('.vgt-go-modal__cat').forEach(function (item) {
            var isActive = item === btn;
            item.classList.toggle('is-active', isActive);
            item.setAttribute('aria-checked', String(isActive));
          });
        });
      });
    }

    var publishBtn = $('vgt-go-publish-btn');
    if (publishBtn) {
      publishBtn.addEventListener('click', publishGoEvent);
    }

    var titleInput = $('vgt-go-event-title');
    if (titleInput) {
      titleInput.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
          event.preventDefault();
          publishGoEvent();
        }
      });
    }

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && modal && !modal.hidden) closeGoEventModal();
    });
  }

  function showYouToast(message) {
    var toast = $('vgt-you-toast');
    if (!toast) return;

    toast.textContent = message;
    toast.classList.add('is-visible');
    toast.setAttribute('aria-hidden', 'false');

    if (youToastTimer) clearTimeout(youToastTimer);
    youToastTimer = setTimeout(function () {
      toast.classList.remove('is-visible');
      toast.setAttribute('aria-hidden', 'true');
    }, 3200);
  }

  function initPulseControls() {
    var grid = $('vgt-pulse-grid');
    if (!grid || grid.getAttribute('data-bound')) return;

    grid.setAttribute('data-bound', 'true');
    grid.querySelectorAll('.vgt-pulse-cat').forEach(function (btn) {
      btn.addEventListener('click', function () {
        grid.querySelectorAll('.vgt-pulse-cat').forEach(function (b) {
          b.classList.remove('vgt-pulse-cat--selected');
        });
        btn.classList.add('vgt-pulse-cat--selected');
      });
    });
  }

  function initProfileBtn() {
    var btn = $('vgt-profile-btn');
    if (!btn || btn.getAttribute('data-bound')) return;

    btn.setAttribute('data-bound', 'true');
    btn.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      switchVgtView('you');
    });
  }

  function initYouProfile() {
    var form = $('vgt-you-form');
    if (form && !form.getAttribute('data-you-bound')) {
      form.setAttribute('data-you-bound', 'true');
      form.addEventListener('submit', saveUserProfile);
    }

    var bioInput = $('vgt-you-bio-input');
    if (bioInput && !bioInput.getAttribute('data-you-bound')) {
      bioInput.setAttribute('data-you-bound', 'true');
      bioInput.addEventListener('input', function () {
        var bioCount = $('vgt-you-bio-count');
        if (bioCount) bioCount.textContent = String(bioInput.value.length);
        updateVerificationBadges();
      });
    }

    var nameInput = $('vgt-you-name-input');
    if (nameInput && !nameInput.getAttribute('data-you-bound')) {
      nameInput.setAttribute('data-you-bound', 'true');
      nameInput.addEventListener('input', function () {
        var displayName = $('vgt-you-display-name');
        if (displayName) {
          displayName.textContent = nameInput.value.trim() || profileT('you_name_label');
        }
        updateVerificationBadges();
      });
    }

    var avatarInput = $('vgt-you-avatar-input');
    if (avatarInput && !avatarInput.getAttribute('data-you-bound')) {
      avatarInput.setAttribute('data-you-bound', 'true');
      avatarInput.addEventListener('change', function () {
        var file = avatarInput.files && avatarInput.files[0];
        if (!file || !file.type.startsWith('image/')) return;
        vgtProfile.pendingAvatarFile = file;
        readFileAsDataUrl(file).then(function (url) {
          vgtProfile.pendingAvatarPreview = url;
          updateAvatarPreview(url);
          updateVerificationBadges();
        });
      });
    }

    var grid = $('vgt-you-hobbies-grid');
    if (grid && !grid.getAttribute('data-you-bound')) {
      grid.setAttribute('data-you-bound', 'true');
      grid.querySelectorAll('.vgt-you-hobby[data-hobby]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var pressed = btn.getAttribute('aria-pressed') === 'true';
          btn.setAttribute('aria-pressed', String(!pressed));
          btn.classList.toggle('is-selected', !pressed);
          updateVerificationBadges();
        });
      });
    }

    getActiveSessionUser().then(function (user) {
      if (user) return loadUserProfile(user);
      updateVerificationBadges();
    });
  }

  function initVgtTabBar() {
    var tabbar = $('vgt-tabbar');
    if (!tabbar) return;

    switchVgtView(VGT_DEFAULT_TAB);

    tabbar.querySelectorAll('.vgt-tabbar__btn[data-vgt-tab]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var tabId = btn.getAttribute('data-vgt-tab');
        if (tabId === 'pulse') {
          openGoEventModal();
          return;
        }
        if (VGT_TABS.indexOf(tabId) !== -1) switchVgtView(tabId);
      });
    });

    initGoEventModal();
    initYouProfile();
    initPulseControls();
    initProfileBtn();
    initMapChips();
    initMapLocate();
  }

  function initBreathPulse() {
    setPulseMode('breathe');
  }

  var DEFAULT_SCREEN = 'map';

  function switchAppScreen(screenId) {
    var phone = $('app-phone');
    if (!phone) return;

    if (screenId === 'map' && !appUnlocked) {
      showInPhoneScreen('promo');
    } else {
      phone.querySelectorAll('.app-screen').forEach(function (screen) {
        var isActive = screen.getAttribute('data-screen') === screenId;
        screen.classList.remove('is-leaving');
        screen.classList.toggle('is-active', isActive);
        screen.setAttribute('aria-hidden', String(!isActive));
      });
    }

    document.querySelectorAll('.nav__link[data-screen]').forEach(function (link) {
      var isActive = link.getAttribute('data-screen') === screenId;
      link.classList.toggle('nav__link--active', isActive);
      link.setAttribute('aria-current', isActive ? 'page' : 'false');
    });

    if (screenId === 'map' && appUnlocked) switchVgtView(VGT_DEFAULT_TAB);
  }

  function initPhoneScreens() {
    var phone = $('app-phone');
    if (!phone) return;

    var navLinks = document.querySelectorAll('.nav__link[data-screen]');
    if (navLinks.length) {
      switchAppScreen(DEFAULT_SCREEN);
      if (!appUnlocked) showInPhoneScreen('promo');

      navLinks.forEach(function (link) {
        link.addEventListener('click', function (e) {
          e.preventDefault();
          var screenId = link.getAttribute('data-screen');
          if (!screenId) return;
          switchAppScreen(screenId);
        });
      });
    }

    var backBtn = phone.querySelector('.app-profile__back');
    if (backBtn) {
      backBtn.addEventListener('click', function () {
        switchAppScreen('map');
      });
    }
  }

  function initMobileNav() {
    var toggle = document.querySelector('.nav-toggle');
    var nav = $('main-nav');
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

  function initDownloadButtons() {
    document.querySelectorAll('[data-download]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        alert('GoTogether — coming soon to App Store & Google Play.');
      });
    });
  }

  var lockedLayout = { width: 0, height: 0 };

  function resetLockedLayout() {
    lockedLayout.width = window.innerWidth;
    lockedLayout.height = window.innerHeight;
  }

  function syncTabbarVisibility() {
    var tabbar = $('vgt-tabbar');
    var phone = $('app-phone');
    if (!tabbar || !phone) return;

    var mainScreen = phone.querySelector('.app-screen[data-screen="map"]');
    var show = !!(mainScreen && mainScreen.classList.contains('is-active') && appUnlocked);
    if (document.body.classList.contains('vgt-keyboard-open')) show = false;

    tabbar.hidden = !show;
    tabbar.setAttribute('aria-hidden', String(!show));
  }

  function scrollFieldIntoView(field) {
    if (!field) return;

    if (
      field.id === 'vgt-companion-input' ||
      (typeof field.closest === 'function' && field.closest('.vgt-companion-compose'))
    ) {
      scheduleCompanionSmoothScroll();
      return;
    }

    if (typeof field.scrollIntoView !== 'function') return;
    var pane = field.closest('.vgt-scroll-pane');
    if (pane) {
      var fieldTop = field.getBoundingClientRect().top;
      var paneTop = pane.getBoundingClientRect().top;
      var offset = fieldTop - paneTop - 12;
      pane.scrollTop += offset;
      return;
    }
    field.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }

  function syncShellMetrics() {
    var tabbar = $('vgt-tabbar');
    var root = document.documentElement;

    var tabbarH = tabbar && !tabbar.hidden ? tabbar.offsetHeight : 48;
    root.style.setProperty('--vgt-tabbar-h', tabbarH + 'px');
    root.style.setProperty('--vgt-safe-bottom', 'env(safe-area-inset-bottom, 0px)');
    root.style.setProperty(
      '--vgt-shell-bottom',
      'calc(' + tabbarH + 'px + env(safe-area-inset-bottom, 0px))'
    );
  }

  function syncAppViewport() {
    var phone = $('app-phone');
    if (!phone || !document.body.classList.contains('vgt-app-root')) return;

    if (!lockedLayout.height) resetLockedLayout();

    var vw = lockedLayout.width;
    var vh = lockedLayout.height;

    document.documentElement.style.setProperty('--vgt-viewport-h', vh + 'px');
    document.documentElement.style.setProperty('--vgt-viewport-w', vw + 'px');

    var stage = document.querySelector('.vgt-app-stage');
    if (stage) {
      stage.style.transform = '';
    }

    phone.style.width = '100%';
    phone.style.height = '100%';
    phone.style.transform = 'none';
    phone.style.marginLeft = '0';
    phone.style.left = '0';
    phone.style.top = '0';

    window.scrollTo(0, 0);
    syncShellMetrics();

    if (vgtMap.initialized) refreshLeafletMapSize();
  }

  function initAppViewport() {
    document.documentElement.classList.add('vgt-app-root');
    document.body.classList.add('vgt-app-root');
    resetLockedLayout();
    syncAppViewport();
    syncShellMetrics();
    syncTabbarVisibility();

    var resizeTimer = null;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        var widthDelta = Math.abs(window.innerWidth - lockedLayout.width);
        if (widthDelta > 48) {
          resetLockedLayout();
          syncAppViewport();
        }
      }, 150);
    });

    window.addEventListener('orientationchange', function () {
      setTimeout(function () {
        resetLockedLayout();
        syncAppViewport();
        syncCompanionKeyboardViewportNow();
      }, 200);
    });

    if (window.visualViewport) {
      var vvScrollTimer = null;
      window.visualViewport.addEventListener('scroll', function () {
        if (isCompanionKeyboardContext()) return;
        if (vvScrollTimer) clearTimeout(vvScrollTimer);
        vvScrollTimer = window.setTimeout(function () {
          window.scrollTo(0, 0);
        }, 50);
      });
    }

    document.addEventListener('focusin', function (event) {
      var target = event.target;
      if (!target) return;
      var tag = target.tagName;
      if (tag !== 'INPUT' && tag !== 'TEXTAREA' && tag !== 'SELECT') return;
      setTimeout(function () {
        scrollFieldIntoView(target);
      }, 320);
    });
  }

  function bootApp() {
    var recoveryRequested = hasPasswordRecoveryUrl();

    if (typeof window.initGoSupabase === 'function') {
      window.initGoSupabase();
    }

    if (window.GoTogetherI18n) {
      GoTogetherI18n.onLanguageChanged = function () {
        applyHomeContent(getCurrentTheme());
        updateThemePillLabels(getCurrentTheme());
        var event = getMapEventById(vgtMap.selectedEventId);
        if (event) updateMapFloatCard(event, vgtMap.lastRouteSummary);
        if (window.GoTogetherI18n) GoTogetherI18n.applyDom();
        renderChatThreads();
        renderChatMessages();
        renderHomeChatPreview();
        refreshCompanionOnLanguageChange();
        updateVerificationBadges();
        updateSoundtrackUi(getCurrentTheme());
        updateCompanionDashboard();
      };
      if (window.i18next) {
        VGT_USER_PROFILE.interfaceLanguage = GoTogetherI18n.normalizeLang(
          window.i18next.language
        );
      }
    }

    initThemeToggle();
    initStartupFlow();
    if (recoveryRequested) setAuthMode('reset');
    initLanguages();
    initChat();
    initCompanion();
    initVgtTabBar();
    initHomeSoundtrack();
    initPhoneScreens();
    initMobileNav();
    initScrollReveal();
    initDownloadButtons();
    initBreathPulse();
    initAppViewport();
    initGreetingSparkle();

    if (recoveryRequested) {
      showInPhoneScreen('auth');
    } else {
      initAuthSession().then(function (restored) {
        if (!restored) showInPhoneScreen('promo');
      });
    }

    var client = getSupabaseClient();
    if (client) {
      client.auth.onAuthStateChange(function (event, session) {
        if (event === 'PASSWORD_RECOVERY') {
          appUnlocked = false;
          setAuthMode('reset');
          showInPhoneScreen('auth');
          window.setTimeout(function () {
            var passwordInput = $('vgt-auth-password');
            if (passwordInput) passwordInput.focus();
          }, 250);
          return;
        }
        if (event === 'SIGNED_OUT') {
          appUnlocked = false;
          vgtChat.currentUserId = null;
          unsubscribeChatRealtime();
          closeChatThread();
          showInPhoneScreen('promo');
        }
        if (event === 'SIGNED_IN' && session && session.user) {
          ensureUserProfile(session.user).then(function () {
            vgtChat.currentUserId = session.user.id;
            initChatCurrentUser();
          });
        }
      });
    }
  }

  function init() {
    if (window.GoTogetherI18n) {
      GoTogetherI18n.init()
        .then(bootApp)
        .catch(function (err) {
          console.warn('[GoTogether] i18n unavailable, booting with defaults', err);
          document.body.classList.add('vgt-i18n-ready');
          if (window.GoTogetherI18n && GoTogetherI18n.syncLangSwitcherLabels) {
            GoTogetherI18n.syncLangSwitcherLabels();
          }
          bootApp();
        });
      return;
    }
    bootApp();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
