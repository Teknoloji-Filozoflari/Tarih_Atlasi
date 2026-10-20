# ADR-0007 — Tarihî yıl, kaynak geçerliliği ve açık önizleme

2026-10-15 · ACCEPTED — TIME ENGINE / UNIT SCOPE; PREVIEW RUNTIME BLOCKED — Faz 06.

Kod öncesi model/test kararı: kullanıcı yılı MÖ için negatif, MS için pozitif ve
sıfırsızdır. Astronomik dönüşüm negatif yılda +1, geri dönüşüm 0 ve altında -1'dir.
Karşılaştırma ve süre farkı astronomik sıralamada yapılır; gün sayısı için 372'lik
sıralama anahtarı kullanılmaz. Üst seçim sınırı sistemin yerel güncel yılıdır;
katalog kapsamı ayrı kalır. Date nesnesiyle eski yıl üretimi yapılmaz.

TemporalExtent mevcut kaynak metni/hassasiyetini korur; opsiyonel `support`
(snapshot / continuous + kaynak açıklaması) ve `periods` (en çok 64 ayrı kapalı
aralık) eklenir. Bunlar şema v2'nin geriye uyumlu genişlemesidir: eski kayıtlar
okunur fakat support'suz geometri yıllara yayılmaz. Bilinmeyen/unbounded uçlar
kesin yıllık bulunma iddiası oluşturmaz. Snapshot tek bilinen yılı kapsar;
continuous yalnız açık kaynak beyanı ve bilinen uçlarla sorgulanır. Kesintili
periods üst zarfın içinde, sıralı ve çakışmasızdır; aradaki boşluklar korunur.
`range` hassasiyetinde ay/gün bulunamaz. Kaba tarihe sahte gün eklenmez.

Kişi yaşam dönemi ve timed-presence kayıtları ayrı sorgulanır. Biyografik ilişki
konum kanıtı değildir. Kültürler/rakip siyasi yorumlar sorguda birleştirilmez.
Üç kapsam modu: exact verified / documented approximate /
no supported historical geography. Yaklaşık veri bilimsel belirsizliğiyle kalır;
unknown tarih kesin sorguya alınmaz. Snapshot önizlemesi varsayılan kapalıdır,
yalnız açık seçimle açılır; seçili yıl ve kaynak yılı birlikte görünür. Önizleme,
seçilen yılın desteklenmeyen coğrafyasını doğrulanmış yapmaz.

Altın test tablosu:

| Senaryo | Beklenti |
| --- | --- |
| MÖ 2 / MÖ 1 / MS 1 / MS 2 | Astronomik -1/0/1/2, adımda yıl 0 yok |
| Başlangıç ve bitiş | Kapalı kaynak aralığının iki ucu dahil; öncesi/sonrası dışarıda |
| Kesintili dönem | Kaynaklı alt aralıklar dahil, zarfın boşluğu hariç |
| Snapshot | Kendi yılı dahil; komşu yıllara taşınmaz |
| Açıklamasız çok yıllı geometri | Varsayılan destek yok; continuous tahmin edilmez |
| Yaklaşık/yüzyıl/bilinmeyen tarih | Yaklaşık ayrı etiketli; bilinmeyen kesin olmaz; gün uydurulmaz |
| Yaşam dönemi + tarihsiz genel yer | Kişi bulunur, o yıl için konum iddiası yok |
| Kültür/rakip siyasi iddia çakışması | Her kayıt ayrı döner |
| Açık snapshot önizlemesi | Kaynak yılı kalıcı, seçili yıl değişmez; kapatma hemen temizler |
| Hızlı yıl değişimi | Geç gelen eski sonuç yeni yılı değiştiremez; cache sınırlıdır |

Yeni dış bağımlılık veya tarihî veri alınmaz. İndeks sağlayıcının en fazla 1000
kayıtlık doğrulanmış katalog limitine uyar; yıl başına binlerce kopya üretmez.
Fiziksel Android ve önceki erişilebilirlik/audit kapıları bu ADR ile kapanmaz.

[Sonuç ve testler](../reports/phase-06.md), [API ve sınırlamalar](../timeline.md).
