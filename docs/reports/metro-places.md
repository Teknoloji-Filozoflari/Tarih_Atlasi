# entry.js %99 — gerçek dünya şehir verisiyle paketleme düzeltmesi

18 Ekim 2026. Kullanıcının site açılamaması incelendi; mevcut kod ve indirilen
veri korundu. `git status --short` exit128, dizinde `.git` yok. Reset, veri
silme, tekrar indirme, yeni bağımlılık veya yeni faz yok.

## Teşhis

Önceki rapordaki boş veri durumu değişmiş: kullanıcı GeoNames'i indirip
hazırlamış.16.102paket/645.992.949byte (diskte yaklaşık655MiB) ve aynı verinin
16.102gzipTSmodülü mevcut; bu modüller145.040.220byteJSmetnidir. Webreader'ın
nativeassetlistesi ve file-originDOMfallbackimportları Metro'nun browser
grafiğine de giriyordu. Geliştirmedeki dynamicimport, bu dosyaların hiç
derlenmeyeceği anlamına gelmiyordu. Bu, kaynak grafiğinde somut büyük yük
yaratır; kullanıcının bildirdiği5dakika agent tarafından ölçülmüş süre değildir.
Eski kilitli oturumun CPU/heap profili elde edilemedi.

Ayrıca gerçek manifestin tip kontrolü **TS2590: union type too complex** verdi.
Bu CSS/kamera/WebGLhatası değildir; paketleme/tip çıkarımı sorunudur.

## Düzeltme

- Browser yalnız ihtiyaç duyulan `.atlas` veri dosyasını aynı origin'den alır;
  nativeasset veya şehirgzipJSindexini import etmez.
- Metrodevelopment middleware yalnız manifestte onaylı64hexSHAile eşleşen
  GET/HEADdosyalarını sunar. Byte sınırı, JSONmime, immutablecache/ETag ve
  nosniff vardır; traversal, bilinmeyen hash, symlink ve yazma isteği reddedilir.
- `npm run web:export` tamamlanınca her paketin kaynak/lisans/sürüm/SHA/row
  şeması denetlenir; veri ve NOTICE `dist/data/places` içine aktarılır. Çakışan
  bozuk hedef dosyası korunup hata verilir. Nativepublicklasörüne ikinci bir
  dünya kopyası eklenmedi.
- GlobeDOM aynı çekirdeğe kendi DOMprovider'ını verir; nativeUI/DOM yerel dosya
  adaptörleri, bridge ve WebViewizinleri korunur.
- Büyük manifest JSONolarak okunur; TypeScript'in16binliteral kombinasyonunu
  çıkarması gerekmez. StrictTS, runtimeşema/SHA/hak kontrolleri korunur.
- Yalnız makine üretimi safgzipstringmodülleri tekrar lintAST'sine çevrilmez.
  Her modülün tek gzipdeğeri, decodedverisi ve paketSHA'sı `places:check` ile
  ayrıca doğrulanır; loader ve uygulama kodunun lint'i kapatılmadı.
- Staging/korunan eski üretim yedekleri Metrocrawl/uygulama grafiğinden ayrılır.
  Hazırlayıcı bundan sonra proje formatter ayarlarını ve JSONmanifestini üretir.

## Veri korundu / kapsam

Version `c0972addaf25d13ab7c1fa1b1ade254f2c3c7ca50003be9c78c964df98f03d29`
ve asılpaketlerin tamamı korunur; kaynak/snapshot/tarih/koordinat değiştirilmedi.

| Kapsam | Sayı |
|---|---:|
| GeoNames ülke/bölge kaydı |248|
| Yerleşim |4999482|
| İdari kayıt |446399|
| Yerleşim bölümü |170872|
| Toplam alınan kayıt |5616753|
| Paket / JSONbyte |16102 /645992949|
| TRyerleşim /idari /bölüm |52786 /2614 /1720|

Ülkelerin idari düzeyleri aynı anlama gelmez;2614idari kayıt,2614Türkiye ilçesi
demek değildir. Bunlar güncel temsil noktalarıdır, seçili2024yılının tarihî
konum kanıtı veya eksiksiz resmî envanter değildir. CCBY4.0/atıf/NOTICEkorunur;
Wikipedia/Commonsmedyası eklenmedi.

## Gerçek doğrulama

