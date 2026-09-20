/**
 * GoTogether — Supabase client bootstrap
 */
(function () {
  'use strict';

  var SUPABASE_URL = 'https://qsslnhhdvosskhisjrna.supabase.co';
  var SUPABASE_ANON_KEY = 'sb_publishable_vsxHOqASsPlktlVGJOV20g_bsbyotu6';

  window.GO_SUPABASE = {
    url: SUPABASE_URL,
    anonKey: SUPABASE_ANON_KEY,
    client: null,
  };

  function initGoSupabase() {
    if (typeof window.supabase === 'undefined' || !window.supabase.createClient) {
      console.warn('[GoTogether] Supabase JS library is not loaded');
      return null;
    }

    if (window.GO_SUPABASE.client) return window.GO_SUPABASE.client;

    window.GO_SUPABASE.client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });

    window.supabaseClient = window.GO_SUPABASE.client;
    return window.GO_SUPABASE.client;
  }

  window.initGoSupabase = initGoSupabase;
})();
