# Faz 14 — Katmanlar, filtreler, lejant ve ayarlar

2026-10-16 · **CODE / UNIT / HOST PERSISTENCE / QUALITY / JS EXPORT PASS**.
Gerçek web etkileşim kabulü **BLOCKED**; Android **UNVERIFIED ON DEVICE**.

AGENTS.md, README, docs/progress.md, Faz13 raporu/ADR, mevcut katman/zaman/renderer/
kaynak/depolama kodu incelendi. Koddan önce [ADR-0015](../adr/0015-layer-preferences.md)
yazıldı. Kullanıcının Faz14 promptu önceki yol haritası önerisinin yerine geçer;
yalnız bu faz uygulandı. Faz15 başlamadı.

## Tamamlanan işler ve kabul

| İstek | Sonuç ve sınır |
| --- | --- |
| 1–2. Bağımsız katmanlar | CODE/UNIT PASS:6 kontrol, ilk5 bağımsız siyasi/kültür/kişi/savaş/olay; tarihî ad/yer etiketi ayrı. Ad için ana katman da gerekir. Yıl/kamera değişmez; panel görünürlüğü coverage kimlikleriyle tutarlı |
| 3. Filtreler | PASS: kesin destek, kayıt güveni, siyasi tür, kişi–yer ilişkisi, olay türü. Tek şema/predicate; kapsama, snapshot önizleme, harita ve olay listesi aynı filtrede. Kayıt güveni kaynak kurumuna puan diye sunulmaz |
| 4. Ortak lejant | CODE PASS: metin+biçim+token renkleri; siyasi çizgi, kültür alanı, savaş/antlaşma/olay, kişi ve belgesiz konum ayrımı. Modern fiziksel kıyı/nehir zamanı uyarısı korunur |
| 5. Kalıcı tercihler | HOST TEST PASS: web-key ve gerçek host diskte native dosya adaptörü yeniden açma; ayrı version1/4KiB kayıt, seri/temp+rename, hata/retry/explicit reset. Yıl/kamera/yer imi korunur. Gerçek browser reload/Android reopen kabulü açık |
| 6. Yoğunluk | PASS: mevcut64+64 kişi/olay küme bütçesi ve8/1000 seçim korunur; kültür dolgusu örtüşmeye göre azalır, seyrek ad modu en çok8 etiket. Geometri sessizce düşürülmez; Android performansı ölçülmedi |
| 7. Modern etiket guard | PASS: fiziksel kaynakta ad niteliği/symbol/glyph/sprite/yeni modern kaynak/katman enjeksiyonu reddedilir; gerçek stil üretiminde çalışır. Tarihî verinin doğruluğu ayrıca ETL kapısında |
| 8. Ayarlar | CODE PASS: koyu/TR sabit; sistem veya hareket azaltma, kalıcılık durumu, gizlilik, atıf, gerçek hata bildirim servisinin bulunmadığını açıklayan metin. Sahte buton/hesap/analitik yok |
| 9. Ergonomi/erişilebilirlik | Kontroller48px/switch hitSlop, renk yanında biçim+metin, token kontrast testleri PASS; mevcut SafeArea/modal/odak kullanılır. Gerçek TalkBack/keyboard/rotasyon/fontScale ve screenshot kabulü BLOCKED |
| 10. Sürekli atıf | CODE PASS: MapControls, katman paneli ve ayarlardan erişim; hiçbir ana katmana veya hazır WebGL durumuna bağlı değil |
| Beş temel katman bağımsız ve yılla uyumlu | Engine/renderer/store testleri PASS; fiziksel web/Android etkileşim kabulü **BLOCKED / UNVERIFIED ON DEVICE** |

[İşlevler, filtre anlamı, bridge ve depolama sözleşmesi](../layers-settings.md).

## Testler ve doğrulama

- `npm run check`: lint0 uyarı, strict native+web typecheck, **214/214 ana test +4/4 worker**,
  fiziksel asset/worker hak+SHA, pilot/LOD/kapsama/lisans ve sitelink hash kontrolü,
  formatter PASS. [Tam çıktı](phase-14-validation.log).
- Yeni16 tercih/filtre testi +1 renderer regresyonu: altı bağımsız katman, aynı
  filtreyle coverage/feature/frame, çok sınıflı siyasi varlık, approximate opt-in,
  biyografi ayrımı, gerçek pilotun yer etiketi yokluğu, snapshot sızıntısı/önizleme,
  çakışan40 kültür, per-snapshot siyasi sınıf, şema/UTF-8 ve bridge reddi,
  web-key/native-adaptör disk kalıcılığı, bozuk depoyu koruma, seri yazma/retry,
  stil enjeksiyonu, stale query/ACK ve kamera/etiket cleanup.
