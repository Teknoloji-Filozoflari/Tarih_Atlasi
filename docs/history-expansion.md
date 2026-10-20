# Dünya tarihi içerik toplama ve inceleme

## 21 Ekim 2026 — İndirilen dosyalar alındı

Mevcut 4.273 adaydan 4.053 yeni kayıt uygulamaya bağlandı; normal kullanım için
yeniden indirme gerekmez. Yeni paket 338 parçadır; detay/geometri ihtiyaçta
yüklenir. Eski küçük extension 710/800 olarak korunur; aşağıdaki kademeli indeks
önkoşulu yeni arşiv adaptörüyle uygulandı. Yeni ham indirme yine otomatik onay
almaz. `npm run history:check` üretimi, `node scripts/history/check.mjs --with-raw`
orijinal yanıtları da denetler. [Güncel sonuç ve platform sınırları](reports/history-import-2026-10-21.md).
`history:prepare` için incelenmiş girdi envanteri pini gerekir; çıktı manifesti
de ayrı pinlenir. Kaynakları elle verified yapmak onay yerine geçmez.

20 Ekim 2026. Üretim kapsamı **PARTIAL**; “bütün önemli kişiler/bütün savaşlar”
tamamlanmış veya nesnel olarak sonlu bir liste değildir. Yeni üretim sürümü
`1.4.0-births`: 56 kişi + 23 olay. [Kayıt bazında kapsam](reports/broad-history-2026-10-20/coverage.json).

## Kullanım

Yeni yayımlanmış içerik için indirme gerekmez. `npm run web -- --clear` ile aç;
Richard Feynman, Orhan Pamuk, İbn Rüşd, Dalay Lama, Waterloo veya Kore Savaşı ara.
Arama farklı yıllardaki profilleri de bulur. Feynman kartında ⓘ → doğum yılına git
eylemi MS 1918’e gider; doğum noktası yalnız o yıldadır. Konumsuz savaşlar yılın
olayları listesinde bulunur; yaşamış bir kişiyi her yılda doğduğu yerde göstermeyiz.

## Daha geniş kaynak alımı

Toplayıcı yalnız **incelenmemiş staging** üretir. Sonuçlarını otomatik olarak
`src/`, harita, çevrimdışı paket veya üretim manifestine kopyalamaz.
Gerçek proje iletişimi gerekir; anahtar/hesap/ücretli servis gerekmez:

```bash
read -r -p 'Gerçek proje URL adresin veya iletişim e-postan: ' ATLAS_WIKIDATA_CONTACT
export WIKIDATA_USER_AGENT="TarihAtlasi/0.1.0 ($ATLAS_WIKIDATA_CONTACT)"
npm run history:collect -- --group nobel --limit 2000
npm run history:collect -- --group time --limit 500
```

Diğer gruplar `scientists`, `philosophers`, `politicians`, `religious`, `people`,
`wars`, `battles`, `events`. Örneğin:

```bash
for ATLAS_HISTORY_GROUP in scientists philosophers politicians religious people wars battles events; do
  npm run history:collect -- --group "$ATLAS_HISTORY_GROUP" --limit 2000 || break
done
```

Her komutun limiti ayrıdır; üst sınır 10.000. İlk 2.000 kayıt “en önemli 2.000”
demek değildir; QID sırasıdır. `people` grubunda ≥40 sitelink yalnız keşif
sezgiselidir, kültürel önem ölçüsü değildir ve dil/coğrafya yanlılığı taşır.
Diğer sınıflar ve ödül ilişkileri de Wikidata’nın kapsadığı kadardır.
`religious` ruhban mesleği ve alt türlerini tarar; bütün dinî kişilikleri kapsamaz.
`politicians` bütün hükümdarların veya bütün görev sahiplerinin listesi değildir.
Nobel grubu beş Nobel kategorisi ile ekonomi ödülünü ayrı kimliklerle keşfeder;
kurumlar da sonuç olabilir, kişi diye dönüştürülmez. TIME’de grup/kavram seçimi
olabilir. İnsan kimliği, rütbe/niteleyici ve ödül tarihleri ayrıca incelenmelidir.

