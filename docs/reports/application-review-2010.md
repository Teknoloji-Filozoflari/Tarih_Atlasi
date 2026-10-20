# Proje incelemesi ve MS 2010 düzeltmeleri

17 Ekim 2026. Kapsam: kullanıcının mevcut uygulamayı inceleme, ülke adıyla
Wikipedia açma, tarih çizelgesini iyileştirme ve özellikle **2010** yılındaki
Afrika boşlukları/renk–sınır uyuşmazlığını giderme isteği. Yeni ürün fazı veya
yayın başlatılmadı. **Sonuç: düzeltmeler IMPLEMENTED; veri kapsamı ve platform
kabulü PARTIAL, yayın NO-GO.**

`git status --short` exit128: bu ortam dizini Git repository olarak tanımıyor.
Reset/checkout/init yapılmadı; mevcut kod, ham indirmeler, kaynak paketleri ve
kullanıcı dosyaları yerinde korundu. Aşağıdaki dosya listesi bu çalışmanın
kaydıdır; Git tarafından hesaplanmış tam diff değildir.

## İnceleme ve küçük değişiklik planı

AGENTS, README, progress, ürün/mimari/veri/lisans belgeleri; Expo Router
girişleri; tema/i18n; MapLibre renderer ve DOM köprüsü; zaman motoru;
dünya/pilot sağlayıcıları; arama, yer imleri, URL/paylaşım, tercih/cache
modülleri ve test/CI komutları incelendi. Başlangıç `npm run check` PASS:
295 ana + 5 worker testi. Plan: 2010 kaynağını gerçek geometriyle teşhis et;
yalnız kanıtlanabilen kaynak kusurlarını gider; kimlik kaybını düzeltip güvenli
sitelink açmayı bağla; mevcut zaman motoruna daha okunur ölçek ekle; sonra
regresyon, export ve lisans/kapsam kontrollerini raporla.

| Alan | Bulgu / yapılan işlem | Durum |
| --- | --- | --- |
| Harita motoru | Web doğrudan, Android tek Expo DOM üzerinden aynı MapLibre GL JS 6.14 globe çekirdeği. Projeksiyon/kamera/fiziksel taban değiştirilmedi | IMPLEMENTED; cihaz kabulü açık |
| Renk–sınır | Yanlış Fransa kapsamı ve aynı Hollanda geometrisinin iki kez çizilmesi düzeltildi | IMPLEMENTED; sınırlı geometri kanıtı |
| Afrika boşlukları | Ad/dönem, siyasi kapsam ve topoloji askıları ayrıldı; verisizlik tarihsel yokluk diye sunulmaz | PARTIAL; ilgili yeni veri BLOCKED |
| Ülke adı → makale | Kaynak QID'si korunur; yalnız kullanıcı tıklamasıyla mevcut Wikidata sitelinki çözülür | IMPLEMENTED; canlı ağ/tarayıcı NOT TESTED |
| Timeline | Belirgin yıl, erişilebilir slider, yuvarlak yıl cetveli, tüm dönem/200/20 yıl ölçeği | IMPLEMENTED; gerçek görsel kabul açık |
| Arama/yer imi/paylaşım | Yerel arama, kayıt kurtarma, URL whitelist ve kamera/yıl geri yükleme akışları korundu | Otomatik regresyon PASS; gerçek E2E NOT TESTED |
| Katmanlar/kaynaklar | Bağımsız filtreler, source/revision kapıları, kaynak kartları ve atıf erişimi korundu; askıdaki siyasi kayıtlar listede öne alındı | Otomatik regresyon PASS |
| Erişilebilirlik | Türkçe katalog, yıl etiketi, klavye slider davranışı, görünür odak ve mevcut 48px kontroller | PARTIAL; TalkBack/büyük yazı/ekran incelemesi açık |
| Cache/performans | Yeni link cache'i sınırlı; dünya geometrisi ham kaynaktan inceleme filtresiyle okunur | PARTIAL; FPS/GPU/RAM ölçülmedi |
| Güvenlik/lisans | Şemalı ID mesajı, URL kontrolü, timeout/boyut/istek sınırları, ayrı atıf kaydı | PARTIAL; Expo ham DOM/CSP/bağımlılık kapıları açık |

