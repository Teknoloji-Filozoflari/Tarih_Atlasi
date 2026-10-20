import { sourceURLMatchesRevision } from './source-url.ts';
import type { Catalog, HistoricalRecord, SourceRecord, TerritoryVersion } from './types.ts';
import { issue, parse, type ValidationIssue, type ValidationResult } from './schema.ts';
import { catalogSchema } from './schemas.ts';
import { temporalRange, temporalIntervals, temporalContradictsParent } from './temporal.ts';
import { boxesIntersect, geometryBounds } from './geometry.ts';
import { licensePolicy } from './licensePolicy.ts';
import { eventLayer } from '../events/model.ts';

export type ValidationMode = 'staging' | 'production';
export function validateCatalog(
  value: unknown,
  mode: ValidationMode = 'production',
): ValidationResult<Catalog> {
  if (mode !== 'production' && mode !== 'staging')
    return {
      ok: false,
      issues: [{ code: 'VALIDATION_MODE', path: '$', message: 'Bilinmeyen doğrulama modu.' }],
    };
  const parsed = parse(catalogSchema, value);
  if (!parsed.ok) return parsed;
  const catalog = parsed.value;
  const issues: ValidationIssue[] = [];
  const sources = new Map(catalog.sources.map((source) => [source.id, source]));
  const records = new Map(catalog.records.map((record) => [record.id, record]));
  const inputs = new Map(catalog.inputs.map((input) => [input.id, input]));
  const transformations = new Map(catalog.transformations.map((step) => [step.id, step]));
  const ids = new Set<string>();
  for (const entry of [
    ...catalog.sources,
    ...catalog.records,
    ...catalog.inputs,
    ...catalog.transformations,
  ]) {
    if (ids.has(entry.id))
      issue(issues, entry.id, 'DUPLICATE_ID', 'Katalog kimlikleri benzersiz olmalı.');
    ids.add(entry.id);
  }
  for (const input of catalog.inputs) {
    const source = sources.get(input.sourceId);
    if (!source || source.rawInputId !== input.id || source.revision !== input.sourceRevision)
      issue(issues, input.id, 'INPUT_SOURCE', 'Ham girdi kaynak/revizyonla bire bir eşleşmeli.');
  }
  for (const step of catalog.transformations)
    for (const id of step.inputIds)
      if (!inputs.has(id)) issue(issues, step.id, 'TRANSFORM_INPUT', 'Dönüşüm girdisi bulunamadı.');
  const visited = new Set<string>();
  const visiting = new Set<string>();
  const visitSource = (source: SourceRecord) => {
    if (visiting.has(source.id)) {
      issue(issues, source.id, 'SOURCE_CYCLE', 'Üst kaynak zinciri döngü içeriyor.');
      return;
    }
    if (visited.has(source.id)) return;
    visiting.add(source.id);
    for (const id of source.upstreamIds) {
      const upstream = sources.get(id);
      if (!upstream)
        issue(issues, source.id, 'SOURCE_REFERENCE', 'Üst kaynak eksik; provenance atılamaz.');
      else visitSource(upstream);
    }
    visiting.delete(source.id);
    visited.add(source.id);
  };
  for (const source of catalog.sources) {
    if (!sourceURLMatchesRevision(source))
      issue(
        issues,
        source.id,
        'SOURCE_URL_REVISION',
        'Kaynak URL kimliği/revizyonu kayıtla eşleşmeli; yinelenen revision parametresi kabul edilmez.',
      );
    visitSource(source);
    const input = inputs.get(source.rawInputId);
    if (!input || input.sourceId !== source.id || input.sourceRevision !== source.revision)
      issue(issues, source.id, 'SOURCE_INPUT', 'Kaynağın ham girdisi/revizyonu korunmalı.');
    if (mode === 'production') {
      const decision = licensePolicy(source, input);
      if (decision.decision !== 'allow')
        issue(
          issues,
          source.id,
          decision.decision === 'manual-review' ? 'LICENSE_REVIEW_REQUIRED' : 'LICENSE_DISALLOWED',
          decision.reason,
        );
      if (source.temporal.reviewStatus !== 'verified')
        issue(
          issues,
          source.id,
          'SOURCE_TEMPORAL_REVIEW',
          'Kaynak tarih kapsamının incelemesi eksik.',
        );
    }
  }
  const reference = (
    id: string,
    owner: string,
    kind: HistoricalRecord['kind'],
    types?: readonly string[],
  ) => {
    const target = records.get(id);
    if (
      !target ||
      target.kind !== kind ||
      (types && (target.kind !== 'entity' || !types.includes(target.entityType)))
    ) {
      issue(
        issues,
        owner,
        'SEMANTIC_REFERENCE',
        `Beklenen ${kind} kaydı/semantiği bulunamadı: ${id}`,
      );
      return undefined;
    }
    return target;
  };
  for (const record of catalog.records) {
    if (mode === 'production') {
      if (record.synthetic)
        issue(
          issues,
          record.id,
          'SYNTHETIC_PRODUCTION',
          'Sentetik kayıt yalnız test/staging alanında kalır.',
        );
      if (record.reviewStatus !== 'verified' || record.temporal.reviewStatus !== 'verified')
        issue(
          issues,
          record.id,
          'UNVERIFIED_PRODUCTION',
          'Hipotez/incelemesiz kayıt üretime giremez.',
        );
    }
    const claims = new Set(record.evidence.flatMap((evidence) => evidence.claims));
    for (const claim of ['identity', 'temporal'] as const)
      if (!claims.has(claim))
        issue(issues, record.id, 'MISSING_CLAIM_SOURCE', `${claim} iddiasının kaynağı eksik.`);
    for (const evidence of record.evidence) {
      const source = sources.get(evidence.sourceId);
      const input = inputs.get(evidence.rawInputId);
      if (
        !source ||
        source.revision !== evidence.sourceRevision ||
        source.rawInputId !== evidence.rawInputId ||
        input?.sourceId !== source.id
      )
        issue(
          issues,
          record.id,
          'EVIDENCE_REFERENCE',
          'Kanıt kaynak/revizyon/ham girdi bağı kopuk.',
        );
      if (
        source &&
        (evidence.licenseId !== source.licenseId ||
          evidence.attribution !== source.attribution ||
          record.licenseId !== evidence.licenseId ||
          !record.attribution.includes(evidence.attribution))
      )
        issue(
          issues,
          record.id,
          'RIGHTS_MISMATCH',
          'Kaynak hak/atıf bilgisi değiştirilemez veya atılamaz; karışık haklar ayrıca modellenmeli.',
        );
      if (evidence.basis === 'derived' && evidence.transformationIds.length === 0)
        issue(
          issues,
          record.id,
          'DERIVATION_MISSING',
          'Türetim, sürümlü dönüşüm kaydı gerektirir.',
        );
      for (const id of evidence.transformationIds) {
        const step = transformations.get(id);
        if (!step || !step.inputIds.includes(evidence.rawInputId))
          issue(
            issues,
            record.id,
            'TRANSFORMATION_REFERENCE',
            'Dönüşüm ve ham girdi izi eşleşmiyor.',
          );
      }
    }
    if (
      record.temporal.basis === 'derived' &&
      !record.evidence.some(
        (evidence) => evidence.basis === 'derived' && evidence.claims.includes('temporal'),
      )
    )
      issue(
        issues,
        record.id,
        'TEMPORAL_DERIVATION',
        'Türetilmiş tarih için türetim kanıtı gerekli.',
      );
    if ('geometry' in record) {
      if ((record.geometry === null) === (record.geometryReason === null))
        issue(
          issues,
          record.id,
          'GEOMETRY_REASON',
          'Geometri yoksa gerekçe gerekli; varsa gerekçe null olmalı.',
        );
      if (record.geometry && !claims.has('geometry'))
        issue(issues, record.id, 'GEOMETRY_SOURCE', 'Geometri kaynağı gerekli.');
    }
    if (record.kind === 'territory' || record.kind === 'cultural-region') {
      const parent = records.get(record.entityId);
      if (parent?.kind === 'entity' && temporalContradictsParent(record.temporal, parent.temporal))
        issue(
          issues,
          record.id,
          'ENTITY_GEOGRAPHY_PERIOD',
          'Coğrafi kayıt bağlı varlığın belgeli döneminden veya dönem boşluğundan taşamaz.',
        );
    }
    switch (record.kind) {
      case 'entity': {
        const profile = record.politicalProfile;
        if (!profile) break;
        if (!['POLITY', 'KINGDOM', 'EMPIRE'].includes(record.entityType))
          issue(
            issues,
            record.id,
            'POLITICAL_PROFILE_KIND',
            'Siyasi profil yalnız siyasi kimliğe bağlanabilir.',
          );
        for (const claim of [
          ...profile.classifications,
          ...profile.names,
          ...profile.descriptions,
          ...profile.capitals,
        ]) {
          if (ids.has(claim.id))
            issue(issues, claim.id, 'DUPLICATE_ID', 'Siyasi iddia kimliği benzersiz olmalı.');
          ids.add(claim.id);
          const evidence = claim.evidenceIndices.map((index) => record.evidence[index]);
          if (
            evidence.some((value) => !value) ||
            !evidence.some(
              (value) => value?.claims.includes('identity') && value.claims.includes('temporal'),
            )
          )
            issue(
              issues,
              claim.id,
              'POLITICAL_CLAIM_SOURCE',
              'Profil iddiası aynı locator içinde kimlik ve tarih kanıtı ister.',
            );
          if ('placeId' in claim) {
            reference(claim.placeId, claim.id, 'place');
            if (
              !evidence.some(
                (value) => value?.claims.includes('location') && value.claims.includes('temporal'),
              )
            )
              issue(
                issues,
                claim.id,
                'CAPITAL_SOURCE',
                'Başkent için ayrıca zaman/yer kanıtı gerekir.',
              );
          }
          if (
            claim.temporal.basis === 'derived' &&
            !evidence.some(
              (value) => value?.basis === 'derived' && value.claims.includes('temporal'),
            )
          )
            issue(
              issues,
              claim.id,
              'POLITICAL_DERIVATION',
              'Türetilmiş profil tarihi dönüşüm kanıtı ister.',
            );
          if (mode === 'production' && claim.temporal.reviewStatus !== 'verified')
            issue(
              issues,
              claim.id,
              'POLITICAL_REVIEW',
              'İncelemesiz siyasi iddia üretime alınamaz.',
            );
          const claimPeriods = temporalIntervals(claim.temporal),
            parentPeriods = temporalIntervals(record.temporal);
          if (
            claimPeriods.some(
              (bounds) =>
                bounds.start !== null &&
                bounds.end !== null &&
                !parentPeriods.some(
                  (parent) =>
                    parent.start !== null &&
                    parent.end !== null &&
                    bounds.start! >= parent.start &&
                    bounds.end! <= parent.end,
                ),
            )
          )
            issue(
              issues,
              claim.id,
              'POLITICAL_CLAIM_PERIOD',
              'Profil dönemi kimliğin kaynak kapsamından taşamaz.',
            );
        }
        break;
      }
      case 'territory':
        reference(record.entityId, record.id, 'entity', ['POLITY', 'KINGDOM', 'EMPIRE']);
        for (const id of record.counterpartEntityIds)
          reference(id, record.id, 'entity', ['POLITY', 'KINGDOM', 'EMPIRE']);
        if (
          record.geometry &&
          (record.geometry.type === 'LineString') !== (record.extentType === 'boundary-segment')
        )
          issue(
            issues,
            record.id,
            'TERRITORY_EXTENT',
            'Sınır kesiti çizgidir; tam egemenlik alanı sayılamaz.',
          );
        if (
          record.borderPrecision.classification === 'treaty-idealized' &&
          record.boundary === 'documented'
        )
          issue(
            issues,
            record.id,
            'BORDER_PRECISION',
            'İdealleştirilmiş antlaşma çizgisi ölçülmüş kesin sınır değildir.',
          );
        break;
      case 'political-relationship':
        reference(record.fromEntityId, record.id, 'entity', ['POLITY', 'KINGDOM', 'EMPIRE']);
        reference(record.toEntityId, record.id, 'entity', ['POLITY', 'KINGDOM', 'EMPIRE']);
        if (record.fromEntityId === record.toEntityId)
          issue(
            issues,
            record.id,
            'POLITICAL_SELF_REFERENCE',
            'Siyasal ilişki iki ayrı varlık gerektirir.',
          );
        for (const id of record.territoryIds) reference(id, record.id, 'territory');
        break;
      case 'cultural-region':
        reference(record.entityId, record.id, 'entity', [
          'CULTURE',
          'CIVILIZATION',
          'CULTURAL_REGION',
        ]);
        if (mode === 'production' && !record.culturalContext)
          issue(
            issues,
            record.id,
            'CULTURAL_CONTEXT',
            'Kültür alanı coğrafi bağlam ve belirsizlik açıklaması ister.',
          );
        if (record.wikipedia) {
          const link = record.wikipedia,
            source = sources.get(link.sourceId);
          if (
            !record.wikidataId ||
            record.wikidataId !== link.wikidataId ||
            source?.sourceKey !== 'wikidata' ||
            source.revision !== link.sourceRevision ||
            source.rawInputId !== link.rawInputId ||
            !record.evidence.some(
              (e) =>
                e.sourceId === link.sourceId &&
                e.sourceRevision === link.sourceRevision &&
                e.rawInputId === link.rawInputId &&
                e.claims.includes('identity'),
            )
          )
            issue(
              issues,
              record.id,
              'SITELINK_PROVENANCE',
              'Sitelink Wikidata kimlik kanıtı/ham revizyonuyla bağlanmalı.',
            );
        }
        break;
      case 'cultural-relationship':
        reference(record.fromEntityId, record.id, 'entity', [
          'CULTURE',
          'CIVILIZATION',
          'CULTURAL_REGION',
        ]);
        reference(record.toEntityId, record.id, 'entity', [
          'CULTURE',
          'CIVILIZATION',
          'CULTURAL_REGION',
        ]);
        if (record.fromEntityId === record.toEntityId)
          issue(
            issues,
            record.id,
            'CULTURAL_SELF_REFERENCE',
            'Kültürel ilişki farklı kimlikler ister.',
          );
        for (const id of record.regionIds) reference(id, record.id, 'cultural-region');
        break;
      case 'person':
        reference(record.entityId, record.id, 'entity', ['PERSON']);
        if (mode === 'production' && !record.profile)
          issue(
            issues,
            record.id,
            'PERSON_PROFILE',
            'Üretim kişi profili ve ayrı yaşam tarihleri gerekli.',
          );
        if (record.profile) {
          const life = temporalRange(record.temporal);
          for (const [key, boundary] of [
            ['birth', life.start],
            ['death', life.end],
          ] as const) {
            const extent = record.profile[key];
            const range = temporalRange(extent);
            if (
              boundary !== null &&
              range.start !== null &&
              range.end !== null &&
              (boundary < range.start || boundary > range.end)
            )
              issue(
                issues,
                record.id,
                'PERSON_LIFE_CONFLICT',
                'Doğum/ölüm yaşam zarfıyla çelişiyor.',
              );
            if (mode === 'production' && extent.reviewStatus !== 'verified')
              issue(issues, record.id, 'PERSON_DATE_REVIEW', 'Yaşam tarihleri incelenmeli.');
          }
          // There are no separately approved media artifacts yet. P18 is not a rights grant.
          if (mode === 'production' && record.profile.image)
            issue(
              issues,
              record.id,
              'PERSON_MEDIA_RIGHTS',
              'Görsel için ayrı dosya hak incelemesi ve asset manifesti gerekli; henüz onaylı görsel yok.',
            );
          for (const link of record.profile.wikipedia) {
            const source = sources.get(link.sourceId);
            if (
              link.wikidataId !== record.wikidataId ||
              source?.sourceKey !== 'wikidata' ||
              source.revision !== link.sourceRevision ||
              source.rawInputId !== link.rawInputId ||
              !record.evidence.some(
                (e) =>
                  e.sourceId === link.sourceId &&
                  e.rawInputId === link.rawInputId &&
                  e.sourceRevision === link.sourceRevision &&
                  e.claims.includes('identity'),
              )
            )
              issue(
                issues,
                record.id,
                'SITELINK_PROVENANCE',
                'Kişi sitelinki incelenmiş Wikidata kimlik kanıtıyla bağlanmalı.',
              );
          }
        }
        break;
      case 'place':
        reference(record.entityId, record.id, 'entity', ['PLACE']);
        break;
      case 'event':
        reference(record.entityId, record.id, 'entity', [
          record.eventType === 'BATTLE' ? 'BATTLE' : 'EVENT',
        ]);
        {
          const parent = records.get(record.entityId);
          if (
            parent?.kind === 'entity' &&
            temporalContradictsParent(record.temporal, parent.temporal)
          )
            issue(
              issues,
              record.id,
              'GEOGRAPHY_PARENT_DATE',
              'Olay dönemi kimlik kaydıyla çelişiyor.',
            );
        }
        if (record.eventType === 'WAR' && record.geometry?.type === 'Point')
          issue(
            issues,
            record.id,
            'WAR_AS_POINT',
            'Savaşın coğrafi kapsamı tek noktayla temsil edilemez; kaynaklı alan veya konumsuz kayıt kullanın.',
          );
        for (const id of record.participantIds) reference(id, record.id, 'entity');
        if (mode === 'production' && !record.details)
          issue(
            issues,
            record.id,
            'EVENT_DETAILS',
            'Üretim olayı açıklama/konum hassasiyeti ister.',
          );
        if (record.details) {
          const details = record.details,
            p = details.locationPrecision;
          if (details.placeId) reference(details.placeId, record.id, 'place');
          if (
            (p.classification === 'unknown') !== (record.geometry === null) ||
            (record.geometry?.type === 'Point' &&
              !['site', 'approximate-point'].includes(p.classification)) ||
            (record.geometry &&
              record.geometry.type !== 'Point' &&
              p.classification !== 'documented-region') ||
            (p.classification === 'unknown' && p.toleranceKm !== null) ||
            (p.classification === 'approximate-point' &&
              record.locationSemantics !== 'representative')
          )
            issue(
              issues,
              record.id,
              'EVENT_PRECISION',
              'Olay geometrisi/konum anlamı ile hassasiyet çelişiyor.',
            );
          for (const alternative of details.alternativeDates) {
            if (!record.temporal.uncertain)
              issue(
                issues,
                record.id,
                'EVENT_ALTERNATIVE_UNCERTAINTY',
                'Alternatif tarih taşıyan olay kesin tarih gibi sunulamaz.',
              );
            if (mode === 'production' && alternative.temporal.reviewStatus !== 'verified')
              issue(
                issues,
                record.id,
                'EVENT_ALTERNATIVE_REVIEW',
                'Alternatif tarih kaynağı incelenmeli.',
              );
            if (
              alternative.evidenceIndices.some(
                (i) => !record.evidence[i]?.claims.includes('temporal'),
              )
            )
              issue(
                issues,
                record.id,
                'EVENT_ALTERNATIVE_SOURCE',
                'Alternatif tarih zaman kanıtına bağlı olmalı.',
              );
          }
          for (const link of details.wikipediaSitelinks) {
            const source = sources.get(link.sourceId);
            if (
              link.wikidataId !== record.wikidataId ||
              source?.sourceKey !== 'wikidata' ||
              source.revision !== link.sourceRevision ||
              source.rawInputId !== link.rawInputId ||
              !record.evidence.some(
                (e) =>
                  e.sourceId === link.sourceId &&
                  e.sourceRevision === link.sourceRevision &&
                  e.rawInputId === link.rawInputId &&
                  e.claims.includes('identity'),
              )
            )
              issue(
                issues,
                record.id,
                'SITELINK_PROVENANCE',
                'Olay sitelinki ham Wikidata kimlik kanıtıyla bağlanmalı.',
              );
          }
        }
        if (
          record.geometry &&
          !record.evidence.some(
            (e) => e.claims.includes('temporal') && e.claims.includes('geometry'),
          )
        )
          issue(
            issues,
            record.id,
            'EVENT_GEOGRAPHY_EVIDENCE',
            'Harita olayı aynı kanıtta zaman ve geometri ister; ülke merkezi kullanılamaz.',
          );
        if ((record.locationSemantics === 'unknown') !== (record.geometry === null))
          issue(
            issues,
            record.id,
            'EVENT_LOCATION',
            'Bilinmeyen olay konumuna koordinat atanmamalı.',
          );
        break;
      case 'person-location': {
        const person = reference(record.personId, record.id, 'person');
        if (mode === 'production' && (!record.relationshipType || !record.spatialContext))
          issue(
            issues,
            record.id,
            'PERSON_LOCATION_CONTEXT',
            'İlişki türü ve koordinatın ölçeği/anlamı gerekli.',
          );
        if (
          record.geometry &&
          record.spatialContext &&
          ['region', 'kingdom', 'unknown'].includes(record.spatialContext.scale)
        )
          issue(
            issues,
            record.id,
            'PERSON_AREA_AS_POINT',
            'Bölge/krallık veya bilinmeyen ölçek kişi noktası yapılamaz.',
          );
        if (
          record.spatialContext?.coordinateRole === 'documented-site' &&
          record.spatialContext.scale !== 'site'
        )
          issue(
            issues,
            record.id,
            'PERSON_COORDINATE_ROLE',
            'Belgelenmiş tesis noktası tesis ölçeği ister.',
          );
        if (
          record.relationshipType &&
          record.relationship !== 'presence' &&
          record.relationship !== 'associated' &&
          record.relationship.toUpperCase() !== record.relationshipType
        )
          issue(
            issues,
            record.id,
            'PERSON_RELATIONSHIP_CONFLICT',
            'Eski ve yeni ilişki alanları çelişemez.',
          );
        if (record.placeId) reference(record.placeId, record.id, 'place');
        if (!record.geometry && !record.placeId)
          issue(
            issues,
            record.id,
            'PERSON_LOCATION_MISSING',
            'Konum kaydı nokta veya kaynaklı yer referansı ister.',
          );
        if ((record.locationType === 'timed-presence') !== (record.relationship === 'presence'))
          issue(
            issues,
            record.id,
            'PERSON_LOCATION_CLASS',
            'Zamanlı bulunma ile genel yaşam yeri ayrı sınıflardır.',
          );
        if (!claims.has('location'))
          issue(
            issues,
            record.id,
            'PERSON_LOCATION_SOURCE',
            'Kişi konumu için ayrı konum kanıtı gerekli.',
          );
        if (
          record.locationType === 'timed-presence' &&
          !record.evidence.some(
            (evidence) =>
              evidence.claims.includes('temporal') && evidence.claims.includes('location'),
          )
        )
          issue(
            issues,
            record.id,
            'TIMED_PRESENCE_EVIDENCE',
            'Aynı kaynak locator kaydı zaman ve konumu birlikte desteklemeli; yaşam tarihleri ile genel yer birleştirilemez.',
          );
        if (
          record.locationType === 'timed-presence' &&
          (record.temporal.start.kind !== 'known' ||
            record.temporal.end.kind !== 'known' ||
            record.temporal.precision === 'unknown')
        )
          issue(
            issues,
            record.id,
            'TIMED_PRESENCE_DATE',
            'Tarih aralığı bilinmeyen yaşam yeri yıllık bulunma iddiası olamaz.',
          );
        if (person) {
          if (
            person.kind === 'person' &&
            person.profile &&
            record.locationType === 'timed-presence' &&
            (record.relationshipType === 'BIRTH' || record.relationshipType === 'DEATH')
          ) {
            const event = temporalRange(
              record.relationshipType === 'BIRTH' ? person.profile.birth : person.profile.death,
            );
            const location = temporalRange(record.temporal);
            if (
              record.temporal.support?.kind !== 'snapshot' ||
              event.start === null ||
              event.end === null ||
              location.start === null ||
              location.end === null ||
              location.start < event.start ||
              location.end > event.end
            )
              issue(
                issues,
                record.id,
                'PERSON_LIFE_EVENT_LOCATION',
                'Doğum/ölüm konumu yalnız ayrı kaynaklı olay anında gösterilebilir; yaşam aralığına yayılamaz.',
              );
          }
          const parent = temporalRange(person.temporal),
            location = temporalRange(record.temporal);
          if (
            (parent.start !== null && location.end !== null && location.end < parent.start) ||
            (parent.end !== null && location.start !== null && location.start > parent.end) ||
            (record.locationType === 'timed-presence' &&
              ((parent.start !== null &&
                location.start !== null &&
                location.start < parent.start) ||
                (parent.end !== null && location.end !== null && location.end > parent.end)))
          )
            issue(
              issues,
              record.id,
              'PERSON_DATE_CONFLICT',
              'Kişi konumu yaşam tarih aralığıyla çelişiyor.',
            );
          if (
            record.locationType === 'timed-presence' &&
            person.temporal.periods &&
            temporalIntervals(record.temporal).some(
              (locationPeriod) =>
                !temporalIntervals(person.temporal).some(
                  (lifePeriod) =>
                    lifePeriod.start !== null &&
                    lifePeriod.end !== null &&
                    locationPeriod.start !== null &&
                    locationPeriod.end !== null &&
                    locationPeriod.start >= lifePeriod.start &&
                    locationPeriod.end <= lifePeriod.end,
                ),
            )
          )
            issue(
              issues,
              record.id,
              'PERSON_PERIOD_CONFLICT',
              'Kaynaklı bulunma kişinin belgeli yaşam dönemindeki bir boşluğa taşınamaz.',
            );
        }
        break;
      }
      case 'coverage': {
        if (!claims.has('coverage'))
          issue(issues, record.id, 'COVERAGE_SOURCE', 'Kapsam iddiası kaynak/inceleme gerektirir.');
        if (
          record.recordCount !== new Set(record.recordIds).size ||
          record.recordCount !== record.recordIds.length ||
          (record.status !== 'partial' && record.recordCount !== 0) ||
          (record.status === 'partial' && record.recordCount === 0)
        )
          issue(
            issues,
            record.id,
            'COVERAGE_COUNT',
            'Kapsam sayısı açık kayıt listesi ve durumla eşleşmeli.',
          );
        for (const id of record.recordIds) {
          const target = records.get(id);
          const layer =
            target?.kind === 'territory'
              ? 'polity'
              : target?.kind === 'cultural-region'
                ? 'culture'
                : target?.kind === 'person-location'
                  ? 'person'
                  : target?.kind === 'event'
                    ? eventLayer(target.eventType)
                    : target?.kind === 'place'
                      ? 'place'
                      : null;
          if (!target || layer !== record.layer)
            issue(
              issues,
              record.id,
              'COVERAGE_REFERENCE',
              'Kapsam kaydı hedef katmanla eşleşmiyor.',
            );
          if (
            target &&
            'geometry' in target &&
            target.geometry &&
            !geometryBounds(target.geometry).some((box) => boxesIntersect(record.region, box))
          )
            issue(issues, record.id, 'COVERAGE_REGION', 'Kayıt kapsam bölgesiyle kesişmiyor.');
          if (target) {
            const a = temporalRange(target.temporal),
              b = temporalRange(record.temporal);
            if (
              a.start !== null &&
              a.end !== null &&
              b.start !== null &&
              b.end !== null &&
              (a.end < b.start || b.end < a.start)
            )
              issue(issues, record.id, 'COVERAGE_DATE', 'Kayıt kapsam tarihiyle kesişmiyor.');
          }
        }
        break;
      }
    }
  }
  const groups = new Map<string, TerritoryVersion[]>();
  for (const record of catalog.records)
    if (record.kind === 'territory') {
      const key = `${record.entityId}/${record.interpretationId}/${record.scopeId}`;
      const group = groups.get(key) ?? [];
      group.push(record);
      groups.set(key, group);
    }
  for (const group of groups.values())
    for (let i = 0; i < group.length; i++)
      for (let j = 0; j < i; j++) {
        if (
          temporalIntervals(group[i]!.temporal).some((a) =>
            temporalIntervals(group[j]!.temporal).some(
              (b) =>
                a.start !== null &&
                a.end !== null &&
                b.start !== null &&
                b.end !== null &&
                a.start <= b.end &&
                b.start <= a.end,
            ),
          )
        )
          issue(
            issues,
            group[i]!.id,
            'TERRITORY_DATE_CONFLICT',
            'Aynı yorumun iki sınır sürümü aynı zamanda geçerli olamaz; rakip yorumları ayrı kimlikle kaydet.',
          );
      }
  return issues.length ? { ok: false, issues } : { ok: true, value: catalog, issues: [] };
}

export class CatalogValidationError extends Error {
  readonly issues: ValidationIssue[];
  constructor(issues: ValidationIssue[]) {
    super('Historical catalog rejected');
    this.name = 'CatalogValidationError';
    this.issues = issues;
  }
}
