import { writeFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fetchPersonEntity } from './wikidata-persons.mjs';
import { canonicalJSON, readBounded } from './pipeline.mjs';

const ids = process.argv.slice(2);
try {
  if (
    ids.length < 1 ||
    ids.length > 5 ||
    new Set(ids).size !== ids.length ||
    ids.some((id) => !/^Q[1-9]\d{0,15}$/.test(id))
  )
    throw new Error('Usage: npm run persons:collect -- Q… [maximum 5 IDs]');
  const directory = resolve('data/staging/wikidata-persons');
  await mkdir(directory, { recursive: true });
  for (const id of ids) {
    let cached = null;
    try {
      cached = {
        id,
        text: (await readBounded(resolve(directory, `${id}.json`), 4 * 1024 * 1024)).toString(
          'utf8',
        ),
        receipt: JSON.parse(
          (await readBounded(resolve(directory, `${id}.receipt.json`), 16384)).toString('utf8'),
        ),
      };
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
    const result = await fetchPersonEntity(id, {
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
      canonicalJSON(result.candidates) + '\n',
    );
    process.stdout.write(
      `${id}: ${result.cacheHit ? 'cache' : 'download'}; UNVERIFIED; productionApproved=false\n`,
    );
  }
} catch (error) {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
}
