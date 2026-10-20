import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { readFile, realpath, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pipeline } from 'node:stream/promises';
import { createGzip } from 'node:zlib';

const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.atlas': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/plain; charset=utf-8',
  '.ttf': 'font/ttf',
  '.woff2': 'font/woff2',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml',
};

export function exportCSP(html = '') {
  const hashes = [...html.matchAll(/<script\b(?![^>]*\bsrc\s*=)[^>]*>([\s\S]*?)<\/script>/giu)].map(
    (m) => `'sha256-${createHash('sha256').update(m[1]).digest('base64')}'`,
  );
  return `default-src 'self'; script-src 'self' ${hashes.join(' ')}; script-src-attr 'none'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self' https://www.wikidata.org https://tiles.openfreemap.org; worker-src 'self' blob:; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'`;
}

const within = (root, path) => path === root || path.startsWith(root + sep);

export function createExportResolver(directory) {
  const root = resolve(directory);
  const policies = new Map();
  return async function resolveExport(raw) {
    if (typeof raw !== 'string' || raw.length > 4096 || /%2e|%2f|%5c|\\|\0/iu.test(raw))
      throw new Error('PATH');
    const url = new URL(raw, 'http://127.0.0.1');
    let path = resolve(root, '.' + decodeURIComponent(url.pathname));
    if (!within(root, path)) throw new Error('PATH');
    let status = 200;
    try {
      if ((await stat(path)).isDirectory()) path = resolve(path, 'index.html');
    } catch {
      try {
        await stat(path + '.html');
        path += '.html';
      } catch {
        if (extname(path)) throw new Error('NOT_FOUND');
        path = resolve(root, '+not-found.html');
        status = 404;
      }
    }
    if (!within(await realpath(root), await realpath(path))) throw new Error('PATH');
    const info = await stat(path);
    if (!info.isFile()) throw new Error('NOT_FOUND');
    const key = `${path}:${info.size}:${info.mtimeMs}`;
    let csp = exportCSP();
    if (extname(path) === '.html') {
      csp = policies.get(key);
      if (!csp) {
        if (info.size > 4 * 1024 * 1024) throw new Error('HTML_SIZE');
        csp = exportCSP(await readFile(path, 'utf8'));
        if (policies.size >= 128) policies.delete(policies.keys().next().value);
        policies.set(key, csp);
      }
    }
    return {
      path,
      status,
      size: info.size,
      headers: {
        'Content-Type': types[extname(path)] ?? 'application/octet-stream',
        'Cache-Control': /\/[a-f0-9]{64}\.(?:json|atlas)$/u.test(path)
          ? 'public, max-age=31536000, immutable'
          : 'no-cache',
        ETag: `W/"${info.size.toString(16)}-${Math.trunc(info.mtimeMs).toString(16)}"`,
        Vary: 'Accept-Encoding',
        'Content-Security-Policy': csp,
        'Referrer-Policy': 'no-referrer',
        'X-Content-Type-Options': 'nosniff',
      },
    };
  };
}

export function createRequestHandler(directory) {
  const resolveExport = createExportResolver(directory);
  return async (req, res) => {
    if (!['GET', 'HEAD'].includes(req.method)) {
      res.writeHead(405, { Allow: 'GET, HEAD' });
      res.end();
      return;
    }
    try {
      if (req.url === '/healthz') {
        await resolveExport('/index.html');
        res.writeHead(200, { 'Content-Type': 'text/plain', 'Cache-Control': 'no-store' });
        res.end(req.method === 'HEAD' ? undefined : 'ok\n');
        return;
      }
      const resource = await resolveExport(req.url);
      if (resource.status === 200 && req.headers['if-none-match'] === resource.headers.ETag) {
        res.writeHead(304, resource.headers);
        res.end();
        return;
      }
      const compressed =
        resource.size > 1024 &&
        /(?:text\/|application\/json)/u.test(resource.headers['Content-Type']) &&
        /(?:^|,)\s*gzip\s*(?:,|$)/u.test(req.headers['accept-encoding'] ?? '');
      res.writeHead(resource.status, {
        ...resource.headers,
        ...(compressed ? { 'Content-Encoding': 'gzip' } : { 'Content-Length': resource.size }),
      });
      if (req.method === 'HEAD') res.end();
      else if (compressed)
        await pipeline(createReadStream(resource.path), createGzip({ level: 4 }), res);
      else await pipeline(createReadStream(resource.path), res);
    } catch {
      if (!res.headersSent) {
        res.writeHead(404, {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'no-store',
          'X-Content-Type-Options': 'nosniff',
        });
        res.end('404');
      } else res.destroy();
    }
  };
}

export async function startExportServer({
  directory = process.env.ATLAS_DIST_DIR ?? 'dist',
  host = process.env.ATLAS_HOST ?? '127.0.0.1',
  port = process.env.ATLAS_PORT ?? '8081',
} = {}) {
  if (!/^\d{1,5}$/u.test(String(port)) || Number(port) < 1 || Number(port) > 65535)
    throw new Error('ATLAS_PORT must be between 1 and 65535');
  await createExportResolver(directory)('/index.html');
  const server = createServer(createRequestHandler(directory));
  server.requestTimeout = 30_000;
  server.headersTimeout = 15_000;
  server.maxRequestsPerSocket = 1000;
  server.on('error', (error) => {
    console.error('Web sunucusu başlatılamadı:', error.code);
    process.exitCode = 1;
  });
  server.listen(Number(port), host, () => console.log(`Tarih Atlası: http://${host}:${port}`));
  for (const signal of ['SIGINT', 'SIGTERM'])
    process.once(signal, () => {
      server.close();
      server.closeIdleConnections();
      const timer = setTimeout(() => server.closeAllConnections(), 5000);
      timer.unref();
    });
  return server;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  startExportServer().catch((error) => {
    console.error('Web sunucusu hazır değil:', error.code ?? error.message);
    process.exitCode = 1;
  });
}
