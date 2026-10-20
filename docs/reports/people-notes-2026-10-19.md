# Kişiler, kısa kartlar ve kişisel kayıtlar — 19 Ekim 2026

## Sonuç ve kapsam

**IMPLEMENTED:** kaynaklı yaklaşık doğum noktaları yeni kurulumda açık; eski kullanıcı tercihi silinmez. Yılın doğum noktalarını gizleyen kişi katmanı/hassasiyet/güven/ilişki filtresi varsa timeline üstünde açık eylem sunulur. Eylem kişi katmanını açar ve ilgili kısıtları kaldırır. Tarihsiz biyografik bağlar yıllara yayılmaz.

Atatürk `births:person-q5152`, Selanik doğum ilişkisi `births:location-q5152`: yalnız **1881**, yaklaşık şehir temsil noktası. 1882 ve yaşamının diğer yıllarında otomatik ikamet iddiası yok. Arama → Atatürk → başlıktaki **Ayrıntıları göster** → **Doğum yılına git ve yaklaşık konumu aç** eylemi yılı seçer ve desteklenen konuma odaklar. Yeni sitelink paketi Q5152'nin Türkçe Wikipedia bağlantısını çevrimdışı çözebilir (makalenin açılması internet gerektirir).

Kişi/olay ilk kartı ad, yaşam/olay yılı, kısa açıklama, gerekli belirsizlik etiketi ve Wikipedia düğmesi gösterir. Eski kaynak/atıf, konum ilişkisi, odaklama, alternatif tarih ve diğer bilgiler başlıktaki bilgi eyleminden erişilir; silinmedi. Sağ alttaki geliştirici kamera aç/kapat düğmesi kaldırıldı. Kamera test verisi yalnız development derlemede görünmez/erişilebilirlik ağacından gizli tutulur; kullanıcı kontrolü değildir.

## Kişisel kayıt kullanımı

**Keşfet → Haritada nokta belirle ve kayıt ekle**. Küreyi sürükleyip ortadaki artıyı hedefe getir, **Bu noktayı kullan**. Kişi / savaş / olay, kısa bilgi, başlangıç–bitiş yılı ve isteğe bağlı kaynak notunu doldur, **Cihaza kaydet**. GPS izni gerekmez; koordinat elle de düzenlenebilir. Escape/Android geri nokta seçimini iptal eder (fiziksel Android doğrulanmadı).

**Kendi kayıtlarım** listesi düzenleme, odaklama ve iki aşamalı silme sağlar. En fazla 50 kayıt / 60.000 UTF-8 byte; aynı yılda ve açık katmanlarda en fazla 8 işaret. Daha sonraki not listeden seçilince görünür önceliğe alınır. Notun yılına geçiş listede açık seçimle yapılır. Kişi/savaş/olay katmanları bağımsızdır. Savaş notu kullanıcının seçtiği referans noktasıdır; doğrulanmış savaş alanı değildir.

Kesik kenarlı ◇ işaretleri **kişisel ve doğrulanmamış** olarak etiketlenir. Üretim tarih kataloğu, kaynak onayı, arama indeksi veya paylaşım URL'sine aktarılmaz. Web localStorage `tarihatlasi.notes.v1`; Android uygulama alanında `atlas-notes-v1.json`, geçici dosya + rename. Şema, yıl sıfırı, koordinat, sürüm, UTF-8 boyutu, benzersiz ID ve tür doğrulanır. Bozuk dosya otomatik ezilmez. Yazma başarıya ulaşmadan bellek güncellenmez; sıra/geri dönüş testi vardır. Kaynak metni çalıştırılmaz, otomatik açılmaz veya ağa gönderilmez. Köprüye yalnız ID/tür/koordinat, en fazla 8 kayıt gönderilir. Marker değişmediğinde yeniden yaratılmaz; unmount dinleyicileri ve marker'ları temizler.

## Yeni, sınırlı dünya içeriği

`1.3.0-births`: 55.278 byte / 16 kayıt / bir paket. 4 kişi profili, 2 yıllık yaklaşık doğum noktası, 2 yalnız biyografik bağ, 2 olay. CC0 yapılandırılmış olguların editöryal çıkarımı; özgün API yanıtı gibi sunulmaz. Yalnız yıl hassasiyeti, kaynak revizyonu ve SHA-256 korunur. Bağımsız üst kaynak zincirinin tamamı doğrulanmış değildir; güven düzeyi orta.

