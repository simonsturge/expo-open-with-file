import { File, Paths } from 'expo-file-system';
import { useEffect, useRef, useState } from 'react';
import { AppState, Platform } from 'react-native';

import { OpenedFile } from './ExpoOpenWithFile.types';
import { readFile, getFileName } from './ExpoOpenWithFileModule';
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

  const getFileNameFromUri = (uri: string) => {
    try {
      const decodedUri = decodeURIComponent(uri);
      const segments = decodedUri.split('/');
      return segments[segments.length - 1];
    } catch (e) {
      console.error('Failed to parse file name from URI:', e);
      return '';
    }
  };

  const readUrl = async (uri: string) => {
    try {
      const sourceFile = new File(uri);
      debug && console.log('[expo-open-with-file] exists', sourceFile.exists);
      if (!sourceFile.exists) {
        if (Platform.OS === 'ios') {
          debug &&
            console.log(
              '[expo-open-with-file] file could be protected, try native read (this can happen when opening documents in place is enabled)',
            );
          const fileData = await readFile(uri);
          if (fileData) {
            const fileName = getFileNameFromUri(uri);
            debug &&
              console.log(
                '[expo-open-with-file] file found by native code',
                JSON.stringify(fileData),
                fileName,
              );
            setFile({
              info: {
                exists: true,
                uri,
                size: new Blob([fileData]).size,
                modificationTime: Date.now(),
              },
              fileName,
              base64: fileData,
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
      const tempFile = new File(Paths.cache, 'temp');
      await sourceFile.copy(tempFile, { overwrite: true });
      const base64 = await tempFile.base64();
      tempFile.delete();
      const fileName =
        Platform.OS === 'ios'
          ? getFileNameFromUri(uri)
          : await getFileName(uri);
      const info = {
        exists: true,
        uri,
        size: sourceFile.size,
        modificationTime: sourceFile.lastModified ?? undefined,
      };
      const file = { info, base64, fileName };
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
