# Faz 00 — Araştırma yöntemi ve kanıt sınırları

Tarih: 2026-10-15. Resmi proje belgeleri, yayıncı veri sayfaları, depo lisans dosyaları ve lisans kuruluşunun tam metinleri önceliklendirildi. Arama sonuçları keşif için kullanıldı; üçüncü taraf uygulamaların lisans etiketleri karar dayanağı yapılmadı. Tam belge veya dosya okunamayan sonuçlar aşağıda ayrı kaydedildi. Hareketli `latest`/`main` sayfaları bu tarihteki gözlemdir; gelecekte aynı içerik garantisi yoktur.

## Doğrulanan kanıt grupları

| Grup | Kaynaklar / neyi desteklediği | Kaydın tutulduğu yer |
| --- | --- | --- |
| SDK uyumluluğu | [Expo SDK 57](https://docs.expo.dev/versions/v57.0.0/), [SDK 57 değişiklik notu](https://expo.dev/changelog/sdk-57), [WebView](https://docs.expo.dev/versions/v57.0.0/sdk/webview/), [DOM kılavuzu](https://docs.expo.dev/guides/dom-components/) | Sürümler ve çıkarımlar architecture.md; birlikte cihaz uyumluluğu test edilmedi |
| Globe ve build şartları | [MapLibre 6.14.0 release](https://github.com/maplibre/maplibre-gl-js/releases/tag/v6.14.0), [v6 göç rehberi](https://github.com/maplibre/maplibre-gl-js/blob/main/docs/guides/v5-to-v6-migration-guide.md), [globe örneği](https://maplibre.org/maplibre-gl-js/docs/examples/display-a-globe-with-a-vector-map/) | architecture.md ve ADR-0001 |
| Temel coğrafya / veri hakları | [Natural Earth](https://www.naturalearthdata.com/about/terms-of-use/), [OHM](https://www.openhistoricalmap.org/copyright), [Wikidata](https://www.wikidata.org/wiki/Wikidata:Licensing), [Pleiades](https://pleiades.stoa.org/downloads), [WHG](https://whgazetteer.org/licenses/) | source-matrix.md ve license-register.md |
| Sınır kaynakları | [Historical Basemaps LICENSE](https://github.com/aourednik/historical-basemaps/blob/master/LICENSE), README/indeks; [Cliopatria LICENSE](https://github.com/Seshat-Global-History-Databank/cliopatria/blob/main/LICENSE.md), README; [ETH CShapes](https://beta.icr.ethz.ch/data/cshapes/); [Euratlas lisansı](https://www.euratlas.net/shop/licences/licence_gis_gb.pdf) | Kaynaklara ayrı karar; tek kaynağın hakkı diğerine aktarılmadı |
| Ek temel harita seçeneği | [Protomaps stil lisansı](https://github.com/protomaps/basemaps/blob/main/LICENSE.md), [tileset indirmeleri](https://docs.protomaps.com/basemaps/downloads) | Fiziksel taban kararı progress.md; stil ve veri ayrı değerlendirildi |
| İddia ve medya ayrımı | [Wikibase JSON](https://doc.wikimedia.org/Wikibase/master/php/docs_topics_json.html), [Wikimedia şartları](https://foundation.wikimedia.org/wiki/Policy:Terms_of_Use), [Commons](https://commons.wikimedia.org/wiki/Commons:Reusing_content_outside_Wikimedia) | Veri modeli ve ayrı metin/görsel sicili |

Creative Commons'ın CC0 1.0, BY 3.0, BY 4.0, BY-SA 4.0 ve BY-NC-SA 4.0 tam metinleri açılarak lisans aileleri kontrol edildi; doğrudan bağlantılar sicildedir. Kod lisans metinleri ilgili upstream depolardan açıldı; paket kurulumu ve bütün transitif lisans denetimi yapılmadı.

## Erişim sorunları ve uygulanmayan çıkarımlar

| Denenen kaynak | Gözlem | Kullanılan alternatif / kalan belirsizlik |
| --- | --- | --- |
| `https://icr.ethz.ch/data/cshapes/` | Araç sayfayı alamadı | Aynı yayıncının [beta.icr.ethz.ch sayfası](https://beta.icr.ethz.ch/data/cshapes/) açıldı; 2.0 edisyon beyanı kullanıldı. Daha yeni bütün edisyonlar taranmış sayılmıyor |
| `https://www.seshat-db.com/terms/current/` ve downloads sayfası; www olmayan varyant | 403/erişim hatası; arama indeksi Public Data CC BY-SA 4.0 metni gösteriyor | Canlı şart doğrulanmış sayılmadı; genel Seshat veri alımı engelli. Cliopatria'nın ayrı depo lisansı açıldı |
| `https://registry.npmjs.org/maplibre-gl/6.14.0` | Metadata araç üzerinden alınamadı | Boyut sayılarına yer verilmedi; release+resmi doküman sürüm kanıtı. Gzip/worker/APK maliyeti gelecekte ölçülecek |
| `https://www.nature.com/articles/s41597-025-04516-9` | Erişilemeyen kimlik yönlendirmesi | [Üniversite arşivindeki 18 sayfalık yazar PDF'si](https://escholarship.org/content/qt21t5k2gq/qt21t5k2gq.pdf) açıldı; üst sayfada bot kontrolü var ama PDF okunabildi |
| `https://www.wikidata.org/wiki/Help:Dates` | Zaman aşımı | Güncel resmi [Wikibase JSON modeli](https://doc.wikimedia.org/Wikibase/master/php/docs_topics_json.html) kullanıldı; kaynak adaptörünün BCE/takvim dönüşümü uygulanmadı |
| MapLibre tahmini `/docs/guides/csp/` yolu | Sayfa bulunamadı / araç hatası | Gerçek [giriş belgesinin CSP bölümü](https://maplibre.org/maplibre-gl-js/docs/#csp-directives) ve göç rehberi okundu |

Bu oturumda seçilmiş kaynakların beyanları incelendi; bütün dış bağlantılar için genel uptime/link sağlamlığı denetimi yapılmadı. Lisans metinleri ve kaynak belgeleri aynen kopyalanmadı; kısa sonuçlar ve doğrudan kanıt bağlantıları tutuldu. PDF'lerde metin katmanı bu araştırmanın ihtiyacını karşıladı; geometriler/haritalar çıkarılmadı.

## Özellikle ölçülmeyenler

Kurulu SDK, npm paket boyutları, Metro entegrasyonu, bundle, APK/AAB, GPU/WebGL2 cihaz yeteneği, font/asset offline erişimi, FPS, PSS, enerji/ısı ve veri kapsama oranları ölçülmedi. Bunların hiçbiri “doğrulandı” sonucu değildir. Tarihî kayıt bazında inceleme yalnız S-03'ün başlangıç tarih/mekân kaynağı düzeyindedir; üç senaryo da yayımlanmış içerik değildir.
