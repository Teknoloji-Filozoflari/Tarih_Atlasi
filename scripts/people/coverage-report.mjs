import { readFile, writeFile } from 'node:fs/promises';
import { peopleManifest as initial } from '../../src/people/generated/index.ts';
import { peopleManifest as expanded } from '../../src/people/expanded/index.ts';
import { peopleManifest as ottoman } from '../../src/people/ottoman/index.ts';
import { requestedPeople } from '../../src/people/generated/requests.ts';

const root = new URL('../../', import.meta.url);
const escape = (s) =>
  String(s ?? '—')
    .replaceAll('|', '/')
    .replaceAll('\n', ' ');
const selected = new Map(
  [...initial.selected, ...expanded.selected, ...ottoman.selected].map((p) => [p.qid, p]),
);
const sourceUrl = (p) =>
  'https://www.wikidata.org/w/index.php?title=' + p.qid + '&oldid=' + p.sourceRevision;
const support = (p) =>
  !p
    ? 'Yeni nokta yayımlanmadı'
    : p.annualBirth
      ? 'Yalnız doğum yılında yaklaşık nokta: MS ' + p.birth[0]
      : p.geometryAvailable
        ? 'Yalnız biyografik; kesin yıl noktası yok'
        : 'Doğum geometrisi doğrulanmadı; nokta yok';
const path = new URL('docs/reports/requested-people-coverage.md', root);
let old = await readFile(path, 'utf8');
old = old.replace(
  '111yayımlanmış profil eşleşmesi,\n698kaynak incelemesi bekleyen kişi',
  '144yayımlanmış profil eşleşmesi,\n665kaynak incelemesi bekleyen kişi',
);
old = old.replace(
  '## Bu görevde eklenen29kişinin kaynak incelemesi',
  '[Son eklenen 33 Osmanlı profili ve belirsizlik düzeltmeleri](ottoman-people.md).\n\n## Önceki ek 29kişinin kaynak incelemesi (güncel kararlar)',
);
old = old.replace(
  '| I. Süleyman | MS 1494 | Trabzon | Yalnız doğum yılında yaklaşık nokta |',
  '| I. Süleyman | Yaklaşık MS 1494; 1496 alternatifi | Trabzon | Yalnız biyografik; yıllık nokta yok |',
);
const start = old.indexOf('| Ad | Durum | Kaynaklı profil / QID | Harita desteği |');
if (start < 0) throw new Error('COVERAGE_TABLE_MISSING');
const rows = requestedPeople.records.map((r) => {
  const p = selected.get(r.wikidataId);
  return (
    '| ' +
    [
      r.name,
      r.status === 'published'
        ? 'Kaynaklı profil yayımlanmış'
        : r.status === 'skipped-unresolved-identity'
          ? 'Kullanıcı isteğiyle atlandı; kimlik belirsiz'
          : 'Kaynak incelemesi bekliyor',
      p ? '[' + p.qid + '](' + sourceUrl(p) + ')' : '—',
      support(p),
    ]
      .map(escape)
      .join(' | ') +
    ' |'
  );
});
await writeFile(
  path,
  old.slice(0, start) +
    '| Ad | Durum | Kaynaklı profil / QID | Harita desteği |\n|---|---|---|---|\n' +
    rows.join('\n') +
    '\n',
);
const raw = JSON.parse(
  await readFile(new URL('data/people/ottoman-raw/browser-review.json', root)),
);
const places = new Map(raw.places.map((p) => [p.qid, p]));
const newRows = ottoman.selected.map((p) => {
  const place = places.get(p.placeQid);
  const links =
    '[' +
    p.qid +
    '](' +
    sourceUrl(p) +
    ')' +
    (place
      ? '; [yer ' +
        place.qid +
        '](https://www.wikidata.org/w/index.php?title=' +
        place.qid +
        '&oldid=' +
        place.revision +
        ')'
      : '');
  return (
    '| ' +
    [p.name, p.birth ? 'MS ' + p.birth[0] : 'Bilinmiyor', p.place, support(p), links, p.note]
      .map(escape)
      .join(' | ') +
    ' |'
  );
});
await writeFile(
  new URL('docs/reports/ottoman-people-coverage.md', root),
  [
    '# Osmanlı kişi kayıtları — kaynak ve karar dökümü',
    '',
    '18 Ekim 2026. Ek paket 33 profil içerir. Önceki Osman Gazi, II. Mehmed ve I. Süleyman ile kullanıcı listesindeki **36 padişahın tamamı kaynaklı profil** olarak erişilebilir. Saltanat, başkent, ikamet veya sefer verisi eklenmedi. Profilin bulunması, kesin doğum konumunun bulunduğu anlamına gelmez.',
    '',
    '22 yaklaşık doğum-yılı noktası, 8 yalnız biyografik yer ilişkisi ve 3 noktası olmayan profil. Yalnız biyografik kararlarda kaynak yılı kesin takvim yılı iddiası değildir. Noktalar şehir/site temsilidir, doğum odası veya kişinin tam konumu değildir. Her bağlantı gerçek incelenen revizyona gider. Ham kaynak iddiası, üretime kabul edilen konumdan ayrıdır.',
    '',
    '| Kişi | Kaynak doğum yılı | Kaynağın yer iddiası | Yayın kararı | Değişmez kaynaklar | İnceleme notu |',
    '|---|---|---|---|---|---|',
    ...newRows,
    '',
    '## Önceki kataloglarda doğruluk düzeltmesi',
    '',
    '- Kanuni (Q8474): Wikidata 1494; [TDV Süleyman I](https://islamansiklopedisi.org.tr/suleyman-i) 1496 alternatifini de aktarır. Trabzon ilişkisi biyografiktir; kesin 1494 doğum noktası kaldırıldı. Profil ve kaynak bilgisi korunur.',
    '- Büyük Konstantin (Q8413), Papa II. Urban (Q30578): ham P569 içinde circa.',
    '- Martin Luther (Q9554): ham P569 içinde disputed.',
    '- Beethoven (Q255): ham P569 içinde presumably.',
    '',
    'Bu dört kayıtta kaynak niteleyicisi daha önce doğum zamanı alanına taşınsa da yıllık nokta kararıyla tutarsızdı. Üretici artık bu niteleyicilerde biyografik ilişki üretir; ham kaynaklar ve kişilerin kimlikleri silinmedi. Revizyonlar [bütün istekler tablosundadır](requested-people-coverage.md).',
    '',
    'TDV yalnız araştırma/çapraz kontrol referansıdır. Makale metni, resim veya geometri kopyalanmadı; Wikidata olgularının CC0 statüsü TDV metnine uygulanmaz. Wikipedia bağlantıları mevcut sitelink servisiyle kullanıcı eyleminde çözülür; başlıktan tahmin edilmez.',
    '',
  ].join('\n'),
);
console.log('Coverage reports updated from reviewed manifests and request registry.');

