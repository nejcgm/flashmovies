#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WEB_ENV="$ROOT/../../apps/web/.env"

if [[ ! -f "$WEB_ENV" ]]; then
  echo "Missing apps/web/.env"
  exit 1
fi

VITE_API_KEY="$(
  node -e "
    const fs = require('node:fs');
    const envPath = process.argv[1];
    const line = fs.readFileSync(envPath, 'utf8')
      .split('\n')
      .find((entry) => entry.startsWith('VITE_API_KEY='));
    if (!line) process.exit(1);
    process.stdout.write(line.slice('VITE_API_KEY='.length).trim());
  " "$WEB_ENV"
)"

if [[ -z "$VITE_API_KEY" ]]; then
  echo "VITE_API_KEY is not set in apps/web/.env"
  exit 1
fi

cd "$ROOT"
npm test
printf '%s' "$VITE_API_KEY" | npx wrangler secret put TMDB_API_KEY
npx wrangler deploy

echo ""
echo "Deploy complete. Verify with:"
echo '  curl -s -A "Googlebot" "https://flashmovies.xyz/" | rg "description"'
