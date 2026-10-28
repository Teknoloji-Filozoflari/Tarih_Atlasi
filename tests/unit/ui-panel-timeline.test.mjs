import assert from 'node:assert/strict';
import { test } from 'node:test';
import { activePeriodId, periodHighlight, periodWindows } from '../../src/atlas/periodWindows.ts';
import { readLayerCatalogCounts } from '../../src/atlas/catalogCounts.ts';
import { MIN_YEAR } from '../../src/timeline/year.ts';

test('period windows stay within product docs and jump to requestedYear targets', () => {
  const maxYear = 2026;
  const windows = periodWindows(maxYear);
  assert.equal(windows.length, 6);
  assert.deepEqual(
    windows.map((w) => w.id),
    ['range-start', 'pilot-p01', 'era-ms1', 'pilot-p02', 'pilot-p03', 'present'],
  );
  assert.equal(windows[0].targetYear, MIN_YEAR);
  assert.equal(windows[1].start, -1600);
  assert.equal(windows[1].end, -1200);
  assert.equal(windows[1].targetYear, -1400);
  assert.equal(windows[2].targetYear, 1);
  assert.equal(windows[3].targetYear, 1200);
  assert.equal(windows[4].targetYear, 1923);
  assert.equal(windows[5].targetYear, maxYear);
});

test('active period prefers the narrowest matching window', () => {
  assert.equal(activePeriodId(-2000, 2026), 'range-start');
  assert.equal(activePeriodId(-1400, 2026), 'pilot-p01');
  assert.equal(activePeriodId(1, 2026), 'era-ms1');
  assert.equal(activePeriodId(1200, 2026), 'pilot-p02');
  assert.equal(activePeriodId(1923, 2026), 'pilot-p03');
  assert.equal(activePeriodId(2026, 2026), 'present');
  assert.equal(activePeriodId(500, 2026), null);
});

test('period highlight fractions stay ordered inside the visible slider window', () => {
  const band = periodHighlight('pilot-p01', 2026, MIN_YEAR, 2026);
  assert.ok(band);
  assert.ok(band.startFraction < band.endFraction);
  assert.ok(band.startFraction >= 0 && band.endFraction <= 1);
  assert.equal(periodHighlight(null, 2026, MIN_YEAR, 2026), null);
});

test('layer catalog counts use real manifests and honest culture zero', () => {
  const counts = readLayerCatalogCounts();
  assert.equal(counts.culture, 0);
  assert.ok((counts.state ?? 0) > 1000);
  assert.ok((counts.person ?? 0) >= 3000);
  assert.ok((counts.war ?? 0) > 0);
  assert.ok((counts.event ?? 0) > 0);
  assert.equal(counts.labels, null);
  assert.equal((counts.war ?? 0) + (counts.event ?? 0), 1084);
});
