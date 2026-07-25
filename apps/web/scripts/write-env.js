const fs = require('node:fs');
const path = require('node:path');

const value = (name, fallback) => process.env[name]?.trim() || fallback;

const env = {
  APP_ENV: value('APP_ENV', 'prod'),
  BASE_URL: value('BASE_URL', '__BASE_URL__'),
  API_BASE_URL: value('API_BASE_URL', '__API_BASE_URL__'),
  SUPABASE_URL: value('SUPABASE_URL', '__SUPABASE_URL__'),
  SUPABASE_PUBLISHABLE_KEY: value('SUPABASE_PUBLISHABLE_KEY', '__SUPABASE_PUBLISHABLE_KEY__'),
};

const serializedEnv = JSON.stringify(env, null, 2)
  .split('\n')
  .map((line, index) => (index === 0 ? line : `  ${line}`))
  .join('\n');

const envFile = `// Generated from runtime environment variables.
(function initEnv() {
  window.__env = ${serializedEnv};
})();
`;

fs.writeFileSync(path.join(__dirname, '..', 'public', 'env.js'), envFile);
