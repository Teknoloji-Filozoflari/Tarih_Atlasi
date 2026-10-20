import { placesManifest } from './generated/catalog';
import { readPlaceAsset } from './reader';
import { createPlacesRepository } from './repository';
export const placesRepository = createPlacesRepository(placesManifest, readPlaceAsset);
