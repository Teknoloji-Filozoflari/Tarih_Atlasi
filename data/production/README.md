# Sürümlü üretim çıktısı

`npm run etl -- build --input data/staging/catalog.json` doğrulamadan sonra
`VERSION-SHA/` altında catalog.json, manifest.json ve review-report.json oluşturur.
Boş katalog örneği gerçek tarihî veri içermez. CLI mevcut uygulama kataloğunu
değiştirmez veya çıktıyı uygulamaya otomatik paketlemez. Yeni veri dağıtımı ayrı
kaynak/hak incelemesi gerektirir. Bu dizindeki üretilmiş dosyalar Git dışındadır.
