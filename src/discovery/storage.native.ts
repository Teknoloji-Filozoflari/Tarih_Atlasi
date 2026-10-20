import * as FileSystem from 'expo-file-system/legacy';
import { createFileBookmarkStorage } from './file-storage';
export const bookmarkStorage = createFileBookmarkStorage(FileSystem);
