# ADR-0003 — Kanıt, hak ve kapsam birbirinden bağımsız kapılar

Tarih: 2026-10-15 · Durum: **PROPOSED**; AGENTS.md'deki kaynak ve lisans yasakları zaten bağlayıcıdır.

## Karar

Bir kayıt ancak tarihî iddiası kaynakla destekleniyor, yeniden dağıtım hakkı doğrulanmış ve sunum kapsamı doğru tanımlanmışsa yayımlanabilir. Açık lisans doğruluk kanıtı değildir; akademik kaynak da kopyalama izni değildir. Her iddia ve artefakt ayrı kayıt taşır. Bir kaynağın tüm koleksiyona ilişkin genel açıklaması nesne istisnalarını silemez.

Siyasi devlet/kültür/kişi/savaş/olay türleri ayrı tutulur. Kişinin zamanlı bulunma iddiası genel yaşam yerinden ayrı veri tipidir. Yaklaşık tarih/alanlar açık işaretlenir; kaynakta eksik tarih, koordinat veya polygon türetilerek gerçek veri gibi doldurulmaz. Eksik veri, yokluk iddiası değildir.

## Alternatif ve sonuç

Tek “güvenilir kaynak” bayrağı kolaydır fakat lisans ile doğruluğu karıştırır. Tek bir depo lisansını tüm veriye uygulamak da nesne bazlı istisnaları kaybettirir. Seçilen yaklaşım daha fazla kayıt ve editöryal emek ister; iddia ve hak izi korunur, itiraz veya güncellemede etkilenen kayıt ayrılabilir.

Kaynak kararları [matriste](../source-matrix.md), dağıtım kararları [sicilde](../license-register.md), somut senaryolar [kapsam stratejisinde](../coverage-strategy.md). Engelli bir kaynağın başka veri setindeki kopyası, üst kaynak hakkı çözülmeden kabul edilemez. Kültürel alanın siyasi sınırdan türetilmesi hakları çözülse bile semantik kapıda reddedilir.

## Gelecek doğrulamalar

Kaynaksız koordinat, eksik lisans, engelli nesne üyesi, yanlış sitelink, tarihsiz kişi konumu ve bilinmeyen şema için olumsuz yayın testleri gerekir. Hak ve kanıt sürümü değişince kararlar yeniden değerlendirilir. Bu fazda bu testlerin ürün uygulaması yapılmadı.
