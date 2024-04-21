import * as FileSystem from 'expo-file-system';
import { useURL } from 'expo-linking';
import { useEffect, useState } from 'react';

import { OpenedFile } from './ExpoOpenWithFile.types';

const useOpenWithFile = () => {
  const url = useURL();

  const [file, setFile] = useState<OpenedFile | null>(null);

  const readUrl = async (uri: string) => {
    try {
      const info = await FileSystem.getInfoAsync(uri);
      if (!info.exists || info.isDirectory) {
        return;
      }
      const temp = FileSystem.cacheDirectory + 'temp';
      await FileSystem.copyAsync({ from: uri, to: temp });
      const base64 = await FileSystem.readAsStringAsync(temp, {
        encoding: FileSystem.EncodingType.Base64,
      });
      await FileSystem.deleteAsync(temp);
      setFile({ info, base64 });
    } catch {
      // unsupported file
    }
  };

  useEffect(() => {
    if (!url || !url.startsWith('file://') || url.startsWith('content://'))
      return;
    readUrl(url);
  }, [url]);

  return { file };
};

export default useOpenWithFile;
