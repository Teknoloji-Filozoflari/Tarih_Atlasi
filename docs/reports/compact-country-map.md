# Kısa ülke adları, Libya/Çad ve kompakt tarih çubuğu

18 Ekim 2026 · Kullanıcının ülke adları, Libya/Çad boşlukları ve kaynak/tarih
alanlarının kapladığı yer hakkındaki talebi. Mevcut proje yerinde düzenlendi;
küre, renkler, kamera, arama, yer imleri, paylaşım ve bağımsız katmanlar korundu.
Yeni ürün fazı veya bağımlılık yok.

| İstek | Sonuç | Durum |
| --- | --- | --- |
| Uzun ülke etiketleri | Harita, siyasi kart başlığı, arama ve kayıt listesinde kısa ad | IMPLEMENTED |
| Libya/Çad boşlukları | Mevcut lisanslı kaynaktan üç tarihli satır incelenip çizime alındı; 2000/2010 çıktısında ikisi de var | IMPLEMENTED, yaklaşık kaynak coğrafyası |
| Fazla kaynak metni | Kalıcı alt kaynak/sayı satırları Keşfet'e; kartın uzun dökümü kapalı kaynak/belirsizlik ayrıntılarına taşındı | IMPLEMENTED |
| Büyük timeline | Yıl/oynatma/slider kompakt; ölçek/hız/atlama/cetvel açılır araç panelinde | IMPLEMENTED; gerçek ekran ölçümü açık |
| Gerçek görsel/Android kabulü | Chromium sandbox EPERM; Java/adb/SDK yok | BLOCKED / UNVERIFIED ON DEVICE |

## Adlar nereden geliyordu?

