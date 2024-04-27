import { useOpenWithFile } from 'expo-open-with-file';
import { useEffect } from 'react';
import { Text, View } from 'react-native';

export default function App() {
  const { file } = useOpenWithFile({ resetOnBackground: true });

  useEffect(() => {
    if (file) {
      console.log('Info', JSON.stringify(file.info));
      console.log('Base64', JSON.stringify(file.base64));
    }
  }, [file]);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>File: {file?.info.uri || 'none'}</Text>
    </View>
  );
}
