import { Buffer } from 'node:buffer';

/** Research/ETL reader: never holds an entire world FeatureCollection in memory. */
export const geoJSONBudgets = Object.freeze({
  bytes: 512 * 1024 * 1024,
  featureBytes: 8 * 1024 * 1024,
  metadataBytes: 256 * 1024,
  features: 50000,
  depth: 64,
  timeoutMs: 120000,
});
const whitespace = (c) => c === ' ' || c === '\n' || c === '\r' || c === '\t';

export async function* readGeoJSONFeatures(stream, { limits = {}, onMetadata = () => {} } = {}) {
  const budget = { ...geoJSONBudgets };
  for (const [key, value] of Object.entries(limits)) {
    if (!(key in budget) || !Number.isInteger(value) || value < 1 || value > budget[key])
      throw new Error('GEOJSON_LIMIT_CONFIG');
    budget[key] = value;
  }
  const decoder = new TextDecoder('utf-8', { fatal: true });
  const keys = new Set(),
    metadata = new Map();
  const deadline = Date.now() + budget.timeoutMs;
  let state = 'root',
    key,
    capture = null,
    allowEnd = true,
    featuresSeen = false;
  let bytes = 0,
    count = 0;
  const begin = (c, target, offset) => {
    if (!'{["-0123456789tfn'.includes(c)) throw new Error('GEOJSON_VALUE');
    capture = {
      target,
      parts: [],
      bytes: 0,
      offset,
      stack: c === '{' || c === '[' ? [c] : [],
      string: c === '"',
      escaped: false,
      primitive: !'{["'.includes(c),
      topString: c === '"',
    };
  };
  const append = (text) => {
    capture.bytes += Buffer.byteLength(text);
    const maximum = capture.target === 'feature' ? budget.featureBytes : budget.metadataBytes;
    if (capture.bytes > maximum) throw new Error('GEOJSON_VALUE_BUDGET');
    capture.parts.push(text);
  };
  const complete = () => {
    const { target, parts } = capture;
    const value = JSON.parse(parts.join(''));
    capture = null;
    if (target === 'key') {
      if (typeof value !== 'string' || value.length > 128 || keys.has(value) || keys.size >= 64)
        throw new Error('GEOJSON_ROOT_KEY');
      keys.add(value);
      key = value;
      state = 'colon';
    } else if (target === 'metadata') {
      metadata.set(key, value);
      onMetadata(key, value);
      state = 'afterValue';
    } else {
      if (++count > budget.features) throw new Error('GEOJSON_FEATURE_BUDGET');
      if (!value || value.type !== 'Feature' || Array.isArray(value))
        throw new Error('GEOJSON_FEATURE_TYPE');
      state = 'afterFeature';
      return value;
    }
  };
  for await (const binary of stream) {
    if (!(binary instanceof Uint8Array) || binary.byteLength > 1024 * 1024)
      throw new Error('GEOJSON_CHUNK_BUDGET');
    if ((bytes += binary.byteLength) > budget.bytes) throw new Error('GEOJSON_INPUT_BUDGET');
    if (Date.now() > deadline) throw new Error('GEOJSON_TIME_BUDGET');
    const chunk = decoder.decode(binary, { stream: true });
    if (capture) capture.offset = 0;
    for (let i = 0; i < chunk.length; i++) {
      const c = chunk[i];
      if (capture) {
        let end = false,
          reprocess = false;
        if (capture.primitive) {
          if (whitespace(c) || ',]}'.includes(c)) {
            end = true;
            reprocess = true;
          }
        } else if (capture.string) {
          if (capture.escaped) capture.escaped = false;
          else if (c === '\\') capture.escaped = true;
          else if (c === '"') {
            capture.string = false;
            end = capture.topString;
          }
        } else if (c === '"') capture.string = true;
        else if (c === '{' || c === '[') {
          capture.stack.push(c);
          if (capture.stack.length > budget.depth) throw new Error('GEOJSON_DEPTH_BUDGET');
        } else if (c === '}' || c === ']') {
          if (capture.stack.pop() !== (c === '}' ? '{' : '[')) throw new Error('GEOJSON_BRACKETS');
          end = capture.stack.length === 0;
        }
        const maximum = capture.target === 'feature' ? budget.featureBytes : budget.metadataBytes;
        if (capture.bytes + i - capture.offset > maximum) throw new Error('GEOJSON_VALUE_BUDGET');
        if (end) {
          append(chunk.slice(capture.offset, i + (reprocess ? 0 : 1)));
          const feature = complete();
          if (feature) yield feature;
          if (reprocess) i--;
        }
        continue;
      }
      if (whitespace(c)) continue;
      if (state === 'root') {
        if (c !== '{') throw new Error('GEOJSON_ROOT');
        state = 'key';
        allowEnd = true;
      } else if (state === 'key') {
        if (c === '}' && allowEnd) state = 'done';
        else if (c === '"') begin(c, 'key', i);
        else throw new Error('GEOJSON_KEY');
      } else if (state === 'colon') {
        if (c !== ':') throw new Error('GEOJSON_COLON');
        state = 'value';
      } else if (state === 'value') {
        if (key === 'features') {
          if (c !== '[') throw new Error('GEOJSON_FEATURE_ARRAY');
          featuresSeen = true;
          state = 'feature';
          allowEnd = true;
        } else begin(c, 'metadata', i);
      } else if (state === 'feature') {
        if (c === ']' && allowEnd) state = 'afterValue';
        else if (c === '{') begin(c, 'feature', i);
        else throw new Error('GEOJSON_FEATURE_ARRAY');
      } else if (state === 'afterFeature') {
        if (c === ',') {
          state = 'feature';
          allowEnd = false;
        } else if (c === ']') state = 'afterValue';
        else throw new Error('GEOJSON_FEATURE_SEPARATOR');
      } else if (state === 'afterValue') {
        if (c === ',') {
          state = 'key';
          allowEnd = false;
        } else if (c === '}') state = 'done';
        else throw new Error('GEOJSON_ROOT_SEPARATOR');
      } else throw new Error('GEOJSON_TRAILING_INPUT');
    }
    if (capture) append(chunk.slice(capture.offset));
  }
  decoder.decode();
  if (capture || state !== 'done' || !featuresSeen || metadata.get('type') !== 'FeatureCollection')
    throw new Error('GEOJSON_INCOMPLETE_COLLECTION');
}
