import { historyManifest } from './generated/manifest';
import { createHistoryRepository } from './repository';
import { readHistoryAsset } from './reader';
export const historyArchive = createHistoryRepository(historyManifest, readHistoryAsset);
