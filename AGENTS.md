# Tarih Atlası — Codex çalışma kuralları

Bu proje React Native + Expo + TypeScript ile Android ve web için geliştirilen, açık kaynaklı, ücretsiz, hesapsız, koyu temalı ve Türkçe öncelikli bir 3D tarih atlasıdır. Oyunlaştırma yoktur.

## Ürün ilkeleri
- Tarih kapsamı MÖ 2000–günümüz; eksiksiz yıllık tarihî veri iddiası yok.
- Haritada gerçek döndürülebilir 3D küre olmalıdır.
- Devlet, kültür, kişi, savaş ve olay katmanları bağımsızdır.
- Wikipedia bağlantıları doğrulanmış Wikidata sitelinklerinden üretilir.
- Hiçbir tarihî sınır, olay tarihi, kişi konumu veya veri kaynağı uydurulamaz.
- 'Bu kişi X yılında burada bulunuyordu' iddiası yalnızca kaynaklı zaman/konum kaydıyla gösterilir. Yaşamına ilişkin genel yer bilgileri ayrı sınıfta sunulur.
- Yaklaşık tarih ve sınırlar açık şekilde işaretlenir; mevcut veri yoksa durum belirtilir.
- Siyasi devlet sınırları ile kültürel bölgeler aynı semantik anlama sahip değildir.
- Modern ülke etiketleri tarihî katmana karıştırılamaz.

## Teknik ilkeler
- TypeScript strict; platform ortak alan modeli ve veri protokolleri.
- Tek MapLibre GL JS globe çekirdeği ve web/native adaptörleri hedeflenir; Android cihaz prototipi başarısızsa alternatifler incelenir.
- UI bileşenleri küçük, test edilebilir, erişilebilir ve responsive olacak.
- Backend zorunlu olmayacak; doğrulanmış, sürümlü statik katalogla başla.
- Veri, kod, görsel ve tile servislerinin lisanslarını birbirinden ayır; lisans kesinleşmeden yeniden dağıtma.
- API anahtarlarını repoya koyma. Public/secret ayrımını koru; CORS, CSP, bağlantı güvenliği ve rate-limit şartlarına uy.
- Büyük veri işlerken batch, limit, backoff, cache, bounded concurrency kullan.
- Android'de WebView/DOM köprüsü şema doğrulamalı, sürümlü ve kontrollü olmalı.
- WebGL erişilemezse hata/fallback deneyimi sağla.
- Test için sentetik veri kullanılabilir ama gerçek dünya verisi gibi gösterilemez.

## Faz işleyişi
1. Mevcut kodu, docs/ klasörünü ve README'yi incele.
2. Yalnızca istenen fazı uygula; istenmeyen yeni özellik ekleme.
3. Önce küçük uygulanabilir değişiklik planı çıkar, sonra kodu uygula.
4. Kod, test, dokümantasyon ve lisans/atıf kayıtlarını birlikte güncelle.
5. Mümkün olan testleri çalıştır; çalıştırmadıklarını dürüstçe belirt.
6. Her faz sonunda tamamlanan işler, değişen dosyalar, web/Android doğrulamaları, test sonuçları, riskler, sonraki fazın önkoşullarını raporla.
7. Kullanıcı onayı olmadan sıradaki faza başlama.
8. Her faz için `docs/progress.md` durumunu güncelle.
9. Önceki çalışan akışları bozmadan ilerle; geriye dönük hataları test et.
10. Yeni dış bağımlılık seçiminde uyumluluk, lisans, bakım ve gerekli paket boyutunu doğrula.

## Definition of Done
- Kabul kriterleri karşıladı veya karşılanamayan kriter açık olarak BLOCKED.
- Typecheck, lint ve ilgili otomatik testler raporlandı.
- Gerçek Android cihazda ölçülmeyen performans 'doğrulandı' olarak sunulmadı.
- Veri kaynaklarının ne kadarını kapsadığı ve hangi belirsizlikleri taşıdığı belgelenir.
