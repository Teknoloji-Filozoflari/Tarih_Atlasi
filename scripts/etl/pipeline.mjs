import {
  publicationPolicyVersion,
  publicationReview,
  geographyWithheld,
  withheldGeography,
} from '../../src/data/publication-policy.ts';
import { createHash } from 'node:crypto';
import { Buffer } from 'node:buffer';
import { open, realpath } from 'node:fs/promises';
import { relative, resolve, sep } from 'node:path';
import { validateCatalog, CatalogValidationError } from '../../src/domain/validate.ts';
import { licensePolicy } from '../../src/domain/licensePolicy.ts';
import { licenseManifest } from '../../src/data/source-manifest.ts';
import { matchesWikidataSitelink } from '../../src/domain/sitelink.ts';

export const ETL_VERSION = '1.6.0';
export const MAX_JSON_BYTES = 4 * 1024 * 1024;
export const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');
export function canonicalJSON(value) {
  if (Array.isArray(value)) return `[${value.map(canonicalJSON).join(',')}]`;
  if (value !== null && typeof value === 'object')
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonicalJSON(value[key])}`)
      .join(',')}}`;
  if (value === undefined || (typeof value === 'number' && !Number.isFinite(value)))
    throw new Error('Non-JSON value');
  return JSON.stringify(value);
}
export async function readBounded(path, limit) {
  const file = await open(path, 'r');
  try {
    const stat = await file.stat();
    if (!stat.isFile() || stat.size > limit)
      throw new Error('INPUT_SIZE: regular file exceeds input limit');
    const buffer = Buffer.alloc(Math.min(stat.size + 1, limit + 1));
    let length = 0;
    while (length < buffer.length) {
      const { bytesRead } = await file.read(buffer, length, buffer.length - length, null);
      if (!bytesRead) break;
      length += bytesRead;
    }
    if (length !== stat.size || length > limit)
      throw new Error('INPUT_CHANGED: input size changed while reading');
    return buffer.subarray(0, length);
  } finally {
    await file.close();
  }
}
export async function inspectCatalog(value, rawRoot, mode = 'production') {
  const validated = validateCatalog(value, mode);
  if (!validated.ok) throw new CatalogValidationError(validated.issues);
  // Own the validated snapshot before the first await; callers cannot mutate through the gate.
  const catalog = structuredClone(validated.value);
  const rawIssues = [];
  // No network, retry loops, downloads or unbounded Promise.all: at most 32 sequential files.
  if (catalog.inputs.length) {
    const root = await realpath(rawRoot);
    for (const input of catalog.inputs) {
      try {
        const path = await realpath(resolve(root, input.relativePath));
        const local = relative(root, path);
        if (
          !local ||
          local === '..' ||
          local.startsWith(`..${sep}`) ||
          resolve(root, local) !== path
        )
          throw new Error('RAW_PATH: input escapes raw root');
        const bytes = await readBounded(path, 8 * 1024 * 1024);
        if (bytes.length !== input.bytes || sha256(bytes) !== input.sha256)
          throw new Error('RAW_CHECKSUM: raw input checksum/bytes mismatch');
        const linked = catalog.records
          .flatMap((record) =>
            record.kind === 'cultural-region'
              ? record.wikipedia
                ? [record.wikipedia]
                : []
              : record.kind === 'person'
                ? (record.profile?.wikipedia ?? [])
                : record.kind === 'event'
                  ? (record.details?.wikipediaSitelinks ?? [])
                  : [],
          )
          .filter((link) => link.rawInputId === input.id);
        if (linked.length) {
          const wikidata = JSON.parse(bytes.toString('utf8'));
          for (const link of linked) {
            if (!matchesWikidataSitelink(wikidata, link))
              throw new Error(
                'SITELINK_RAW_MISMATCH: Wikipedia URL is not the preserved Wikidata sitelink',
              );
          }
        }
      } catch (error) {
        rawIssues.push({ code: 'RAW_INPUT_REJECTED', path: input.id, message: error.message });
      }
    }
  }
  if (rawIssues.length) throw new CatalogValidationError(rawIssues);
  return catalog;
}
export async function prepareBundle(value, rawRoot) {
  const input = await inspectCatalog(value, rawRoot, 'production');
  const withheld = input.records.filter((r) => geographyWithheld(r.id));
  for (const record of withheld)
    if ('geometry' in record) {
      record.geometry = null;
      record.geometryReason = `WITHHELD: ${publicationReview.reason} Source: ${publicationReview.reference}`;
    }
  const published = validateCatalog(input);
  if (!published.ok) throw new CatalogValidationError(published.issues);
  const sort = (entries) => [...entries].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  const catalog = {
    ...input,
    sources: sort(input.sources),
    records: sort(input.records),
    inputs: sort(input.inputs),
    transformations: sort(input.transformations),
  };
  const catalogText = `${canonicalJSON(catalog)}\n`;
  const digest = sha256(catalogText);
  const manifest = {
    schemaVersion: catalog.schemaVersion,
    catalogVersion: catalog.catalogVersion,
    createdAt: catalog.createdAt,
    etlVersion: ETL_VERSION,
    publicationPolicyVersion,
    withheldGeography: withheldGeography.filter((id) => input.records.some((r) => r.id === id)),
    publicationReview,
    policyVersion: licenseManifest.version,
    catalogFile: 'catalog.json',
    sha256: digest,
    bytes: Buffer.byteLength(catalogText),
    recordCount: catalog.records.length,
    sourceCount: catalog.sources.length,
    sourceRevisions: catalog.sources.map((source) => ({
      id: source.id,
      revision: source.revision,
      rawInputId: source.rawInputId,
      licenseId: source.licenseId,
      attribution: source.attribution,
      upstreamIds: source.upstreamIds,
    })),
    inputs: catalog.inputs,
    transformations: catalog.transformations,
  };
  const report = {
    mode: 'production',
    status: withheld.length ? 'accepted-with-withheld-geography' : 'accepted',
    publicationPolicyVersion,
    withheldGeography: withheld.map((r) => r.id),
    recordCount: catalog.records.length,
    issues: [],
    sourceDecisions: catalog.sources.map((source) => ({
      id: source.id,
      ...licensePolicy(
        source,
        catalog.inputs.find((entry) => entry.id === source.rawInputId),
      ),
    })),
  };
  return {
    catalogText,
    manifestText: `${canonicalJSON(manifest)}\n`,
    reportText: `${canonicalJSON(report)}\n`,
    directory: `${catalog.catalogVersion}-${digest.slice(0, 12)}`,
  };
}
