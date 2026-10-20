import { isWikipediaSitelink } from '../../src/domain/sitelink.ts';
export const HISTORY_VERSION = '1.0.0-history';
export const HISTORY_POLICY = 'wikidata-json-conservative-1';
export const ATTRIBUTION =
  'Wikidata katkıda bulunanlar · CC0-1.0 · yapılandırılmış kaynak iddiası; bağımsız tarihsel doğrulama değildir.';
const bound = (year) =>
  year === null
    ? { kind: 'unknown', date: null }
    : { kind: 'known', date: { year, month: null, day: null } };
export function extent(
  start = null,
  end = null,
  text = 'Kaynak tarih kapsamı doğrulanmadı.',
  uncertain = true,
  precision = 'unknown',
) {
  return {
    start: bound(start),
    end: bound(end),
    precision,
    uncertain,
    calendar: 'proleptic-gregorian',
    yearNumbering: 'historical-no-zero',
    sourceDate: {
      text: text.slice(0, 1900),
      calendar: 'Özgün Wikidata JSON takvimi metinde korunur; gün dönüşümü yapılmaz.',
      yearNumbering: 'historical-no-zero',
    },
    basis: 'derived',
    reviewStatus: 'verified',
  };
}
export const active = (entity, property) =>
  (entity.claims?.[property] ?? []).filter((s) => s.rank !== 'deprecated');
export function sourceTime(statements) {
  // Never turn a century/decade midpoint, approximate qualifier or conflicting claim into an exact year.
  const values = statements.map((s) => ({
    s,
    v: s.mainsnak?.snaktype === 'value' ? s.mainsnak.datavalue?.value : null,
  }));
  const text = values
    .map(({ s, v }) =>
      JSON.stringify({
        id: s.id,
        rank: s.rank,
        value: v,
        qualifiers: s.qualifiers ?? {},
        referenceHashes: (s.references ?? []).map((r) => r.hash),
      }),
    )
    .join('; ');
  if (values.length !== 1)
    return extent(null, null, text || 'Kaynakta zaman yok; bilinmeyen dönem.', true);
  const { s, v } = values[0],
    match =
      typeof v?.time === 'string' && /^([+-])(\d{4,})-(\d{2})-(\d{2})T00:00:00Z$/.exec(v.time);
  const year = match ? Number(match[2]) * (match[1] === '-' ? -1 : 1) : 0;
  const calendars = [
    'http://www.wikidata.org/entity/Q1985727',
    'http://www.wikidata.org/entity/Q1985786',
  ];
  const month = match ? Number(match[3]) : 0;
  const day = match ? Number(match[4]) : 0;
  const astronomical = year < 0 ? year + 1 : year;
  const leap =
    v?.calendarmodel === calendars[1]
      ? astronomical % 4 === 0
      : astronomical % 4 === 0 && (astronomical % 100 !== 0 || astronomical % 400 === 0);
  const lastDay = month === 2 ? (leap ? 29 : 28) : [4, 6, 9, 11].includes(month) ? 30 : 31;
  if (
    !match ||
    year === 0 ||
    Math.abs(year) > 10000 ||
    month > 12 ||
    day > 31 ||
    (v.precision >= 10 && month < 1) ||
    (v.precision === 11 && (day < 1 || day > lastDay)) ||
    !calendars.includes(v.calendarmodel) ||
    !Number.isInteger(v.precision) ||
    v.precision < 9 ||
    v.precision > 11 ||
    v.before !== 0 ||
    v.after !== 0 ||
    Object.keys(s.qualifiers ?? {}).length
  )
    return extent(null, null, text || 'Kaynak zamanı çözümlenemedi.', true);
  return extent(
    year,
    year,
    text,
    (s.references ?? []).length === 0 ||
      v.calendarmodel !== 'http://www.wikidata.org/entity/Q1985727',
    'year',
  );
}
const names = (e) =>
  ['tr', 'en']
    .filter((l) => e.labels?.[l]?.value?.trim())
    .map((l) => ({ language: l, value: e.labels[l].value.trim() }))
    .filter((n) => n.value.length <= 240 && !/[\u0000-\u001f]/u.test(n.value));
