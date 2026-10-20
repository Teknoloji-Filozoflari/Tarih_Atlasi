const { lstat } = require('node:fs/promises');
const { createReadStream, constants } = require('node:fs');
const { join } = require('node:path');
const { pipeline } = require('node:stream');

/** Metro development middleware: fixed hash paths only, never arbitrary filesystem access. */
exports.createPlacesMiddleware = (
  root,
  next,
  loadManifest = async () => (await import('../../src/places/generated/catalog.ts')).placesManifest,
) => {
  let allowed;
  return async (req, res, ...rest) => {
    if (typeof req.url !== 'string' || !req.url.startsWith('/data/places/'))
      return next(req, res, ...rest);
    const match = /^\/data\/places\/([a-f0-9]{64})\.atlas$/.exec(req.url);
    if (!match) {
      res.writeHead(404);
      res.end();
      return;
    }
    if (!['GET', 'HEAD'].includes(req.method)) {
      res.writeHead(405, { Allow: 'GET, HEAD' });
      res.end();
      return;
    }
    try {
      allowed ??= Promise.all([loadManifest(), import('../../src/places/catalog.ts')]).then(
        ([manifest, schema]) => {
          schema.assertPlacesManifest(manifest);
          return new Map(manifest.packs.map((pack) => [pack.sha256, pack.bytes]));
        },
      );
      const expected = (await allowed).get(match[1]);
      if (expected === undefined) throw new Error('PLACES_STATIC_UNAPPROVED');
      const file = join(root, 'assets', 'places', match[1] + '.atlas');
      const info = await lstat(file);
      if (
        !info.isFile() ||
        info.isSymbolicLink() ||
        info.size !== expected ||
        info.size < 2 ||
        info.size > 256 * 1024
      )
        throw new Error('PLACES_STATIC_FILE');
      res.writeHead(200, {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': info.size,
        'Cache-Control': 'public, max-age=31536000, immutable',
        ETag: '"' + match[1] + '"',
        'X-Content-Type-Options': 'nosniff',
      });
      if (req.method === 'HEAD') {
        res.end();
        return;
      }
      pipeline(
        createReadStream(file, {
          start: 0,
          end: info.size - 1,
          flags: constants.O_RDONLY | constants.O_NOFOLLOW,
        }),
        res,
        () => {},
      );
    } catch {
      if (!res.headersSent) {
        res.writeHead(404);
        res.end();
      } else res.destroy();
    }
  };
};
