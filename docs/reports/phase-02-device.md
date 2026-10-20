# Faz 02 — Web ve Android cihaz doğrulama raporu

2026-10-15 · **UNVERIFIED ON DEVICE** · **BLOCKER — PHASE 02 ACCEPTANCE**.

Güncel durum: kurulum/asset hazırlığı, lint/TS/unit ve web/Android+DOM JS export
geçti. Kullanıcı web'de küre sürükleme, reset ve sentetik işaret → bilgi panelini
çalışır bildirdi. Bu beyan tarayıcı/OS/model veya ölçüm içermiyor; otomatik smoke
ve Android kabulü değildir. Kullanıcı düzeltme sonrası arka yüzde işaretin
kaybolduğunu da doğruladı; öne dönüşte seçim ve klavye/odak denemeleri açık.
Android APK, native mesaj teslimi, FPS, PSS, ilk yükleme/dokunma gecikmesi ölçülmedi.
[Güncel takip](phase-02-marker-occlusion.md). İlk DNS/kurulum engellerinin
[eski komut kaydı](phase-02-validation.txt) tarihîdir.

| Alan | Gerçek sonuç | Kapanış için yapılacak deney |
| --- | --- | --- |
| Web geliştirme / export / globe görüntüsü | EXPORT PASS; USER-REPORTED WEB PASS | Otomatik smoke ve tarayıcı/OS/ekran kaydı ile bağımsız doğrulama |
| Android debug / release APK | BLOCKED | SDK/JDK/adb + Gradle; Expo DOM local HTML/ESM/CSS/worker paketini kontrol et |
| Android gerçek cihaz, GPU, System WebView sürümü | UNVERIFIED ON DEVICE | En az iki GPU ailesinde model, Android/WebView, GPU sürücü ve commit kaydet |
| Pan/rotate/pinch/wheel/keyboard/reset | PARTIAL — kullanıcı sürükleme/reset bildirimi | Wheel/klavye/touch/pinch henüz doğrulanmadı; kamera değerlerini ve ScrollView çatışmasını dene |
| Marker → web React | USER-REPORTED PASS; arka yüzde gizlenme de kullanıcı doğrulamalı | Otomatik gerçek marker/host/session kontrolü, öne dönüşte tekrar seçim ve klavye/odak |
| Marker → native React | UNVERIFIED ON DEVICE | Fiziksel cihazda marker'a dokun; native Frame mesajı görünsün; ekran kaydı sakla |
| WebGL2 yok / context loss | BLOCKED | Web fault testi; cihazda destek yokluğu/process kaybı ve manuel retry |
| Boyut değişimi / portre-yatay | UNVERIFIED ON DEVICE | Döndürme/çoklu pencere; canvas oranı, marker konumu, pan sürsün |
| Android geri / about / geri dönüş | UNVERIFIED ON DEVICE | Router geri, kökte sistem geri; 20 tekrar sonunda tek WebView, boş ekran yok |
| Background/foreground / process kill | UNVERIFIED ON DEVICE | Tekrar yükleme, yeni oturum, eski event reddi; reload döngüsü yok |
| Offline release varlıkları | UNVERIFIED ON DEVICE | Metro kapalı/uçak modu release açılışı; kara, CSS, worker, bildirimler yerel |
| Bellek/context/listener temizliği | UNVERIFIED ON DEVICE | 20 mount/destroy sonrası PSS ve renderer/worker sayısı, sürekli artış araştırması |
| URL/origin/raw taşıma sınırı | BLOCKED | Dış URL/popup/intent/local traversal reddi; dev origin release'te yok; Expo raw parse testi |

## Deney sırası ve kayıt şablonu

Önce ağ erişimi olan ortamda lock üret/npx expo install --check/npm ci; sonra
`npm run globe:prepare`, provenance/lisans incelemesi, formatter, npm run check,
config, web ve Android JS export. Gerçek Playwright senaryoları fallback'i globe
başarısı saymaz. Ardından `npm run android:device` debug ve yerel release APK.
Offline testi geliştirme sunucusuyla yapılmış sayılmaz. Kullanıcı onayı olmadan
cihaza uygulama veya sistem paketi kurulduğu varsayılmaz.

Her denemeye: tarih, kaynak revizyonu, artifact SHA, dependency lock SHA, build türü,
cihaz/model/Android/API/System WebView/GPU, ekran boyutu/DPR, soğuk/sıcak başlangıç,
geometri ve worker byte'ları, test adımı, beklenen/gözlenen sonuç, log ve ekran kaydı
ekle. `adb shell dumpsys meminfo org.tarihatlasi.app` ile PSS önce/sonra ve Perfetto/
Android Studio ile kare/dokunma profili al; JS heap'i toplam GPU belleği diye sunma.
Bu dosyada bütün sayısal ölçüm alanları **ölçülmedi**; uydurma eşik/sonuç yoktur.

Engelleri ayır: önce MapLibre minimal küre + küçük fiziksel kaynak; sonra Blob
worker/ESM/export, sonra WebView konfigürasyonu, sonra GPU. Gerekirse DPR 1 ile
karşılaştır; donanım katmanı ve güncel System WebView ile tekrar dene. DOM ambalajı
sorununda aynı renderer'ın açık WebView deneyi düşük/orta göç maliyetlidir. Genel
WebGL2 yokluğu bu değişiklikle çözülmüş sayılmaz; [ADR alternatifleri](../adr/0001-globe-engine.md)
için yeni ölçüm gerekir. Kapsamlı UI/Faz 03 bu kapı kapanana kadar açılmaz.
