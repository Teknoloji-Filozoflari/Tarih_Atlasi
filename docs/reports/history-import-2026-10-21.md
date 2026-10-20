# İndirilen dünya tarihi verisinin alınması — 21 Ekim 2026

**IMPLEMENTED:** 4.273 indirilmiş entity JSON dosyası ve sorgu makbuzları
incelendi; 4.053 yeni kişi/olay mevcut uygulamaya bağlandı. Yeni indirme
gerekmiyor. **PARTIAL:** bu dosyalar bütün dünya tarihi, bütün bilim insanları,
filozoflar, liderler veya eksiksiz resmî Nobel/TIME envanteri değildir.

## Sonuç

| Ölçü | Yeni ek | Uygulama toplamı |
| --- | ---: | ---: |
| Kişi profili | 2.969 | 3.203 |
| Savaş/muharebe/antlaşma/diğer olay | 1.084 | 1.120 |
| Yalnız doğum yılına özel yaklaşık şehir noktası | 46 | 193 |
| Ek yaklaşık muharebe referans noktası | 35 | Eski olay noktaları ayrıca korunur |

Yeni olay türleri: 483 BATTLE, 489 WAR, 1 TREATY, 111 OTHER. Kaynak grubundan
bağımsız doğrudan P31 sınıfı dikkate alınarak üç muharebenin türü düzeltildi.
Modern devlet sınırı, tarihî kültür polygonu, başkent veya bayrak eklenmedi.
Yeni kişilerin 2.923'ünde kabul edilmiş harita konumu yok; arama/kısa kart ve
varsa Wikipedia bağlantısıyla erişilirler. Yeni olayların 1.049'unda geometri
yok; destekli tarihi varsa yıl listesinde, tarihi belirsizse aramada bulunurlar.

### Paketlenmeyen 220 kayıt

| Neden | Sayı | İşlem |
| --- | ---: | --- |
| Önceki incelenmiş kişi/olay zaten var | 51 | Eski ID, bilgi, kaynak ve konum korunur |
| Kullanılan tr/en ad alanlarında uygun ad yok | 123 | Kaynak incelemesinde tutulur; isim uydurulmaz |
| Kurgu/efsane veya P1441 bağlamı ek inceleme gerektiriyor | 12 | Tarihsel olgu gibi paketlenmez |
| İnsan değil ve uygun olay grubunda değil | 34 | Kurum/grup kişi doğum kaydına çevrilmez |

