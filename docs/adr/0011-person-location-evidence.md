# ADR-0011 — Kişi yaşamı ve kaynaklı konum ilişkisi

2026-10-16 · Faz 10 · Uygulama kararı; gerçek cihaz doğrulaması açık.

Plan: mevcut v2 kayıt zarfını koru, HistoricalPerson profili ve ayrı ilişki/konum
anlamı ekle. Üretimde profil zorunlu; eski staging kayıtları açık geçiş alanıdır.
TemporalExtent tek tarih otoritesidir; validFrom/validTo/precision salt okunur
projeksiyondur. Yaşam yılı ve bulunma yılı ayrı sorgulanır. Bir Wikidata yer
özelliği, yaşam aralığıyla çarpılarak yıllık konum yapılamaz.

Varsayılan haritada yalnız incelenmiş, yüksek güvenli, belirsiz olmayan dönem
ve belgelenmiş tesis noktası yer alır. Yaklaşık dönem/şehir noktası açık tercih
ister; biyografik bağlantılar ayrı listede kalır. Bölge/krallık merkezi kişi
konumu değildir. Kaynaklı hareket olayları yokken rota/animasyon üretilmez.

Aynı renderer/DOM köprüsü korunur; kişi işaretleri yerel DOM düğmeleridir.
Ekran uzayında kümelenir, küme tüm adayları sayfalı köprüyle sunar; yakınlaşınca
ayrışır. Küme konumu sunum ankrajıdır, tarihî bulunma iddiası değildir. Yeni
bağımlılık, glyph/tile/font veya resim indirmesi eklenmez. P18 dosya lisansı
sayılmaz; ayrı medya hak/asset incelemesi tamamlanana kadar üretim görseli reddedilir.

Pilot: Wikidata Q5582 tarih niteleyicili Maison Van Gogh ilişkisi ve Q3280282
P625 yapı noktası. Tarayıcıda incelenen yapılandırılmış olgular CC0 kapsamında
editöryal çıkarım olarak korunur; HTTP yanıtı veya tam özgün JSON oldukları
iddia edilmez. Aylık dönem ve güncel koordinat hassasiyeti korunur. Özgün JSON
elde edilmedikçe Wikipedia sitelinki bu pilotta paketlenmez.
