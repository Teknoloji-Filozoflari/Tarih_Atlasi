import * as FileSystem from 'expo-file-system/legacy';
import { createFileBookmarkStorage } from '../discovery/file-storage';
export const noteStorage = createFileBookmarkStorage(FileSystem, 'atlas-notes-v1.json');
