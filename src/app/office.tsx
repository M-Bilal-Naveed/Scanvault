import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { PressableScale } from '../components/PressableScale';
import { convertOffice } from '../services/office';
import { useLibrary } from '../store/library';
import { useTheme, font, palette, radius } from '../theme/tokens';

const KINDS = {
  word: { title: 'Word to PDF', sub: '.docx files', icon: 'document-text', color: palette.blue, exts: ['docx'] },
  ppt: { title: 'PowerPoint to PDF', sub: '.pptx files, one slide per page', icon: 'easel', color: palette.amber, exts: ['pptx'] },
  excel: { title: 'Excel to PDF', sub: '.xlsx, .xls and .csv files', icon: 'grid', color: palette.teal, exts: ['xlsx', 'xls', 'csv'] },
} as const;
type Kind = keyof typeof KINDS;

function isKind(value: string | string[] | undefined): value is Kind {
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(KINDS, value);
}

export default function Office() {
  const t = useTheme();
  const router = useRouter();
  const { kind } = useLocalSearchParams<{ kind?: string }>();
  const add = useLibrary((s) => s.add);
  const [busy, setBusy] = useState('');
  const autoPicked = useRef<Kind | null>(null);

  const pick = useCallback(async (selectedKind: Kind) => {
    if (busy) return;
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: true });
      if (result.canceled) return;
      const asset = result.assets[0];
      const extension = asset.name.split('.').pop()?.toLowerCase() ?? '';
      if (!(KINDS[selectedKind].exts as readonly string[]).includes(extension)) {
        Alert.alert('Wrong file type', `Please choose a ${KINDS[selectedKind].exts.map((ext) => `.${ext}`).join(', ')} file.`);
        return;
      }
      setBusy(asset.name);
      const converted = await convertOffice(asset.uri, asset.name);
      await add(converted);
      router.replace('/(tabs)/library');
    } catch (error: unknown) {
      Alert.alert('Conversion failed', error instanceof Error ? error.message : String(error));
    } finally {
      setBusy('');
    }
  }, [add, busy, router]);

  useEffect(() => {
    if (isKind(kind) && autoPicked.current !== kind) {
      autoPicked.current = kind;
      const timeout = setTimeout(() => { void pick(kind); }, 0);
      return () => clearTimeout(timeout);
    }
  }, [kind, pick]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }}>
      <ScrollView contentContainerStyle={{ padding: 24, gap: 12 }}>
        <Text style={[styles.h, { color: t.text }]}>Office to PDF</Text>
        {(Object.keys(KINDS) as Kind[]).map((item) => (
          <PressableScale key={item} disabled={!!busy} style={[styles.row, { backgroundColor: t.card, borderColor: t.line }]} onPress={() => void pick(item)}>
            <View style={[styles.chip, { backgroundColor: KINDS[item].color }]}><Ionicons name={KINDS[item].icon as any} size={22} color={palette.ink} /></View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: font.bold, fontSize: 16, color: t.text }}>{KINDS[item].title}</Text>
              <Text style={{ fontFamily: font.medium, fontSize: 13, color: t.muted }}>{KINDS[item].sub}</Text>
            </View>
          </PressableScale>
        ))}
        {!!busy && (
          <View style={{ alignItems: 'center', gap: 8, marginTop: 8 }}>
            <ActivityIndicator color={palette.teal} />
            <Text style={{ fontFamily: font.medium, color: t.muted }} numberOfLines={1}>Converting {busy}…</Text>
          </View>
        )}
        <Text style={{ fontFamily: font.medium, color: t.muted, lineHeight: 21, marginTop: 8 }}>
          Conversion runs on your phone. Text and spreadsheet data are preserved; embedded images, formatting, charts, and animations may not be retained.
        </Text>
        <PressableScale onPress={() => router.back()}><Text style={{ fontFamily: font.bold, color: t.muted, textAlign: 'center', marginTop: 8 }}>Close</Text></PressableScale>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  h: { fontFamily: font.heavy, fontSize: 30, letterSpacing: -0.5 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, borderRadius: radius.lg, borderWidth: 1 },
  chip: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
});
