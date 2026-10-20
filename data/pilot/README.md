# Kaynaklı küçük pilot

## Güncel keşif kataloğu — 18 Ekim 2026

0.7.0-discovery:106kayıt/35kaynak; istenen10kişi ve7ekolay. Tek hamJSON
hash ile pinlidir; farklı kaynak revizyonları aynı açık etiketli editöryal
çıkarıma bağlanır. Şehirler ayrı modern modüle üretilir, tarihî yer yapılmaz.
Beş yaklaşık kişi ilişkisi opt-in, dört yeni olay noktası ve üç listelik olay.
Yeniden üretim: npm run pilot:prepare && npm run chunks:prepare; denetim
npm run pilot:check && npm run chunks:check. Yeni download gerekmez.
[Kaynak/atıf/kararlar](../../docs/reports/turkey-discovery.md).

`raw/alaska-treaty-facts.json` resmî NARA belgesinden editöryal olgu çıkarımıdır;
HTTP yanıtının kopyası veya hazır GIS geometrisi değildir. Kaynak URL'si, tarih,
locator, hak kapsamı ve çıkarım yöntemi dosyada korunur. Bu dosya hazırlanırken
resmî metin araştırma tarayıcısından okundu; terminalden kaynak API erişimi yoktu.

Tek tarih: **20 Haziran 1867**. Tek geometri: 141°B ideal meridyeninin 65–68°K
görüntüleme kesiti. Tam Alaska/ABD alanı, güncel ölçülmüş sınır, kültür bölgesi
veya diğer yıllar için geometri değildir. Kesit uçları proje penceresidir.

```sh
npm run pilot:prepare
npm run pilot:check
```

`production/` küçük canonical JSON çalışma paketidir: catalog.json, iki GeoJSON
LOD, manifest.json ve review-report.json. Katalog/ETL/politika sürümleri, byte/hash,
zaman ve bbox indeksi manifestte. Generated TypeScript aynı normalleştirilmiş
kataloğu taşır. `pilot:check` ham dosyadan yeniden türetir, bütün çıktı ve bildirimi
karşılaştırır; raw SHA/revizyon değişince dar hak onayı geçersiz olur.

`pilot:prepare` bu gözden geçirilmiş çalışma paketinin sabit dosyalarını günceller;
bir yayın veya ağ işlemi değildir. Dosyaları üretim sitesine otomatik yüklemez.
Değişmez version/hash release için genel `etl build` kullanılabilir; GeoJSON/LOD
manifesti de aynı incelemeye dahil edilmelidir. Paket çok küçük olduğu için vector
tile üretimi/servisi eklenmedi. `raw/` ve `production/` formatter'dan hariçtir;
kaynak byte'ları ve canonical çıktı formatlanarak değiştirilmez.

Veri **CC0 1.0**: [NARA bildirimi](../../assets/licenses/NARA-pilot-NOTICE.txt).
Görsel, tarama, mühür veya başka kurum geometrisi alınmadı. Kod lisansı MIT ayrı.
[Kalite/kapsam](../../docs/data-quality.md), [Faz 05](../../docs/reports/phase-05.md).

Faz 06: güncel katalog 0.2.0-pilot, ETL 1.2.0. Aynı ham olgu çıkarımına
açık snapshot annotation eklendi; coğrafya/NOTICE/hak değişmedi.
[Zaman ve önizleme kuralları](../../docs/timeline.md).

Faz 09: ETL **1.3.0** metadata'sı manifest/generated modülde yeniden üretildi.
Katalog **0.2.0-pilot**, raw/katalog/GeoJSON/NOTICE değişmedi. Gerçek kültür
alanı yok; kültürel alan test fixture'ları bu pakete alınmadı.
