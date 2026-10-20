#!/bin/sh
set -eu
cd -- "$(CDPATH='' cd -- "$(dirname -- "$0")" && pwd)"
docker load --input tarih-atlasi-image.tar.gz
docker compose up -d --wait
printf '%s\n' 'Tarih Atlası: http://127.0.0.1:8081 — Kapat: docker compose down'
