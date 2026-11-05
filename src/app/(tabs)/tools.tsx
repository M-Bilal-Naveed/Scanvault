import React, { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { PressableScale } from '../../components/PressableScale';
import { mergePdfs } from '../../services/pdf';
import { useLibrary } from '../../store/library';
import { useTheme, font, palette, radius } from '../../theme/tokens';

export default function Tools() {
  const t = useTheme();
  const router = useRouter();
  const add = useLibrary((s) => s.add);
  const [busy, setBusy] = useState(false);

  const merge = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const r = await DocumentPicker.getDocumentAsync({ type: 'application/pdf', multiple: true, copyToCacheDirectory: true });
      if (r.canceled) return;
      if (r.assets.length < 2) {
        Alert.alert('Pick at least 2 PDFs', 'Select several files in one go to merge them.');
        return;
      }
      const res = await mergePdfs(r.assets.map((a) => a.uri), 'merged');
      await add({ name: 'Merged PDF', ...res });
      router.push('/(tabs)/library');
    } catch (e: unknown) {
      Alert.alert('Merge failed', e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const tools = [
    { title: 'Images to PDF', sub: 'Camera or gallery', icon: 'images', color: palette.blue, go: () => router.push('/scan') },
    { title: 'Word to PDF', sub: '.docx files', icon: 'document-text', color: palette.teal, go: () => router.push({ pathname: '/office', params: { kind: 'word' } }) },
    { title: 'PowerPoint to PDF', sub: '.pptx files', icon: 'easel', color: palette.amber, go: () => router.push({ pathname: '/office', params: { kind: 'ppt' } }) },
    { title: 'Excel to PDF', sub: '.xlsx, .xls, .csv', icon: 'grid', color: palette.violet, go: () => router.push({ pathname: '/office', params: { kind: 'excel' } }) },
    { title: 'Merge PDFs', sub: 'Combine 2 or more', icon: 'git-merge', color: palette.blue, go: merge },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }}>
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 140, gap: 12 }}>
        <Text style={[styles.h, { color: t.text }]}>Tools</Text>
        {tools.map((x) => (
          <PressableScale key={x.title} disabled={busy} style={[styles.row, { backgroundColor: t.card, borderColor: t.line }]} onPress={x.go}>
            <View style={[styles.chip, { backgroundColor: x.color }]}><Ionicons name={x.icon as any} size={22} color={palette.ink} /></View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: font.bold, fontSize: 16, color: t.text }}>{x.title}</Text>
              <Text style={{ fontFamily: font.medium, fontSize: 13, color: t.muted }}>{x.sub}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={t.muted} />
          </PressableScale>
        ))}
        {busy && <ActivityIndicator color={palette.teal} />}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  h: { fontFamily: font.heavy, fontSize: 32, letterSpacing: -0.5, marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, borderRadius: radius.lg, borderWidth: 1 },
  chip: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
});
