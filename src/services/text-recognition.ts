export async function recognizeImageText(uri: string): Promise<string[]> {
  let textExtractor: typeof import('expo-text-extractor');
  try {
    textExtractor = await import('expo-text-extractor');
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    if (/Cannot find native module ['"]?ExpoTextExtractor/i.test(message)) {
      throw new Error(
        'OCR is not included in this installed app. Rebuild and reinstall the development app with `npx expo run:android` or `npx expo run:ios`. Expo Go does not include this native module.',
      );
    }
    throw error;
  }

  if (!textExtractor.isSupported) {
    throw new Error('Text recognition is not available on this device.');
  }
  return textExtractor.extractTextFromImage(uri);
}
