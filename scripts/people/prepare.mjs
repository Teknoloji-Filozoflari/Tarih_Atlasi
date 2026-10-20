import { buildPeople, writePeople } from './build.mjs';
const m = await writePeople(await buildPeople());
console.log(
  JSON.stringify({
    version: m.version,
    profiles: m.published,
    annualBirths: m.annualBirths,
    biographicalOnly: m.biographicalOnly,
    pending: m.pending.length,
    packs: m.entries.length,
  }),
);
