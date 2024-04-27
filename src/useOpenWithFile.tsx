import * as FileSystem from 'expo-file-system';
import { useEffect, useRef, useState } from 'react';
import { AppState, Platform } from 'react-native';

import { OpenedFile } from './ExpoOpenWithFile.types';
import { readFile } from './ExpoOpenWithFileModule';
import { useBetterURL } from './useBetterUrl';

type OpenWithFileOptions = {
  resetOnBackground?: boolean;
  debug?: boolean;
};

const useOpenWithFile = (
  { debug = false, resetOnBackground = false }: OpenWithFileOptions = {
    resetOnBackground: false,
    debug: false,
  },
) => {
  const url = useBetterURL();

  const [file, setFile] = useState<OpenedFile | null>(null);

  const appState = useRef(AppState.currentState);

  const readUrl = async (uri: string) => {
    try {
      const info = await FileSystem.getInfoAsync(uri);
      debug && console.log('[expo-open-with-file] info', JSON.stringify(info));
      if (!info.exists) {
        if (Platform.OS === 'ios') {
          debug &&
            console.log(
              '[expo-open-with-file] file could be protected, try native read (this can happen when opening documents in place is enabled)',
            );
          const file = await readFile(uri);
          if (file) {
            debug &&
              console.log(
                '[expo-open-with-file] file found by native code',
                JSON.stringify(file),
              );
            setFile({
              info: {
                exists: true,
                uri,
                size: new Blob([file]).size,
                isDirectory: false,
                modificationTime: Date.now(),
              },
              base64: file,
            });
          } else {
            debug &&
              console.log('[expo-open-with-file] url not found by native code');
          }
        } else {
          debug && console.log('[expo-open-with-file] url not found');
        }
        return;
      }
      if (info.isDirectory) {
        debug &&
          console.log('[expo-open-with-file] url is directory, not file');
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
    }
  }, [url]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        resetOnBackground &&
        appState.current === 'active' &&
        ['inactive', 'background'].includes(nextAppState)
      ) {
        debug && console.log('[expo-open-with-file] clear file');
        setFile(null);
      }
      appState.current = nextAppState;
    });
    return () => {
      subscription.remove();
    };
  }, []);

  return { file };
};

export default useOpenWithFile;