Kaynak siyasi başlıkların Türkçe karşılığı doğrudan etikete taşınıyordu:
`Third Hellenic Republic` → `Yunanistan Cumhuriyeti` gibi. Resmî uzun ad için
[Yunanistan Dışişleri Bakanlığı](https://www.mfa.gr/missionsabroad/en/about-greece/government-and-politics)
incelendi. Kısa harita adı ayrı bir gösterim tercihidir.

`short-names.ts`, **108 açık kaynak başlığı** için kısa ad eşleştirir; bu 108
ayrı ülke sayısı değildir. Yunanistan, Türkiye, Fransa, Almanya, Çad, Libya,
ABD gibi adlar kullanılır. Kaynak adları, tarihli iddialar, kalıcı ID'ler ve
uzun adla arama korunur. Roma Cumhuriyeti, tarihî krallıklar, iki Kongo ve
Dominika/Dominik Cumhuriyeti ayrımları regex ile silinmez. Özgün adlar açılabilir
belirsizlik ayrıntısındadır; kültür adları değiştirilmedi.

## Libya ve Çad incelemesi

CShapes üretime alınmadı. Yeni indirme, modern sınır ithali veya tahminî çizim
yok. Mevcut Cliopatria v0.2.1 ZIP'i ve veri lisansı hash ile doğrulandı.

| Satır | Kaynak dönemi | İşlem |
| --- | --- | --- |
| Çad13239 | 1961–2023 | Dış halka ile bir iç deliğin tek ortak köşedeki teğeti incelendi.115pozisyon, iki iç delik ve bütün kenarlar korundu; yalnız halka yönü normalleşti |
| Libya13370 | 1976–2005 | 127pozisyonlu geçerli geometri/iç delik korundu; eski rejim başlığı bütün dönemin resmî adı olarak sunulmaz |
| Libya13580 | 2006–2013 | Aynı ilke; kaynak dönemi uzatılmadı |

[JTS'nin birincil geometri tanımı](https://locationtech.github.io/jts/javadoc-1.18.0/org/locationtech/jts/geom/Polygon.html)
tek noktalı halka temasının iç alan bağlantısı korunuyorsa geçerli olabildiğini
açıklar. Genel doğrulayıcı varsayılanı değişmez; yalnız pinlenmiş Çad incelemesi
dar seçeneği açar. Kesişme, ortak kenar, iki farklı temas noktası, dışarıdaki
delik ve kopukluk oluşturabilecek temas ağı reddedilir. Tunus gibi diğer
kayıtlara bu istisna uygulanmaz. Sentetik olumsuz testler üretim verisi değildir.

Libya kaynağının QID'si **Q17435890**, ülke yerine rejim tarihi öğesidir.
[Q17435890](https://www.wikidata.org/wiki/Q17435890),
[ülke Q1016](https://www.wikidata.org/wiki/Q1016),
[BM üye ülke/ad değişikliği kaydı](https://www.un.org/en/about-us/member-states/libya)
ve [2010 konferans kaydı](https://static.un.org/en/conf/npt/2010/statements/statements_day_05may.shtml)
karşılaştırıldı. Özgün QID/başlık çıkarımda/provenance'da saklı; ülke alanının
makale işlemi incelenmiş **Q1016** kimliğini kullanır. Wikipedia URL'si
tahmin edilmez; mevcut sitelink çözümleyicisi kullanılır.

[ICJ dosyası](https://www.icj-cij.org/case/83) da kaydedildi. Bu referanslar
her koordinatın veya dönem içindeki fiilî kontrolün bağımsız doğrulaması
değildir. Alanlar **documented approximate**, düşük güven ve kaynak dönemleriyle
gösterilir; iç savaş cephesi veya tartışmasız hâkimiyet iddiası yoktur. Kaynağın
sabit aralığı yıllık gözlem diye sunulmaz.

İnceleme filtresi v1.1.0. Ham dünya manifesti/374asset değişmez. Üç satırlık
ek çıkarım `generated/country-review.ts`, SHA-256:
`e9c65f7bbc68000f6e9705c3a337d4611c3cc6555311c1e5cbb38cf0eedfa402`.
[Ayrı CC BY4.0 bildirimi](../../assets/licenses/country-review-NOTICE.txt)
CI'da hash ile zorunlu. Arşivden yeniden üretimde özgün ve çıktı kenar
çokluklarının aynılığı ayrıca kontrol edilir; delik silme/buffer/snapping yok.

| Yıl | Kaynak satırı | Çizilebilir / askıda | Uygulama feature çıktısı |
| --- | --- | --- | --- |
| 2000 | 192 | 180 /12 | 193; Libya13370 ve Çad13239 var |
| 2010 | 191 | 180 /11 | 193; Libya13580 ve Çad13239 var |
| 2024 | 195 | 186 /9 | 186; Çad'ın ayrı2024kaydı hâlâ askıda |
| 2025/2026 | 0 | 0 /0 | Desteksiz; sınır uzatma yok |

Toplam etkin12951çizilebilir/428askıdaki kaynak satırı vardır; ayrı ülke veya
uzmanlarca onaylanmış sınır sayısı değildir. Çok parçalı alanlar feature sayısını
artırır. [Gerçek uygulama yükleyicisi çıktısı](compact-country-map/scene-proof.json),
[2010 örneklemesi](compact-country-map/map-2010.json):286KuzeyAfrika örnek
noktasında örtüşme0; tam dünya/geometri sertifikası değildir.

## Harita alanı ve kaynak erişimi

Varsayılan alt bölümden kaynak/kapsam sayacı ve cache menşei satırları kaldırıldı;
**Keşfet** içinde erişilebilir. Yıl altında kısa veri durumu kalır. Yüklenirken
eski yılın kapsamı yeni yılın durumu olarak yazılmaz. Önizleme kaynak yılı ve
hata uyarıları gerektiğinde görünür kalır.

Kartta yinelenen kaynak URL/locator/atıf dökümü, uzun tarih açıklaması ve teknik
zaman özeti varsayılan açık değildir. **Kaynakları gör / Veri belirsizliği** ve
haritadaki **©** korunur; lisans kaydı veya veri silinmedi. Kısmi alan/çizim
askısı uyarıları kapatılmadı.

Timeline: yıl girişi, önce/sonra, oynat/durdur ve slider doğrudan erişilir.
**⋯ Tarih araçlarını genişlet** panelinde20/200/tüm tarih ölçeği,±10/100atlama,
başlangıç/bitiş, hız, snapshot ve cetvel var. Panel normal document flow'da
yer kaplamaz; açmak oynatmayı durdurur. MÖ/MS, yıl sıfırı reddi, iptal/revizyon
ve kamera koruma aynı motor üzerinde.48pxhedefler küçültülmedi; yeni animasyon
yok. Gerçek ekran yüksekliği, TalkBack ve büyük metin kabulü ölçülmedi.

## Test kanıtları

- `npm run check`: **307 ana +5 worker PASS**, lint, native/web strict TS,
  kaynak/hash/lisans/NOTICE ve format kapıları. Üç yeni test ad/ID ayrımını,
  geometri olumsuz örneklerini ve gerçek kaynak dönem/kenar/deliklerini sınar.
- `node scripts/world/review-countries.mjs --check`: PASS; mevcut arşivden
  aynı üç satır/çıktı/atıf. `world:review:check` ham ZIP gerektirmeyen CI kapısı.
- Web4rota ve AndroidHermes+DOM JavaScript export PASS; APK/cihaz değildir.
- Yeni6browser ve production44senaryo **yalnız listelendi**. Chromium launch
  exit2/sandbox EPERM; ekran görüntüsü0. Görsel kabul **NOT TESTED**.
- `environment:check` exit1: Java/adb/SDK yok. Android **UNVERIFIED ON DEVICE**.
- İlk dosya URL yolu/kaynak QID kontrolü, duplicate-import lint uyarısı ve eski
  uzun ad/sayım beklentileri düzeltilip yeniden kontrol edildi; test kaldırılmadı
  veya eşik gevşetilmedi. İlk süreçli `--test` çağrısının dosya başarısızlığı
  da saklı; doğrudan repo koşucusunun son sonucu esas alınır.

[Komutlar ve loglar](compact-country-map/commands.json).
İlgili üretim/timeline/cache browser akışları güncel veriye uyarlandı; bütün
eski browser senaryolarının çalıştığı iddia edilmiyor. Gerçek browser/canlı
Wikidata, CSP/ham DOM, bağımlılık/NOTICE, tarihsel doğruluk ve cihaz performansı
için önceki yayın **NO-GO** kararı sürer.

## Dosyalar ve çalıştırma

- Adlar: `src/politics/{short-names,model}.ts`, `src/data/world/{names,search}.ts`.
- Veri: `src/data/world/{geometry,review,repository,timeline,types}.ts`,
  `generated/country-review.ts`, `scripts/world/{review-countries,check-country-review}.mjs`,
  `scripts/qa/map-scene.mjs`, `assets/licenses/country-review-NOTICE.txt`, `package.json`.
- UI: `src/atlas/{AtlasScreen,TimelineBar,PolityCard,SourceActions,UncertaintyDetails,AttributionPanel}.tsx`,
  `src/i18n/tr.ts`.
- Test: `tests/unit/{country-compact,world}.test.mjs`, `tests/run.mjs`,
  `tests/web/{application-review,product-flows,playback,loading,product-rework}.spec.ts`.
- Belgeler: README/THIRD_PARTY_NOTICES, progress, ürün/mimari/veri kalitesi/
  lisans/arayüz/oynatma/yayın engelleri, ETL yönergesi, bu rapor/kanıt klasörü.

Git dizini repository olarak tanımıyor (exit128); bu liste Git diff değildir.
Reset/checkout/init yapılmadı. Kullanıcı indirmeleri ve önceki assetler korundu.

Expo terminalini **Ctrl+C** ile durdurup proje kökünde:

```sh
npm run web -- --clear
```

Gerekirse tarayıcıda Ctrl+Shift+R. Yeni indirme gerekmez.2000/2010'da Libya,
Çad ve Yunanistan'ı kontrol edin; ülke adı makaleyi, alanı kartı açar. Kaynak ve
tarih araçlarını açıp kapatınca kamera korunmalı. Sonraki önkoşul gerçek
web/Android kabulü ve kalan kaynak incelemeleridir; yeni faz başlatılmadı.
