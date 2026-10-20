/** Browser/WebView-only lossless fallback for packaged DOM's file:// origin.
 * No script-evaluated data and no relaxation of WebView file-origin permissions.
 */
export async function decodeWorldGzip(
  encoded: string,
  bytes: number,
  signal: AbortSignal,
): Promise<string> {
  if (signal.aborted) throw new Error('WORLD_ASSET_ABORT');
  if (typeof DecompressionStream === 'undefined')
    throw new Error('WORLD_DECOMPRESSION_UNAVAILABLE');
  if (
    !/^[A-Za-z0-9+/]*={0,2}$/.test(encoded) ||
    encoded.length > 1024 * 1024 ||
    !Number.isInteger(bytes) ||
    bytes < 2 ||
    bytes > 512 * 1024
  )
    throw new Error('WORLD_COMPRESSED_SIZE');
  const binary = atob(encoded),
    input = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) input[i] = binary.charCodeAt(i);
  const reader = new Blob([input])
    .stream()
    .pipeThrough(new DecompressionStream('gzip'))
    .getReader();
  const decoder = new TextDecoder();
  let count = 0,
    result = '';
  const abort = () => {
    void reader.cancel().catch(() => {});
  };
  signal.addEventListener('abort', abort, { once: true });
  try {
    for (;;) {
      if (signal.aborted) throw new Error('WORLD_ASSET_ABORT');
      const { value, done } = await reader.read();
      if (done) break;
      count += value.length;
      if (count > bytes) throw new Error('WORLD_DECOMPRESSED_SIZE');
      result += decoder.decode(value, { stream: true });
    }
    if (count !== bytes || signal.aborted) throw new Error('WORLD_DECOMPRESSED_SIZE_OR_ABORT');
    return result + decoder.decode();
  } finally {
    signal.removeEventListener('abort', abort);
    await reader.cancel().catch(() => {});
  }
}
