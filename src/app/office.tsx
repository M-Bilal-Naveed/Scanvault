import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { ScreenHeader } from '../components/ScreenHeader';
import { PressableScale } from '../components/PressableScale';
import { convertOffice } from '../services/office';
import { assertInternetAvailable, confirmExternalUpload } from '../services/online';
import { getProviderKey } from '../services/provider-keys';
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
  const busyRef = useRef(false);
  const autoPicked = useRef<Kind | null>(null);

  const pick = useCallback(async (selectedKind: Kind) => {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy('Opening file picker…');
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: true });
      if (result.canceled) return;
      const asset = result.assets[0];
      const extension = asset.name.split('.').pop()?.toLowerCase() ?? '';
      if (!(KINDS[selectedKind].exts as readonly string[]).includes(extension)) {
        Alert.alert('Wrong file type', `Please choose a ${KINDS[selectedKind].exts.map((ext) => `.${ext}`).join(', ')} file.`);
        return;
      }
      await assertInternetAvailable();
      const apiKey = await getProviderKey('office');
      if (!apiKey?.trim()) {
        throw new Error('Add your free CloudConvert API key in Settings before converting files.');
      }
      const confirmed = await confirmExternalUpload(
        'Upload document for conversion?',
        'This file will be sent to CloudConvert and processed by its service. Its free plan currently allows up to 10 conversions per day; quotas and terms can change. ScanVault will request deletion of the uploaded job after conversion.',
        'Upload and convert',
      );
      if (!confirmed) return;
      setBusy(asset.name);
      const converted = await convertOffice(asset.uri, asset.name, apiKey);
      if (converted.size <= 0 || converted.pages <= 0) {
        throw new Error('The selected file did not produce a readable PDF.');
      }
      await add(converted);
      if (converted.cleanupWarning) Alert.alert('Conversion complete', converted.cleanupWarning);
      router.replace('/(tabs)/library');
    } catch (error: unknown) {
      Alert.alert('Conversion failed', error instanceof Error ? error.message : String(error));
    } finally {
      busyRef.current = false;
      setBusy('');
    }
  }, [add, router]);

  useEffect(() => {
    if (isKind(kind) && autoPicked.current !== kind) {
      autoPicked.current = kind;
      const timeout = setTimeout(() => { void pick(kind); }, 0);
      return () => clearTimeout(timeout);
    }
  }, [kind, pick]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }}>
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 48, gap: 12 }}>
        <ScreenHeader title="Office to PDF" onBack={() => router.back()} />
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
            <Text style={{ fontFamily: font.medium, color: t.muted }} numberOfLines={1}>
              {busy === 'Opening file picker…' ? busy : `Converting ${busy}…`}
            </Text>
          </View>
        )}
        <Text style={{ fontFamily: font.medium, color: t.muted, lineHeight: 21, marginTop: 8 }}>
          Conversion uses CloudConvert. The selected file is uploaded only after you confirm. Its free plan is limited; see Settings for API key setup.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, borderRadius: radius.lg, borderWidth: 1 },
  chip: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
});
