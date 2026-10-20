# Faz 08 — polygon kaynak erişimi ve karar

2026-10-16. İncelenen birincil kaynaklar:

- [Cliopatria deposu](https://github.com/Seshat-Global-History-Databank/cliopatria)
  dağıtımı tek sıkıştırılmış GeoJSON olarak tanımlar; tarih uçlarının dahil
  olduğunu ve tarihî yorum belirsizliğini açıklar.
- [Veri lisansı](https://raw.githubusercontent.com/Seshat-Global-History-Databank/cliopatria/main/LICENSE.md)
  CC BY 4.0; atıf/lisans/değişiklik bildirimi gerekir. Mevcut manual-review politikası
  kaldırılmadı; sürüm/kayıt/ham SHA/üst kaynak/geometri incelemesi hâlâ gerekli.
- [Seshat resmî yöntem](https://seshat-global-history-databank.readthedocs.io/en/latest/cliopatria.html)
  API veya depodan alımı anlatır. API binding kodunun MIT olması veri hakkı değildir.

Gerçek terminal denemesi: `curl --head --location --max-time 15 --max-filesize
33554432 https://raw.githubusercontent.com/Seshat-Global-History-Databank/cliopatria/main/cliopatria.geojson.zip`
**exit 6 — Could not resolve host: raw.githubusercontent.com**. Hiçbir geometri
indirilmedi. Araştırma tarayıcısında `https://seshat-db.com/api/` **403 Forbidden**;
resmî dokümanda belirtilen API'den küçük kayıt yanıtı da alınamadı. Repo README ve
lisansının okunması, ZIP geometrisinin okunduğu anlamına gelmez.

Karar: **BLOCKED — VERIFIED POLYGON ACQUISITION / RECORD REVIEW**. NARA çizgi
kesiti tam siyasi alan diye yeniden etiketlenmez. Yeni bir polygon veya başkent/
bayrak/nüfus/kuruluş yılı uydurulmaz. Sentetik polygonlar yalnız testtedir. Gelecek
alımda belirli release/feature ve üyeler/hak/provenance incelenip staging/ETL
kapısından geçirilmeden üretime eklenemez. Historical Basemaps **BLOCKED FOR
REDISTRIBUTION**, OHM geometri/üye/hak kapısı aynen sürer.
