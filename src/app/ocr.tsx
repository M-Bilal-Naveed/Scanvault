import React, { useState } from 'react';
import { ActivityIndicator, Image, ScrollView, Share, StyleSheet, Text, TextInput, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PressableScale } from '../components/PressableScale';
import { useTheme, font, palette, radius } from '../theme/tokens';

export default function Ocr() {
  const t = useTheme();
  const router = useRouter();
  const [uri, setUri] = useState<string>();
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const run = async (camera: boolean) => {
    const opts: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], quality: 1 };
    const r = camera ? await ImagePicker.launchCameraAsync(opts) : await ImagePicker.launchImageLibraryAsync(opts);
    if (r.canceled) return;
    const u = r.assets[0].uri;
    setUri(u); setText(''); setError(''); setBusy(true);
    try {
      const TextRecognition = require('@react-native-ml-kit/text-recognition').default;
      const res = await TextRecognition.recognize(u);
      setText(res.text || '');
      if (!res.text) setError('No text found. Try a sharper, well-lit photo.');
    } catch {
      setError('Offline text recognition is a native feature. It does not run inside Expo Go. Build a development build (see the steps in chat) and it will work here.');
    }
    setBusy(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }}>
      <ScrollView contentContainerStyle={{ padding: 24, gap: 14 }}>
        <Text style={[styles.h, { color: t.text }]}>Image to text</Text>
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
            <TextInput multiline value={text} onChangeText={setText} style={[styles.box, { color: t.text, backgroundColor: t.card, borderColor: t.line }]} />
            <PressableScale style={styles.btn} onPress={() => Share.share({ message: text })}><Text style={styles.bt}>Copy or share text</Text></PressableScale>
          </>
        )}
        <PressableScale onPress={() => router.back()}><Text style={{ fontFamily: font.bold, color: t.muted, textAlign: 'center' }}>Close</Text></PressableScale>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  h: { fontFamily: font.heavy, fontSize: 30, letterSpacing: -0.5 },
  btn: { height: 52, borderRadius: radius.pill, backgroundColor: palette.teal, alignItems: 'center', justifyContent: 'center' },
  bt: { fontFamily: font.bold, fontSize: 16, color: palette.ink },
  img: { width: '100%', height: 220, borderRadius: radius.md, backgroundColor: '#00000010' },
  box: { minHeight: 200, borderRadius: radius.md, borderWidth: 1, padding: 16, fontFamily: font.medium, fontSize: 16, textAlignVertical: 'top' },
});
