# Faz15 — fiziksel Android ölçüm notları

2026-10-16 · **UNVERIFIED ON DEVICE**. Java/adb/Android SDK yok; cihazla bağlantı
kurulmadı. FPS/PSS/touch/pil/ısı/lifecycle sonuçları yoktur. JS export başarıları
Gradle/APK, WebGL veya fiziksel cihaz kanıtı değildir.

`npm run benchmark:android` yalnız read-only adb snapshotları toplar: tek yetkili
cihaz, pidof, dumpsys meminfo/gfxinfo/battery/thermalservice. Cihaz seri numarası
rapora kaydedilmez. Bu ortamda ENOENT; [ham durum](phase-15-android-measurement.json).
Native gfxinfo RN UI'ya aittir; WebView GPU frame metrikleriyle aynı ölçüm değildir.
Android/üreticiye göre thermalservice kısıtlanabilir; rapor PARTIAL olur. Test
cihazı bilgisi/özel uygulama verisi dışarı gönderilmez; dosyayı paylaşmadan incele.

Gerçek cihazda Expo57 development/release build açıldıktan sonra aynı cihaz,
yapı türü, WebView sürümü, ekran boyutu/yenileme, başlangıç şarjı, güç modu ve
sıcaklık koşulunu kaydet. Test öncesi/sonrası script çıktısını ayrı dosyaya yaz:

```sh
npm run benchmark:android -- /tmp/atlas-before.json
# Aşağıdaki elle senaryoları uygula.
npm run benchmark:android -- /tmp/atlas-after.json
```

| Senaryo | İşlem / incelenecek kanıt | Bu ortam |
| --- | --- | --- |
| Uzun oynatma | MÖ2000–günümüz,100 yıl hızında tekrar; source/requested yıl ve hiç kaynak olmayan dönemler. CPU/PSS ve marker/listener artışı izle | UNVERIFIED |
| Elle hızlı yıl seçimi |1867→1880→1066→1866; son seçim kazanmalı, geç veri yeni yıla taşınmamalı | UNVERIFIED |
| Yön değiştirme | Dikey/yatay10 tur; tek WebView/canvas, geometri/konum aynı, kaynaklar açık | UNVERIFIED |
| Arka plan/ön plan | Oynatırken10 tur home/return; oynatma dursun, son yıl/kamera korunsun; arka planda yeni ağ/animasyon olmasın | UNVERIFIED |
| Düşük bellek | OS gerçek bellek baskısı/cihaz laboratuvarı; context kaybı/renderer process kill/fallback. Özel veri veya cihaz ayarını silme | UNVERIFIED |
| Ağ kesintisi | Yüklenmiş pilotu uçak modunda aç; ana FS cache/DOM paketli fallback, kaynak yılı/atıf görünsün. Edinilmemiş veri varmış gibi çizilmesin | UNVERIFIED |
| Cache corruption | Yalnız test build cache dosyası bozulsun; hash reddi+izinli yedek/yeniden deneme. Yer imi/tercih dosyaları korunmalı | UNVERIFIED |
| Gizlilik/release değişimi | Manifest dışı eski hash'ler temizlensin, bilinmeyen lisans/tile cache'e alınmasın | UNVERIFIED |
| Pil ve ısı | Sabit parlaklık ve ağda eş süre idle/oynatma; background tüketimi, throttling/termal durum. Tek anlık battery snapshot drain hesabı değildir | UNVERIFIED |

Kontroller tamamlanınca tabloya gerçek cihaz kanıtı/tarih/komut eklenmeli. Bu
notlar başarı beyanı veya Faz02 cihaz kapısının kapatılması değildir.
