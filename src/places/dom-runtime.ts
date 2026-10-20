import { placesManifest } from './generated/catalog';
import { readPlaceAsset } from './reader.dom';
import { createPlacesRepository } from './repository';
// Only the native DOM entry imports this adapter. Its file-origin policy is unchanged.
export const domPlacesRepository = createPlacesRepository(placesManifest, readPlaceAsset);
