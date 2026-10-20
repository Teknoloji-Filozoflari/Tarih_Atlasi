import { fileURLToPath } from 'node:url';
import { writeFile } from 'node:fs/promises';
import { buildPeople, writePeople } from './build.mjs';
import { reviewedOttomanInputs } from '../../src/people/policy.ts';

export const ottomanOptions = {
  version: '1.2.0-births',
  requestCount: 33,
  namespace: 'people-ottoman',
  approvedInputs: reviewedOttomanInputs,
  rawDirectory: 'data/people/ottoman-raw/',
  outputDirectory: 'src/people/ottoman/',
  productionDirectory: 'data/people/ottoman-production/',
};
export const buildOttoman = () => buildPeople(ottomanOptions);
export const ottomanNotice =
  'Wikidata contributors · CC0-1.0\nhttps://www.wikidata.org/wiki/Wikidata:Licensing\nOttoman people 1.2.0-births: 33 additional person profiles. Reviewed editorial extraction of P569/P570/P19 and P625, with source revisions and SHA256. City/site representative points are approximate; they are not birth rooms, continuous residence or reign locations. Conflicting early chronology, unreferenced birth assertions and unverified building phases remain biographical or unlocated. TDV articles are research cross-checks only: https://islamansiklopedisi.org.tr/orhan , https://islamansiklopedisi.org.tr/bayezid-i , https://islamansiklopedisi.org.tr/bayezid-ii . No TDV/Wikipedia text, images or geometry redistributed.\n';
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const manifest = await writePeople(await buildOttoman(), ottomanOptions);
  await writeFile(
    new URL('../../assets/licenses/Wikidata-ottoman-people-NOTICE.txt', import.meta.url),
    ottomanNotice,
  );
  console.log(
    JSON.stringify({
      published: manifest.published,
      annualBirths: manifest.annualBirths,
      biographicalOnly: manifest.biographicalOnly,
      packs: manifest.entries.length,
    }),
  );
}
