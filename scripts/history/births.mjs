import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { sourceCoordinate } from '../people/build.mjs';
import { reviewedInputsFor } from '../../src/people/policy.ts';
import { active, extent } from './normalize.mjs';
import { birthCityAllowlist as cities } from './birth-city-allowlist.mjs';
export async function reviewedCities() {
  const found = new Map();
  for (const [directory, version] of [
    ['raw', '1.0.1-births'],
    ['expanded-raw', '1.1.1-births'],
    ['ottoman-raw', '1.2.0-births'],
    ['global-raw', '1.3.0-births'],
    ['broad-raw', '1.4.0-births'],
  ]) {
    const path = `data/people/${directory}/browser-review.json`,
      bytes = await readFile(path),
      approved = reviewedInputsFor(version);
    if (createHash('sha256').update(bytes).digest('hex') !== approved?.browserReview)
      throw Error('HISTORY_PLACE_REVIEW_REQUIRED');
    const data = JSON.parse(bytes);
    for (const place of data.places) {
      const value = sourceCoordinate(place.props?.['coordinate location']);
      if (place.revision && cities.has(place.name) && value)
        found.set(place.qid, {
          ...place,
          ...value,
          path,
          bytes: bytes.length,
          sha256: approved.browserReview,
          retrievedAt: data.reviewedAt,
        });
    }
  }
  return found;
}
export function addReviewedBirth(unit, entity, places) {
  if (unit.record.kind !== 'person' || unit.birth.uncertain || unit.birth.start.kind !== 'known')
    return;
  const assertions = active(entity, 'P19');
  if (
    assertions.length !== 1 ||
    !assertions[0].references?.length ||
    Object.keys(assertions[0].qualifiers ?? {}).length
  )
    return;
  const qid = assertions[0].mainsnak?.datavalue?.value?.id,
    place = places.get(qid);
  if (!place) return;
  const year = unit.birth.start.date.year;
  if (year < -2000 || year > new Date().getFullYear()) return;
  const sourceId = `source:history-place-${qid.toLowerCase()}`,
    inputId = `input:history-place-${qid.toLowerCase()}`;
  unit.placeSource = {
    ...unit.source,
    id: sourceId,
    wikidataId: qid,
    names: [{ language: 'tr', value: `Wikidata ${qid}` }],
    revision: String(place.revision),
    url: `https://www.wikidata.org/w/index.php?title=${qid}&oldid=${place.revision}`,
    retrievedAt: place.retrievedAt,
    rawInputId: inputId,
    temporal: extent(),
  };
  unit.placeInput = {
    id: inputId,
    relativePath: place.path,
    sha256: place.sha256,
    bytes: place.bytes,
    sourceId,
    sourceRevision: String(place.revision),
  };
  unit.birthLocation = {
    ...unit.record,
    id: unit.record.id + '-birth',
    kind: 'person-location',
    wikidataId: null,
    names: [
      {
        language: unit.record.names[0].language,
        value: `${unit.record.names[0].value} · ${place.name}`,
      },
    ],
    temporal: {
      ...unit.birth,
      support: {
        kind: 'snapshot',
        note: 'Yalnız kaynaklı doğum yılı; yaşam boyunca konum çıkarımı değildir.',
      },
    },
    personId: unit.record.id,
    placeId: null,
    locationType: 'timed-presence',
    relationship: 'presence',
    relationshipType: 'BIRTH',
    spatialContext: {
      scale: 'city',
      coordinateRole: 'representative-place',
      description: `${place.name}: incelenmiş yaklaşık şehir temsil noktası; kişinin veya doğum evinin GPS konumu değildir.`,
    },
    geometry: { type: 'Point', coordinates: place.coordinates },
    geometryReason: null,
    evidence: [
      {
        ...unit.record.evidence[0],
        locator: `P569 ${unit.birth.sourceDate.text}; P19 ${assertions[0].id} ${qid}; kaynaklı doğum yılı ve yer ilişkisi.`,
        claims: ['identity', 'temporal', 'location'],
      },
      {
        ...unit.record.evidence[0],
        sourceId,
        sourceRevision: String(place.revision),
        rawInputId: inputId,
        locator: `P625 ${place.sourceText}; önceki incelenmiş şehir kaynağı.`,
        claims: ['geometry', 'location'],
      },
    ],
  };
  delete unit.birthLocation.entityId;
  delete unit.birthLocation.profile;
}
