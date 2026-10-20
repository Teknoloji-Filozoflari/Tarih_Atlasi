# Zaman motoru ve kapsam sözleşmesi

2026-10-15 · Faz 06. Giriş: `src/timeline/index.ts`; UI hook'ları ayrı dosyadadır.
Yeni bağımlılık, tarihî kayıt veya geometri eklenmedi.

## Yıl modeli

`displayYear` negatif MÖ, pozitif MS tam sayıdır; yıl 0 geçersizdir.
`displayYearToAstronomical(-1) = 0`, `(1) = 1`, `(-2000) = -1999`;
`astronomicalToDisplayYear` ters dönüşümdür. Genel alan modeli ±10000, kullanıcı
seçimi **MÖ 2000–sistemin güncel yerel yılı** ile sınırlıdır. `selectableYearRange`
Date kabul eder, bu nedenle yıl devri testi sistem saatini değiştirmez. UI açılış,
uygulamaya dönüş ve 60 saniyelik kontrolle üst yılı yeniler. Seçilen yıl veri
kapsaması hakkında bir iddia değildir; statik katalog kendi tarihleriyle kalır.

`elapsedYears` astronomik sıradaki yıl adımı farkı, `inclusiveYearCount` kapalı
aralıktaki yıl sayısıdır. MÖ 1 → MS 1 bir adım ve iki dahil yıldır. Bunlar geçen
gün sayısı değildir. Mevcut `dateKey` 372 tabanlı **sıralama anahtarı**dır; gerçek
süreye çevrilmez. Eski yıllar için JavaScript Date ile takvim günü üretilmez.

## TemporalExtent genişlemesi

Şema **v2** korunur; opsiyonel alanlar katı doğrulanır, bilinmeyen alanlar hâlâ
reddedilir. Eski kayıtlar okunabilir fakat yeni motor support'suz geometriyi
seçili yılın coğrafyası yapmaz. Arama sağlayıcısının `possible` adayları ile
zaman motorunun kaynakla desteklenen sonuçları farklı sözleşmelerdir.

```ts
support?: {
  kind: 'snapshot' | 'continuous';
  note: string; // Kaynaktaki zaman/geometri geçerliliğinin açıklaması
};
periods?: { start: HistoricalDate; end: HistoricalDate }[];
```

- `start/end` ve periods uçları **dahildir**. Ay/gün null kalabilir; yıl zorunludur.
  Kendi hassasiyetinde kesişim sorgulanır. Yıl seçimi bir günlük snapshot'ı bulur;
  snapshot'ın bütün yıl geçerli olduğu iddiasını üretmez. Kayıt tüm TemporalExtent,
  özgün sourceDate, belirsizlik, evidence locator ve review bilgisiyle geri döner.
- `snapshot` her alt aralıkta tek bir bilinen yılı kapsar. Sorgu komşu yıllara
  çizgiyi taşımaz. Birden fazla snapshot yılı varsa ayrı periods ile gösterilir.
- `continuous` açık kaynak açıklaması ve bilinen uçlar ister. Kaynak metni,
  temporal ve geometry/location evidence ile birlikte editöryal incelenmelidir;
  yalnız iki dış yıl yazılması sürekli geçerlilik kanıtı sayılmaz.
- `periods` en çok 64, boş olmayan, sıralı, çakışmasız, dış zarf içinde kapalı
  aralıktır. Aralarındaki boşluklar indekste de korunur. Aynı entity/yorum/scope
  için zarfı çakışan fakat gerçek dönemleri ayrık sınır sürümleri kabul edilir.
- `day/month/year/decade/century/range/unknown` ayrı hassasiyetlerdir. Kaba/unknown
  bilgi belirsizlik taşır. Day ancak gerçek ay+günle geçer; month'ta gün null,
  year/decade/century/range/unknown için ay/gün null olmalı. Tarih öncesine özel
  sahte gün verilmez. `describeTemporal` eksik bileşenleri null olarak döndürür.
- Unknown/unbounded uç, unknown precision veya incelemesiz kayıt kesin yıllık
  sonuç üretmez. Bunlar desteklenmeyen aday sayımıyla görünür kalır; sonsuz
  geçerlilik ya da en yakın kaynak yılına otomatik atama yapılmaz.

## API

`createTimelineEngine(provider, { cacheSize: 32 })` doğrulanmış
`HistoricalDataProvider` alır; backend veya renderer tipine bağlı değildir.
Aynı isimli fonksiyon dışa aktarımları da engine'i ilk argüman olarak alır.

| Metot | Sonuç / anlam |
| --- | --- |
| getEntitiesAtYear(year) | Belgeli dönemle kesişen kimlik kayıtları; varlık konumu çıkarılmaz |
| getTerritoriesAtYear(year) | Yalnız zaman/geometri kaynakları ve support beyanı olan alan/çizgi sürümleri |
| getPersonsAtYear(year) | Ayrı person yaşam sonucu, o yılın locations listesi, biographicalLocations ve locationStatus |
| getEventsAtYear(year) | Kaynaklı tarihli olaylar/savaşlar; geometrisiz olayın varlığı ile mekânsal kapsam ayrı |
| getAvailableSnapshots(options?) | Kapsamdaki destekli snapshot yılları ve recordIds; kültür/siyasi iddialar birleştirilmez |
| getDataCoverage(year, options?) | Seçili yıl, kaynak yılı, kapsam modu, tam kaynaklı kayıtlar, editöryal coverageRecords ve kısmi kapsam |