Chronas'ın [istenen bağlantısı](https://www.chronas.org/?type=area&value=Central+Sahara)
ve [resmî frontend](https://github.com/Chronasorg/chronas-frontend) /
[API açıklaması](https://github.com/Chronasorg/chronas-api) araştırıldı.
Canlı harita bu ortamda görsel olarak incelenemedi; birebir görünüm karşılaştırması
yapıldığı iddia edilmiyor. Haritadan alan seçme, yoğun bilgiyi isteğe bağlı
açma ve zamanla keşif işlevsel referanstır. Kod, geometri, görsel, font veya
marka kopyalanmadı. Kullanıcının istediği mevcut 3D Küre korunur.

## Renk uyuşmazlığının veri kaynaklı iki nedeni

**Fransa, satır 13247, “French Fifth Republic”, kaynak dönemi 1961–2023.**
19 parçalı kaynak geometrisi Fransa anakarası/Korsika yanında Cezayir/Sahra,
eski işgal alanları ve başka denizaşırı parçalar içeriyordu. Fransa'nın en büyük
parçası üzerinden hesaplanan ad konumu Sahra'ya düşebiliyor; Fransa dolgusu
Cezayir alanıyla üst üste geliyordu. Bu, renk paletini değiştirerek çözülmez.

[Fransız Savunma Bakanlığı tarih yayını](https://www.cheminsdememoire.gouv.fr/en/revue/1962-end-war-algeria-0)
ve [BM antlaşma kaydı](https://treaties.un.org/doc/Publication/UNTS/Volume%20507/v507.pdf)
1962 bağımsızlık bağlamını destekler.
[INSEE tanımı](https://www.insee.fr/fr/metadonnees/definition/c2315) ve
[2010 dönemine ait bölgeler belgesi](https://www.insee.fr/fr/statistiques/fichier/1288766/ter-1-2-1_regions_francaises.pdf)
anakara/Korsika kapsamını açıklamak için kullanıldı; bu kaynaklardan yeni
geometri alınmadı. Bunlar Cliopatria sınırlarının her kenarını doğrulamaz.

İnceleme v1.0.0 yalnız özgün bileşen **5 ve 6**'yı değiştirmeden tutar ve
`extentType: partial-area` olarak açıklar. Bu, Fransa'nın bütün alanı değildir;
çıkarılan her denizaşırı parçanın her yılda yanlış olduğu iddia edilmez.
Kaynakta tek aralık olarak verilen dönem bölünmedi veya uzatılmadı. Yeni
koordinat, modern sınırla kesme, snapping veya buffer uygulanmadı.

| Kontrol | SHA-256 |
| --- | --- |
| Özgün 19 parçalı geometri | `ba77ae4917239336786f40c490b2799d8ee5eb12fc26ded120f13a6150a2c824` |
| Bileşen 5 / Korsika | `45215622b5db18a04dbab8851a37bcce3a6df380837f65f3895bb7eb25571ab8` |
| Bileşen 6 / anakara | `7b32b21c725ddfe784d20600e6b03fa87269c3bd84f589be683fd1d9b07f4f9a` |

Hash veya beklenen ad/dönem değişirse inceleme hata verir; farklı girdiye aynı
istisna sessizce uygulanmaz. Türetilmiş bbox, arama/odak/kapsam sorgularında da
kullanılır. Ham manifest ve immutable assetler yeniden yazılmadı.

**Hollanda, satır 13116 ve 13120.** Aynı kaynak Q55, aynı 1950–2023 dönemi ve
aynı `5d295ca52bee1461cf46adf17daa61f86b57f690d64e17d624b94ce5915b8a4a`
geometrisi iki adla iki farklı renk alıyordu. `Netherlands` (13120) çizilir;
`(Netherlands)` (13116) kaynak kaydı, gerekçesi ve arama erişimi korunarak
yinelenen çizimden çıkarılır. Genel siyasi/kültürel örtüşmeler yasaklanmadı;
bu karar yalnız aynı kaynak kimliği/dönemi/geometrisinin bu kopyası içindir.

2010 Kuzey Afrika kontrolünde, 0–42 boylam / 10–34 enlem, 2 derece aralıkla
**286 nokta** örneklendi. Ham kaynaktaki 37 örtüşme örneği incelenmiş görünümde
0 oldu. [Tekrar üretilebilir rapor](application-review-2010/map-scene-2010.json).
Bu kaba örnekleme bütün dünya topolojisi, piksel düzeyinde dolgu/çizgi uyumu
veya tarihsel doğruluk sertifikası değildir. Ayrı kaynakların kıyı/genelleştirme
farkı sürer; onu modern geometriyle gizlemek için tarihî veri değiştirilmedi.

## 2010'da hangi boşluklar kaldı?

**191 kaynak siyasi satırı: 178 çizilebilir, 13 çizimden askıda.** Satır,
bağımsız ülke sayısı değildir; 13'ün biri yukarıdaki Hollanda kopyasıdır.
Fransa ayrıca kısmi alandır. Çok parçalı pilot nedeniyle geometrik feature
sayısı siyasi kaynak satırı sayısıyla aynı değildir.

| Kaynak kaydı | Açık sorun |
| --- | --- |
| Libyan Arab Republic (13580) | Kaynağın ad–dönem eşleşmesi incelemede; Mısır'ın batısına tahminî alan çizilmedi |
| Republic of Chad (13239), Republic of Tunisia (13374) | Halka kesişimi/geometri incelemesi; genel doğrulayıcı gevşetilmedi |
| Mali Federation (13234), Federal Republic of Somalia (13215) | Siyasi kapsam veya ad–dönem sorunu |
| Angola (13369), Eswatini (13400), Bahrain (13327) | Dönemle uyumsuz ad incelemesi |
| Netherlands Antilles, Kingdom of Great Britain, Estado Novo, Commonwealth | Kaynak kimliği/siyasi kapsam ayrımı; eksik ülkeyi başka kapsamla doldurma yok |

Askıdaki kayıtlar **Keşfet → Bu yılın siyasi kayıtları** içinde gerekçeli
görünür. “Veri desteklenmiyor” o ülkenin 2010'da var olmadığı anlamına gelmez.

Orijinal dünya manifesti: 13379 satır, 12949 çizilebilir kaynak satırı / 430
askıda. İnceleme filtresinden sonra **12948 çizilebilir / 431 askıda**;
374 kaynak asseti ve 120664555 byte değişmedi. 2000 için etkin sonuç
192/178/14; 2024 için 195/186/9. Eski `world:audit-2000` ham manifestin
192/179/13 sayımını denetler; etkin görünüm için `qa:map -- 2000` kullanılır.

4026 seçilebilir yılın 4024'ünde en az bir siyasi kaynak alanı vardır;
2025/2026'da yoktur. **Bu, her yılda bütün ülkeler var demek değildir.**
Pilot-only kapsam sayımı ise ayrı 67 kayıtlık kataloğu inceler; dünya
kaynağıyla karıştırılmaz. [Metaveri kapsam özeti](application-review-2010/world-coverage.json).

## Ülke adından güvenli Wikipedia açma

Özgün Cliopatria arşivinden 13375 geçerli QID, satır kimliği/ad/dönem eşleşmesi
ve ZIP hash'i doğrulanarak çıkarıldı; 4 satırda QID yok. Bu kimlikler upstream
adaylarıdır; yanlış kimlik veya tarih iddiasını bağımsız doğrulamaz.
Başlık alanından URL üretilmez. Çıkarım CC BY 4.0, ayrı NOTICE ve checksum taşır.

- Ülke **adına** tıklama: kaynak QID → mevcut `trwiki`, yoksa mevcut `enwiki`,
  ikisi de yoksa doğrulanmış Wikidata kaydı. Ülke **alanına** tıklama: kaynak
  kartı. Karttan aynı makale işlemi de kullanılabilir.
- Yalnız kullanıcı eylemi ağ isteği başlatır; arama metni/yıl/kamera gönderilmez.
  `wbgetentities`, `info|sitelinks/urls`, `trwiki|enwiki`; anonim `origin=*`,
  credentials omit, no-referrer ve API User-Agent. Hesap/anahtar gerekmez.
- QID, revision, gerçek URL, içerik türü, yönlendirme ve 256KiB yanıt sınırı
  kontrol edilir. Tek eşzamanlı istek, en az 1 saniye aralık, 8 saniye timeout;
  429/503 Retry-After bekleme, otomatik tekrar yok.
- 128 girişlik/24 saatlik oturum LRU yalnız doğrulanmış iki bağlantı/revizyonu
  tutar. Makale metni/görsel alınmaz. Yerel sabit sitelink pilotu korunur.
- Web'de tıklamada ayrılmış boş sekmenin opener'ı hemen kesilir; ağ sonrası
  yalnız allowlist hedefe gider. Hata/iptalde sekme kapanır. Native dış tarayıcı
  kullanır; harita WebView'i Wikipedia'ya yönlendirilmez.
- Köprü `entity.article` için yalnız ID, katalog sürümü ve görünüm revizyonu
  taşır; URL/HTML taşınmaz. Geç gelen yıl/istek sonucu iptal edilir; yıl/kamera
  kendiliğinden değiştirilmez.

[Resmî Wikidata erişimi](https://www.wikidata.org/wiki/Wikidata:Data_access),
[MediaWiki CORS](https://www.mediawiki.org/wiki/API:Cross-site_requests),
[User-Agent politikası](https://foundation.wikimedia.org/wiki/Policy:User-Agent_policy).
Bu ortamın terminal DNS'i API'ye ulaşamadı. Gerçek CORS/pop-up/referrer/native
dönüş doğrulaması açık; sentetik transport testleri canlı servis PASS değildir.
Üretim hosting CSP'si `connect-src https://www.wikidata.org` iznini gerçek
başlıkta kontrol etmelidir; yalnız yerel preview güncellendi. Akış bozulursa
kaynak kartı/Wikidata bağlantısı erişilebilir kalır.

## Tarih çizelgesi

Seçilen yıl butonu doğrudan MÖ/MS yıl girişini açar. Masaüstünde tüm dönem,
200 yıl ve 20 yıl seçimleri; dar ekranda kompakt ölçek çevrimi vardır. İnce
cetvel yuvarlak yılları gösterir; veri kapsamı olduğu iddiası taşımaz. Kaynak
snapshot işaretleri ayrı kalır. MÖ 1 → MS 1, yıl sıfırı reddi, önce/sonra,
oynatma hızı, manuel girdide durma ve kamera koruma akışları korunur. Reduced
motion tercihine yeni animasyon eklenmedi; cetvel ekran okuyucuda dekoratiftir,
seçilen yıl slider etiketiyle okunur.

## Gerçekten çalıştırılan kontroller

| Komut / kanıt | Sonuç |
| --- | --- |
| Başlangıç `npm run check` | PASS, 295 ana + 5 worker |
| Son `npm run check` | PASS, **304 ana + 5 worker**, lint, native/web strict TS, asset/source/checksum/lisans kapıları ve format |
| `node --test tests/unit/application-review.test.mjs` | PASS, 9 yeni test; API yanıtları yalnız açık etiketli sentetik fixture |
| `node --test tests/unit/world.test.mjs` | PASS, 18 test; 2000 için katı 178/14 ve 191 feature beklentisi |
| `node scripts/polity-identities.mjs --check` | PASS; mevcut özgün ZIP'ten aynı çıkarım/NOTICE üretimi |
| `npm run web:export` | PASS, 4 statik rota; tarayıcı açılışı değildir |
| `npm run android:bundle` | PASS, Hermes + DOM JavaScript export; APK/cihaz değildir |
| `npx playwright test tests/web/application-review.spec.ts --list` | 4 test listelendi; çalıştırılmadı. Production test komutuna da eklendi |
| `npm run test:web:production -- --list` | 42 test listelendi; gerçek browser koşusu değildir |
| Chromium launch | BLOCKED, sandbox `Operation not permitted`; ekran görüntüsü **0** |
| `npm run environment:check` | BLOCKED: Java/adb/ANDROID_HOME yok; Android **UNVERIFIED ON DEVICE** |
| `npm run qa:security` | 662 dosyada 0 desen isabeti; açık SEC-RAW-DOM var. Güvenlik kabulü değildir |
| `npm run qa:licenses` | 873 lock girdisi / 781 kök lisans dosyalı; dağıtım onayı false |
| `npm audit --json` | BLOCKED, registry EAI_AGAIN; güncel zafiyet sayısı doğrulanmadı |
| `npm run qa:coverage` | PASS, yalnız pilot kapsamı; dünya özeti ayrı |
| `npm run qa:map -- 2010` | PASS, lisanslı kaynak/inceleme geometrisi teşhisi; tam dünya doğruluğu değildir |
| `npm run cshapes:inspect -- --year 2010` | Araştırma PASS / DATA_REVIEW_REQUIRED: 180 aday, 177 geometri geçer, 3 incelemede; productionAllowed false |

İlk lintteki state/import sorunları, eski dünya sayımı beklentileri ve generated
format uyuşmazlığı düzeltilip tekrar çalıştırıldı. Test kaldırılmadı/eşik
gevşetilmedi. Loglar ve [komut envanteri](application-review-2010/commands.json)
başarısız ara sonuçları da korur. Son CLI/NOTICE ve belge düzenlemesinden sonra
`npm run check` yeniden PASS; runtime export'tan sonra uygulama kodu değişmedi.

Export dosya boyutları [ayrı ölçümde](application-review-2010/export-sizes.json).
Bunlar sıkıştırılmamış dosya sistemi toplamıdır; ilk ağ indirmesi, APK, FPS,
GPU RAM veya uzun kullanım profili değildir. Yaklaşık 20MB fiziksel JS ve büyük
uygulama girdisi performans riski olarak kalır; cihaz kanıtı olmadan kapanmaz.

## Değişen dosyalar

- Veri: `src/data/world/{review,repository,provider,timeline}.ts`;
  `src/sources/polity-identity.ts`, `src/sources/generated/polity-identities.ts`;
  `scripts/{polity-identities,check-polity-identities}.mjs`,
  `assets/licenses/Cliopatria-identity-NOTICE.txt`, `scripts/qa/map-scene.mjs`.
- Bağlantı: `src/sources/{live-sitelinks,open-article,article-navigation,article-tab.web,article-tab.native,catalog}.ts`;
  `src/map-contract/{protocol,viewport}.ts`, `src/map/useGlobeHost.ts`,
  `src/map/globe/{renderer,GlobeView,political-labels}`.
- UI: `src/atlas/{AtlasScreen,PolityCard,SourceActions,AttributionPanel,TimelineBar,TimelineRuler,YearSlider.web,YearSlider.native}.tsx`,
  `src/atlas/year-slider.css`, `src/timeline/ruler.ts`, `src/i18n/tr.ts`.
- Kalite/gizlilik: `src/privacy/policy.ts`, `env.example`, `package.json`,
  `scripts/qa/serve-export.mjs`, `tests/run.mjs`,
  `tests/unit/{application-review,world}.test.mjs`, `tests/web/application-review.spec.ts`.
- Belgeler: README, THIRD_PARTY_NOTICES, ETL README; ürün/mimari/veri kalitesi/
  lisans/gizlilik/yayın engelleri/progress; bu rapor ve kanıt klasörü.

Yeni bağımlılık, lockfile değişikliği, ücretli servis, rota ürünü veya modern
siyasi geometri eklenmedi. Eski yer imleri/paylaşım/katman özellikleri silinmedi.

## Kullanıcının yapabilecekleri ve kalan engeller

Bu düzeltmeler için **yeniden veri indirmek gerekmez**. Proje kökünde:

```sh
npm run web -- --clear
```

Yılı **MS 2010** yapın; Cezayir/Sahra üzerindeki yanlış Fransa rengi/adının
kalktığını ve Hollanda'nın tek renkle çizildiğini inceleyin. Ülke adına tıklama
makaleyi, alanına tıklama kaynak kartını açmalı. İlk bağlantıda internet gerekir;
pop-up engellenirse karttaki makale/Wikidata işlemini kullanın. Cetvelde
200/20 yıl ölçeğini, MÖ 1/MS 1 geçişini, oynatma sırasında manuel seçimi ve
arama/yer imleri/paylaşımı kontrol edin. Küre kamera durumu korunmalıdır.

```sh
npm run check
npm run qa:map -- 2010
npm run cshapes:inspect -- --year 2010
npm audit
```

Mevcut CShapes dosyasında Libya/Çad/Tunus adayları geometri denetimini geçiyor;
bu tek başına üretim izni/tarihsel doğruluk değildir. [Resmî CShapes](https://icr.ethz.ch/data/cshapes/)
**CC BY-NC-SA 4.0**; ticari olmayan/aynı lisans koşulları, yerel dosyanın kökeni,
saat dilimsiz export tarihleri ve eksik siyasi statü incelenmeli. Bu turda
CShapes verisi üretime taşınmadı. Dosyayı tekrar indirmek bu kararları çözmez.
Historical Basemaps **BLOCKED FOR REDISTRIBUTION**; OHM nesne/üye lisans kapısı sürer.

Yayın öncesi açık kapılar: gerçek browser/görsel E2E, canlı Wikidata CORS ve
pop-up, Expo ham DOM parse/dispatch, gerçek hosting CSP/origin, güncel bağımlılık
audit/NOTICE, kaynak doğruluğu, erişilebilirlik ve fiziksel Android. Android
için README'deki JDK/SDK/USB adımlarından sonra `npm run environment:check` ve
`npm run android:device`; touch/pinch/rotation/back/offline/tarayıcıdan dönüş ve
uzun süreli GPU/bellek ölçümü gerekir. [Güncel yayın engelleri](../release-blockers.md).
