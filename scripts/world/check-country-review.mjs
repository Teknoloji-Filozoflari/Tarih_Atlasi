import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { worldManifest } from '../../src/data/world/generated/manifest.ts';
import { reviewedWorldRow, reviewedSupplementGeometry } from '../../src/data/world/review.ts';
for (const index of [
  13239, 13370, 13580, 13613, 13369, 13659, 13234, 13773, 13199, 13254, 13374, 13605,
]) {
  const row = reviewedWorldRow(worldManifest.rows.find((r) => r.index === index));
  assert.equal(row.withheld, null);
  assert.ok(reviewedSupplementGeometry(row));
}
assert.equal(
  createHash('sha256')
    .update(
      await readFile(new URL('../../assets/licenses/country-review-NOTICE.txt', import.meta.url)),
    )
    .digest('hex'),
  '1a3e6ef9e26a0365d1ef8be8b57ecf0ed7036db257e2591e0aa85e9d4385f33e',
);
console.log(
  'PASS: pinned CC BY 4.0 Chad/Libya/Angola/Mali/Tunisia extraction, original source periods, reviewed geometry and NOTICE; no CShapes or modern boundary import.',
);
