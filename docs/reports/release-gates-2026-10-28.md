# Yayın kapıları kanıtı — 28 Ekim 2026

Ortam: Cloud Agent VM, Node 24.22.1 + npm 12.2.0, Chromium (Playwright),
Docker yok. Taban: `main` @ `780f71db`. UI PR’ları #1–#5 dokunulmadı.

## Yeşile dönenler

| Kapı | Sonuç |
| --- | --- |
| Production E2E | 86 passed (7.7m) |
| web:export | 4 route, 16.102 packs, 645.992.949 byte |
| release:stage / verify | 18.474 files, 890.120.304 byte |
| release:smoke-web | CSP sha256, no unsafe-eval, healthz, 404, POST 405 |
| unit + worker | 419/419 + 5/5 |
| lint + native/web typecheck | PASS |
| npm audit (ağ) | alındı; güvenli fix sonrası 11 kalan |

## BLOCKED / UNVERIFIED

- Docker Engine imaj build/run/container smoke — `docker` yok
- Android fiziksel cihaz — UNVERIFIED ON DEVICE; ölçüm yok
- SEC-RAW-DOM Expo ham transport — kod yaması/cihaz deneyi yok
- SEC-DEPS kalan Expo-major high’lar — force downgrade uygulanmadı
- Native file-origin CSP, A11Y TalkBack, PRIVACY-HOST, uzak Release taslağı

Ham çıktılar: [release-gates-2026-10-28/](release-gates-2026-10-28/)
(`e2e-production.txt`, `smoke-web.txt`, `npm-audit*.json`).
