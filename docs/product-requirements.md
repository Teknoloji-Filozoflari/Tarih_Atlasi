# Tarih Atlası — Ürün gereksinimleri

## 18 Ekim 2026 — kişi/olay kartı ve güncel şehir tercihi

İlk açılış Türkiye yakın görünümü, zoom4; ilk yıl2000. Kullanıcının açık
kamerası/tarihi korunur. Kişi/olay kısa bilgi ve Wikipedia işlemi; uzun kaynak
kartı ancak açılınca. Kişinin yaşam zarfı harita konumu değildir. Yaklaşık
kaynaklı doğum/ölüm snapshotı yalnız kaynak yılını, ikamet yalnız belgeli
aralığı destekler; kaynak/Gregoryen-Jülyen/antik belirsizlik korunur.

Güncel şehirler kullanıcı isteğiyle bağımsız, açıkça güncel referans katmanı.
Modern siyasi ülke/ad/sınırları tarihî katmana eklenmez. Altı şehir başlangıç
kapsamı; tarihî ad/varlık veya canlı nüfus iddiası yok. Tüm savaşlar ve tüm
şehirler henüz sağlanmadı. Görseller dosya lisansı doğrulanınca ayrı ele alınır.
[Kaynaklı kapsam ve kabul](reports/turkey-discovery.md).


**18 Ekim 2026:** Harita/kart/arama/listede kısa ülke adları; özgün uzun adlar
isteğe bağlı ayrıntıda. Normal timeline yıl/oynatma/slider, ölçek/hız/cetvel/
atlama ayrı panelde. Kalıcı kaynak sayaçları Keşfet'te; ©/kaynak/uncertainty
erişimi korunur. Libya/Çad2000/2010 yaklaşık alanları mevcut:2010:191/180/11,
2000:192/180/12. Aşağıdaki17Ekim178/13 sayımı önceki sürümdür. Küre ve tarihsel
belirsizlik ilkeleri aynı. [Kabul ve sınırlamalar](reports/compact-country-map.md).

## Geçerli ürün kararı — 17 Ekim 2026

Kullanıcının son tercihi **yalnız döndürülebilir 3D Küre**; önceki Atlas/2D
geçişi güncel ürün gereksinimi değildir. Harita ana yüzeydir; üst bar
arama/Keşfet/katmanlar, kompakt timeline, sağ panel/mobil sheet kullanılır.
Eski yer imleri/linkler kaybedilmeden Küre'de açılır. Yıl aralığı MÖ2000–sistem
yılı; hiçbir UI/çıktı yıl sıfırını kabul etmez. Tarih seçilebilirliği veri
kapsamından bağımsızdır.

Ülke adı kullanıcı eylemiyle mevcut Wikidata TR/EN Wikipedia sitelinkini açar;
ikisi de yoksa doğrulanmış Wikidata kaydına gider. Alan seçimi kaynak kartını
açar; yıl/kamera kendiliğinden değişmez. Bağlantı/kimlik doğrulaması tarihî
iddianın doğruluğunu kanıtlamaz. Kaynak/atıf/uncertainty erişilebilir kalır.

Timeline belirgin yıl ve tüm dönem/200/20 yıl ölçeği sağlar. Cetvel aralığı
veri kapsamı olarak yorumlanmaz. Kaynak yılı ve requestedYear ayrımı korunur.
Mevcut siyasi alanlar yaklaşık kaynak rekonstrüksiyonudur; kısmi Fransa alanı
ve çizilmeyen kayıtlar açık etiketlenir. 2010'da191kaynak/178çizilebilir/13askıda,
kültür pilotu0; dünyanın her yılı/ülkesi eksiksizmiş gibi sunulmaz.

[Son inceleme ve kabul durumu](reports/application-review-2010.md),
[yalnız Küre kararı](globe-only.md), [referans incelemesi](reference-review.md).
Aşağıdaki Faz00 metni başlangıç araştırmasıdır; sıfır veri/kurulmadı/gelecek
zaman ifadeleri bugünün envanteri değildir. Güncel durum [progress.md](progress.md).


Tarih: 2026-10-15 · Faz: 00 · Durum: araştırma tamamlandı, ürün uygulanmadı.
Bağlayıcı kurallar: [AGENTS.md](../AGENTS.md). Bu metindeki hedefler ürün kararıdır; çalışan özellik veya doğrulanmış performans beyanı değildir.

## Amaç ve sınırlar

Android ve web için açık kaynaklı, ücretsiz, hesapsız, koyu temalı, Türkçe öncelikli bir 3D tarih atlası. Kullanıcı küreyi döndürür, tarih seçer, bağımsız katmanları açar ve kaynakları inceler. Oyunlaştırma, hesap, reklam, kullanıcı konumu takibi ve zorunlu uygulama backend'i ilk sürüm kapsamı dışındadır. Kaynakların açık olması, barındırmanın maliyetsiz olması anlamına gelmez.

Tarih seçimi MÖ 2000–2026 aralığını kapsar; gelecekte üst sınır sürümlü katalogla güncellenir. 2026 seçimi yılın henüz gerçekleşmemiş kısmı için tarihî kayıt üretmez; bu araştırmanın kesim tarihi 15 Ekim 2026'dır. Her yıl ve her bölge için veri bulunduğu ileri sürülmez. Dünya çapında fiziksel yön bulma tabanı ve dürüst eksiklik bildirimi; birkaç denetlenmiş dönem/bölgede derin içerik hedeflenir. [Kapsam stratejisi](coverage-strategy.md).

## İşlevsel kabul koşulları

