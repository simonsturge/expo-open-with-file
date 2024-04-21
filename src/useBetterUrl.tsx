import { getInitialURL, useURL } from 'expo-linking';
import { useEffect, useState } from 'react';

export const useBetterURL = (): string | null | undefined => {
  const url = useURL();

  const [urlState, setUrlState] = useState<string | null | undefined>(
    undefined,
  );

  useEffect(() => {
    async function updateURL() {
      if (urlState === undefined) {
        const initialUrl = await getInitialURL();
        setUrlState(initialUrl);
        return;
      }
      if (url === urlState) {
        return;
      }
      setUrlState(url);
    }
    updateURL();
  }, [url, urlState]);

  return urlState;
};
