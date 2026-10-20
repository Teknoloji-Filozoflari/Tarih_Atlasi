import { createDataRuntime } from './runtime-core';
import { chunkStorage } from './storage.native';
// No approved production API origin exists yet. Native uses reviewed bundled parts + private cache.
export const dataRuntime = createDataRuntime(chunkStorage, null);