| Kimlik | Gereksinim | Gelecek uygulamada kanıt |
| --- | --- | --- |
| PR-01 | Gerçek perspektifli, sürükleme/dokunma ile dönen 3D küre; düz harita küre diye sunulmaz | Web ve fiziksel Android kaydı; aynı çekirdek sürümünün derleme kimliği |
| PR-02 | MÖ/MS seçimi, yıl sıfırı içermeyen gösterim ve erişilebilir sayısal tarih girişi | MÖ 1 → MS 1 geçişi, sınır yılları ve klavye testleri |
| PR-03 | Devlet, kültür, kişi, savaş ve olay katmanları birbirinden bağımsız | Her katmanın aç/kapa durumu ve seçimin diğerlerini bozmaması |
| PR-04 | Kültürel etkileşim alanı ile siyasi egemenlik farklı lejant ve açıklamalar taşır; örtüşmeler korunur | Aynı tarihte iki semantiğin ayrıldığı pilot incelemesi |
| PR-05 | Her iddia kaynak, zamansal hassasiyet, mekânsal hassasiyet, lisans ve katalog sürümüyle izlenebilir | Katalog doğrulayıcısı ve ayrıntı paneli; kaynaksız kayıt yayımlanmaz |
| PR-06 | Yaklaşık/tartışmalı tarih ve geometriler metin ve desenle işaretlenir | Renkleri ayırt edemeyen kullanıcı için de anlaşılır lejant |
| PR-07 | Kişinin seçilen tarihteki yeri yalnızca o zaman ve konumu birlikte destekleyen kaynaklı iddiayla gösterilir | Doğum/ölüm yeri veya genel ikamet kaydından yıllık kişi işareti üretilmediğini gösteren olumsuz test |
| PR-08 | Genel yaşam yerleri ayrı sınıftadır; seçilen yılda bulunma iddiası taşımaz | Ayrı liste/başlık; tarihî bulunma katmanına karışmaz |
| PR-09 | Wikipedia URL'si yalnız doğrulanmış Wikidata sitelinkinden türetilir; Türkçe yoksa mevcut dil belirtilir; hiç yoksa bağlantı sunulmaz | Eksik, yönlendirilmiş ve yanlış türde sitelink testleri |
| PR-10 | Modern ülke sınırları/ülke ve başkent etiketleri tarihî tabanda yoktur | Stil katman denetimi, dünya ve pilot yakın plan ekran görüntüleri |
| PR-11 | Veri yokluğu, lisans engeli, yükleme hatası ve kapalı katman farklı bildirilir | [Kapsam durumları](coverage-strategy.md) için UI testleri |
| PR-12 | WebGL/GPU veya asset hatasında Türkçe açıklama, yeniden deneme ve haritasız kayıt/kaynak listesi vardır | Bağlam kaybı ve ağ kesintisi senaryoları; fallback küre başarısı sayılmaz |
| PR-13 | Çalışma anında hesap/API sorgusu zorunlu değildir; izinli küçük katalog sabit sürümden okunur | Ağsız pilot açılışı; lisans/atıf panelinin ağsız erişimi |
| PR-14 | Kaynak, lisans ve atıflar kullanıcıya erişilebilir; bağlantılar güvenli harici açılır | Ekran okuyucu, odak sırası, dar ekran ve büyük yazı denetimi |

Sitelink, Wikidata öğesiyle bir Wikimedia sayfası arasındaki site/başlık ilişkisidir; bağlantının varlığı tarihî iddianın doğruluğunu tek başına kanıtlamaz. [Resmi sitelink açıklaması](https://www.wikidata.org/wiki/Help:Sitelinks).

## Kalite ve yayın kapıları

TypeScript strict, ortak alan modeli ve sürümlü protokoller zorunludur. Klavye ile temel işlemler, TalkBack ile tarih/katman/kaynak erişimi, en az 44×44 mantıksal birim dokunma hedefi, metinde hedef 4.5:1 kontrast ve azaltılmış hareket desteği ürün hedefleridir. Türkçe karakterler ve MÖ gösterimi hem native UI hem harita yazılarında kontrol edilir.

Performans sayıları ancak [mimari doğrulama planındaki](architecture.md) koşullar altında fiziksel Android'de ölçülünce raporlanır. SDK'nin desteklediği en eski Android sürümü hedef cihazda WebGL2 ve yeterli GPU olduğu anlamına gelmez. Çalışan küre kapısı geçilmeden derin veri geliştirmesine geçilmez.

Her yayımlanan kayıt için kaynak ve hak incelemesi %100 olmalıdır. Bu oran tarihî dünyanın %100'ünü kapsamak anlamına gelmez. Gerçek tarihî kayıt sayısı şu an **0**, paketlenen dış veri/asset sayısı **0**. Sentetik testler ayrı kimlik ve görünür “Sentetik test verisi” ibaresi taşır.

Faz 00'da önerilen MIT kod lisansı, Faz 01'de kökteki [LICENSE](../LICENSE) ile projenin kendi kod ve belgeleri için somutlaştırıldı. Veriler, üçüncü taraf kodu, fontlar, görseller, stiller ve tile hizmetleri ayrı sicildedir. Bağımlılık kurulumu ve platform kabulü henüz engellidir. [Lisans sicili](license-register.md), [Faz 01 raporu](reports/phase-01.md).

## Faz 00 kabulü ve sonraki işler

Bu fazın kabulü çalışan uygulama gerektirmez: web/Android yaklaşımı ve ölçüm planı, izinli temel coğrafya adayı ve belirsiz veriyi paketlememe koşulları [faz raporunda](reports/phase-00.md) izlenir. Gelecek uygulama gereksinimleri yukarıdaki tabloda tanımlıdır ve henüz doğrulanmamıştır. [18 fazlı yol haritası](roadmap.md) yalnız öneridir; her yeni faz kullanıcı onayı gerektirir.
