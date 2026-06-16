const fs = require('node:fs');
const path = require('node:path');

const env = {
  BASE_URL: process.env.BASE_URL || '__BASE_URL__',
  API_BASE_URL: process.env.API_BASE_URL || '__API_BASE_URL__',
  SUPABASE_URL: process.env.SUPABASE_URL || '__SUPABASE_URL__',
  SUPABASE_PUBLISHABLE_KEY:
    process.env.SUPABASE_PUBLISHABLE_KEY || '__SUPABASE_PUBLISHABLE_KEY__',
};

env.baseUrl = env.BASE_URL;
env.apiBaseUrl = env.API_BASE_URL;
env.supabaseUrl = env.SUPABASE_URL;
env.supabasePublishableKey = env.SUPABASE_PUBLISHABLE_KEY;

const serializedEnv = JSON.stringify(env, null, 2)
  .split('\n')
  .map((line, index) => (index === 0 ? line : `  ${line}`))
  .join('\n');

const envFile = `// Generated during the Cloudflare Pages build.
(function initEnv() {
  window.__env = ${serializedEnv};
})();
`;

fs.writeFileSync(path.join(__dirname, '..', 'public', 'env.js'), envFile);
