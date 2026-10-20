# 18 fazlı önerilen yol haritası

Tarih: 2026-10-16. Numaralandırma **00–17**, toplam **18 faz**. Faz 00 tamamlandı.
Faz 01 altyapı/kalite hazır; Android cihaz kapısı açık. Faz 02 kullanıcı web denemesi
başarılı, tam runtime/Android kabulü BLOCKED. Faz 03 UI kaynakları hazır, platform
kabulü BLOCKED. Faz 04 tarihî alan modeli/kaynak/ETL kapsamı tamamlandı; önceki
cihaz kapıları kapanmadı. Faz 05 kaynaklı dar sınır pilotu/paket hattı hazır,
çizgi/kaynak kartı ve yıl filtresi kullanıcı testi başarılı; otomatik tarayıcı ve
Android kapıları açık. Faz 06 zaman motoru/altın testleri tamamlandı; yeni önizleme runtime kabulü açık. Faz 07 çizelge/oynatma uygulandı; runtime kabulü açık. Faz 08 siyasi katman kodu uygulandı; gerçek polygon edinme/inceleme ve runtime kabulü BLOCKED. Faz 09 kültürel model/katman/kart/seçim kodu uygulandı; gerçek kültür pilotu ve runtime kabulü BLOCKED. Faz 10 kişi/konum kodu ve dar gerçek pilot uygulandı; runtime/cihaz kabulü açık. Faz 11 olay/savaş/antlaşma kodu ve dört dar olay kaydı uygulandı; runtime/cihaz kabulü açık. Faz 12 doğrulanmış sitelink/cache/güvenli dış bağlantı ve ortak kaynak kartları uygulandı; runtime/cihaz dönüş kabulü açık. Faz 13 ortak arama/kamera/yer imi/paylaşım uygulandı; gerçek platform kabulü açık. Faz14 katman/filtre/lejant/kalıcı ayar uygulandı; gerçek platform kabulü açık. Faz15 cache/parçalı yükleme/host benchmark uygulandı; web ve cihaz performans kabulü açık. Faz16 tarihsel doğruluk/QA/güvenlik denetimi teslim edildi; yayın NO-GO. Faz17 başlamadı. Kullanıcının açık Faz 03/04/05/06/07/08/09/10/11/12/13/14/15/16 promptları
ilk önerideki başlıkların yerine geçer; aşağıdaki satırlar buna göre güncellendi.
Güncel kanıt [progress.md](progress.md) içindedir. Sonraki faz kendiliğinden
başlamaz; kalan başlıklar kullanıcı promptuyla netleşecek önerilerdir.