| Kayıt | Kaynak / revizyon | Tarih ve yer kararı |
|---|---|---|
| Wangari Maathai | [Q46795](https://www.wikidata.org/w/index.php?title=Q46795&oldid=2556913244), Nyeri Q380130 / 2420069333 | 1940–2011; P19 **near** niteleyicisi nedeniyle Nyeri bağı yalnız biyografik. 1940 kesin nokta yok. |
| José de San Martín | [Q134160](https://www.wikidata.org/w/index.php?title=Q134160&oldid=2549014359), Yapeyú Q55854 / 2516856033 | 1778 doğum yılı, yaklaşık yer temsil noktası; yaşam boyunca burada kabul edilmez. |
| Rabindranath Tagore | [Q7241](https://www.wikidata.org/w/index.php?title=Q7241&oldid=2551730759), Kolkata Q1348 / 2556280439 | 1861 doğum yılı; 6/7 Mayıs kaynak sıralaması notta tutuldu, gün kesinliği üretilmedi. |
| Kate Sheppard | [Q455072](https://www.wikidata.org/w/index.php?title=Q455072&oldid=2533876870), Liverpool Q24826 / 2558240239 | P569 1847 / açıklama 1848 ihtilafı; 1847–1848 aralığı, yalnız biyografik yer bağı. Yeni Zelanda merkezine doğum noktası konmaz. |
| Berlin Duvarı'nın açılması | [Q69163529](https://www.wikidata.org/w/index.php?title=Q69163529&oldid=2545528111) | 1989; P585 ve P625 yaklaşık temsil noktası. Duvar geometrisi veya 1990 birleşme olayıyla eşitlenmez. |
| Ayacucho Muharebesi | [Q934157](https://www.wikidata.org/w/index.php?title=Q934157&oldid=2515888972) | 1824; Wikidata'nın Wikipedia'dan aktarılan tarih/koordinat iddiası. Yaklaşık nokta, muharebe alanı poligonu değil. Türkçe sitelink yok; doğrulanmış İngilizce hedef. |

Atatürk dahil 7 yeni QID/sitelink eşleşmesi, toplam 9 sabit sitelink snapshot'ı. Wikipedia metni veya Commons görseli kopyalanmadı. Yeni dış bağımlılık veya toplu veri indirmesi yok.

**PARTIAL:** önceki 823 benzersiz kullanıcı isteğinden 146'sı yayımlanan kayıtla eşleşir; 668 kaynak incelemesi bekler, 9 belirsiz ad kullanıcının önceki talebine uygun atlanır. Dünya ülkelerinin tüm önemli kişi/olayları tamamlanmadı. Yeni kişilerin tümü tek doğum yılı noktasına zorlanmadı.

## Batı Sahra — veri boşluğu

Mevcut Cliopatria üretim manifestinde Sahara/Sahrawi siyasi kaydı bulunmadı; önceki Natural Earth referans denetimindeki beş iç nokta da 2024 için eşleşmedi. Bu, bölgenin tarihsel yokluğu veya başka devlete aidiyeti değildir. [BM Batı Sahra kaydı](https://www.un.org/dppa/decolonization/en/nsgt/western-sahara) bölgeyi kendi kendini yönetmeyen topraklar listesinde belirtir. Keşfet paneline bu katalog boşluğunu açıklayan metin eklendi.

**BLOCKED — tarihî sınır tamamlama:** yıl/geometri/kaynak/iddia tarafları birlikte incelenmiş Batı Sahra siyasi sınırı yok. Modern referans geçmişe taşınmadı; Fas veya SADR adına rastgele doldurulmadı. Ek dosya indirmenin tek başına çözeceği bir eksik değildir. Bir sonraki veri çalışması: dönemli kaynak, fiilî kontrol ve hak iddiası ayrımı, yeniden dağıtım kararı, geometri doğrulaması.

## Değişen dosyalar

- `src/annotations/*`, `src/atlas/LocalNotesPanel.tsx`: yerel not modeli, platform depoları, form.
- `src/atlas/{AtlasScreen,PersonCard,EventCard,SourceActions,EntitySheet}.tsx`: entegrasyon/kısa kartlar; `src/map/ViewportFrame.tsx`: kamera düğmesinin kaldırılması.
- `src/map-contract/protocol.ts`, `src/map-contract/viewport.ts`, `src/map/useGlobeHost.ts`, `src/map/globe/{renderer,note-markers}.ts`, `GlobeView.tsx`, `markers.css`: sınırlı köprü/marker/cleanup.
- `src/preferences/model.ts`, `src/discovery/file-storage.ts`, `src/i18n/tr.ts`, `src/privacy/policy.ts`.
- `data/people/global-{raw,production}/*`, `src/people/global/*`, `scripts/people/global.mjs`, `src/people/{policy,runtime,extension,discovery}.ts`, `scripts/people/requests.mjs`, `src/people/generated/requests.ts`, istek raporları.
- `src/data/application{,-core}.ts`: olay reposu da aynı birleşik kataloğu kullanır.
- `data/sitelinks/reviewed.json`, `scripts/sitelinks.mjs`, `src/sources/generated/sitelinks.ts`, ilgili NOTICE dosyaları.
- `tests/unit/local-notes.test.mjs`, kaynak/sayı regresyon testleri; `tests/web/local-notes.spec.ts` ve eski ayrıntı kart akışları; `tests/run.mjs`, `package.json`, `.prettierignore`.
- README, ilerleme, gizlilik, lisans ve veri kalite belgeleri.

## Doğrulama

Aşağıdaki komutların gerçek çıktıları `docs/reports/people-notes-2026-10-19-*.log` dosyalarındadır. İlk koşuda 375/378 geçti; üç eski sabit toplam/sürüm beklentisi yeni incelenmiş kayıtlar için güncellendi. Kontrol gevşetilmedi. Yeni özel testler gerçek domain/persistence/bridge/marker lifecycle kodunu çalıştırır; DOM/MapLibre doubles GPU doğrulaması değildir.

| Kontrol | Sonuç |
|---|---|
| `npm test` | **PASS 384/384**; yeni 6 test dahil |
| `npm run test:worker` | **PASS 5/5** |
| `npm run lint` | **PASS**, tam depo, 0 uyarı; ilk uyarı NOTICE üretiminde kullanılmayan importtu, son kodda düzeltildi |
| `npm run typecheck` | **PASS**, native + web strict TypeScript |
| Değişen dosyalarda Prettier | **PASS** |
| `npm run people:global:check`, `sitelinks:check` | **PASS**, hash/provenance ve deterministik çıktı |
| `npm run web:export` | **PASS**, 4 rota; 16.102 şehir paketi / 645.992.949 byte statik veri doğrulaması |
| Playwright `local-notes.spec.ts` desktop | **BLOCKED**, 45s sonunda exit124; bağımsız localhost isteği `EPERM`. Testler başlamadığı için PASS veya ekran görüntüsü yok. |
| `npm run android:bundle` | **INCOMPLETE**, Metro başlangıcından sonra sonuç gelmedi; bu deneme durduruldu (exit130). Başarılı Android export/APK iddiası yok. |
| Gerçek Android / TalkBack / dokunma / GPU | **UNVERIFIED ON DEVICE** |

Başlıca kalan riskler: tarayıcıda yeni kısa kart boyutu/odak/yeniden açılış E2E'si ve Android DOM köprüsü cihaz testi. Önceki büyük web giriş paketi (yaklaşık 13 MB sıkıştırılmamış) ve fiziksel ayrıntı paketi (20 MB) hâlâ performans riski; bu çalışma bunları çözdüğünü iddia etmez. Kişisel notlar yedeklenmediği için tarayıcı/uygulama verisi temizlenince kaybolur. Batı Sahra döneme bağlı sınırı ve tam dünya kişi/olay kapsamı açık kalır.

Çalışma dizininde `.git` yok; `git status --short` exit128 verdi. Var olan kullanıcı dosyaları korunarak yerinde düzenlendi, reset veya toplu silme yapılmadı. Yeni faz başlatılmadı.
