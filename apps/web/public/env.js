// Default runtime configuration used by the dev server.
// Docker replaces this file at container start with real values.
(function initEnv() {
  window.__env = window.__env || {
    BASE_URL: "__BASE_URL__",
    API_BASE_URL: "__API_BASE_URL__",
    SUPABASE_URL: "__SUPABASE_URL__",
    SUPABASE_PUBLISHABLE_KEY: "__SUPABASE_PUBLISHABLE_KEY__",
  };
})();
