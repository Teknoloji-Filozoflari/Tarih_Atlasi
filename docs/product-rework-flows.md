# Kullanıcı akışları ve elle kabul

16 Ekim 2026. Kaynak kod ve otomatik domain/renderer testleri uygulandı;
gerçek tarayıcı/TalkBack/Android etkileşim kabulü bu ortamda **NOT TESTED**.
Bu liste başarı beyanı değil, kalan gerçek platform koşusunun tekrarlanabilir
protokolüdür. [Kalite raporu](reports/product-rework.md).

| Akış | Adımlar | Beklenen davranış |
| --- | --- | --- |
| İlk açılış | `npm run web`; ana sayfa | Ürün adı/arama/Keşfet/katmanlar; Atlas varsayılan, Küre seçeneği; görünür yıl ve katalog kapsamı. Gerçek veri eksikliği açıklanır; sentetik işaret başlangıçta gizli. |
| Atlas/Küre | Sürükle, zoom, katman kapat; iki görünüm arasında geç | Tek canvas/WebView; kamera, yıl ve katman korunur. 2D Atlas, 3D diye sunulmaz; kürede arka yüz işaretleri gizli, Atlas'ta küre horizon filtresi uygulanmaz. |
| Tarih | Yıla dokun, `MÖ 1`; ok ile ileri; araçları genişlet | MS1; yıl0 Türkçe hata; +/-10/100, ilk/son ve hızlar erişilebilir. Manuel yıl değişimi oynatmayı durdurur, kamera sabit kalır. |
| Kaynaklı pilot | Keşfet →1867 örneği; Keşfet→odak | Yıl1867'de yalnız belgeli sınır kesiti; bütün bir ülke polygonu veya kesin GPS sınırı iddiası yok. Yıl1868'de kaybolur. Odak komutu görünür kayda yönelir, her durumda Alaska'ya gitmez. |
| Arama | `Hastings` veya `Gogh` ara, sonucu aç | Sonuç mevcut yılı kendiliğinden değiştirmez. İlgili yıla git açık seçim; odak ayrı. Gogh biyografisi bulunur ama askıdaki konum haritaya dönmez. Türkçe/alternatif ad sorguları yereldir. |
| Katman | Her6 anahtarı ayrı değiştir; tarih değiştir/yeniden aç | Siyasi/kültür/kişi/savaş/olay/yerler bağımsız; filtreler korunur; kültür kesin egemenlik diye çizilmez. Gerçek kültür pilotu olmadığını bildirir. |
| Kaynak | Sınır/olay seç → kaynak/belirsizlik/Wikipedia | Kaynak yılı, revizyon, atıf ve hassasiyet; doğrulanmış TR sitelink, kontrollü EN/WD fallback. Tarayıcı dönüşünde yıl/kamera korunmalı. |
| Yer imi | Keşfet→yer imleri→yıl/varlık/kamera kaydet; yeniden aç | Hesap gerektirmez; eski biçimler okunur; yeni kayıtta projection korunur. Eksik varlık uydurma marker oluşturmaz. |
| Bozuk yer imi | Bozuk depoyla aç → incele→vazgeç veya onayla | İlk hata dosyayı değiştirmez. Özgün metin incelenip kopyalanabilir. Açık onay yalnız yer imi deposunu sıfırlar; eşzamanlı değişiklik reddedilir. Ayarlar/veri katalogları etkilenmez. |
| Paylaşım | Keşfet→paylaş; URL'yi yeni sekmede aç | Yalnız whitelist yıl/ID/kamera/projection; bilinçli görünüm uygulaması. Eski URL'ler geçerli; geçersiz/tekrar parametreler reddedilir. |
| WebGL/ağ | WebGL2'yi kapat veya veri bağlantısını kes | Türkçe hata/retry; Keşfet/arama/katalog/kaynaklar kullanılabilir. Önceden izinli/verifiye cache veya paketli pilot; kaynak/sürüm açıklanır. Tam offline iddiası yok. |
| Erişilebilirlik |320×568,800×360,1920×1080; Tab/Escape, büyük yazı, TalkBack |48birim hedefler, isimli simgeler, görünür odak, güvenli alan; masaüstü sağ panel/mobil sheet. Paneldeyken harita yanlışlıkla sürüklenmez. Kapatınca giriş kontrolüne odak dönmeli. |

## Ayrıntılı fiziksel veri

Ağ erişimli geliştirici ortamında:

```sh
npm run basemap:prepare
npm run basemap:check
npm run check
npm run web
```

Hazırlayıcı yalnız public-domain Natural Earth v5.1.2/50m fiziksel kara alır;
12MiB,5000feature,200000koordinat ve hash kapıları var. İlk kez indirilince
ham dosya, ayrı provenance, geometrisiz presence metadata ve lazy DOM modülü
üretilir. Genel `npm run format` ve export kontrolleri tekrarlanır. Özel API
anahtarı veya demo tile sunucusu gerektirmez. Bu çalışma ortamında indirme
EAI_AGAIN; dolayısıyla mevcut paket **110m**. 50m de şehir/sokak ayrıntısı veya
tarihî sahil değişimi sağlamaz. Büyük veri/vektör tile göçü ölçüm olmadan yapılmadı.

Gelecek sefer/rota ürünü notu: kaynaklı dönem+LineString ve hareket olayları
ayrı hak/topoloji/zaman incelemesi ister; kişi yaşam aralığından hareket rotası
üretilmez. Bu çalışmaya yeni rota verisi/animasyonu eklenmedi.
