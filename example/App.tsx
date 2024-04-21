import { useOpenWithFile } from 'expo-open-with-file';
import { Text, View } from 'react-native';

export default function App() {
  const { file } = useOpenWithFile();

  console.log('FILE', JSON.stringify(file));

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>File: {file?.info.uri || 'none'}</Text>
    </View>
  );
}
