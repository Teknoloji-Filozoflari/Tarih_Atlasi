import { fileURLToPath } from 'node:url';
import { writeFile } from 'node:fs/promises';
import { buildPeople, writePeople } from './build.mjs';
import { reviewedExpansionInputs } from '../../src/people/policy.ts';
export const expansionOptions = {
  version: '1.1.1-births',
  requestCount: 29,
  namespace: 'people-expanded',
  approvedInputs: reviewedExpansionInputs,
  rawDirectory: 'data/people/expanded-raw/',
  outputDirectory: 'src/people/expanded/',
  productionDirectory: 'data/people/expanded-production/',
};
export const buildExpansion = () => buildPeople(expansionOptions);
export const expansionNotice =
  'Wikidata contributors · CC0-1.0\nhttps://www.wikidata.org/wiki/Wikidata:Licensing\nExpanded people 1.1.1-births: 29 person sources, 28 place sources, 4 editorial review sources. P569/P570/P19 and P625 assertions extracted and reviewed with pinned source revisions. Year-only approximate representative points; uncertain/traditional chronology remains biographical. Suleiman I birth chronology has a 1496 alternative in TDV: https://islamansiklopedisi.org.tr/suleyman-i . His Trabzon relationship is now biographical, not an annual birth point. TDV is a research cross-check; no article text, media or geometry redistributed. Unknown death is not converted to an invented lifetime. No Wikipedia article text, Commons portraits or inferred travel/current residence. User name spellings in the request registry are search hints, not sourced historical aliases.\n';
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const manifest = await writePeople(await buildExpansion(), expansionOptions);
  await writeFile(
    new URL('../../assets/licenses/Wikidata-expanded-people-NOTICE.txt', import.meta.url),
    expansionNotice,
  );
  console.log(
    JSON.stringify({
      published: manifest.published,
      annualBirths: manifest.annualBirths,
      bio: manifest.biographicalOnly,
      packs: manifest.entries.length,
    }),
  );
}