| Faz | Amaç / beklenen çıktı | Önkoşul ve çıkış kapısı |
| --- | --- | --- |
| 00 | Araştırma, lisans, uygulanabilirlik, PRD, ADR, risk ve kapsam | Mevcut dizin/kurallar incelemesi; bu fazdaki üç kabul kriterinin raporu |
| 01 | Expo + TS strict proje temeli, minimal web/Android açılış, lisans kararı ve kontrol komutları | Kullanıcı onayı; güncel kararlı SDK/paket matrisi ve lockfile/notice; typecheck/lint/temel test düzeni; yeni bağımlılık boyut kaydı |
| 02 | Aynı globe çekirdeğiyle web ve fiziksel Android renderer prototipi | Faz 01; V-01–V-08, ESM worker/offline asset/bridge; başarısızsa alternatif ADR araştırması; çalışan 3D kanıtı olmadan kapı geçmez |
| 03 | Kullanıcının isteğiyle özgün responsive UI | Kaynak uygulandı; renderer/Android ve erişilebilirlik kabulü açık |
| 04 | Kullanıcının isteğiyle tarihî veri şeması, kaynak kataloğu, ETL doğrulayıcı ve sağlayıcı | DOMAIN / ETL COMPLETE; hash/provenance/rights kapısı; büyük indirme/gerçek veri/UI yok; önceki cihaz kapıları korunur |
| 05 | Kullanıcının isteğiyle doğrulanmış sınır pilotu, fiziksel taban ve veri paketleri | 1 kaynaklı antlaşma kesiti + v2 ilişki/LOD/manifest; SOURCE DATA PASS, USER-REPORTED PILOT PASS; otomatik tarayıcı/Android kapıları açık |
| 06 | Kullanıcının isteğiyle zaman motoru, MÖ/MS ve kapsam | İndeks/cache, support/periods, kişi konumu ayrımı ve açık snapshot önizlemesi; 65+4 test/kalite/JS export PASS, yeni önizleme runtime ve cihaz kapısı açık |
| 07 | Kullanıcının isteğiyle tarih çizelgesi ve oynatma | Tek zaman store, erişilebilir slider/MÖ-MS giriş, kamera koruma, atomik frame/ACK; runtime ve cihaz kapısı açık |
| 08 | Kullanıcının isteğiyle devlet/krallık/imparatorluk katmanı | Kaynaklı çoklu sınıf/tarihli ad, siyasi seçim/kart/stil/odak kodu; gerçek polygon edinme/inceleme ve web/Android kabulü BLOCKED; kültür verisi eklenmedi |
| 09 | Kullanıcının isteğiyle kültür/medeniyet/belirsiz etki alanları | Aynı yerde çok kültür modeli, ayrı lejant/stil/kart ve tüm hitlere sayfalı erişim; gerçek kültür pilotu ve platform kabulü BLOCKED; kişi katmanı genişletilmedi |
| 10 | Kullanıcının isteğiyle tarihî kişiler ve belgelenmiş konum ilişkileri | Yaşam/yer ayrımı, kişi arama/kart/küme, kaynaklı dar Wikidata pilotu; runtime/cihaz kabulü açık |
| 11 | Kullanıcının isteğiyle savaşlar, anlaşmalar ve tarihî olaylar | 7 tür, bağımsız savaş/olay, konumsuz yıl listesi; 4 dar olay / 1 yaklaşık nokta; runtime/cihaz kapıları açık |
| 12 | Kullanıcının isteğiyle Wikidata/Wikipedia ve doğrulanabilir kaynak kartları | TR/EN/Wikidata sırası, küçük hash-bound link kataloğu, güvenli platform adaptörleri, cache/ETL ve kaynak/atıf/belirsizlik; A-03 düzeltildi. Runtime/cihaz dönüş kabulü açık |
| 13 | Kullanıcının isteğiyle arama, kamera odaklama, yer imleri ve paylaşım | Yerel beş tür indeks/iptal, kullanıcı seçimiyle yıl, bbox odağı, kalıcı50 yer imi ve strict web/native link. Unit/JS export PASS; gerçek platform kabulü açık |
| 14 | Kullanıcının isteğiyle katmanlar, filtreler, lejant ve ayarlar |6 bağımsız kontrol, ortak şemalı zaman/harita filtreleri, yerel tercihler ve stil guard; unit/JS export PASS, gerçek web/Android kabulü açık |
| 15 | Kullanıcının isteğiyle önbellek, yükleme, büyük veri ve performans |6 manifest girdisi/4 izinli parça, bounded cache/iptal/fallback, host ve export ölçümü; gerçek kısıtlı ağ/browser/GPU/cihaz kabulü BLOCKED |
| 16 | Kullanıcının isteğiyle tarihsel doğruluk, kalite güvencesi ve güvenlik | Denetim/düzeltme/otomatik kontroller teslim; [NO-GO ve açık kapılar](release-blockers.md). Gerçek web/Android/a11y ve kaynak/transitif hak kanıtı eksik |
| 17 | İlk sürüm kabulü, kullanıcı belgeleri ve ölçüm raporu | Gerçek cihaz ve web kanıtları, typecheck/lint/test sonuçları, açık engeller, kapsam/atıf; yayın işlemi ayrıca yetkilendirilmeli |

Bir fazın başarısız kapısı, sonraki fazın içinde saklanarak atlanmaz. Veri kapıları yalnız ilgili kaynağı engelleyebilir; örneğin Historical Basemaps engeli sürerken uygun temel coğrafyayla renderer deneyi yapılabilir. Kültür veya kişi derinliği kaynak yokluğunda azaltılabilir; ürünün gerçek 3D küre koşulu azaltılamaz.
