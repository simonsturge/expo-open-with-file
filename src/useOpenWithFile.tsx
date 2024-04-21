import * as FileSystem from 'expo-file-system';
import { useURL } from 'expo-linking';
import { useEffect, useState } from 'react';

import { OpenedFile } from './ExpoOpenWithFile.types';
import { useBetterURL } from './useBetterUrl';

type OpenWithFileOptions = {
  debug?: boolean;
};

const useOpenWithFile = ({ debug }: OpenWithFileOptions = { debug: false }) => {
  const url = useBetterURL();

  const [file, setFile] = useState<OpenedFile | null>(null);

  const readUrl = async (uri: string) => {
    try {
      const info = await FileSystem.getInfoAsync(uri);
      debug && console.log('[expo-open-with-url] info', JSON.stringify(info));
      if (!info.exists || info.isDirectory) {
        debug && console.log('[expo-open-with-url] not supported');
        return;
      }
      const temp = FileSystem.cacheDirectory + 'temp';
      await FileSystem.copyAsync({ from: uri, to: temp });
      const base64 = await FileSystem.readAsStringAsync(temp, {
        encoding: FileSystem.EncodingType.Base64,
      });
      await FileSystem.deleteAsync(temp);
      const file = { info, base64 };
      debug && console.log('[expo-open-with-url] file', JSON.stringify(file));
      setFile(file);
    } catch (e) {
      debug && console.log('[expo-open-with-url] not supported', e);
    }
  };

  useEffect(() => {
    debug && console.log('[expo-open-with-url] url', url);
    if (!url || !url.startsWith('file://') || !url.startsWith('content://')) {
      debug && console.log('[expo-open-with-url] url not supported');
      return;
    }
    readUrl(url);
  }, [url]);

  return { file };
};

export default useOpenWithFile;
