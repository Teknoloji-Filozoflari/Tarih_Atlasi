# Dünya şehir/idari birim genişletmesi — 18 Ekim 2026

**PARTIAL.** Kaynak/uygulama hattı uygulandı; gerçek dünya verisi henüz
indirilmedi. Önceki altı gerçek referans ve tarihî bütün işlevler korunur.

`git status --short`: exit128; çalışma dizininde `.git` yok. Repo başlatılmadı,
reset/checkout/silme yapılmadı. Kaynak/lockfile bağımlılık sürümleri değiştirilmedi.

## Değişiklikler

- `scripts/places/{download,build,prepare,check}.mjs`: beş kaynak, seri/cache/backoff/
  timeout/byte kotalı indirme, receipts; sabitZIPüye akışı, hücre/LODspool, bounded
  paket üretimi, globalIDtakibi, kaynak/lisans/format/hash/NOTICE kontrolü ve
  eski generated çıktıyı yedekleyen kurulum.
- `scripts/map-sources.mjs`: mevcut altı kaynağın sözleşmesi korunarak taşıma
  kodu sabit allowlist kabul eden yardımcıya çıkarıldı; yeni indirmeler ayrı komutta.
- `src/places/{catalog,repository,modern,runtime,reader.web,reader.native}.ts`,
  `generated/world` boş manifest/asset/DOM girişleri ve stabil re-exportlar.
- `src/map/globe/{modern-city-markers,renderer,GlobeView}`: görünür bölge/zoom,
  iptal/son yanıt/gizleme/dispose, iki kaynak türü/32etiket ve yükleme durumu.
- `src/map-contract/{protocol,viewport}`, `src/map/useGlobeHost`, `ViewportFrame`:
  sürümlü küçük seçim, hostta güvenilir paket çözümü, açık yükleme/yoğunluk/hata.
- `src/atlas/{ModernPlacesExplorer,PlaceCoverage,ModernCityCard,LayersDrawer,
  AtlasScreen,AttributionPanel}`: ülke+idari/yerleşim sayfalaması, kaynak kartı,
  tarih değiştirmeyen odaklama, atıf. Bütün görünür metinler `src/i18n/tr.ts`.
- `src/sources/url-policy.ts`: sadece sayısal GeoNames HTTPS kayıt adresi.
- `src/data/world/{asset-cache.native,reader.native,native-cache}`: ortak cache,
  birden fazla okuyucunun aynı dosyayı tutması için refcount koruması.
- `tests/unit/modern-places.test.mjs`, `renderer.test.mjs`, `tests/run.mjs`:
  sentetik izole testler; `tests/web/modern-places.spec.ts`, güncellenen şehirtesti.
- `package.json`, `.gitignore`, `.prettierignore`, `eslint.config.mjs`:
  komutlar/gate; ham kaynaklar üretim ve format/lint kapsamı dışında.
- `README`, `THIRD_PARTY_NOTICES`, `assets/licenses/GeoNames-NOTICE.txt`,
  `docs/{modern-places,architecture,source-matrix,license-register,privacy-policy,progress}`.

## Hak ve tarihsel doğruluk

