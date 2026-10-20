# ADR-0002 — Backend gerektirmeyen sürümlü statik katalog

Tarih: 2026-10-15 · Durum: **PROPOSED**.

## Bağlam ve karar

Hesapsız atlasın çalışması, canlı kamu API'lerinin kota ve erişilebilirliğine bağlı olmamalı. Başlangıç önerisi, önceden doğrulanmış ve lisansları çözümlenmiş küçük statik katalogdur. Statik HTTPS barındırma olabilir; kullanıcı hesabı veya çalışan uygulama backend'i zorunlu değildir.

Katalog manifesti şema sürümü, katalog sürümü, içerik hash'leri, hak sicili sürümü, üretim zamanı, kaynak revizyonları ve [kapsam durumlarını](../coverage-strategy.md) içermeli. Veri bölge/zaman/katmana göre küçük parçalara ayrılır; istemci yalnız gerekli parçaları yükler. Katalog sürümü harita çekirdeği sürümünden bağımsızdır. Geçersiz şema/hash veya eksik hak kararı yeni kataloğu reddeder; son geçerli sürüm ve görünür hata bilgisi korunur.

API alımı geliştirici/veri hazırlama sürecindedir; ürün ekranı her tarih değişiminde OHM/WDQS çağırmaz. İlk küçük pilot paket içi olabilir. Tam dünya yüksek ayrıntılı offline arşivi taahhüt edilmez; ağsız kaynak ve atıf erişimi korunur. İleride büyük katalog ihtiyacı varsa önce parçalara ayırma/cache ölçülür; backend ayrı ADR gerektirir.

## Alternatif ve maliyet

Canlı API sorgusu daha yeni veri sağlayabilir ama tutarsız sürüm, quota, CORS, bağlantı ve hak değişimi risklerini kullanıcıya taşır. Veritabanı/backend bakım ve hizmet bağımlılığı ekler. Statik katalog seçimi güncelleme sıklığını azaltır; her sürüm için kaynak incelemesi ve barındırma yükü gerekir.

## Doğrulama

Gelecek testler: ağsız pilot açılışı, bozuk hash, şema sürüm uyumsuzluğu, yarım indirme, eski sürüme dönüş, iptal edilen tarih yüklemesinin yeni seçimi bozmaması ve beklenmeyen API isteği bulunmaması. Limitler [kaynak alım planında](../source-matrix.md), mesaj limitleri [mimaride](../architecture.md). Faz 00'da katalog veya indirme kodu oluşturulmadı.
