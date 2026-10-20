import * as FileSystem from 'expo-file-system/legacy';
import { createFileChunkStorage } from './file-storage';
export const chunkStorage = createFileChunkStorage(FileSystem);