- `npm run web:export`:4 statik route PASS. [Çıktı](phase-14-web-export.log).
- `npm run android:bundle`: Android Hermes + ortak DOM JS export PASS.
  APK/Gradle build veya GPU/cihaz kanıtı değildir. [Çıktı](phase-14-android-export.log).
- Playwright **68 senaryo /10 dosya** listelendi;3 yeni akış desktop+narrow.
  [Liste](phase-14-browser-list.log). Gerçek başlatma45s sınırında tamamlanamadı;
  testler çalışmadı, PASS yok. [Deneme](phase-14-browser-run.log).
  Ayrı localhost:8081 bind probe **EPERM** verdi. [Kanıt](phase-14-port-check.log).
- `npm run environment:check` exit1: Node26.11.1/npm12.2.0/lock PASS;
  java/adb ENOENT, Android SDK yok. [Ortam](phase-14-environment.log).
  Fiziksel cihaz, FPS/PSS/ısı/dokunma/rotasyon/geri/kalıcılık **UNVERIFIED ON DEVICE**.

İlk turda eski sentetik renderer testinin yeni place katmanını da saydığı
saptandı; o testin kapsamı labels=false ile açıklaştırıldı. Bir testin async
reddi sync throw olarak beklemesi ve duplicate import lint uyarısı düzeltildi.
Son kalite turunda hata yok. Gerçek platform doğrulaması için önerilen adımlar:

1. `npm ci`, `npm run check`, `npm run web`; `npm run test:web` ile68 senaryo.
2. Katmanlar:6 anahtarı tek tek kapat/aç;1066/1867/1880 ve veri olmayan yıla git.
   War kapalıyken1648 antlaşma listesi erişilebilir; kaynak/atıf her zaman açık.
3. Kesin/güven/tür/ilişki filtrelerini dene, yaklaşık kişi opt-in'i ayrı dene;
   değişiklikten sonra kaynak yılı/harita/kartın aynı revision'a geldiğini izle.
4. Hareket azaltma/seyrek ad/filtre seç, yeniden aç; ardından yalnız tercihleri
   sıfırla. Yer imleri, seçili yıl ve kamera korunmalı. Kayıp/bozuk depo ve kota
   hatası durumunu kontrol et.
5. Gerçek Android cihazda USB build/open, TalkBack,48px hedef, büyük metin,
   çentik/alt navigation/klavye, dönme/geri/arka plan ve yeniden açılış. Önceki
   Faz02 GPU/context/cleanup kapısını gerçek cihaz kanıtıyla tamamla.

## Veri, lisans, değişen dosyalar

Yeni dış paket, servis, lisansı belirsiz kaynak veya tarihî veri eklenmedi.
Tarihî katalog **0.4.0-pilot /19 kayıt /7 kaynak**, link kataloğu1.0.0; NARA1867
sınır kesiti, Van Gogh yaklaşık konumu ve4 dar olay mevcut haliyle korunur.
Tam siyasi polygon, gerçek kültür alanı ve yıllık destekli bağımsız yer etiketi0.
NE110m fiziksel127 feature/5143 koordinat tarihî kıyı doğruluğu iddiası taşımaz.
Mevcut FileSystem57.0.7 MIT bildirimi aynı atıf panelinde kalır. Historical
Basemaps **BLOCKED FOR REDISTRIBUTION**; OHM nesne hak incelemesi olmadan eklenmez.

[Değişen dosya listesi](phase-14-files.txt): preferences model/store/adaptör/hook,
LayersDrawer/LayerFilters/LegendPanel/SettingsPanel/PlaceCard ve AtlasScreen,
kişi/arama kart görünürlükleri, timeline/config/frame, pilot feature loader,
bridge/host/renderer/etiket/stil guard, testler, TR katalog ve dokümanlar.
Bu ortamda git repository metadata yok; commit/diff üretilemedi.

## Riskler ve sonraki faz önkoşulları

Gerçek browser/Android kabulü, A-04 screenshot baseline, önceki raw Expo bridge/
origin/CSP, temiz Node24/GitHub CI, güncel online npm audit ve tam transitif NOTICE
kapıları sürer. Önceki29 audit bildirimi yeni online denetimle kapatılmadı.
Filtrelenmiş boş harita, dünya tarihinde varlık yok anlamına gelmez; kapsam her
zaman kısmîdir. Çok sekmeli eşzamanlı tercih son yazanla sonuçlanır; senkronizasyon
bu fazda yoktur. Host disk testi gerçek Android dosya sistemi veya OS yeniden
başlatma kanıtı değildir. Yeni faz için açık kullanıcı isteği ve bu kapıların
raporlanması gerekir. **Faz15'e otomatik geçilmedi.**
