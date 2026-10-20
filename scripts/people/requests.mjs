import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import prettier from 'prettier';
import { normalizeSearch } from '../../src/discovery/search.ts';
import { peopleCatalogs, peopleManifest } from '../../src/people/generated/index.ts';
import { peopleCatalogs as expandedCatalogs } from '../../src/people/expanded/index.ts';
import { peopleCatalogs as ottomanCatalogs } from '../../src/people/ottoman/index.ts';
import { peopleCatalogs as globalCatalogs } from '../../src/people/global/index.ts';
import { peopleCatalogs as broadCatalogs } from '../../src/people/broad/index.ts';
import { preparedPilot } from '../../src/data/generated/pilot.ts';
import { historyManifest } from '../../src/history/generated/manifest.ts';

// Editorial spelling equivalents only. They do not verify identity, birth or location.
export const aliasGroups = [
  ['Anaksimandros', 'Anaximander', 'Anaksimander'],
  ['Pisagor', 'Pythagoras'],
  ['Thales', 'Tales'],
  ['Epikür', 'Epikuros'],
  ['Diyojen', 'Dirojen'],
  ['Nikolas Kopernik', 'Nicolaus Copernicus', 'Nikolas Kopernikus'],
  ['Johannes Gutenberg', 'Johann Gutenberg'],
  ['Antonie van Leeuwenhoek', 'Anton Van Leeuwenhoek'],
  ['Isaac Newton', 'Sir Isaac Newton'],
  ['Gregor Mendel', 'Gregor Johann Mendel'],
  ['Alessandro Volta', 'Kont Alessandro Volta'],
  ['Ernest Rutherford', 'Sir Ernest Rutherford'],
  ['Alexander Fleming', 'Sir Alexander Fleming'],
  ['James Chadwick', 'Sir James Chadwick'],
  ['Frank Whittle', 'Sir Franklin Whittle'],
  ['Joseph John Thomson', 'Sir Joseph John Thomson'],
  ['James Watson', 'James Dewey Watson'],
  ['Linus Pauling', 'Linus Carl Pauling'],
  ['Gottlieb Daimler', 'Gottlieb Wilhelm Daimler'],
  ['Dmitri Mendeleev', 'Dimitri Mendeleyev'],
  ['Wilhelm Conrad Röntgen', 'Wilhelm Röntgen'],
  ['Henri Becquerel', 'Antoine Henri Becquerel'],
  ['Niccolò Machiavelli', 'Niccolo Machiavelli'],
  ['Thomas Aquinas', 'Aquinalı Aziz Thomas'],
  ['William of Ockham', 'Ockhamlı William'],
  ['Spinoza', 'Baruch Spinoza'],
  ['Montesquieu', 'Charles Montesquieu'],
  ['Hegel', 'Wilhelm Hegel', 'Georg Wilhelm Friedrich Hegel'],
  ['Søren Kierkegaard', 'Soren Kierkegaard'],
  ['Voltaire', 'François Marie Arouet'],
  ['Augustinus', 'Aziz Augustinus'],
  ['El Harezmi', 'Harezmi'],
  ['Antonio Vivaldi', 'Antonio Antonio Vivaldi'],
  ['Büyük İskender', 'İskender'],
  ['Büyük Konstantin', 'Konstantin'],
  ['İmparator I. Jüstinyen', 'I. Justinianus'],
  ['Büyük Kiros', 'II. Kiros'],
  ['Aşoka', 'Ashoka'],
  ['Charlemagne', 'Şarlman'],
  ['Fatih William', 'William the Conqueror'],
  ['Kraliçe I. Elizabeth', 'I. Elizabeth'],
  ['Kraliçe I. Isabella', 'I. Isabel'],
  ['Büyük Petro', 'I. Petro'],
  ['Julius Caesar', 'Jül Sezar'],
  ['Lenin', 'Vladimir Lenin'],
  ['Kristof Kolomb', 'Christopher Columbus'],
  ['Michelangelo', 'Michelangelo Buonarroti'],
  ['Zhang Heng', 'Zhan Heng'],
  ['Elealı Zenon', 'Zenon', 'Zeno', 'Zeno of Elea'],
];
export const ambiguousNames = [
  'Sargon',
  'Hattuşili',
  'Mursili',
  'Nebukadnezar',
  'Dicle-Pileser',
  'Kılıç Arslan',
  'Ptolemaios',
  'Kral Faysal',
  'Millî Salih Demirel',
];
const groups = new Set(
  ['The Beatles', 'Led Zeppelin', 'Pink Floyd', 'Queen', 'The Rolling Stones'].map(normalizeSearch),
);
const aliases = new Map(aliasGroups.flatMap((g) => g.map((a) => [normalizeSearch(a), g[0]])));
const canonical = (name) => aliases.get(normalizeSearch(name)) ?? name;
export function splitRequests(text) {
  if (typeof text !== 'string' || text.length > 128 * 1024) throw new Error('REQUEST_TEXT_BUDGET');
  const out = [];
  let section = '';
  for (const line of text.split(/\r?\n/u)) {
    if (!line.trim()) continue;
    const header = /^=== (.+) ===$/u.exec(line);
    if (header) {
      section = header[1];
      continue;
    }
    if (!section) throw new Error('REQUEST_SECTION');
    let depth = 0,
      start = 0;
    for (let i = 0; i <= line.length; i++) {
      if (line[i] === '(') depth++;
      if (line[i] === ')' && --depth < 0) throw new Error('REQUEST_PARENTHESES');
      if (i === line.length || (depth === 0 && line.slice(i, i + 3) === ' - ')) {
        const original = line.slice(start, i).trim();
        if (!original) throw new Error('REQUEST_EMPTY');
        out.push({ original, section });
        start = i + 3;
        if (i !== line.length) i += 2;
      }
    }
    if (depth !== 0) throw new Error('REQUEST_PARENTHESES');
  }
  if (out.length > 2000) throw new Error('REQUEST_COUNT_BUDGET');
  return out;
}
export function buildRequestRegistry(
  text,
  catalogs = [
    ...peopleCatalogs,
    ...expandedCatalogs,
    ...ottomanCatalogs,
    ...globalCatalogs,
    ...broadCatalogs,
    {
      records: historyManifest.rows
        .filter((r) => r.kind === 'person')
        .map((r) => ({
          id: r.id,
          kind: 'person',
          wikidataId: r.qid,
          names: [{ language: r.language, value: r.name }],
          alternativeNames: r.aliases.map((value) => ({ language: 'und', value })),
        })),
    },
  ],
) {
  const profiles = new Map(
    [...preparedPilot.records, ...catalogs.flatMap((c) => c.records)]
      .filter((r) => r.kind === 'person')
      .map((r) => [r.id, r]),
  );
  const oldNames = new Map();
  for (const p of profiles.values())
    for (const n of [...p.names, ...p.alternativeNames]) {
      const key = normalizeSearch(canonical(n.value));
      const matches = oldNames.get(key) ?? [];
      if (!matches.some((m) => m.id === p.id)) matches.push(p);
      oldNames.set(key, matches);
    }
  const rows = splitRequests(text),
    merged = new Map();
  const add = (name, alias, section, original) => {
    const resolved = canonical(name),
      key = normalizeSearch(resolved);
    let r = merged.get(key);
    if (!r) {
      const candidates = oldNames.get(key) ?? [];
      const p = candidates.length === 1 ? candidates[0] : null;
      const pending = peopleManifest.pending.find(
        (p) => normalizeSearch(canonical(p.name)) === key,
      );
      r = {
        id: 'request:' + createHash('sha256').update(key).digest('hex').slice(0, 20),
        name: resolved,
        aliases: [...(pending?.aliases ?? [])],
        sections: [],
        originals: [],
        kind: groups.has(key)
          ? 'group'
          : ambiguousNames.some((n) => normalizeSearch(n) === key)
            ? 'ambiguous'
            : 'person',
        wikidataId: p?.wikidataId ?? pending?.wikidataId ?? null,
        recordId: p?.id ?? null,
        status: p
          ? 'published'
          : ambiguousNames.some((n) => normalizeSearch(n) === key)
            ? 'skipped-unresolved-identity'
            : 'source-review-required',
      };
      merged.set(key, r);
    }
    r.aliases = [
      ...new Set([
        ...r.aliases,
        name,
        alias,
        ...(aliasGroups.find((g) => g.some((a) => normalizeSearch(a) === key)) ?? []),
      ]),
    ].filter(Boolean);
    r.sections = [...new Set([...r.sections, section])];
    r.originals = [...new Set([...r.originals, original])];
  };
  for (const { original, section } of rows) {
    if (original === 'Wright Kardeşler') {
      for (const n of ['Orville Wright', 'Wilbur Wright']) add(n, n, section, original);
      continue;
    }
    const match = /^([^()]+?)(?:\s*\(([^()]*)\))?$/u.exec(original);
    if (!match) throw new Error('REQUEST_NAME');
    const name = match[1].trim();
    const parenthesis = match[2]?.trim();
    add(name, parenthesis, section, original);
    if (name === 'The Beatles')
      for (const n of (parenthesis ?? '').split(' - ')) add(n, n, section, original);
  }
  const records = [...merged.values()].sort((a, b) => a.name.localeCompare(b.name, 'tr'));
  return {
    version: 1,
    inputSha256: createHash('sha256').update(text).digest('hex'),
    occurrences: rows.length,
    records,
    summary: {
      uniqueRequests: records.length,
      published: records.filter((r) => r.status === 'published').length,
      groups: records.filter((r) => r.kind === 'group').length,
      ambiguous: records.filter((r) => r.kind === 'ambiguous').length,
      pending: records.filter((r) => r.status === 'source-review-required').length,
      skipped: records.filter((r) => r.status === 'skipped-unresolved-identity').length,
    },
  };
}
export async function requestOutput() {
  const text = await readFile(
    new URL('../../data/people/raw/expanded-request.txt', import.meta.url),
    'utf8',
  );
  return buildRequestRegistry(text);
}
export async function writeRequestRegistry() {
  const result = await requestOutput(),
    target = new URL('../../src/people/generated/requests.ts', import.meta.url);
  const config = await prettier.resolveConfig(fileURLToPath(target));
  await writeFile(
    target,
    await prettier.format(
      'export const requestedPeople = ' + JSON.stringify(result) + ' as const;\n',
      { ...config, parser: 'typescript' },
    ),
  );
  await writeFile(
    new URL('../../data/people/production/requests.json', import.meta.url),
    JSON.stringify(result, null, 2) + '\n',
  );
  return result;
}
if (process.argv[1] === fileURLToPath(import.meta.url))
  console.log(JSON.stringify((await writeRequestRegistry()).summary));
