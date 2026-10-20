# ADR-0004 — Tek Expo projesi, npm ve küçük ortak modüller

Tarih: 2026-10-15 · Durum: **ACCEPTED — SOURCE STRUCTURE; INSTALLATION BLOCKED**.

## Bağlam ve karar

Faz 00 tek uygulama, ortak alan/veri protokolleri ve platform adaptörleri önerdi;
monorepo zorunlu kılmadı. Faz 01'de ortada bağımsız yayımlanacak paket veya ikinci
uygulama yok. Bu nedenle kökte tek Expo/npm projesi ve `src/` altında açık modül
sınırları seçildi. `apps/expo`, ayrı workspace package.json'ları, pnpm ve ek görev
koşucusu eklenmedi. İkinci gerçek tüketici oluşursa paketlere ayırmak ayrı karar olur.

Npm ortamda mevcut ve tek lock ile tüm geliştiriciler/CI için yeterli. Tam doğrudan
sürümler ve npm sürümü manifestte kayıtlı; transitif tekrar üretilebilirlik için
package-lock.json ve npm ci şart. Registry engeli yüzünden lock üretilemedi;
kararın dosya düzeni kabul edildi, kurulum başarısı kabul edilmedi.

## Modül sınırları ve kullanıcı deneyimi

Router yalnız `src/app` içindedir. Ortak UI, tema ve Türkçe katalog ayrı modüllerdir.
MapViewport için web/native girişleri şu an aynı dürüst kullanılamıyor durumunu
gösterir. MapLibre, WebView, mesaj köprüsü, zaman seçici, katman verileri ve ETL
uygulaması Faz 01'e alınmadı. `src/map-contract` yalnız UI giriş tipidir; gelecekteki
sürümlü köprü uygulanmış gibi sunulmaz. Alan modeli Faz 03'e bırakıldı.

Türkçe anahtarlar `MessageKey`, gelecekteki çeviri kataloğu `MessageCatalog` ile
denetlenir. Sistem fontu ve küçük metin glifleri dış font/ikon bağımlılığını önler.
Hata/boş/yükleniyor bileşenleri ayrıdır; başlangıç ekranı kayıt indirilmiş veya
çalışan 3D küre varmış izlenimi vermez. MIT, yalnız kendi kod ve belgelerimiz için
kökte somutlaştırıldı; dış veri lisansları ayrı kalır.

## Sonuç ve doğrulama

Bu düzen tek Metro/Router kurulumuyla başlanmasını sağlar; ortak modüller web DOM
veya native API bağımlılığı taşımayabilir. Monorepo'ya göre daha az yapılandırma var,
ancak modül sınırlarını ekip disipliniyle korumak gerekir.

Unit testleri ve bağımsız core tip/biçim kontrolleri yapılabildi. Tam lint/typecheck,
web ve Android çalışması, paket lisans/boyut envanteri ve lock üretimi engelli.
[Faz 01 raporu](../reports/phase-01.md). ADR-0001 globe kararı **PROPOSED** olarak
kalır; bu karar onu kabul edilmiş duruma getirmez.
