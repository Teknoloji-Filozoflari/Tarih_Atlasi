import { historicalFeatures, worldRepository } from '../../data/application';
import { ensureApplicationData } from '../../data/application-runtime';
import { createChunkedFeatureLoader, worldInlineVerifier } from './data-loader';
import { peopleExtension } from '../../people/runtime';
import { historyArchive } from '../../history/runtime';
export { applicationDataRuntime as globeDataRuntime } from '../../data/application-runtime';
const verifiedWorldGeometry = worldInlineVerifier(worldRepository);
export const chunkedHistoricalFeatures = createChunkedFeatureLoader(
  historicalFeatures,
  { ensure: ensureApplicationData },
  (id) =>
    verifiedWorldGeometry(id) || peopleExtension.hasGeometry(id) || historyArchive.hasGeometry(id),
);
