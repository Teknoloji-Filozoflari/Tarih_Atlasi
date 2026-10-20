import { pilotStatus } from './pilot.ts';
// Görüntülenebilir kaynaklı sınır sayısı; teknik kimlik/ilişki kayıtları ayrı sayılır.
export const catalogSummary = Object.freeze({
  state: pilotStatus.ok ? ('partial' as const) : ('invalid' as const),
  recordCount: pilotStatus.boundaryCount,
  catalogRecordCount: pilotStatus.catalogRecordCount,
  personCount: pilotStatus.personCount,
  eventCount: pilotStatus.eventCount,
});
