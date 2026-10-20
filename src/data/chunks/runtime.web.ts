import { createDataRuntime } from './runtime-core';
import { chunkStorage } from './storage.web';
import { fetchChunk } from './network';
export const dataRuntime = createDataRuntime(
  chunkStorage,
  typeof location !== 'undefined' && ['https:', 'http:'].includes(location.protocol)
    ? fetchChunk
    : null,
);
