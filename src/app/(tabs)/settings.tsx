import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLibrary } from '../../store/library';
import { fmtSize } from '../../services/pdf';
import { useTheme, font, palette, radius } from '../../theme/tokens';

export default function Settings() {
  const t = useTheme();
  const items = useLibrary((s) => s.items);
  const total = items.reduce((a, i) => a + i.size, 0);
  const Row = ({ icon, title, value }: { icon: string; title: string; value: string }) => (
    <View style={[styles.row, { backgroundColor: t.card, borderColor: t.line }]}>
      <Ionicons name={icon as any} size={22} color={palette.teal} />
      <Text style={{ flex: 1, fontFamily: font.bold, fontSize: 16, color: t.text }}>{title}</Text>
      <Text style={{ fontFamily: font.medium, color: t.muted }}>{value}</Text>
    </View>
  );
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }}>
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 140, gap: 12 }}>
        <Text style={[styles.h, { color: t.text }]}>Settings</Text>
        <Row icon="albums-outline" title="Saved PDFs" value={`${items.length}`} />
        <Row icon="save-outline" title="Storage used" value={fmtSize(total)} />
        <Row icon="image-outline" title="PDF image quality" value="Original" />
        <Row icon="color-palette-outline" title="Theme" value="Follows system" />
        <View style={[styles.note, { borderColor: t.line }]}>
          <Ionicons name="lock-closed" size={18} color={palette.teal} />
          <Text style={{ flex: 1, fontFamily: font.medium, color: t.muted, lineHeight: 21 }}>Your files never leave your device. ScanVault has no account, no server and no tracking.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  h: { fontFamily: font.heavy, fontSize: 32, letterSpacing: -0.5, marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, borderRadius: radius.lg, borderWidth: 1 },
  note: { flexDirection: 'row', gap: 12, padding: 16, borderRadius: radius.lg, borderWidth: 1.5, borderStyle: 'dashed', marginTop: 8 },
});
