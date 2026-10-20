// UI/renderer facade. Original pilot remains independently testable and backward compatible.
import {
  pilotProvider,
  pilotTimeline as baseTimeline,
  pilotSearch as baseSearch,
  createHistoricalFeatureLoader,
} from './pilot';
import { preparedPilot } from './generated/pilot';
import { createApplicationData } from './application-core';
import { worldRepository } from './world/runtime';
import { peopleExtension } from '../people/runtime';
import { historyArchive } from '../history/runtime';
export {
  pilotStatus,
  pilotCultures,
  pilotManifest,
  getPilotSource,
  getPilotCoverage,
  createHistoricalFeatureLoader,
} from './pilot';
export type { HistoricalView, RenderFeatureCollection } from './pilot';
if (!pilotProvider || !baseTimeline || !baseSearch) throw new Error('BOOTSTRAP_UNAVAILABLE');
const application = createApplicationData(
  { provider: pilotProvider, timeline: baseTimeline, search: baseSearch, catalog: preparedPilot },
  worldRepository,
  peopleExtension,
  historyArchive,
);
export const pilotPersons = application.persons;
export const pilotEvents = application.events;
export const pilotTimeline = application.timeline;
export const pilotSearch = application.search;
export const pilotPolitics = application.politics;
export const pilotSources = application.sources;
export const getPilotRecord = application.provider.getById;
export const historicalFeatures = createHistoricalFeatureLoader(pilotTimeline, pilotPolitics);
export { worldRepository };
