import * as FileSystem from 'expo-file-system/legacy';
import { createFileBookmarkStorage } from '../discovery/file-storage';
export const preferenceStorage = createFileBookmarkStorage(FileSystem, 'atlas-preferences-v1.json');
