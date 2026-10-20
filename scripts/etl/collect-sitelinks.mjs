import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fetchSitelinkCandidate } from './wikidata-sitelinks.mjs';
import { readBounded, canonicalJSON } from './pipeline.mjs';
import { isQid } from '../../src/sources/sitelinks.ts';
const ids = process.argv.slice(2);
try {
  if (
    ids.length < 1 ||
    ids.length > 5 ||
    new Set(ids).size !== ids.length ||
    ids.some((id) => !isQid(id))
  )
    throw new Error('Usage: npm run sitelinks:collect -- Q… [maximum5]');
  const directory = resolve('data/staging/wikidata-sitelinks');
  await mkdir(directory, { recursive: true });
  for (const [index, id] of ids.entries()) {
    if (index > 0) await new Promise((resolve) => setTimeout(resolve, 1000));
    let cached = null;
    try {
      cached = {
        id,
        text: (await readBounded(resolve(directory, `${id}.json`), 262144)).toString('utf8'),
        receipt: JSON.parse(
          (await readBounded(resolve(directory, `${id}.receipt.json`), 16384)).toString('utf8'),
        ),
      };
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
    const result = await fetchSitelinkCandidate(id, {
      userAgent: process.env.WIKIDATA_USER_AGENT,
      cached,
    });
    if (!result.cacheHit) {
      await writeFile(resolve(directory, `${id}.json`), result.text);
      await writeFile(
        resolve(directory, `${id}.receipt.json`),
        canonicalJSON(result.receipt) + '\n',
      );
    }
    await writeFile(
      resolve(directory, `${id}.review.json`),
      canonicalJSON(result.candidate) + '\n',
    );
    process.stdout.write(
      `${id}: ${result.cacheHit ? 'cache' : 'download'}; UNVERIFIED; productionApproved=false\n`,
    );
  }
} catch (error) {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
}
