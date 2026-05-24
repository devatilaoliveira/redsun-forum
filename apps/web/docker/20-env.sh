#!/bin/sh
set -eu
# Gera /usr/share/nginx/html/env.js com base nas variáveis de ambiente
BASE_URL="${BASE_URL:-__BASE_URL__}"
API_BASE_URL="${API_BASE_URL:-__API_BASE_URL__}"
SUPABASE_URL="${SUPABASE_URL:-__SUPABASE_URL__}"
SUPABASE_ANON_KEY="${SUPABASE_ANON_KEY:-__SUPABASE_ANON_KEY__}"

cat >/usr/share/nginx/html/env.js <<EOF
window.__env = {
  BASE_URL: "${BASE_URL}",
  API_BASE_URL: "${API_BASE_URL}",
  SUPABASE_URL: "${SUPABASE_URL}",
  SUPABASE_ANON_KEY: "${SUPABASE_ANON_KEY}"
};
EOF
