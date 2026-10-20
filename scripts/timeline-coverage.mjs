// Local coverage report only. No data collection or automatic nearest-snapshot display.
import { pilotTimeline } from '../src/data/pilot.ts';
import { selectableYearRange } from '../src/timeline/year.ts';
import { PILOT_YEAR } from '../src/data/pilot-contract.ts';
if (!pilotTimeline) throw new Error('Pilot rejected');
const range = selectableYearRange();
const years = [
  ...new Set([
    range.minYear,
    -2,
    -1,
    1,
    2,
    PILOT_YEAR - 1,
    PILOT_YEAR,
    PILOT_YEAR + 1,
    range.maxYear,
  ]),
];
const summarize = (report) => ({
  selectedYear: report.selectedYear,
  sourceYear: report.sourceYear,
  isPreview: report.isPreview,
  mode: report.mode,
  selectedYearMode: report.selectedYearMode,
  recordIds: report.records.map((hit) => hit.record.id),
  partial: report.partial,
  unresolvedTemporalRecords: report.unresolvedTemporalRecords,
});
const reports = [];
for (const year of years) reports.push(summarize(await pilotTimeline.getDataCoverage(year)));
process.stdout.write(
  `${JSON.stringify(
    {
      catalogVersion: pilotTimeline.catalogVersion,
      selectableRange: range,
      notices: [
        'A selectable year is not a coverage claim.',
        'No new historical records in phase 06.',
      ],
      snapshots: await pilotTimeline.getAvailableSnapshots(),
      reports,
      explicitPreviewExample: summarize(
        await pilotTimeline.getDataCoverage(PILOT_YEAR + 1, { preview: 'nearest-snapshot' }),
      ),
    },
    null,
    2,
  )}\n`,
);
