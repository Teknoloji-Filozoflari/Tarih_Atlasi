import { worldManifest } from './generated/manifest';
import { readWorldAsset } from './reader';
import { createWorldRepository } from './repository';
export const worldRepository = createWorldRepository(worldManifest, readWorldAsset);