[GeoNames README](https://download.geonames.org/export/dump/readme.txt),
[kodlar](https://www.geonames.org/export/codes.html),
[CC BY4.0](https://creativecommons.org/licenses/by/4.0/legalcode.en) incelendi.
403M civarı allCountries ZIP; doğrudan resmî kaynak, APIhesabı yok. Kaynak güncel
yerleşim ve ADM1–4 temsili noktalarıdır, tarihî iddia veya ilçe sınırı değildir.
Kaynak adları/koordinatları/tarihi korunur; yeni QID/sitelink uydurulmaz.
Yeni dünya kaynak0/üretim0; sentetik test verileri repoya üretim diye konmadı.

## Kontroller

| Komut / doğrulama | Gerçek sonuç | Kanıt / anlam |
|---|---|---|
| `npm run check` | **PASS**, exit0 | [Log](modern-places/check-session.log): ESLint, native+webstrictTS,335ana+5worker, format; mevcut fiziksel/pilot/sitelink/chunk/world/NOTICE gate'leri geçti |
| Yeni GeoNames unit/integration | **PASS**,16test | Aynı logda; gerçek unzip/CRC yolu,800satır bölme, deterministik iki çıktı, hak/hash/şema retleri, idari semantik, viewport/antimeridyen, sayfalama, iki eşzamanlı okuma/LRU, cache refcount |
| Yeni renderer regresyonu | **PASS** | Gerçek renderer kodu+DOM/MapLibre test double: eski yanıt/disable/pause/unmount; GPU testi değil. Renderer toplam21test |
| `npm run places:check` | **PARTIAL**, exit0 | Manifest düzgün ve boş; gerçek GeoNames paketi kurulmuş anlamına gelmez |
| `npm run web:export` | **PASS**, exit0 | [Log](modern-places/web-final.log):4rota; `/`27389byte,`/about`25936byte statik response200/CSP kontrolü ayrıca geçti; browser/GPU değil |
| `npm run android:bundle` | **PASS**, exit0 | [Log](modern-places/android-session.log):Hermes+DOMJS export; APK/SDK/cihaz kanıtı değil |
| `npm run test:web:production -- --list` | **LISTED ONLY**, exit0 |52senaryo/8dosya; yeni modern-places desktop+narrow2senaryo; çalışmış test sayılmadı |
| Chromium headless launch | **BLOCKED**, exit1 | `sandbox_host_linux.cc:41` shutdown EPERM; browser süreç başlatılamıyor;0screenshot, görsel/E2E **NOT TESTED** |
| `npm run environment:check` | **BLOCKED**, exit1 | Node/npm/lockPASS; java/adb ENOENT, ANDROID_HOME yok. Fiziksel Android **UNVERIFIED ON DEVICE** |
| `npm run places:download -- --timeout-seconds 10` | **BLOCKED**, exit1 | [Log](modern-places/download-final.log):ilk resmîREADMEisteği EAI_AGAIN; ham/üretim gerçekdünya verisi yok |
| `npm run places:prepare` | **BLOCKED**, exit1 | [Log](modern-places/prepare-final.log):SOURCE_NOT_DOWNLOADED; var olan katalogları değiştirmeden ret |

İlk lint denemesinde sentetik bozukZIPtestinin kullanılmayan `_line` değişkeni
uyarısı vardı. Beklenti gevşetilmedi: bozukZIPbir satır üretirse `assert.fail`
olacak biçimde düzeltildi; yukarıdaki son check335+5/0fail/0skip ile geçti.
Sonradan eklenen yalnız CLI ilerleme bildiriminin ESLint/formatter kontrolü
ayrıca çalıştırıldı; gerçek dünya ölçek/performans sonucu olarak sunulmaz.

Gerçek dosya ETL/ölçek/bundlebüyüklüğü **NOT TESTED**, kaynak edinimi **BLOCKED**.
Şehir adıyla global tammetin arama, WikipediaQIDzenginleştirme, ADM5/ADMD ve ilçe
polygonları bu uygulamanın teslim edilmiş kapsamı değildir. Global dosya alındıktan
sonra veri eksikleri ve idari eşleme sorunları manifest/gerçek örneklerle yeniden
incelenmelidir. Yayın için önceki **NO-GO** kararı değişmedi.

Makine kaydı ve değişen dosyaların SHA256'ları: [commands.json](modern-places/commands.json).

## Kullanıcının sonraki adımı

[Komutlar ve kapsam](../modern-places.md). Sunucuyu durdur, dünya dosyasını indir,
prepare/check çalıştır ve uygulamayı yeniden aç. Ardından gerçek kayıt sayıları,
paket boyutu, Türkiye/diğer ülke örnekleri ve cihaz davranışı doğrulanmalı.
Bu tamamlanmadan dünya şehirlerinin haritada var olduğu söylenmez.
