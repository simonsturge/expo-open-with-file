import { FileInfo } from 'expo-file-system';

export type OpenedFile = {
  info: FileInfo;
  base64: string;
};
