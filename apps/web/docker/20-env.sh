#!/bin/sh
set -eu
# Gera /usr/share/nginx/html/env.js com base nas variáveis de ambiente
BASE_URL="${BASE_URL:-__BASE_URL__}"
API_BASE_URL="${API_BASE_URL:-__API_BASE_URL__}"
SUPABASE_URL="${SUPABASE_URL:-__SUPABASE_URL__}"
SUPABASE_PUBLISHABLE_KEY="${SUPABASE_PUBLISHABLE_KEY:-__SUPABASE_PUBLISHABLE_KEY__}"

cat >/usr/share/nginx/html/env.js <<EOF
window.__env = {
  BASE_URL: "${BASE_URL}",
  API_BASE_URL: "${API_BASE_URL}",
  SUPABASE_URL: "${SUPABASE_URL}",
  SUPABASE_PUBLISHABLE_KEY: "${SUPABASE_PUBLISHABLE_KEY}"
};
EOF
