# Faz 00 raporu — Araştırma, lisans ve uygulanabilirlik

Tarih: 2026-10-15 · Sonuç: **COMPLETE — DOCUMENTATION SCOPE**.

## Kapsam ve mevcut durum

Kökteki `AGENTS.md` bağlayıcı kabul edilerek okundu. Başlangıçta README, docs/progress.md, önceki faz çıktıları, uygulama kodu ve paket/test yapılandırması yoktu; dolayısıyla önceki çalışan akışa karşı uygulama regresyonu çalıştırılamadı. Git metadata'sı da kullanılabilir değildi. Bu faz yalnız araştırma ve dokümantasyon üretti; ürün, prototip, paket kurulumu veya veri alımı yapılmadı.

## Sekiz görev maddesinin karşılığı

| İstek | Çıktı / sonuç |
| --- | --- |
| 1. Resmi uyumluluk ve renderer riskleri | [Mimari](../architecture.md): Expo SDK 57 / RN / RN Web, DOM wrapper ayrımı, WebView sürüm adayı, MapLibre v6/WebGL2/ESM/worker, bellek/asset/event riskleri. Birlikte çalışma ve boyut henüz ölçülmedi |
| 2. Aynı globe kodu ve alternatifler | [ADR-0001](../adr/0001-globe-engine.md): koşullu birincil öneri, tek WebView, wrapper/native/Cesium/GLView alternatifleri ve göreli göç maliyetleri |
| 3. Veri kaynakları karşılaştırması | [Kaynak matrisi](../source-matrix.md): OHM, Natural Earth, Wikidata, Historical Basemaps ve altı ek aday; zaman, lisans, format, coğrafya ve kalite sınırları |
| 4. Lisans engelleri | [Lisans sicili](../license-register.md): HB-REDIST-01, OHM nesne/üye incelemesi, Wikidata CC0 ile metin/medya ayrımı; bütün kaynaklar otomatik paketleme dışında |
| 5. En az üç doğrulama senaryosu | [Kapsam stratejisi](../coverage-strategy.md): S-01 antik kültür, S-02 Orta Çağ sınırı, S-03 yakın dönem olay; kanıt ve hak kapıları. Senaryo tanımlamak gerçek geometriyi doğrulamak değildir |
| 6. Koyu fiziksel taban | [Mimarideki karşılaştırma](../architecture.md): kendi stilinde Natural Earth fiziksel altküme; Protomaps koyu tasarım alternatifi, ayrı tile lisansı; demo endpointi üretim bağımlılığı değil |
| 7. İlk içerik kapsamı | Dünya düzeyinde açık eksiklik bildirimi, üç küçük pilot, sayı üst sınırları ve kaynak yoksa içerik azaltımı; tam yıllık kapsama iddiası yok |
| 8. Mimari kayıtlar / yol haritası / PRD | Üç ADR, kaynak/lisans/risk/kapsam kayıtları, [18 faz](../roadmap.md) ve [PRD](../product-requirements.md) |

## Kabul kriterleri

| Kriter | Faz 00 sonucu | Kanıt / sınır |
| --- | --- | --- |
| Web + Android rendering yaklaşımı ve doğrulama planı belgeli | **PASS** | Tek GL JS çekirdeği; V-01–V-08 ve alternatif kapıları. Cihaz başarısı henüz doğrulanmadı; ADR öneri durumunda |
| En az bir lisansı uygun temel coğrafya kaynağı belirli | **PASS** | Natural Earth yayıncının [kamu malı şart metni](https://www.naturalearthdata.com/about/terms-of-use/) ile belirlendi; dosya indirilmedi |
| Yeniden dağıtımı belirsiz hiçbir veri otomatik paketlenmemiş | **PASS** | Sıfır dış veri/asset, sıfır paket kurulumu; yalnız Markdown belgeleri ve yerel doğrulama raporu |
| Ürün bu fazda oluşturulmamış | **PASS** | Kaynak kodu, package.json, uygulama build'i veya geometri dosyası yok |

Kaynak özelindeki engeller: Historical Basemaps ve Euratlas için **BLOCKED FOR REDISTRIBUTION**; Seshat genel şartları canlı doğrulanamadığından aynı engel var. Bunlar araştırma teslimatını engellemez; ilgili verinin dağıtımını engeller. OHM ve Cliopatria için seçilecek kayıt/sürüm incelemesi bekliyor.

## Değişen dosyalar

Bu fazda oluşturulan 14 dosya:

- [product-requirements.md](../product-requirements.md)
- [architecture.md](../architecture.md)
- [adr/0001-globe-engine.md](../adr/0001-globe-engine.md)
- [adr/0002-static-catalog.md](../adr/0002-static-catalog.md)
- [adr/0003-evidence-and-rights.md](../adr/0003-evidence-and-rights.md)
- [source-matrix.md](../source-matrix.md)
- [license-register.md](../license-register.md)
- [risks.md](../risks.md)
- [coverage-strategy.md](../coverage-strategy.md)
- [roadmap.md](../roadmap.md)
- [research-notes.md](../research-notes.md)
- [progress.md](../progress.md)
- [reports/phase-00.md](phase-00.md) — bu rapor
- [reports/phase-00-validation.txt](phase-00-validation.txt)

`AGENTS.md` değiştirilmedi. Başlangıçta olmayan README için ürün kurulmuş izlenimi veren bir dosya üretilmedi.

## Testler ve platform doğrulamaları

Yerel otomatik belge doğrulamasının çıktısı [phase-00-validation.txt](phase-00-validation.txt) içindedir: gerekli sekiz teslimat, UTF-8 ve temel Markdown biçimi, yerel dosya hedefleri, tam 18 faz, üç senaryo, ADR'lerin durumları, lisans engelleri ve ürün/veri dosyası oluşmaması denetlenir. Denetim script'i geçici `/tmp` alanındadır; uygulama testi veya tam Markdown linter yerine geçmez.

Typecheck, uygulama lint'i, unit/integration testleri ve web/Android build **NOT RUN / N/A**: uygulama/paket/test yapılandırması yok ve bu fazda oluşturulmadı. Kurulu markdownlint aracı bulunmadı; temel biçim denetimi yapıldı. Web tarayıcısında renderer çalıştırılmadı. Android adb/APK yok; fiziksel cihazda WebGL, bellek, FPS veya offline davranışı ölçülmedi. Hiçbir cihaz performansı doğrulanmış olarak sunulmadı.

Resmi web belgeleri ve lisanslar çevrimiçi incelendi; erişim hataları [araştırma notlarında](../research-notes.md). Dış URL'lerin tümüne genel link/uptime testi yapılmadı. Paket boyutu ve veri kapsama yüzdesi bilinmiyor; varsayım veya hedefler gerçek ölçümden ayrıldı.

## Açık riskler ve sonraki faz önkoşulları

En önemli riskler: Android GPU/WebGL2 ve Metro worker entegrasyonu, toplam bellek, offline asset origin'i, mesaj köprüsü ve kaynak hak zincirleri. [Risklerin tamamı](../risks.md). Gerçek kültür/sınır geometrileri henüz kaynak/izin incelemesini geçmedi; yalnız güncel temel coğrafya için uygun hak beyanı bulundu.

Sonraki olası faz 01 için kullanıcı onayı, güncel kararlı bağımlılık/sürüm kontrolü, geliştirme ortamı ve proje kod lisansı kararı gerekir. Temel kurulumdan sonra renderer kararı ancak fiziksel Android deneyiyle kabul edilebilir; bu iş gelecekteki renderer fazındadır. **Faz 01 veya sonraki herhangi bir faz başlatılmadı.**
