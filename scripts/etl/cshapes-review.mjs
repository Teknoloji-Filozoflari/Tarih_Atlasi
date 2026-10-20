import { createReadStream } from 'node:fs';
import { lstat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import { basename, resolve } from 'node:path';
import { readGeoJSONFeatures, geoJSONBudgets } from './geojson-stream.mjs';
import { normalizeWorldGeometry } from '../../src/data/world/geometry.ts';

export const cshapesReference = Object.freeze({
  sourceURL: 'https://icr.ethz.ch/data/cshapes/',
  codebookURL: 'https://icr.ethz.ch/data/cshapes/CShapes-2.0_Codebook.pdf',
  publisherDataLicense: 'CC-BY-NC-SA-4.0',
  licenseURL: 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
  attribution:
    'Schvitz, Rüegger, Girardin, Cederman, Weidmann and Gleditsch. Mapping The International System, 1886–2017: The CShapes 2.0 Dataset (2022). Publisher reference only; local file authenticity is not established by this inspector.',
});

export function cshapesDate(value) {
  if (typeof value !== 'string') return null;
  // Only explicit calendar dates or UTC/midnight ISO representations; no locale guesses.
  const match = /^(\d{4})-(\d{2})-(\d{2})(?:[T ]00:00:00(?:\.0{1,3})?Z?)?$/.exec(value);
  if (!match) return null;
  const [, y, m, d] = match;
  const year = Number(y),
    month = Number(m),
    day = Number(d);
  if (year < 1000 || month < 1 || month > 12 || day < 1 || day > 31) return null;
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
    ? `${y}-${m}-${d}`
    : null;
}

const calendarFields = ['gwsyear', 'gwsmonth', 'gwsday', 'gweyear', 'gwemonth', 'gweday'];
const codebookFields = ['statename', 'startdate', 'enddate'];
function calendarDate(year, month, day) {
  if (![year, month, day].every(Number.isInteger)) return null;
  return cshapesDate(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
}
function sourceProfile(p) {
  const has = (key) => Object.hasOwn(p, key);
  const validName = (value) => typeof value === 'string' && value.trim() && value.length <= 300;
  const codebook = codebookFields.every(has) && has('status') && validName(p.statename);
  const calendar = calendarFields.every(has) && has('gwcode') && validName(p.cntry_name);
  // Observed GW export fields are an explicit research profile, not an assertion
  // about export version, political status, or the provenance of a local file.
  // Mixed naming/date profiles require review instead of choosing one silently.
  if (codebook && !['cntry_name', ...calendarFields].some(has))
    return {
      schemaProfile: 'codebook-state-period',
      name: p.statename,
      start: cshapesDate(p.startdate),
      end: cshapesDate(p.enddate),
      dateBasis: 'explicit-source-calendar-dates',
      sourceDateFields: { startdate: p.startdate, enddate: p.enddate },
      exportedTimestampReview: false,
    };
  if (calendar && !codebookFields.some(has)) {
    if (
      ['gwsdate', 'gwedate'].some(
        (key) => has(key) && (typeof p[key] !== 'string' || p[key].length > 128),
      )
    )
      return null;
    return {
      schemaProfile: 'observed-gw-calendar-export',
      name: p.cntry_name,
      start: calendarDate(p.gwsyear, p.gwsmonth, p.gwsday),
      end: calendarDate(p.gweyear, p.gwemonth, p.gweday),
      dateBasis: 'explicit-gw-year-month-day-fields-unapproved',
      sourceDateFields: Object.fromEntries(
        [...calendarFields, 'gwsdate', 'gwedate'].filter(has).map((key) => [key, p[key]]),
      ),
      // These unzoned display timestamps may disagree with the calendar fields.
      // Preserve the text and require review; never guess a timezone or shift a day.
      exportedTimestampReview: ['gwsdate', 'gwedate'].some(has),
    };
  }
  return null;
}

export async function inspectCShapesStream(stream, { year = 2000, limits } = {}) {
  if (!Number.isInteger(year) || year < 1000 || year > 9999) throw new Error('CSHAPES_YEAR');
  const metadata = new Map(),
    keys = new Set(),
    candidates = [],
    issues = [];
  const summary = {
    features: 0,
    codebookSchemaRows: 0,
    gwCalendarSchemaRows: 0,
    supportedSchemaRows: 0,
    unsupportedSchemaRows: 0,
    invalidDateRows: 0,
    unsupportedStatusRows: 0,
    missingStatusRows: 0,
    exportedTimestampReviewRows: 0,
    syntheticRows: 0,
    candidateRows: 0,
    candidateGeometryPassed: 0,
    candidateGeometryReview: 0,
  };
  const lower = `${year}-01-01`,
    upper = `${year}-12-31`;
  const deadline = Date.now() + geoJSONBudgets.timeoutMs;
  let earliest = null,
    latest = null;
  const issue = (value) => {
    if (issues.length < 100) issues.push(value);
  };
  for await (const feature of readGeoJSONFeatures(stream, {
    limits,
    onMetadata: (key, value) => metadata.set(key, value),
  })) {
    if (Date.now() > deadline) throw new Error('CSHAPES_TIME_BUDGET');
    const index = summary.features++;
    const p = feature.properties;
    if (!p || typeof p !== 'object' || Array.isArray(p) || Object.keys(p).length > 128)
      throw new Error('CSHAPES_PROPERTY_BUDGET');
    for (const key of Object.keys(p)) {
      if (key.length > 128 || (keys.size >= 256 && !keys.has(key)))
        throw new Error('CSHAPES_SCHEMA_BUDGET');
      keys.add(key);
    }
    if (p.synthetic === true) summary.syntheticRows++;
    const profile = sourceProfile(p);
    if (!profile) {
      summary.unsupportedSchemaRows++;
      issue({ index, reason: 'SOURCE_SCHEMA_REVIEW_REQUIRED' });
      continue;
    }
    summary.supportedSchemaRows++;
    if (profile.schemaProfile === 'codebook-state-period') summary.codebookSchemaRows++;
    else summary.gwCalendarSchemaRows++;
    if (profile.exportedTimestampReview) {
      summary.exportedTimestampReviewRows++;
      issue({ index, reason: 'EXPORTED_TIMESTAMP_SEMANTICS_REVIEW_REQUIRED' });
    }
    if (!Object.hasOwn(p, 'status')) {
      summary.missingStatusRows++;
      issue({ index, reason: 'POLITICAL_STATUS_NOT_PROVIDED' });
    } else if (!Number.isInteger(p.status) || p.status < 1 || p.status > 5) {
      summary.unsupportedStatusRows++;
      issue({ index, reason: 'STATUS_CODE_REVIEW_REQUIRED' });
    }
    const { start, end } = profile;
    if (!start || !end || start > end) {
      summary.invalidDateRows++;
      issue({ index, reason: 'DATE_REVIEW_REQUIRED' });
      continue;
    }
    earliest = earliest === null || start < earliest ? start : earliest;
    latest = latest === null || end > latest ? end : latest;
    if (start > upper || end < lower) continue;
    if (++summary.candidateRows > 512) throw new Error('CSHAPES_CANDIDATE_BUDGET');
    const row = {
      sourceFeatureIndex: index,
      sourceName: profile.name,
      schemaProfile: profile.schemaProfile,
      dateBasis: profile.dateBasis,
      sourceDateFields: profile.sourceDateFields,
      exportedTimestampReview: profile.exportedTimestampReview,
      sourceStart: start,
      sourceEnd: end,
      yearIntersection:
        start <= lower && end >= upper ? 'whole-year-candidate' : 'partial-year-candidate',
      // Preserve raw status/code values. A source record is not an independently
      // verified country, and a country-period need not cover a complete year.
      status:
        typeof p.status === 'string'
          ? p.status.slice(0, 100)
          : typeof p.status === 'number'
            ? p.status
            : null,
      gwcode:
        typeof p.gwcode === 'number' || typeof p.gwcode === 'string'
          ? String(p.gwcode).slice(0, 100)
          : null,
      geometryStatus: 'REVIEW_REQUIRED',
      geometryReason: null,
      bbox: null,
      positions: null,
      normalizedGeometrySha256: null,
    };
    try {
      const value = normalizeWorldGeometry(feature.geometry);
      row.geometryStatus = 'BOUNDED_GEOMETRY_CHECK_PASSED';
      row.bbox = value.bbox;
      row.positions = value.points;
      row.normalizedGeometrySha256 = createHash('sha256')
        .update(JSON.stringify(value.geometry))
        .digest('hex');
      summary.candidateGeometryPassed++;
    } catch (error) {
      row.geometryReason = error.message;
      summary.candidateGeometryReview++;
    }
    candidates.push(row);
  }
  const crs = metadata.get('crs');
  const declared = crs?.type === 'name' ? crs.properties?.name : null;
  const crsStatus =
    crs === undefined ||
    ['EPSG:4326', 'urn:ogc:def:crs:OGC:1.3:CRS84', 'urn:ogc:def:crs:EPSG::4326'].includes(declared)
      ? 'GEOJSON_LON_LAT_OR_DECLARED_WGS84'
      : 'CRS_REVIEW_REQUIRED';
  return {
    inspectionVersion: 2,
    year,
    reference: cshapesReference,
    originAuthenticity: 'UNVERIFIED_LOCAL_INPUT',
    productionAllowed: false,
    datasetClass: summary.syntheticRows ? 'synthetic-test-data' : 'unverified-source-candidate',
    status:
      summary.unsupportedSchemaRows || !summary.supportedSchemaRows
        ? 'SCHEMA_REVIEW_REQUIRED'
        : summary.invalidDateRows ||
            summary.unsupportedStatusRows ||
            summary.missingStatusRows ||
            summary.exportedTimestampReviewRows ||
            summary.candidateGeometryReview ||
            crsStatus === 'CRS_REVIEW_REQUIRED'
          ? 'DATA_REVIEW_REQUIRED'
          : 'INSPECTED_NOT_APPROVED',
    crsStatus,
    summary,
    observedPropertyKeys: [...keys].sort(),
    observedDateRange: { earliest, latest },
    candidates,
    issues,
    scope:
      'Local source inventory and candidate year intersections only. No geometry is exported, no historical/name/sovereignty certification, no implicit support for a full year, no production license approval.',
  };
}

async function fileHash(file, maximum) {
  const hash = createHash('sha256');
  let bytes = 0;
  for await (const chunk of createReadStream(file)) {
    if ((bytes += chunk.length) > maximum) throw new Error('CSHAPES_FILE_BUDGET');
    hash.update(chunk);
  }
  return { bytes, sha256: hash.digest('hex') };
}
async function zipMembers(file) {
  return new Promise((accept, reject) => {
    const child = spawn('unzip', ['-Z1', file], { stdio: ['ignore', 'pipe', 'ignore'] });
    let text = '',
      bytes = 0;
    const timer = setTimeout(() => {
      child.kill();
      reject(new Error('CSHAPES_ZIP_TIMEOUT'));
    }, 10000);
    child.stdout.on('data', (chunk) => {
      if ((bytes += chunk.length) > 65536) {
        child.kill();
        reject(new Error('CSHAPES_ZIP_LIST_BUDGET'));
      } else text += chunk.toString('utf8');
    });
    child.on('error', reject);
    child.on('close', (code) => {
      clearTimeout(timer);
      const members = text.split(/\r?\n/).filter(Boolean);
      if (code !== 0 || members.length > 256) reject(new Error('CSHAPES_ZIP_DIRECTORY'));
      else accept(members);
    });
  });
}
export async function inspectCShapesFile(path, { year = 2000, member } = {}) {
  const file = resolve(path),
    before = await lstat(file);
  const zip = /\.zip$/i.test(file);
  if (
    !before.isFile() ||
    before.isSymbolicLink() ||
    before.size === 0 ||
    before.size > (zip ? 128 * 1024 * 1024 : geoJSONBudgets.bytes)
  )
    throw new Error('CSHAPES_FILE_BUDGET');
  const input = await fileHash(file, zip ? 128 * 1024 * 1024 : geoJSONBudgets.bytes);
  let child, stream, done, timer;
  try {
    if (zip) {
      const members = await zipMembers(file);
      const possible = members.filter((n) => /\.(?:geojson|json)$/i.test(n));
      member ??= possible.length === 1 ? possible[0] : null;
      if (!member || !members.includes(member)) throw new Error('CSHAPES_ZIP_SELECT_MEMBER');
      if (
        member.length > 512 ||
        /[\\\x00-\x1f*?\[\]]/.test(member) ||
        member.startsWith('/') ||
        member.split('/').includes('..')
      )
        throw new Error('CSHAPES_ZIP_UNSAFE_MEMBER');
      child = spawn('unzip', ['-p', file, member], { stdio: ['ignore', 'pipe', 'ignore'] });
      done = new Promise((accept, reject) => {
        child.on('error', reject);
        child.on('close', (code) =>
          code === 0 ? accept() : reject(new Error('CSHAPES_ZIP_READ')),
        );
      });
      void done.catch(() => {});
      timer = setTimeout(() => child.kill(), geoJSONBudgets.timeoutMs);
      stream = child.stdout;
    } else {
      if (member) throw new Error('CSHAPES_MEMBER_WITHOUT_ZIP');
      stream = createReadStream(file, { highWaterMark: 65536 });
    }
    const report = await inspectCShapesStream(stream, { year });
    if (done) await done;
    const after = await lstat(file);
    if (
      after.isSymbolicLink() ||
      before.ino !== after.ino ||
      before.dev !== after.dev ||
      before.size !== after.size ||
      before.mtimeMs !== after.mtimeMs
    )
      throw new Error('CSHAPES_INPUT_CHANGED');
    return { ...report, input: { file: basename(file), ...input, member: member ?? null } };
  } finally {
    clearTimeout(timer);
    stream?.destroy();
    child?.kill();
  }
}
