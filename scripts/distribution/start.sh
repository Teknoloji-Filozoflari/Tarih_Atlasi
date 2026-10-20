#!/bin/sh
set -eu
cd -- "$(CDPATH='' cd -- "$(dirname -- "$0")" && pwd)"
if ! command -v node >/dev/null 2>&1; then
  echo 'Node.js 24 veya 26 gereklidir. Alternatif: Releases Docker paketini kullanın.' >&2
  exit 1
fi
node -e 'if (![24,26].includes(Number(process.versions.node.split(".")[0]))) process.exit(1)' || {
  echo 'Bu paket Node.js 24 veya 26 gerektirir.' >&2
  exit 1
}
node scripts/verify.mjs
exec node scripts/server.mjs
