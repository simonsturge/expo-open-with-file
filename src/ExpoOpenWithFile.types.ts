import { FileInfo } from 'expo-file-system';

export type OpenedFile = {
  info: FileInfo;
  fileName: string | null;
  base64: string;
};
