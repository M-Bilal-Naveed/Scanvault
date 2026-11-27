import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, Platform, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader } from '../components/ScreenHeader';
import { PressableScale } from '../components/PressableScale';
import { assertInternetAvailable, confirmExternalUpload } from '../services/online';
import { recognizeImageTextOnline } from '../services/online-ocr';
import { getProviderKey } from '../services/provider-keys';
import { recognizeImageText } from '../services/text-recognition';
import { useTheme, font, palette, radius } from '../theme/tokens';

export default function Ocr() {
  const t = useTheme();
  const router = useRouter();
  const [uri, setUri] = useState<string>();
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const run = async (camera: boolean) => {
    if (busy) return;
    setBusy(true);
    setError('');
    let nativeFailure = '';
    try {
      const opts: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], quality: 1 };
      const result = camera
        ? await ImagePicker.launchCameraAsync(opts)
        : await ImagePicker.launchImageLibraryAsync(opts);
      if (result.canceled) return;

      const imageUri = result.assets[0].uri;
      setUri(imageUri);
      setText('');
      if (Platform.OS !== 'web') {
        try {
          const recognized = await recognizeImageText(imageUri);
          const extractedText = recognized.join('\n').trim();
          if (extractedText) {
            setText(extractedText);
            return;
          }
        } catch (cause: unknown) {
          nativeFailure = cause instanceof Error ? cause.message : String(cause);
        }
      }

      await assertInternetAvailable();
      if (!(await getProviderKey('ocr'))?.trim()) {
        throw new Error(
          `${nativeFailure ? `${nativeFailure} ` : ''}Add your free OCR.space API key in Settings to use online OCR.`,
        );
      }
      const confirmed = await confirmExternalUpload(
        'Use online OCR?',
        'This image will be uploaded to OCR.space for text recognition. Continue only if you agree to share this image with that service.',
        'Upload image',
      );
      if (!confirmed) {
        setError('Online OCR was canceled. Your image was not uploaded.');
        return;
      }
      const extractedText = await recognizeImageTextOnline(imageUri);
      setText(extractedText);
      if (!extractedText) setError('No text found. Try a sharper, well-lit photo.');
    } catch (cause: unknown) {
      const message = cause instanceof Error ? cause.message : String(cause);
      setError(nativeFailure && !message.includes(nativeFailure) ? `${nativeFailure}\n${message}` : message);
    } finally {
      setBusy(false);
    }
  };

  const copyText = async () => {
    try {
      await Clipboard.setStringAsync(text);
      Alert.alert('Text copied', 'The recognized text is on your clipboard.');
    } catch (cause: unknown) {
      Alert.alert('Could not copy text', cause instanceof Error ? cause.message : String(cause));
    }
  };

  const shareText = async () => {
    try {
      await Share.share({ message: text });
    } catch (cause: unknown) {
      Alert.alert('Could not share text', cause instanceof Error ? cause.message : String(cause));
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }}>
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 48, gap: 14 }}>
        <ScreenHeader title="Image to text" onBack={() => router.back()} />
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <PressableScale style={[styles.btn, { flex: 1 }]} onPress={() => run(true)}><Text style={styles.bt}>Camera</Text></PressableScale>
          <PressableScale style={[styles.btn, { flex: 1, backgroundColor: t.card, borderWidth: 1, borderColor: t.line }]} onPress={() => run(false)}>
            <Text style={[styles.bt, { color: t.text }]}>Gallery</Text>
          </PressableScale>
        </View>
        {uri && <Image source={{ uri }} style={styles.img} resizeMode="contain" />}
        {busy && <ActivityIndicator color={palette.teal} />}
        {!!error && <Text style={{ fontFamily: font.medium, color: t.muted, lineHeight: 22 }}>{error}</Text>}
        {!!text && (
          <>
            <View style={[styles.box, { backgroundColor: t.card, borderColor: t.line }]}>
              <Text selectable style={{ color: t.text, fontFamily: font.medium, fontSize: 16, lineHeight: 24 }}>{text}</Text>
            </View>
            <View style={styles.actions}>
              <PressableScale style={[styles.btn, { flex: 1 }]} onPress={() => void copyText()}>
                <Text style={styles.bt}>Copy text</Text>
              </PressableScale>
              <PressableScale style={[styles.btn, styles.secondary, { flex: 1, backgroundColor: t.card, borderColor: t.line }]} onPress={() => void shareText()}>
                <Text style={[styles.bt, { color: t.text }]}>Share text</Text>
              </PressableScale>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  btn: { height: 52, borderRadius: radius.pill, backgroundColor: palette.teal, alignItems: 'center', justifyContent: 'center' },
  secondary: { borderWidth: 1 },
  actions: { flexDirection: 'row', gap: 10 },
  bt: { fontFamily: font.bold, fontSize: 16, color: palette.ink },
  img: { width: '100%', height: 220, borderRadius: radius.md, backgroundColor: '#00000010' },
  box: { minHeight: 200, maxHeight: 360, borderRadius: radius.md, borderWidth: 1, padding: 16 },
});
