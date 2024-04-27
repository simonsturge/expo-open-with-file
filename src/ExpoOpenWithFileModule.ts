import { requireNativeModule } from 'expo-modules-core';

const ExpoOpenWithFileModule = requireNativeModule('ExpoOpenWithFile');
export default ExpoOpenWithFileModule;

export async function readFile(url: string): Promise<string | null> {
  return ExpoOpenWithFileModule.readFile(url);
}
