# Veri hazırlama alanı

Çad/Libya için dar, lisanslı kaynak incelemesini yeniden üretmek:

```sh
npm run world:review:prepare
node scripts/world/review-countries.mjs --check
npm run world:review:check
```

İlk iki komut mevcut SHA-pinli Cliopatria ZIP'ini gerektirir; dosya indirmez.
13239/13370/13580dışında kayıt almaz. İndeks/ad/dönem/QID, lisans, geometri
ve özgün/çıktı kenar eşitliği kontrol edilir. Genel topoloji kapısı değişmez;
yalnız incelenmiş Çad için izole shell-hole teğeti desteklenir. CI ham ZIP
olmadan generatedçıkarım/NOTICE hash'ini denetler. CShapes alınmaz.
[İnceleme kapsamı](../../docs/reports/compact-country-map.md).

Kaynak QID dizini mevcut lisanslı Cliopatria ZIP'inden yeniden üretilebilir:

```sh
npm run polities:identities:prepare
node scripts/polity-identities.mjs --check
npm run polities:identities:check
npm run qa:map -- 2010
```

İlk iki komut ham arşivin sabitSHA'sı ve her kaynak satırının
index/ad/dönem/tür eşleşmesini denetler; ignoredstaging ZIP'i gerekir.
Üçüncü komut CI için çevrimdışıdır: generatedçıkarımın bağımsız hashpini,
kaynak kapsamı ve CC BY4.0NOTICE kontrol edilir. Satır→QID aday eşleşmesi
çıkarılır; Wikipedia başlığı veya URL'si üretilmez. Gerçek sitelink ancak
kullanıcı eylemiyle Wikidata API'den çözülür. Geometri üretim onayı bu kimlik
işleminden türetilmez. [Kaynak/hak ve çalışma zamanı sınırları](../../docs/reports/application-review-2010.md).

Yakın dönem kaynak incelemesi: `npm run cshapes:inspect -- --help`.
`scripts/etl/cshapes-review.mjs` yerel GeoJSON/ZIP girdisini salt okunur inceler;
stream okuyucusu dosyayı tek seferde belleğe almaz. Çıktı yalnız ignored
`data/staging/country-review/` içindedir, üretim build/allowlist işlemi yoktur.
Gerçek dosya gelmeden kullanılan bütün yeni test geometrileri açıkça sentetiktir.
[Kullanım ve sınırlar](../../docs/reports/cshapes-preflight.md).
İnceleyiciv2, gerçek yerel dosyadan gözlenen GW yıl/ay/gün alanlarını açık
profil ile tanır; saat dilimsiz tarih metnini dönüştürmez, eksik siyasi statüyü
bağımsız devlet saymaz. Rapor sürümü değiştiğinde eski rapor korunur.
[Gerçek şema incelemesi](../../docs/reports/cshapes-schema-review.md).

Faz 09: ETL **1.3.0**. Kültür üretim kaydında culturalContext gerekir; bilinen
entity dönemleriyle çelişen siyasi/kültürel coğrafya reddedilir. Opsiyonel
Wikipedia bağı source/revision/rawInputId/QID üzerinden doğrulanır ve checksum'u
kontrol edilen ham Wikidata JSON'undaki sitelinkle bire bir eşleşmelidir. Ham
JSON girdi başına bir kez parse edilir. [Sözleşme](../../docs/cultural-layer.md).

Faz 04 yerel ETL iskeleti: `npm run etl -- --help`.
`validate --input FILE` staging şeması/provenance/ham hash kontrolü yapar;
`build --input FILE` üretim lisans/atıf/inceleme kapılarını da uygular.
İsteğe bağlı `--raw-root DIR` (data/raw) ve `--output DIR` (data/production).

İndirme/ağ yoktur. JSON 4 MiB, en çok 32 ham girdi × 8 MiB; sıralı okuma.
Üretimden önce bütün hatalar reddedilir; ham veri değiştirilmez. Version/hash
klasöründe catalog.json, manifest.json ve review-report.json atomik yazılır.
Uygulamaya veri import edilmez. Örnek staging dosyası boştur.

[Şema, üretim ve hak kararları](../../docs/data-model.md).

Faz 05: domain schema 2, ETL 1.1.0. `npm run ohm:collect -- --relation ID` ayrı
ham/audit karantina aracıdır; indirdiği üyeler otomatik üretim geometrisi olmaz.
Tüm lisans/EDTF/tarih/source etiketleri, nesne sürümü ve ham SHA korunur; eksik
zaman unknown, end_date source-exclusive kalır. Ürün runtime API sorgusu yapmaz.
Küçük onaylı NARA olgu pilotu için `npm run pilot:prepare` / `pilot:check` kullanılır.
[Kalite/kapsam](../../docs/data-quality.md).

Faz 06 güncel ETL 1.2.0, pilot 0.2.0-pilot. TemporalExtent support/periods
şeması doğrulanır; yeni tarihî geometri veya hak onayı yok.
`npm run timeline:coverage` gerçek statik kapsamın raporunu yazdırır.
