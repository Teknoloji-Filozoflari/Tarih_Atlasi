import * as FileSystem from 'expo-file-system/legacy';
import { createWorldNativeCache } from './native-cache';
// Shared holds/quota across licensed world geometry and modern gazetteer assets.
export const atlasAssetCache = createWorldNativeCache(FileSystem);