Örnek karantina: Macross evrenindeki Space War I (Q11602081). P1441'in varlığı
tek başına bir gerçek kişinin kurgusal olduğunu kanıtlamaz; bu nedenle bu
satırlar “ek inceleme”dir. Kaynak dosyaları silinmedi. [Her dışlama nedeni ve
makine özeti](history-import-2026-10-21/summary.json),
[girdi envanteri ve kaynak SHA256'ları](history-import-2026-10-21/input-audit.json).

### İndirilen gruplar

| Grup | İndirilen benzersiz aday | Yeni kabul | Eski kayıt korundu |
| --- | ---: | ---: | ---: |
| Nobel | 1.032 | 948 | 40 |
| TIME | 50 | 34 | 10 |
| Filozof | 2.000 | 1.944 | 3 |
| Ruhban/dinî meslek | 50 | 50 | 0 |
| Muharebe | 500 | 480 | 0 |
| Savaş | 500 | 492 | 1 |
| Tarihî olay | 500 | 443 | 0 |

Gruplar örtüşür; sütunlar toplanarak toplam kişi/olay sayısı bulunamaz.
Sorgu limiti ve QID sıralaması “en önemli kişiler” sıralaması değildir. Bu
indirmede bilim insanları/siyasetçiler/genel kişi için ayrı tamamlanmış grup
envanteri yok; Nobel/filozof/diğer gruplardaki uygun kişiler yine dahil edildi.
Nobel/TIME sonuçları Wikidata'daki mevcut P166 iddialarıdır; eksiksiz resmî
ödül diziniyle bağımsız eşleştirme yapılmış değildir. Ödül bir övgü etiketi
olarak kullanılmadı; TIME, New York Times diye adlandırılmadı.

## Tarih ve konum doğruluğu

- Her JSON/makbuz normal dosya, boyut, SHA256, HTTPS API URL'si, request hash,
  entity ID/revizyonu ve CC0 kapsamıyla kontrol edilir. Sorgu sonuçları beklenen
  sınıf sorgusu ve sıralı QID'lerle karşılaştırılır; checkpoint onay kaynağı değildir.
- Üretim kaynağı her kayıt için oldid URL, ham input hash/byte/path, locator,
  dönüşüm sürümü, atıf ve confidence=medium taşır. “Verified” kaynak/protokol
  incelemesidir; bağımsız akademik tarih doğrulamasının bittiği anlamına gelmez.
- Normal/preferred kaynak statement'larında çelişen yıllar, yüzyıl/onyıl,
  before/after ve qualifier bulunan zamanlar rastgele yıl yapılmaz. Bilinmeyen
  gün/ay tam gün olarak gösterilmez; özgün takvim/qualifier/reference bilgisi
  kaynak metni ve checksum ile bağlanan orijinal yanıtta korunur.
- Wikidata **JSON** MÖ numaralaması -0001=MÖ1'dir; RDF/SPARQL astronomik
  numaralamasıyla karıştırılmadı. Yıl sıfır ve geçersiz günler reddedilir.
  Julian yıl kaynak metninde korunur, kesin Gregorian doğum yılına çevrilmez.
  Kaynak: [Wikidata tarih modeli](https://www.wikidata.org/wiki/Help:Dates).
- 1.865 yeni kişinin yaşam aralığında en az bir sınır belirsiz/eksik, 332 yeni
  olayın yılı/aralığı bu kurallarla çözümlenemiyor. Bu, kişinin/olayın tarihsel
  olarak bulunmadığı anlamına gelmez; sırf addaki rakamdan yıl çıkarılmadı.
- 46 doğum: tek referanslı P569/P19 + belirsiz olmayan Gregorian yıl + önceki
  kaynak hash'i pinlenmiş şehir P625. Nokta şehir temsilidir; doğum evi/GPS
  veya yaşam boyunca ikamet değildir. Ada/krallık/bölge merkezi kullanılmadı.
- 35 muharebe: tek, referanslı Earth P625, makul koordinat aralığı/hassasiyeti
  ve destekli olay tarihi gerekir. Savaş/antlaşma koordinatı uydurulmadı.
- Wikipedia sadece API'deki mevcut trwiki, sonra enwiki; başlıktan URL üretimi
  yoktur. İkisi de yoksa Wikidata fallback. Makale metni, portre ve rota alınmadı.

## Uygulama ve boyut

338 lisans/şema/hash kontrollü `.atlas` parçası, toplam **32.177.954 byte**;
indekste 4.053 ad/tür/yıl/paket özeti. Ayrıntı ve geometriler ihtiyaçta yüklenir;
200 MB ham indirme açılış JS'ine gömülmez. Paket ≤256 KiB; cache en fazla8
paket; okuma eşzamanlılığı2. Bunlar kod/test sınırlarıdır, cihaz RAM/FPS ölçümü
değildir. Eski 800/1.000 kayıt sınırları gevşetilmedi.
[ADR](../adr/0019-indexed-history-catalog.md).

Genel arama ve kişi listesi yeni kayıtları sayfalar; kaynak kartları orijinal
input/revizyonu çözer; 128 girişlik sitelink cache'i ve iptal/yıl kontrolleri
korunur. Yıl değişikliği kamerayı kendiliğinden değiştirmez. Modern şehir/yol,
ülke renkleri, kişisel notlar, yer imleri ve paylaşım akışları korunur.
Eski 179 yayımlanmış isim eşleşmesinde kayıp **0**; eski 823 istekten artık
220 eşleşmiş, 594 bekleyen ve 9 belirsiz atlanan ad var.

## Çalıştırma ve kontroller

```bash
npm run web -- --clear
npm run history:check
node scripts/history/check.mjs --with-raw
```

Aramada **Aziz Sancar**, **Svante Pääbo**, **Novšiće** veya **nobel** denenebilir.
Paketlenmiş kayıtlar için yeniden indirme gerekmez. `history:audit` yalnız ham
dosyaları denetler. `history:prepare`, yeni dosyaları kendiliğinden onaylamaz;
incelenmiş girdi pininin değişmesi gerekir. İleride daha çok kişi noktası için
eksik P19 yer varlıklarının ayrıca kaynak/ölçek/koordinat incelemesi gerekir.

Test ve komut sonuçları [checks.json](history-import-2026-10-21/checks.json)
ve aynı klasördeki loglarda tutulur. Tarih/kalender, checksum/lisans/origin,
kurgu kayıt, lazy arama, sayfalama, eski Atatürk/siyasi bağlam, kaynak eşleşmesi,
bütün46doğum, bağımsız katman ve cache/iptal regresyonları otomatik testtedir.

| Kontrol | Sonuç | Kanıt |
| --- | --- | --- |
| `npm test` | **PASS 408/408**, skip0 | [Log](history-import-2026-10-21/tests.log) |
| `npm run typecheck` | **PASS** native/web strict | [Log](history-import-2026-10-21/typecheck.log) |
| `npm run lint` | **PASS**, 0 uyarı | [Log](history-import-2026-10-21/lint.log) |
| `node scripts/history/check.mjs --with-raw` | **PASS**, 338 paket + orijinal kaynak/sitelink/yer girdileri | [Log](history-import-2026-10-21/source-check.log) |
| `npm run test:worker` | **PASS 5/5** | [Log](history-import-2026-10-21/worker.log) |
| Değişen kod/metadata/README `prettier --check` | **PASS** | [Log](history-import-2026-10-21/format.log) |
| `npm run web:export` | **PASS**, 4 rota; mevcut16.102şehir paketi de doğrulandı | [Log](history-import-2026-10-21/web-export.log) |

İlk lint denemesinde Node Buffer importu ve type-import biçimi düzeltildi;
kurallar gevşetilmedi. Eski üretilmiş dosyaların temizliğiyle çakışan lint
ENOENT denemesi, dosyalar sabitlendikten sonra yeniden çalıştırıldı. Son lint
komutunun sonucu kontrol kaydında ve `lint.log` içindedir.

**BLOCKED:** yeni web E2E üretim preview `EPERM` ile başlamadı. İki platform
senaryosunun listelenmesi çalıştırılmış test değildir; ekran görüntüsü alınamadı.
**INCOMPLETE:** Android JS export `--max-workers 2` ile denendi; Metro başlangıcı
sonrası tamamlanma kanıtı alınamadı, durduruldu (exit130). Başarılı APK/JS export
veya gerçek cihaz performansı iddiası yok. **UNVERIFIED ON DEVICE:** Android
dokunma, GPU, yön değişimi, bellek, background ve TalkBack.

Yeni dış bağımlılık yok. [Wikidata yapılandırılmış veri lisansı](https://www.wikidata.org/wiki/Wikidata:Licensing)
CC0; Wikipedia/Commons/tile/kod hakları ayrıdır. Bildirim:
`assets/licenses/Wikidata-history-NOTICE.txt`. Historical Basemaps dağıtım
engeli ve mevcut OHM nesne lisansı kapıları aynen sürer.

## Değişen dosya grupları

- `scripts/history/{import,normalize,births,check}.mjs`, `package.json`:
  kontrollü kabul, kaynak karşılaştırması ve CI check.
- `src/history/{types,policy,repository,provider,timeline,search,persons,link-cache,runtime,reader.*}.ts`,
  `src/history/generated/*`, `assets/history/*`, `data/history/manifest.json`:
  küçük paketler, indeks, iki platform okuyucusu, pin ve bounded cache.
- `src/data/{application-core,application,application-runtime}.ts`,
  `src/map/globe/application-loader.ts`: mevcut akışa bağlama ve kaynak temizliği.
- `src/discovery/search.ts`, `src/sources/{repository,catalog,open-article}.ts`:
  henüz yüklenmemiş arama kaydı, lazy kaynak/sitelink; güvenli harici bağlantı.
- `src/people/discovery.ts`, `scripts/people/requests.mjs`, üretilmiş istek
  kataloğu/kapsam raporları: yeni isimler ve kalıcı ID eşleşmesi.
- `src/atlas/AttributionPanel.tsx`, `src/i18n/tr.ts`, lisans NOTICE:
  Türkçe atıf ve mevcut ayrı kaynak sicili.
- `tests/unit/history-import.test.mjs`, `tests/web/history-import.spec.ts`,
  `tests/run.mjs`, iki mevcut kapsam testi; `.prettierignore` byte koruması.
- README, progress, architecture/ADR, veri kalite/kapsam/kaynak/lisans belgeleri,
  bu rapor ve kanıtları.

`git status --short` exit128: dizinde `.git` yok, git diff üretilmedi. Kullanıcı
dosyaları ve ham indirmeler korundu. Yalnız bu çalışmanın geçici, hash'i doğrulanan
ve mevcut manifestte kullanılmayan üretilmiş parçaları temizlendi. Sonraki faza
geçilmedi; bu işlem indirilen mevcut kaynakların kabulüdür.
