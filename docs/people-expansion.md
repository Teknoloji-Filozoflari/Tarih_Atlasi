# Geniş kişi listesi — kullanım ve kaynak edinimi

18 Ekim 2026 · **PARTIAL**. Gönderilen952ad geçişi korunur; tekrar/yazım
eşleştirmesi ve açık grup üyeleri ayrıldıktan sonra823ayrı istek vardır.
**823doğrulanmış harita kişisi değildir.** Yeni listeden144kişi kaynaklı
profillerle eşleşir;665kişi için kaynak incelemesi bekler. Beş müzik grubu kişi
doğum kaydı değildir. Kullanıcının son talebiyle kimliği ayrıştırılamayan9ad
atlanır; aramada/haritada yayımlanmaz. Zenon **Elealı Zenon** olarak çözüldü.

İlk ek29profilin ardından33Osmanlı profili ve22doğum-yılı noktası eklendi.
36padişahın tamamı kaynaklı profildir. Belirsizlik denetimiyle beş eski yıllık
nokta biyografik sınıfa düzeltildi. VanGogh dahil174profil; yaklaşık doğum-yılı
noktası toplam109. [Kaynaklar ve gerçek testler](reports/ottoman-people.md).
ElealıZenon ve OsmanGazi yalnız biyografik yer ilişkisidir; İsmetİnönü yapısının koordinatı
doğrulanamadığı için bu profilde doğum noktası yoktur. Yaşam dönemi, ikamet,
güncel konum ve devlet görevi doğumdan veya istek kategorisinden çıkarılmaz.

## Şimdi görme

```sh
npm run people:expanded:check
npm run people:ottoman:check
npm run web -- --clear
```

Arama→**Fatih Sultan Mehmed** veya **II. Mehmed**→karttaki **Doğum yılına git ve
yaklaşık konumu aç**→1432→isteğe bağlı konuma odaklan. CahitArf1910,
Tesla1856,Turing1912,Messi1987,Ronaldo1985 ve II.Selim1524 de denenebilir. Yaklaşık kişi konumu
varsayılan kapalıdır; açık eylemle açılır. Diğer filtreler korunur. Yıl değişince
doğum noktası kaybolur; kişinin bütün yaşamına yayılamaz. Ölümü bilinmeyen
kişiye yapay ölüm yılı veya sonsuz yaşam dönemi yazılmaz.

## Kalan isimler için terminalden kaynak indirme

Bu ortamın terminalinde Wikidata DNS çözümü `EAI_AGAIN` ile engelli; büyük
liste için API kaynağı alınamadı. Küçük yayımlanan ek katalog, araştırma
tarayıcısında resmî sayfalar incelenerek oluşturuldu. Kalan665kişinin incelendiği
veya haritaya eklendiği iddia edilmez. Kaynağa erişememek, kişinin Wikipedia'da
bulunmadığı anlamına gelmez.

İndirici gerçek iletişim içeren geliştirici User-Agent ister. API anahtarı veya
hesap gerekmez; bu kimliği `EXPO_PUBLIC_` içine koyma. İletişim bilgisi yalnız
Wikimedia istekleri ve gitignored stagingreceipt için kullanılır.

Proje kökünde Bash ile:

```sh
read -r -p "Wikimedia için iletişim e-postan veya proje URL’n: " ATLAS_WIKIMEDIA_CONTACT
export WIKIDATA_USER_AGENT="TarihAtlasi/0.1.0 ($ATLAS_WIKIMEDIA_CONTACT)"
npm run people:requests:collect -- --limit 1000
npm run people:requests:collect -- --verify
```

Sahte iletişim yazma. E-posta ya da gerçek proje adresi yazabilirsin. Adres,
yayınlanan uygulama verisine kopyalanmaz. Varsayılan limit25, açık üst sınır1000;
aynı anda1istek, en az1snara,5sonuçluTR/ENarama,15sntimeout,429/503/maxlag
backoff veençok3deneme. Her JSONençok4MiB, arama yanıtı256KiB. Çok sayıda kişi
olduğu için işlem uzun sürebilir; sabit süre veya boyut garantisi yoktur.
Kesilirse aynı komut hash doğrulamalı cache/per-request kayıtlardan devam eder.
`--verify` ağ isteği yapmaz; indirilmemiş/bozuk girdide açıkça durur.

Çıktı `data/staging/people-requests/`: kişi ve P19yerlerinin kaynak JSON'ları,
lisans/SHA/boyut/revizyon receipt'leri, requestbaşına `.review.json` ve toplama
raporu. **UNVERIFIED / productionApproved=false** kalır. İlk arama sonucu
otomatik doğru kabul edilmez; tam ad/alias eşleştirmesi ve P31=human kontrolü
vardır. Eşleşen kimlik bile doğum tarihi/konum kanıtının tarihsel doğruluğu
onayı değildir. Kaynak qualifier/rank/reference/sitelinkler ham JSON'da korunur.

İndirme **haritayı otomatik doldurmaz**. Sonrasında P569/P19kaynaklarının,
tarih belirsizliğinin, P625yer ölçeğinin ve çelişkilerin incelenip yeni bounded
kataloglara onaylanması gerekir. Mevcut ek çalışma onaylı29+33yeni kişiyi
yayınlar; bütün665kişiyi runtime'a alma henüz tamamlanmış değildir. Mevcut
800birleşikrecord/1000timeline bütçeleri yükseltilmedi; tam büyük üretim
içeriği için mevcut chunk mekanizmasına bağlı ek indeksleme işi gerekir.
Güvenli staging toplaması bu mimari önkoşulu tamamlanmış saymaz.

## Kaynak, lisans ve doğrulama

Wikidata yapılandırılmış verisi[CC0](https://www.wikidata.org/wiki/Wikidata:Licensing).
Wikipedia makale metni ve Commons portre hakları ayrıdır; içe aktarılmadı.
Önceki ek1.1.1-births:29kişi+28yer+4editöryal kaynak,4katalog/335744byte.
Yeni1.2.0-births:33kişi+12kullanılan yer+5editöryal kaynak,5katalog/369289byte;
en büyük92277byte. Gerçek QID/oldid, iki hamSHA ve hak/atıf onayı gerekir.
256KiBpaket ve eski512KiBpilot/64girdi sınırları korunur. Hamkaynaklar:
`data/people/expanded-raw`, `data/people/ottoman-raw`; üretim manifestleri
`data/people/expanded-production`, `data/people/ottoman-production`.
İstek metni/özet:`data/people/raw/expanded-request.txt`,
`data/people/production/requests.json`. Kullanıcı yazılışları yalnız arama
ipucudur; kaynağa ait tarihî alternatif ad diye profile eklenmez.

`people:requests:prepare` istek indeksini; `people:expanded:prepare` ve
`people:ottoman:prepare` ilgili onaylı katalogları yeniden üretir. HamSHA
değişirse otomatik onay yoktur.
`people:expanded:check` tekrar üretim/lisans/hash/atıf/NOTICE ve bütün isimlerin
hesabını doğrular. [Her isim için gerçek durum](reports/requested-people-coverage.md),
[güncel dosya/komut/test/Android raporu](reports/ottoman-people.md).