// Keep the original 113-person source table current while preserving its review notes.
const originalPath = new URL('docs/reports/person-birth-coverage.md', root);
let original = await readFile(originalPath, 'utf8');
original = original
  .replace('release 1.0.0-births.', 'release 1.0.1-births (belirsizlik düzeltmesi).')
  .replace(
    '111 profil / 66 doğum-yılı noktası / 20 yalnız biyografik yer ilişkisi /',
    '111 profil / 62 doğum-yılı noktası / 24 yalnız biyografik yer ilişkisi /',
  );
const corrections = new Set(['Q8413', 'Q9554', 'Q255', 'Q30578']);
original = original
  .split('\n')
  .map((line) => {
    if (
      !line.startsWith('| ') ||
      ![...corrections].some((qid) => line.includes('[Kişi ' + qid + ']'))
    )
      return line;
    const cells = line.split(' | ');
    cells[1] = 'Yaklaşık ' + cells[1].replace(/^Yaklaşık /u, '');
    cells[3] = 'Yalnız biyografik; P569 belirsizliği nedeniyle yıllık nokta yok';
    return cells.join(' | ');
  })
  .join('\n');
const correctionNote =
  '\nGüncel düzeltme: Büyük Konstantin / II. Urban (circa), Luther (disputed) ve\nBeethoven (presumably) yalnız biyografik ilişkilerdir; aşağıdaki eski inceleme\nnotlarındaki temsil noktası ifadesi yıllık konum desteği sayılmaz.\n[Karar ve testler](ottoman-people.md).\n';
if (!original.includes('Güncel düzeltme: Büyük Konstantin')) original += correctionNote;
await writeFile(originalPath, original);
