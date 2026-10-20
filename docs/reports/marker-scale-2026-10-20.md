# Harita işareti boyutu — 20 Ekim 2026

**IMPLEMENTED:** kişi, olay/savaş ve kişisel not işaretlerinin görünen boyutu,
48 px erişilebilir dokunma alanından ayrıldı. Önceden 48 px hedefin tamamı
boyanıyordu; dünya uzaklaşınca büyük kalıyordu. Hedef artık saydamdır, yalnız
merkezindeki küçük yüzey ve simge boyanır.

- Zoom ≤1: tek kayıt 8 px; zoom 5 ve üstü: en fazla 24 px.
- Küme: sayının okunması için 20–28 px; sınırsız büyüme yok.
- Zoom 4 altında ad etiketi gizlenir; seçim bu kuralı aşmaz.
- Seçim çerçevesi küçük yüzeye uygulanır; dokunma alanının tamamı boyanmaz.
- Zoom hareketinde yalnız mevcut DOM öğesinin ölçüleri güncellenir; marker
  yeniden kurulmaz, veri/geometri yüklenmez, köprüye kare başına mesaj eklenmez.
- Dokunma hedefi 48 px, ekran okuyucu adı, yaklaşık/kesin çizgi ayrımı,
  kişisel notun kesik kare biçimi, küme seçimi ve arka yarımküre gizleme korunur.

Değişen dosyalar: `src/theme/tokens.ts`,
`src/map/globe/{marker-scale,person-markers,note-markers}.ts`, `markers.css`,
`tests/unit/{renderer,local-notes}.test.mjs`, bu rapor ve `docs/progress.md`.
Yeni veri, geometri, dış bağımlılık veya lisans/atıf değişikliği yok.

Regresyon: gerçek renderer modülü DOM/MapLibre doubles ile zoom 0/1/3/5/16
üzerinde sınanır. Hem kişi hem olay küçülür, üst sınırı aşmaz, 48 px hedefi
korur, zoom sırasında marker/data yeniden üretilmez; küçükken seçim çalışır
ve unmount temizliği korunur. Kişisel not aynı öğe üzerinde 24→8 px küçülür.
Bu GPU veya gerçek cihaz görsel doğrulaması değildir.

Tarayıcı görsel kontrolü denendi ancak Chromium başlangıcında
`sandbox_host_linux.cc:41 ... Operation not permitted` / SIGTRAP nedeniyle
**BLOCKED**; ekran görüntüsü üretilemedi. Android gerçek cihaz
**UNVERIFIED ON DEVICE**, Android paketleme bu değişiklik için çalıştırılmadı.
Komut sonuçları ve loglar aşağıdaki kontrol kaydındadır.

**PASS:** `npm test` 390/390; renderer 23/23 ve kişisel not 6/6;
native + web strict typecheck; değişen kodda 0 uyarılı ESLint; değişen
dosyalarda Prettier; web export (4 rota ve statik şehir paketi hashleri).
İzole browser girişimi exit1/SIGTRAP; görsel doğrulama BLOCKED.

**PASS:** tam depo `npm run lint`, 0 uyarı, exit0.
