# Güvenlik denetimi — Faz 16

2026-10-16 · **NO-GO**. Bu, kaynak kodu/yerel otomatik kontrol incelemesidir;
penetrasyon testi, ulaşılabilir exploit veya Android güvenlik sertifikası değildir.
[Tarama JSON](reports/phase-16-security-scan.json), [yayın kapıları](release-blockers.md).

| Kontrol | Kanıt / sonuç | Açık sınır |
| --- | --- | --- |
| Kaynak URL/revizyonu | Yeni `sourceURLMatchesRevision`: immutable Wikidata URL'sinde oldid ile revision eşit; unique title/oldid ve QID biçimi, varsa metadata QID'si eşit. Bozulmuş gerçek katalog negatif testi PASS | Metadata wikidataId null ise URL'nin QID'si özgün API ile kendiliğinden doğrulanmaz; provenance ve insan incelemesi gerekir |
| HTTPS / dış URL | Şema raw whitespace/backslash/control/encoded control/credentials/nondefault port reddeder; dış servis exact domain/protocol ve amaç kontrolü yapar. Web noopener,noreferrer; native ayrı Linking adaptörü | Kaynak şeması tüm HTTPS hostlarını allowlist'e dönüştürmez; açma servisi ayrıca dar listelidir. Art Institute inceleme adresi bilinçli source host olarak eklendi |
| WebView navigation | Yerel bootstrap query/hash, traversal, uzaktan URL ve sahte origin retleri test edildi; dev origin yalnız geliştirmede | Tam tek bootstrap dosya/oturum pinleme, file-origin davranışı ve redirect/new-window gerçek cihaz kanıtı yok |
| Uygulama bridge | version/type/requestId/payload,4KiB sınırı, bilinmeyen/nested alan ve stale revision ret testleri PASS; geometri kare başına taşınmaz | Expo ham taşıması bu şemadan önce işliyor; aşağıdaki SEC-RAW-DOM |
| XSS yüzeyleri | Kendi src kodunda metinler React/textContent; taramada innerHTML/dangerouslySetInnerHTML/document.write atama eşleşmesi0. HTML arama payload'ı için gerçek E2E senaryosu eklendi | E2E burada çalışmadı; bütün transitif HTML sink'lerinin denetimi veya XSS yokluğu kanıtı değil |
| Secret yönetimi |197 kapsamlı dosyada private-key/AWS access-key/GitHub-token kalıbı eşleşmesi0; tarama değerleri loglamaz. env.example anahtarsız; public/secret belgeli | Pattern taraması bütün secret biçimleri veya Git geçmişi için kanıt değildir. .git geçerli repo değil; geçmiş taranamadı |
| CORS / ağ | Statik yerel varlıklar; live WDQS, demo tile servisi veya unsafe universal-file access açılmadı | Gerçek production host/CSP/CORS response ve native uçak modu testi yok |
| Bağımlılıklar | SDK57/lock korundu, yeni dış paket yok; güncel audit denemesi kayıtlı | Ağ isteği EAI_AGAIN; eski güvenlik bulguları açık, sıfır zafiyet sonucu yok |

## Framework ve worker bulguları

**SEC-RAW-DOM / HIGH / OPEN:** Kurulu Expo57.0.29
`node_modules/expo/src/dom/webview-wrapper.tsx` içindeki `onMessage`,
`JSON.parse(event.nativeEvent.data)` çağrısını uygulama callback'inden önce yapar.
DOM_READY/native action gibi framework mesajlarını da bu noktada dağıtır.
`...dom` props'undan sonra framework `onMessage` atandığından app callback'i
vererek parse öncesi boyut sınırı eklenmiş sayılamaz. 4KiB uygulama şeması
uygulama komutlarını korur; taşımanın tamamını koruduğu iddiası kaldırılır.
İncelenmemiş node_modules yaması veya keyfî injected JS eklenmedi. Kapanış:
upstream/patch/taşıma ADR'si, parsing öncesi limit/dispatch şeması ve adversarial
native test. [Expo DOM resmi çalışma modeli](https://docs.expo.dev/guides/dom-components/)
ile kurulu sürümün davranışı ayrı değerlendirilmelidir.

**SEC-WORKER-DYNAMIC / HIGH / OPEN:** TypeScript AST taraması paketli worker'da
satır8304 civarında1 `globalThis.eval` çağrısı buldu. İki opsiyonel dynamic import
önceden kapatılmıştı; bu kalan çağrının core harita yolundan erişilebilirliği
kanıtlanmadı. Bu yüzden ne exploit var ne erişilemez denildi. Hash/NOTICE'ı
koruyan küçük dönüşüm veya upstream çözümü sonrası gerçek worker/CSP/GPU deneyi
şarttır. `unsafe-eval` açmak çözüm sayılmaz.

## CSP doğrulama planı

Mevcut `public/_headers` hash dosyaları için HTTP cache talimatıdır; **CSP değildir**.
Expo export inline bootstrap/stil ve blob worker kullandığından denenmemiş bir
üretim başlığı uygulanıp çalışıyor iddiası üretilmedi. Gerçek hostta önce yerel
olarak gözlenen bootstrap'a nonce/hash, gerekli RN Web style politikası ve
worker URL'si belirlenmeli; sonra Report-Only gözlemi ve enforced test yapılmalı.
Başlangıç şablonu (üretim başlığı olarak kopyalanıp hazır sayılmaz):

```text
Content-Security-Policy-Report-Only: default-src 'self'; script-src 'self' <reviewed-bootstrap-nonce-or-hashes>; style-src 'self' <reviewed-style-policy>; worker-src 'self' blob:; connect-src 'self'; img-src 'self' data:; font-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'
```

Report endpoint eklenmedi; üçüncü tarafa CSP raporu/URL gönderilmez. Host
başlık desteği, worker ve inline yolları
[MDN CSP dokümanı](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy)
üzerinden kontrol edilerek gerçek response ile kanıtlanmalıdır.

## Npm audit

[Bu fazdaki deneme](reports/phase-16-npm-audit-attempt.json) registry DNS
`EAI_AGAIN` ile başarısızdır; güncel online audit **BLOCKED**.
[Önceki gerçek snapshot](reports/npm-audit.json)29etkilenen paket düğümü
(10moderate/19high),4temel bildirimi içerir; bunlar29bağımsız exploit değildir.
16Ekim2026'da resmi advisory sayfaları yeniden incelendi:
[braces](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm),
[node-forge](https://github.com/advisories/GHSA-86w9-cpqp-85rv),
[decode-uri-component](https://github.com/advisories/GHSA-vcc3-ghjq-m6fr),
[uuid](https://github.com/advisories/GHSA-w5hq-g745-h8pq).
Araç ve kullanıcı runtime erişim yolları ayrı incelenmelidir; paket adının
bundle'da görünmesi tek başına exploit kanıtı değildir. `npm audit fix --force`
SDK'yı bozan önerileri nedeniyle uygulanmadı. Gerekli takip ve eski yollar
[önceki incelemede](security-review.md); hiçbir bulgu bu tur çözüldü sayılmadı.