| Kontrol | Sonuç | Kanıt |
|---|---|---|
| `npm run check` |363ana+5worker PASS; lint/native+web strictTS; tüm kaynak/format/hak/hash kapıları | [log](metro-places-evidence/check.log) |
| Yeni HTTP/staticexport/middleware testleri |4yeni test; UTF8baytsınırı, sadece gerekli paket okuma, cache, kaynak, corruption, iptal, traversal, HEAD/GET/POST, symlink, hak/NOTICEve çakışan dosya koruma | [21yer testi](metro-places-evidence/places-tests.log) |
| İlk webexport |1808modül,21849msderleme;4rota PASS | [log](metro-places-evidence/web-export-initial.log) |
| Tekrarlanan `npm run web:export` |1808modül,2497ms (sıcak cache);4rota ve16102doğrulanmış veri dosyası PASS | [log](metro-places-evidence/web-export.log) |
| Gerçek TRkaydı, exported route, CSP/MIME/cache, SHA |TRidari liste İzmir/Tekirdağ/Kırklareli/Edirne/Çanakkale ile okundu;<=8paket okuması; browserçıktısında şehirgzipJSmodülü0 | [smoke](metro-places-evidence/web-data-smoke.log), [kapsam/byte](metro-places-evidence/installed-catalog.json) |
| Gerçek Metrohandler/varsayılan manifest |Kurulu onaylı TRpaketi doğru byte/SHAile işlendi; gerçek soket testi değildir | [log](metro-places-evidence/metro-route-smoke.log) |
| Son middleware değişikliği |Hedefli ESLint ve21yer testi PASS | [lint](metro-places-evidence/final-middleware-lint.log), [test](metro-places-evidence/places-tests.log) |
| Developmentserver8090/socket |BLOCKED: portçözümü başarısız/null, noninteractiveçıkış1; localhostfetch EPERM. Site açıldı denemez | [log](metro-places-evidence/dev-server.log) |

İlk tam kontrol saf145MBgzipstringlintinde kesildi (exit130); kapsamı daraltılan
uygulama testi yoktur. Son tam kontrol, ayrı gerçek verinin decodedşema/SHA
doğrulamasıyla PASS. İlk TS2590hatası [bu logda](metro-places-evidence/typecheck-initial.log)
saklanır; hata giderilerek strictkontrol çalıştırıldı.

Webentry12481155byte; bu başlangıç/FPS/GPU/RAMölçümü değildir. Soğuk/sıcak
derleme sayıları sadece bu makinenin loglarıdır; kullanıcının bilgisayarına süre
garantisi verilmez. Tarayıcı WebGL/görsel/E2E ve screenshot **NOT TESTED**.
Gerçek Android **UNVERIFIED ON DEVICE**; kurulu büyük veriyle yeni Androidexport
çalıştırılmadı. NativeDOMiçin eski16.102gzipmodülü korunur; nativepaket boyutu,
derleme/cihaz belleği ve kaynak tüketimi açık risklerdir. Yayın **NO-GO** sürer.

## Değişen dosyalar

`metro.config.cjs`, `scripts/places/{static.cjs,export-web.mjs,build.mjs,
prepare.mjs}`, `scripts/qa/serve-export.mjs`, `package.json`,
`eslint.config.mjs`; `src/places/{reader.web.ts,reader.dom.ts,dom-runtime.ts,
http.ts}`, `src/map/{GlobeDOM.tsx,globe/GlobeView.tsx}`;
generatedworldcatalog/assets/DOMindex (yalnız kod temsili/format, aynı veriler);
`tests/unit/modern-places.test.mjs`; README, progress/architecture/modern-places/
source-matrix/license-register/release-blockers ve THIRD_PARTY_NOTICES.
İndirilenZIP/receipt/asıl`.atlas`/gzipveri değerleri silinmedi veya yeniden
indirilmedi. Dosya başına veri kontrolleri gerçek16102paket üzerinde çalıştı.

## Kullanıcıda yeniden açma

Önceki sunucuyu Ctrl+C ile kapat:

```sh
npm run web -- --clear
```

Ardından Katmanlar → Ülkelere göre şehir ve ilçe kayıtlarını gez → TR → İdari
birimler / ilçeler. Mevcut indirilmiş veri kullanılır; yeniden indirme veya ETL
gerekmiyor.2024açılışı, Türkiye kamerası ve önceki katmanlar korunur.

Teknik dayanak: kurulu Expo/Metro'nun `enhanceMiddleware` ve nativeDOMentry
uygulaması incelendi. [Expo Metro](https://docs.expo.dev/guides/customizing-metro/),
[DOMbileşenlerinde ayrı JSengine/asset davranışı](https://docs.expo.dev/guides/dom-components/)
ve [statik export](https://docs.expo.dev/router/web/static-rendering/) resmî kaynaklardır.
