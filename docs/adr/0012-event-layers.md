# ADR-0012 — Savaşlar, antlaşmalar ve yıl olay listesi

2026-10-16 · Faz 11 · Uygulama planı / platform kabulü ölçülecek.

Plan: yedi eventType, konum hassasiyeti ve olay ayrıntı alanları → zaman
sorgusu ve independent battle/event katmanları → kişi çekirdeğini koruyan olay
küme/alan stili → konumsuz kayıtları da içeren yıl listesi/kart → dar lisanslı
pilot, negatif testler ve faz raporu. Yeni dış bağımlılık yok.

WAR/BATTLE savaş anahtarında; TREATY/FOUNDATION/DISSOLUTION/CULTURAL_EVENT/OTHER
olay anahtarında. Antlaşma ayrı ikon taşır; üçüncü anahtar eklenmez. Geniş savaş
tek nokta değildir. Kaynaklı alan varsa alan olarak çizilir; alan içi etiket
ankrajı geometri veya olay konumuna dönüştürülmez. Eksik yer veya düşük/incelemesiz
kanıt haritaya girmez; bilinen tarih yıl listesine girebilir. Tarihsiz olay yıl
listesinden de dışlanır. Yıl listesindeki tarihli olay sayısı harita sayısından
ayrıdır; boş geometri tarihî olayın olmadığı anlamına gelmez.

Canonical tarih `temporal`, başlık `names`, katılımcı kimlikleri `participantIds`,
kaynaklar `evidence` ile tutulur; dateExtent/title/participants/sources salt okunur
sunum projeksiyonudur. Olay detay alanları, locationPrecision, placeId ve ham
Wikidata eşleşmeli sitelinkler strict şemaya eklenir. Eski EVENT türü üretimde
kabul edilmez; test/staging verisi OTHER'a açıkça taşınır. Alan modeli schema2'nin
sürümlü katalog/ETL genişletmesidir; eski bundle yeni üretim kapısından sessizce
onaylanmaz. Alternatif tarihler kaynak Evidence indeksleriyle ayrı tutulur;
çelişki varsa canonical TemporalExtent belirsiz işaretlenir.

Tek MapLibre/DOM renderer, finite katalog ve 4KiB sayfalı köprü korunur. Olay
noktaları kişi marker yaşam döngüsüyle aynı sınırlı yaklaşımı kullanır, farklı
ikon/lejant taşır. Örtüşmede bütün kimlikler sayfalanır. Yıl/layer/preview değişimi
eski seçimleri temizler; kamera yılı takip ederek kendiliğinden hareket etmez.
Offline statik katalog ve yerel stil korunur. Resmî Wikidata yapılandırılmış
CC0 olguları açık etiketli çıkarım olarak saklanabilir; makale/görsel/geometri
lisansı varsayılmaz. Özgün sitelink JSON'u yoksa Wikipedia URL'si üretilmez.
