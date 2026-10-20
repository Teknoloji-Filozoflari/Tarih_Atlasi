# Açılış yılı 2024 ve şehir/ilçe eksikliğinin teşhisi

18 Ekim 2026. Kullanıcı isteği: uygulama MS2024 ile açılsın; ülke şehir/ilçe
verilerinin neden görünmediği açıklansın. Yeni faz veya bağımlılık yok.
`git status --short` exit128: çalışma dizininde `.git` yok; reset/silme yapılmadı.

## Uygulanan değişiklik

- `src/timeline/useTimelineStore.ts`: boş açılış MS2000 yerine MS2024.
  Sistem üst yılı daha küçükse sınır korunur. Takvim üst sınırı günümüzdür;
  paylaşım URL'si, yer imi veya açık tarih seçimi bu varsayılana üstün kalır.
- `src/atlas/ModernPlacesExplorer.tsx`: dünya paketi yokken işlevsiz ülke arama,
  boş ülke listesi ve sayfalama yerine yalnız gerçek eksik paket durumu.
- Beş web test dosyası: varsayılan açılış beklentisi2024; ülke2000 regresyonları
  açık2000seçimiyle korunur.2010ölçeğinin gerçek2000alt sınırı değiştirilmedi.
  Eksik şehir paketinde textbox/sayfalama bulunmadığı da denetlenir.
- `README.md`, `docs/modern-places.md`, `docs/progress.md`: gerçek kurulum
  durumu ve kullanıcının çalıştıracağı komutlar.
- `scripts/map-sources.mjs`, `scripts/places/download.mjs`: yalnız onaylı
  GeoNames kaynakları için en fazla iki saatlik indirme süresi. Diğer kaynaklar
  30 dakikayla sınırlı; bayt/tekrar deneme/tek istek politikası değişmez.
  `tests/unit/modern-places.test.mjs` yeni süre üst sınırını ve sentetik
  transportla bu seçeneğin indirmeye geçebildiğini denetler; gerçek büyük dosya
  indirmesi veya iki saat bekleme testi değildir.

## Şehir/ilçe konusu neden PARTIAL?

Ülke bazında gezinme, bbox/LOD yükleme, kaynak/hak/hash kontrolü ve GeoNames
ETL altyapısı var. Ancak **veri edinimi ve üretim kurulumu tamamlanmamış**:
`src/places/generated/world/catalog.ts` versionnull,0ülke/0paket/0kayıt;
`assets/places` yok. Staging'de ve İndirilenler'de hedef kaynak dosyaları
bulunamadı. Uygulamadaki altı eski referans şehir, dünya kataloğu değildir.

Gerçek çalıştırılan komutlar:

```text
npm run places:download -- --verify
Şehir verisi indirilemedi: SOURCE_NOT_DOWNLOADED (exit1)

npm run places:download -- --timeout-seconds 10
İndirme: readme.txt
Şehir verisi indirilemedi: EAI_AGAIN (exit1)
```

Bu nedenle dünya dosyası indirildi, milyonlarca yer dönüştürüldü veya bütün
ilçeler haritada doğrulandı denemez. Eksik yerler sentetik kayıtla doldurulmadı.
Mevcut şehir/tarihî katmanlar ve kişi kayıtları korunur.

## Kullanıcının terminalinde kurulum

Web sunucusunu Ctrl+C ile durdur; proje kökünde:

```sh
npm run places:download -- --timeout-seconds 7200
npm run places:download -- --verify
npm run places:prepare
npm run places:check
npm run web -- --clear
```

İlk komut hata verirse sonraki adımlar tamamlanmış sayılmaz. Aynı indirme
komutu doğrulanmış tamamlanan dosyaları tekrar almaz. `unzip` ve birkaç GB boş
disk alanı gerekir; yeni npm paketi, API anahtarı veya hesap gerekmez.
Hazırlama sonunda sayılar ve ülke kapsamı gerçek çıktıya göre raporlanır.

**Katmanlar → Güncel şehirler ve idari birimler** açık olsun. Yakınlaşmayla
kapsam artar; **Ülkelere göre şehir ve ilçe kayıtlarını gez → TR → İdari birimler /
ilçeler** ile ülke bazında inceleme yapılır. Veriler güncel yerleşim/idari birim
temsil noktalarıdır; seçili tarih için tarihî konum kanıtı veya eksiksiz resmî
ilçe envanteri değildir.

## Kaynak ve lisans

[GeoNames resmî dump README](https://download.geonames.org/export/dump/readme.txt)
ve [indirme dizini](https://download.geonames.org/export/dump/) yeniden kontrol
edildi. allCountries.zip bütün ülkelerin birleşik dosyası; P yerleşimleri ve
ADM1–4 idari kayıtlar mevcut hazırlayıcının kapsamıdır. Kaynak güncel noktalar,
WGS84koordinatlar ve idari kodlar taşır; ilçe sınır poligonu kurulmaz.
CCBY4.0/atıf kararı değişmedi. Bu tur yeni kaynak/medya yeniden dağıtılmadı;
eksik paket için sahte NOTICE veya kaynak tarihi üretilmedi.

## Doğrulama

| Komut | Sonuç ve sınır | Kanıt |
|---|---|---|
| `npm run check` |359ana+5worker PASS; lint/native+web strictTS ve kaynak/hak/hash/format kapıları | [log](opening-year-places-evidence/check.log) |
| `npm run web:export` |4statikrota PASS | [log](opening-year-places-evidence/web-export.log) |
| Exported HTML kontrolü | Gerçek ana sayfa HTML'i MS2024 içerir; browser/GPU testi değil | [log](opening-year-places-evidence/static-opening.log) |
| `npm run android:bundle` | Hermes+DOM JSexport PASS; APK değil | [log](opening-year-places-evidence/android-export.log) |
| Beş güncellenen web dosyası `--list` |34senaryo yalnız listelendi, çalıştırılmış PASS değil | [liste](opening-year-places-evidence/browser-list.log) |
| Chromium launch | BLOCKED; sandbox shutdownEPERM/SIGTRAP, screenshot0 | [hata](opening-year-places-evidence/browser-launch.log) |
| `places:download -- --list` | Beş allowlist kaynağı ve mevcut hak/boyut sınırları PASS | [liste](opening-year-places-evidence/places-list.log) |
| `places:download -- --timeout-seconds 7200` | Yeni süre seçeneği kabul edildi; gerçek indirme yine EAI_AGAIN ile durdu, exit1 | [log](opening-year-places-evidence/places-download.log) |

Android fiziksel cihaz **UNVERIFIED ON DEVICE**. Gerçek büyük GeoNames ETL,
cihaz dokunma/GPU/TalkBack/performans ve browser görsel kabulü doğrulanmadı.
Önceki yayınNO-GO sürer;2024varsayılanı bütün katmanların o yılda eksiksiz olduğu
iddiası değildir.
