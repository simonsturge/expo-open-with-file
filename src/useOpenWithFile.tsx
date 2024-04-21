import * as FileSystem from 'expo-file-system';

import { useEffect, useState } from 'react';
import { useBetterURL } from './useBetterUrl';
import { OpenedFile } from './ExpoOpenWithFile.types';
import { Platform } from 'react-native';

type OpenWithFileOptions = {
  debug?: boolean;
};

const useOpenWithFile = ({ debug }: OpenWithFileOptions = { debug: false }) => {
  const url = useBetterURL();

  const [file, setFile] = useState<OpenedFile | null>(null);

  const readUrl = async (uri: string) => {
    try {
      const info = await FileSystem.getInfoAsync(uri);
      debug && console.log('[expo-open-with-file] info', JSON.stringify(info));
      if (!info.exists || info.isDirectory) {
        debug && console.log('[expo-open-with-file] not supported');
        return;
      }
      const temp = FileSystem.cacheDirectory + 'temp';
      await FileSystem.copyAsync({ from: uri, to: temp });
      const base64 = await FileSystem.readAsStringAsync(temp, {
        encoding: FileSystem.EncodingType.Base64,
      });
      await FileSystem.deleteAsync(temp);
      const file = { info, base64 };
      debug && console.log('[expo-open-with-file] file', JSON.stringify(file));
      setFile(file);
    } catch (e) {
      debug && console.log('[expo-open-with-file] not supported', e);
    }
  };

  useEffect(() => {
    debug && console.log('[expo-open-with-file] url', url);
    if (!url) {
      debug && console.log('[expo-open-with-file] no url, stop');
      return;
    }
    if (Platform.OS === 'android' && url.startsWith('content://')) {
      debug && console.log('[expo-open-with-file] android, read url');
      readUrl(url);
      return;
    }
    if (Platform.OS === 'ios' && url.startsWith('file://')) {
      debug && console.log('[expo-open-with-file] iOS, read url');
      readUrl(url);
      return;
    }
  }, [url]);

  return { file };
};

export default useOpenWithFile;
