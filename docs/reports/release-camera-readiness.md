# Release ilk açılış düzeltmesi — 22 Ekim 2026

Son doğrulanmış uzak çalışma:
[39664079314](https://github.com/Teknoloji-Filozoflari/Tarih_Atlasi/actions/runs/39664079314),
commit ae2b990d. npm ci/check, web export ve Chromium kurulumu PASS;
gerçek tarayıcı 83 PASS / 3 FAIL. Dağıtım, Docker ve Release adımları SKIPPED.
GitHub Releases koleksiyonu bu incelemede boştu.

## Bulgu ve uygulama

- **IMPLEMENTED:** MapLibre ilk load öncesinde resize/moveend gönderebilir.
  Bu kamera host'a erkenden ulaşıp ready aşamasında temizlenirken renderer
  aynı kamerayı tekrar göndermiyordu. Güncel şehir rozeti host kamerası istediği
  için, DOM'da 24/31 şehir işareti varken rozet bulunamayabiliyordu.
  Renderer load öncesi kamera göndermez; ready sonrası ilk konumu ve açık
  kamera geri yüklemesinin onayını aynı koordinatta olsa da gönderir.
  Normal değişmeyen moveend birleştirmesi ve yıl değişiminde kameranın korunması sürer.
- **IMPLEMENTED:** Ülke linki E2E'si yıl niteliği yüklenirken de yazılabildiği
  için boş tarih katmanını denetliyordu. Artık ready durumunu, 189 gerçek
  feature'ı ve görünür ülke etiketi üzerinden gerçek kullanıcı tıklamasını
  bekler. Doğrulanmış sitelink, harici sekme, aynı yıl ve kaynak kartı
  beklentileri korunur.
- **IMPLEMENTED:** Kurulu dünya şehir kataloğu GeoNames'tir. Ankara satırının
  doğrulanmış Wikidata eşleşmesi olmadığı için test GeoNames kaynak eylemini
  ve uydurulmuş Wikipedia düğmesinin bulunmamasını denetler. Eski üç şehirlik
  Wikidata pilotuna ait beklenti yeni veri sağlayıcısına taşınmaz.
- **IMPLEMENTED:** Cache regresyonundaki BROKEN gövde enjeksiyonu disk kotasını
  aşıyordu; trim işlemi doğrulamadan önce bu gövdeyi yasal olarak silebiliyordu.
  Kota/LRU beklentilerinden sonra yalnız test deposu temizlenir ve bozuk gövde
  kota içinde enjekte edilir. Corruption sayacı ve onaylı fallback/hash
  beklentileri aynıdır; üretim cache algoritması değiştirilmedi.
- **IMPLEMENTED:** Release workflow güncellemesi main'e gönderildiğinde yeni
  commit'te otomatik çalışma açılır; diğer ürün commit'leri için manuel giriş
  kalır. Varsayılan sürüm 0.1.0-preview.1. İlk açılış/ülke/şehir testleri önce
  çalışır; ardından tüm 86 senaryo yine zorunludur. Hiçbir başarısız test
  yayımlama kapısından çıkarılmaz. Summary her kapının sonucunu ve taslak ile
  herkese açık Release farkını gösterir.

## Kanıt ve sınırlar

Tam yerel npm run check PASS: 418/418 ana + 5/5 worker; lint, native/web
strict typecheck, veri/lisans/hash ve formatter kapıları.
[Gerçek komut kaydı](release-camera-check.txt). 86 E2E senaryosu listelenir;
listeleme tarayıcı akışlarının çalıştırıldığı anlamına gelmez.

Renderer regresyonu düzeltme öncesinde 1 FAIL / 23 PASS, düzeltme sonrası
24/24 PASS. Kota içindeki cache testleri 17/17 PASS. Bu Node testleridir;
WebGL veya Android cihaz kabulü değildir.

Web export dört route ve 16.102 şehir paketinde 645.992.949 byte hash kontrolüyle
PASS. release:stage ve release:verify 18.474 dosya / 890.119.342 byte için PASS.
Bu yerel inceleme çıktısı eski HEAD kimliğiyle etiketlendiğinden yeni commit'e
ait indirilebilir yayın diye yüklenmez; GitHub workflow aynı commit'ten yeniden üretir.

Güncel browser TypeScript kontrolü PASS. Chromium başlatma bu çalışma ortamında
EPERM ile BLOCKED; yeni gerçek E2E sonucu henüz yok. Docker runtime bu tur
NOT TESTED; fiziksel Android UNVERIFIED ON DEVICE. Yeni dependency, tarihî veri,
geometri veya lisans eklenmedi. Kararlı yayın NO-GO sürer. Kalite kapıları
geçtiğinde yalnız inceleme için taslak teknik önizleme hazırlanır.
