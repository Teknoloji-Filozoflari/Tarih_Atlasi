import { peopleCatalogs, peopleManifest } from './generated';
import { peopleCatalogs as expandedCatalogs, peopleManifest as expandedManifest } from './expanded';
import { peopleCatalogs as ottomanCatalogs, peopleManifest as ottomanManifest } from './ottoman';
import { combinePeopleExtensions, createPeopleExtension } from './extension';
import { peopleCatalogs as globalCatalogs, peopleManifest as globalManifest } from './global';
import { peopleCatalogs as broadCatalogs, peopleManifest as broadManifest } from './broad';
export const peopleExtension = combinePeopleExtensions(
  combinePeopleExtensions(
    createPeopleExtension(globalCatalogs, globalManifest),
    createPeopleExtension(broadCatalogs, broadManifest),
  ),
  combinePeopleExtensions(
    combinePeopleExtensions(
      createPeopleExtension(peopleCatalogs, peopleManifest),
      createPeopleExtension(expandedCatalogs, expandedManifest),
    ),
    createPeopleExtension(ottomanCatalogs, ottomanManifest),
  ),
);
export { peopleManifest };
