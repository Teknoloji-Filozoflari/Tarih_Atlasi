# Ülke dolgusu ve kaynak/yıl doğruluğu — 17 Ekim 2026

Kullanıcı saydam siyasi tabakanın kaldırılmasını, MS2000 ülkelerinin
incelenmesini ve uygun yeni coğrafya verisinin ayrıntılı araştırılmasını istedi.
Küçük plan: siyasi dolguyu kapatıp alan seçimini koru; eksik/hatalı kayıtları
kaynak satırına kadar izle; doğrulayıcı ve kaynak kapısını düzelt; mevcut
akışları/testleri denetle; lisans/kapsam ve gerekli indirmeleri belgele.

## Sonuç ve kanıt

**IMPLEMENTED:** `polity-area` opaklığı sabit0. Görünür ülke dolgusu seçimde de
üretilmez; `visibility:none` kullanılmadığı için MapLibre alan içi seçimi
devam eder. Bu davranış [MapLibre queryRenderedFeatures sözleşmesiyle](https://maplibre.org/maplibre-gl-js/docs/API/classes/Map/#queryrenderedfeatures)
uyumludur. Sınır/ad çizimi ve mevcut küre projeksiyonu/kamera/fiziksel taban
korunur. Kültür/olay dolgularına dokunulmadı.

**IMPLEMENTED:** Yunanistan `world:clio-r13502` yanlışlıkla dışlanıyordu.
Sorun koordinatlarda sınır icat ederek değil, izole iç-halka teğetliğini
doğru değerlendirerek çözüldü. Kaynak geometri SHA:
`72e9bf539749c5e60edc23a5e3a93bf750385d627943b6a1b28254a6dc862577`,
21MultiPolygon bileşeni,287pozisyon; kaynak aralığı1992–2023.
Kaynak köşe ve yönsüz kenar çokluklarının birebir aynılığı
[ayrı probe ile](country-data-audit/greece-source-fidelity.json) kontrol edildi.
Doğrulayıcı değişikliği91kaynak satırını geri kazandırdı; yeni köşe/ada/sınır
oluşturulmadı. Tam OGC/GEOS topoloji sertifikası verilmez: kabuk teması veya
daha büyük iç-halka temas ağları konservatif olarak incelemeye ayrılır.
Diğer çoklu poligon bileşenleri arasındaki bütün global topoloji sorunlarının
çözüldüğü iddia edilmez.

**IMPLEMENTED:** Ürdün monarşisi kaynak kontrolünden sonra korundu. Altı gerçek
ad/dönem uyuşmazlığı12kaynak satırında kaydedilip geometri üretiminden
çıkarıldı; kaynak metaverileri/ID'leri kaybolmadı. MS2000:192siyasi kaynak satırı,
179çizilebilir,13incelemede. İnceleme kayıtları için kullanıcıya bunun tarihsel
yokluk anlamına gelmediği ve kaynaktaki adın doğrulanmış dönem adı olmadığı
açıklanır. Kanıtlar `scripts/world/identity-review.mjs` ve
[tam envanterde](country-data-audit/ms2000.json).

**IMPLEMENTED:** NARA kesitinin kapsama indeksinde kaynak sırasına bağlı yanlış
`sourceId` seçimi giderildi. Kaynak/revizyon kendi evidence kaydından gelir.
Politika1.3.1 için pilot manifesti yenilendi. İlk `pilot:check` denemesi yalnız
politika1.3.0/1.3.1 farkını buldu; çıktı güncellendi ve son kontrol geçti.
Başarısız kontrol kaldırılmadı, beklentisi gevşetilmedi.

**PARTIAL:** tüm dünya için tarihî doğruluk ve ülke-kapsam eksiksizliği.
192kaynağın tamamı envanterlendi, her birinin adı/geometrisi bağımsız uzman
tarafından onaylandı denmez. Kaynağın `POLITY` sınıfı bağımsız devlet, bağlı
toprak, birleşik alan ve iddia ayrımını tek başına çözmez. Araştırma ve indirme
teslimatı [burada](../country-data-research.md); CShapes/başka yeni coğrafya bu
turda üretime eklenmedi.

## Değişen dosyalar

- `src/theme/tokens.ts`, `src/map/globe/style.ts`: siyasi dolgu kapalı; alan
  seçim katmanı korunur.
- `src/data/world/geometry.ts`: bütçeli izole teğet-halka kontrolü; kesişme,
  kenar paylaşımı, iç içelik ve temas ağı retleri.
- `scripts/world/identity-review.mjs`:12kaynak satırı için altı ad/dönem
  bulgusu ve birincil bağlantılar; `scripts/world/prepare.mjs`: bu kapı ve
  teğet halka denetim günlüğü.
- `src/data/world/types.ts`, `records.ts`, `policy.ts`: revizyon2 ve yeniden
  incelenmiş metadataSHA; `src/data/source-manifest.ts`: politika1.3.1.
- `src/data/world/generated/*`, `assets/world/*.atlas`,
  `docs/reports/world-coverage/import-report.json`:374paket/120664555byte,
  sınırlı/tembel yüklenen mevcut lisanslı kaynak türevleri. Metadata3497950byte;
  paket başına512KiB sınırı korunur. Bu disk boyutudur, ölçülmüş RAM/FPS değildir.
- `scripts/world/audit-2000.mjs`, `package.json`: `world:audit-2000` komutu ve
  tekrarlanabilir192satır envanteri.
- `src/atlas/PolityCard.tsx`, `AtlasScreen.tsx`, `src/i18n/tr.ts`: kaynak
  uyuşmazlığı ve çizilmeyen ülke konusunda Türkçe açıklamalar.
- `scripts/pilot/build.mjs`, `src/data/generated/pilot.ts`, pilot üretim
  manifesti: evidence kaynak düzeltmesi/politika sürümü. Önceki kayıt ID'leri,
  geometriler ve67kayıtlı pilot katalog korunur.
- `tests/unit/world.test.mjs`, `politics.test.mjs`, `pilot.test.mjs`:
  pozitif teğetlik, negatif geometri, gerçek Yunanistan/Ürdün, hatalı dönem adı,
  saydam alan seçimi ve kaynak indeksi regresyonları. Önceden Yunanistan'a
  uygulanan bozuk-geometri negatif senaryosu hâlâ bozuk Tunus kaydında korunur;
  Yunanistan için ayrı gerçek pozitif senaryo var.
- `.gitignore`: araştırma indirileri için `data/staging/country-review/`.
- README, ilerleme, kalite, kaynak matrisi ve lisans/atıf sicilleri.

`git status --short` bu ortamda Git çalışma ağacı bulamadı (128). Kullanıcı
değişikliklerini geri alan veya ham dosyalarını silen komut kullanılmadı.
`npm run data:download -- --verify` altıözgün staging dosyasının hash'ini
doğruladı. Büyük arşiv yeniden indirilmedi.

## Doğrulama

Gerçek komut logları ve son durum tablosu
[kanıt dizininde](country-data-audit/commands.json).

| Kontrol | Sonuç | Log |
| --- | --- | --- |
| `npm run typecheck` | PASS, strict native/web | [Log](country-data-audit/typecheck.log) |
| `npm run lint` | PASS, 0 uyarı | [Log](country-data-audit/lint.log) |
| `npm test` | PASS, 286/286, 0 fail/skip | [Log](country-data-audit/tests.log) |
| `npm run test:worker` | PASS, 5/5 | [Log](country-data-audit/worker.log) |
| `npm run format:check` | PASS | [Log](country-data-audit/format.log) |
| `npm run world:check` | PASS, 374paket bütünlüğü | [Log](country-data-audit/check.log) |
| `npm run world:source-check` | PASS, kaynaktan deterministik yeniden üretim | [Log](country-data-audit/source-check.log) |
| `npm run world:audit-2000` | PASS, 192satır envanteri | [Log](country-data-audit/inventory.log) |
| `npm run data:download -- --verify` | PASS, 6özgün dosya aynı | [Log](country-data-audit/preserved.log) |
| `npm run pilot:check` | PASS, source/politika metaveri düzeltmesi sonrası | [Log](country-data-audit/pilot.log) |
| `npm run chunks:check` | PASS, 68girdi/35benzersiz | [Log](country-data-audit/chunks.log) |
| `npm run web:export` | PASS, 4rota | [Log](country-data-audit/web-export.log) |
| `npm run android:bundle` | PASS, JS export | [Log](country-data-audit/android-export.log) |
| Chromium/screenshot | BLOCKED, sandbox; 0görsel | [Log](country-data-audit/browser.log) |
| Fiziksel Android/GPU/TalkBack | NOT TESTED — UNVERIFIED ON DEVICE | Cihaz doğrulaması yok |

- Birim testler286/286; eski testler silinmedi, sentetik geometri yalnız testte.
- Lint, strictnative/web typecheck, formatter ve worker testleri.
- Dünya kaynak yeniden üretim/bütünlük, eski pilot ve chunk kontrolleri.
- Web ve AndroidHermes+DOM JavaScript export; APK/cihaz doğrulaması değil.
- Gerçek Chromium başlatma denemesi sandbox izniyle engellendi;
  E2E/screenshot **BLOCKED**, ekran görüntüsü0.
- Fiziksel Android **NOT TESTED — UNVERIFIED ON DEVICE**. Yeni performans/FPS
  ölçümü yapılmadı; böyle bir başarı iddiası yok.

## Kalan sorun ve sonraki işin önkoşulu

Mevcut kaynak kendi ölçeğinde kaba ve bazı dönem adları hatalıdır; çizim stili
bunu düzeltemez. CShapes2.0 ham GeoJSON araştırması yakın dönem için önerildi;
NC/SA veri koşulları ve gerçek dosya kapsamı incelemeden üretim izni verilmedi.
Natural Earth/geoBoundaries çağdaş sınırını2000'e taşıyarak boşluk doldurulmaz.
Tüm tarih atlası için kapsam/tarihî doğruluk hâlâ **PARTIAL**, önceki yayın
**NO-GO** kararı değişmedi. Başka bir ürün fazına geçilmedi.