`getDataCoverage` için layers (polity/culture/person/battle/event/place), CRS84
bbox ve isteğe bağlı `preview: 'nearest-snapshot'` kullanılabilir. Boş layers
hiçbir katmanı seçmez. Bbox filtrelemesi geometrinin bbox kesişimidir, kesin
polygon içinde bulunma testi değildir. Bilinmeyen seçenek/layer/bbox reddedilir.
Arayüzde şu an yalnız çizilebilir devlet/kültür katmanları kapsam sorgusuna gider;
kişi/olay çizimi sonraki fazlara ait kalır.

Kişi yaşamı kendi başına konum değildir. Yalnız `timed-presence`, ortak temporal+
location kaynak locator'ı, support ve bilinen tarihle yıllık konum döner; o yıl
kişinin belgeli yaşam dönemi de bulunmalıdır. Tarihsiz biyografik yerler ayrı
listede kalır. Yer referansına merkez koordinatı uydurulmaz. Yaşam periods
boşluğuyla çelişen timed-presence katalog doğrulamasında reddedilir.

## Üç kapsam modu ve önizleme

| API değeri | Türkçe UI | Koşul |
| --- | --- | --- |
| exact verified | Kesin kaynakla doğrulanmış tarihî coğrafya | İncelenmiş, bilinen/kaba olmayan tarih, yüksek güven; siyasi sınırda documented+surveyed |
| documented approximate | Kaynakla belgelenmiş yaklaşık tarihî coğrafya | Destekli geometride tarih/konum/sınır belirsizliği veya kültürel alan |
| no supported historical geography | Seçili yıl için kaynakla desteklenen tarihî coğrafya yok | O kapsam/yılda destekli çizilebilir geometri yok |

Bunlar haritanın tamamının eksiksiz/kesin olduğu anlamına gelmez: `partial: true`
ve boş alanın tarihî yokluk olmadığı açıklaması korunur. Katalog/asset yükleme
hatası ayrıca gösterilir; veri yokluğuna çevrilmez. `coverageRecords` engelli veya
pilot dışı editöryal kapsam açıklamalarını kaybetmez.

Önizleme **varsayılan kapalıdır**. Kullanıcı düğmeyi seçerse yalnız seçili kapsamın
snapshot'ları arasında astronomik yıl farkına göre en yakın yıl bulunur; eşitlikte
eski yıl tercih edilir. Seçili yıl değişmez. Report.selectedYearMode destek yok
olarak kalırken report.mode önizlenen kaydın kalitesini anlatır; sourceYear ve
isPreview bunu ayırır. Harita feature'ları da sourceYear/preview taşır. Etiket
haritanın yanında ve kaynak kartı açıkken görünür; çizgi seçili yıla aitmiş gibi
sunulmaz. Önizleme kapatılınca ya da yıl değişince eski kaynak temizlenir. İlk
pilot düğmesi ise açıkça **1867'ye gider**, önizleme düğmesinden farklı davranır.

## İndeks, cache ve kaynak temizliği

Motor ilk istekte sağlayıcıdan tüm küçük kataloğu sayfalı okur: en çok 10×100
kayıt, concurrency 1; aynı anda gelen istekler tek kurulumu paylaşır. Kayıt başına
64 periods üst sınırı, en çok 64000 indeks girdisi vardır; 4026 yıl için kopya
üretilmez. Başlangıç sırası + binary search + prefix max-end elemesi kullanılır.
Genellikle adaylar daralır; çok uzun örtüşen aralıklarda en kötü durum O(n)'dir.
Büyük dünya katalogları için performans kanıtı veya sınırsız ölçek iddiası yoktur.

Yıl sorguları immutable bir katalog örneğine ait LRU'da tutulur (varsayılan 32,
izinli 1–128 yıl). Farklı katalog sürümü ayrı engine kurar; cache paylaşılmaz.
`cacheInfo` boyut/kapasite/indexScans, `clearCache` bellek kontrolü sağlar. Katalog
limiti aşılırsa kısmi sonuç sessizce sunulmaz. Renderer mevcut revision kontrolüne
preview seçimini de ekler; UI `createLatestQuery` ile eski başarı/hataları reddeder
ve unmount'ta iptal eder. Provider snapshot'ı donuktur; caller mutasyonu indeksi
ve provenance'ı değiştiremez. Bellek/latency gerçek Android'de ölçülmedi.

## Çalıştırma ve gerçek kapsam

```sh
npm run check
npm run timeline:coverage
npm run web:export
npm run android:bundle
```

[Makine okunur kapsam örneği](reports/phase-06-coverage.json) sistem üst yılını ve
1867 dışındaki boş sonuçları raporlar. Pilot **0.2.0-pilot**, ETL **1.2.0**; açık
snapshot annotation eklenmiştir. Aynı NARA raw SHA, aynı 1 çizgi/6 kayıt ve aynı
CC0 hakkı geçerlidir. Geometri/NOTICE byte ve hash'leri değişmemiştir. Yeni olay,
kişi, kültür veya başka dönem eklenmemiştir. [Faz raporu](reports/phase-06.md).

## Faz 07 uygulama state güncellemesi

AtlasScreen artık tek useTimelineStore kullanır; eski useTimelineCoverage genel
hook'u uygulamada paralel ikinci state olarak çalışmaz. Requested yıl, ortak
contextYear frame ve renderer ACK ayrı izlenir. Önizlemede bütün varlık grupları
kaynak yılını paylaşır; seçili yıl ve unsupported kapsam etiketi korunur.
Yıl/önizleme değişimi kamerayı hareket ettirmez; ayrı odaklanma kontrolü eklendi.
[Çizelge/oynatma rehberi](playback.md), [ADR-0008](adr/0008-timeline-playback-state.md).