export function normalizeEntity(entity, receipt, groups, { existing = new Set() } = {}) {
  const qid = entity.id,
    ns = `history:${qid.toLowerCase()}`;
  if (existing.has(qid)) return { reason: 'existing-reviewed-record-preserved' };
  const title = names(entity);
  if (!title.length) return { reason: 'no-supported-name' };
  if (
    Object.values(entity.descriptions ?? {}).some((d) =>
      /\b(?:fictional|legendary|mythical)\b|kurgusal|efsanevi|mitolojik/iu.test(d.value ?? ''),
    ) ||
    active(entity, 'P1441').length
  )
    return { reason: 'fictional-or-legendary-manual-review' };
  const classes = active(entity, 'P31').map((s) => s.mainsnak?.datavalue?.value?.id);
  const human = classes.includes('Q5');
  const group = human
    ? 'person'
    : classes.includes('Q178561') || groups.includes('battles')
      ? 'battle'
      : classes.includes('Q198') || groups.includes('wars')
        ? 'war'
        : groups.includes('events')
          ? 'event'
          : null;
  if (!group) return { reason: 'non-human-not-a-reviewed-event' };
  const sourceId = `source:${ns}`,
    inputId = `input:${ns}`,
    transformId = 'transform:history-normalize';
  const base = {
    names: title,
    alternativeNames: ['tr', 'en']
      .flatMap((l) => (entity.aliases?.[l] ?? []).map((a) => ({ language: l, value: a.value })))
      .filter(
        (n) =>
          typeof n.value === 'string' &&
          n.value.trim() &&
          n.value.length <= 240 &&
          !/[\u0000-\u001f]/u.test(n.value),
      )
      .slice(0, 30),
    wikidataId: qid,
    confidence: {
      level: 'medium',
      spatialAccuracyKm: null,
      rationale:
        'Wikidata kaynak iddiası; şema, kimlik ve provenance denetlendi. Bağımsız tarihsel doğrulama eksiksiz değildir.',
    },
    licenseId: 'CC0-1.0',
    attribution: ATTRIBUTION,
    reviewStatus: 'verified',
    synthetic: false,
  };
  const source = {
    ...base,
    id: sourceId,
    names: [{ language: 'tr', value: `Wikidata ${qid}` }],
    alternativeNames: [],
    temporal: extent(),
    kind: 'source',
    sourceKey: 'wikidata',
    url: `https://www.wikidata.org/w/index.php?title=${qid}&oldid=${entity.lastrevid}`,
    revision: String(entity.lastrevid),
    retrievedAt: receipt.fetchedAt,
    rawInputId: inputId,
    upstreamIds: [],
    licenseUrl: 'https://www.wikidata.org/wiki/Wikidata:Licensing',
    licenseScope: 'data',
    objectLicense: null,
    membersReviewed: false,
  };
  const input = {
    id: inputId,
    relativePath: `entity-${qid}.json`,
    sha256: receipt.sha256,
    bytes: receipt.bytes,
    sourceId,
    sourceRevision: String(entity.lastrevid),
  };
  const evidence = [
    {
      sourceId,
      sourceRevision: String(entity.lastrevid),
      rawInputId: inputId,
      locator:
        'Wikidata JSON ana statements; P31/P569/P570/P580/P582/P585/P625. GUID/rank/references/qualifiers özgün checksum girdisinde; medya/reference qualifier tarihleri seçilmez.',
      claims: ['identity', 'temporal'],
      licenseId: 'CC0-1.0',
      attribution: ATTRIBUTION,
      basis: 'derived',
      transformationIds: [transformId],
    },
  ];
  const wikipedia = ['trwiki', 'enwiki']
    .map((site) => entity.sitelinks?.[site])
    .filter((l) => l && isWikipediaSitelink(l))
    .map((l) => ({
      wikidataId: qid,
      site: l.site,
      title: l.title,
      url: l.url,
      sourceId,
      sourceRevision: String(entity.lastrevid),
      rawInputId: inputId,
      verifiedAt: new Date(receipt.fetchedAt).toISOString(),
    }));
  const descriptions = ['tr', 'en']
    .filter((l) => entity.descriptions?.[l]?.value?.trim())
    .map((l) => ({ language: l, value: entity.descriptions[l].value }))
    .filter((n) => n.value.length <= 1500);
  if (!descriptions.length) descriptions.push(title[0]);
  let temporal,
    record,
    birth = null,
    death = null;
  if (human) {
    birth = sourceTime(active(entity, 'P569'));
    death = sourceTime(active(entity, 'P570'));
    const a = birth.start.kind === 'known' ? birth.start.date.year : null,
      b = death.end.kind === 'known' ? death.end.date.year : null;
    temporal =
      a !== null && b !== null && a > b
        ? extent(
            null,
            null,
            'Çelişen doğum/ölüm iddiaları: ' + birth.sourceDate.text + '; ' + death.sourceDate.text,
            true,
          )
        : extent(
            a,
            b,
            'P569 ' + birth.sourceDate.text + '; P570 ' + death.sourceDate.text,
            birth.uncertain || death.uncertain,
            a !== null && b !== null ? 'year' : 'unknown',
          );
    record = {
      ...base,
      id: ns,
      kind: 'person',
      entityId: ns + '-identity',
      temporal,
      evidence,
      profile: { birth, death, descriptions, occupations: [], wikipedia, image: null },
    };
  } else {
    const from = sourceTime(active(entity, 'P580')),
      to = sourceTime(active(entity, 'P582')),
      point = sourceTime(active(entity, 'P585'));
    const a = from.start.kind === 'known' ? from.start.date.year : null,
      b = to.end.kind === 'known' ? to.end.date.year : null;
    temporal =
      a !== null && b !== null && a <= b
        ? extent(
            a,
            b,
            'P580 ' + from.sourceDate.text + '; P582 ' + to.sourceDate.text,
            from.uncertain || to.uncertain,
            'year',
          )
        : point.start.kind === 'known'
          ? point
          : extent(
              null,
              null,
              'P580 ' +
                from.sourceDate.text +
                '; P582 ' +
                to.sourceDate.text +
                '; P585 ' +
                point.sourceDate.text,
              true,
            );
    if (temporal.start.kind === 'known' && temporal.end.kind === 'known')
      temporal.support = {
        kind: temporal.start.date.year === temporal.end.date.year ? 'snapshot' : 'continuous',
        note: 'Yalnız ana source statements kapsamı; konumsuz savaş tek noktaya dönüştürülmez.',
      };
    const coords = active(entity, 'P625');
    const coordinate = coords.length === 1 ? coords[0].mainsnak?.datavalue?.value : null;
    const validPoint =
      group === 'battle' &&
      coordinate?.globe === 'http://www.wikidata.org/entity/Q2' &&
      Number.isFinite(coordinate.longitude) &&
      Math.abs(coordinate.longitude) <= 180 &&
      Number.isFinite(coordinate.latitude) &&
      Math.abs(coordinate.latitude) <= 90 &&
      Number.isFinite(coordinate.precision) &&
      coordinate.precision > 0 &&
      coordinate.precision <= 1 &&
      Object.keys(coords[0].qualifiers ?? {}).length === 0 &&
      (coords[0].references ?? []).length > 0 &&
      temporal.support;
    const geometry = validPoint
      ? { type: 'Point', coordinates: [coordinate.longitude, coordinate.latitude] }
      : null;
    if (geometry) evidence[0].claims.push('geometry', 'location');
    record = {
      ...base,
      id: ns,
      kind: 'event',
      entityId: ns + '-identity',
      temporal,
      evidence,
      eventType:
        group === 'battle'
          ? 'BATTLE'
          : group === 'war'
            ? 'WAR'
            : classes.includes('Q131569')
              ? 'TREATY'
              : 'OTHER',
      participantIds: [],
      locationSemantics: geometry ? 'representative' : 'unknown',
      geometry,
      geometryReason: geometry
        ? null
        : 'İncelenmiş yer geometrisi yok; tahminî olay merkezi atanmadı.',
      details: {
        placeId: null,
        description: descriptions,
        locationPrecision: {
          classification: geometry ? 'approximate-point' : 'unknown',
          toleranceKm: null,
          explanation: geometry
            ? 'Wikidata P625 yaklaşık referans noktası; bütün muharebe alanı veya kesin GPS konumu değildir.'
            : 'Konum belirsiz veya henüz ayrıca incelenmedi.',
        },
        wikipediaSitelinks: wikipedia,
        alternativeDates: [],
      },
    };
  }
  const identity = {
    ...base,
    id: ns + '-identity',
    kind: 'entity',
    entityType: human ? 'PERSON' : group === 'battle' ? 'BATTLE' : 'EVENT',
    temporal,
    evidence,
  };
  return { record, identity, source, input, group, birth, death, wikipedia, groups };
}