[TIME’nin açıklaması](https://time.com/3626016/person-of-the-year-faq/)
“yılın kişisi” seçkisinin TIME’ye ait olduğunu açıklar. New York Times listesi
varsayılmadı; ödül/seçim etiketi tarihsel onay veya ahlaki övgü anlamına gelmez.

## Ağ, cache ve provenance

- [Wikidata veri erişimi](https://www.wikidata.org/wiki/Wikidata:Data_access)
  ve [yapılandırılmış veri lisansı](https://www.wikidata.org/wiki/Wikidata:Licensing)
  incelendi. Ham JSON CC0 olgularıdır; Wikipedia metni/Commons görseli değildir.
- SPARQL yalnız kimlik keşfi için; arama veya harita hareketi canlı WDQS isteği
  üretmez. Sorgu sayfası en fazla 50; eşzamanlılık 1, istek arası en az 1 saniye,
  20 saniye timeout, en fazla 3 deneme. HTTP 429/5xx ve API maxlag/ratelimited
  için sınırlı backoff; 30 saniyeden uzun Retry-After’da bekleme kuyruğu kurmak
  yerine durur. Geniş sınıf sorgusu sunucuda pahalı olabilir; timeout’ta körlemesine
  tekrar döngüsü çalıştırılmamalı, daha dar sorgu veya dump değerlendirilmelidir.
- Yanıt başına en fazla 4 MiB; QID, sıralama, tekillik, sayfa boyutu ve entity
  revision kontrolü. Ham statement GUID/rank/references/qualifiers aynen korunur.
- `data/staging/history/` git dışında. Her ham dosyanın URL/request hash/byte/
  SHA256/erişim zamanı ve `productionApproved:false` makbuzu var. İletişim adresi
  yalnız User-Agent ile kaynağa gönderilir; runtime kullanıcı verisi toplanmaz.
- Aynı komut tekrar çalıştırılınca bütünlük doğrulanan sayfa ve varlık cache’i
  kullanılır; yarıda kalan sayfanın tamamlanan entity yanıtları tekrar indirilmez.
  Checkpoint bilgilendiricidir; başlangıçtaki cache sayfaları yeniden taranır.
  Bu dondurulmuş cache güncellik garantisi değildir. Güncellemede eski klasörü
  inceleme arşivine taşıyıp yeni staging aç; sessizce üzerine yazma.
- Bozuk cache reddedilir; kullanıcı verisi silinmez. Hatalı dosya/makbuz çiftini
  incelemek üzere taşı ve sonra komutu tekrar çalıştır. Cache dosyasını elle
  `verified` yaparak üretime sokma.

## Üretime kabul

1. İnsan/kurum/olay kimliğini ve kaynak revizyonunu doğrula. Meslek/önem etiketi
   doğum, ödül veya yıllık konum kanıtı değildir.
2. P569/P570/P19 ile yerin P625 revizyonunu birlikte incele. Birden çok doğum
   iddiası, yüzyıl, yaklaşık tarih veya geniş bölgeyi rastgele yıla/şehir noktasına
   çevirmeden biyografik/konumsuz bırak. Yaşam dönemi konum kanıtı değildir.
3. Olayda P580/P582/P585 ana statement’larını seç; görselin tarihi, bir
   referansın erişim tarihi veya antlaşmanın yürürlük tarihi karıştırılmamalı.
   Günler özgün takvim metninde kalır, şu paket yıl hassasiyetinde sorgulanır.
4. Lisans/atıf, kaynak revision, review zamanı, dönüşüm kararı, checksum ve
   şema/topoloji testlerini tamamla. `scripts/people/broad.mjs` örneğinde olduğu
   gibi dar bir sürümü pinle. Collector üretim onayı vermez.
5. Mevcut limitleri artırma: paket 256 KiB, sürüm 512 kayıt/16 paket, birleşik
   extension 800 ve temel zaman/arama indeksi 1.000 kayıt. Şimdiki extension
   710 kayıttır. Binlerce kişi için geometriye ek olarak metadata/arama/zaman
   indekslerinin de manifestten kademeli yüklenmesi gerekir. Staging sayısını
   artırmak runtime kapasitesini artırmaz.

Nobel resmî API koşulları sayfasına bu ortamda erişim 403; terminal Nobel ve
Wikidata JSON erişimi `EAI_AGAIN`. Bu nedenle Nobel API metinleri, motivasyonları
ve portreleri alınmadı; tüm laureate listesi tamamlandı iddiası yok.
Kaynak: [Nobel API koşulları adresi](https://www.nobelprize.org/about/terms-of-use-for-api-nobelprize-org-and-data-nobelprize-org/).
Yeni pakette yalnız incelenmiş Wikidata CC0 olguları ve doğrulanmış sitelinkler var.

## Doğrulama

`npm run people:broad:check`, `npm run sitelinks:check`, `npm run
qa:people-visibility`, `npm test`, lint/typecheck ve web export. Yeni testler
kimlik ikamesi, cache corruption, kota/backoff, lisans/hash kapısı, yıllık
konum ayrımı, yanlış olay tarihi ve konumsuz savaş senaryolarını kapsar.
Tarayıcı/GPU ve fiziksel Android ölçümü bu testlerle doğrulanmış sayılmaz.
