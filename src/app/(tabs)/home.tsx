import React, { useEffect } from 'react';
import { ScrollView, Text, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { PressableScale } from '../../components/PressableScale';
import { useLibrary } from '../../store/library';
import { fmtSize } from '../../services/pdf';
import { useTheme, font, palette, radius } from '../../theme/tokens';

export default function Home() {
  const t = useTheme();
  const router = useRouter();
  const { items, load } = useLibrary();
  useEffect(() => { load(); }, [load]);

  const actions = [
    { title: 'Images to PDF', sub: 'Camera or gallery', icon: 'images-outline', color: palette.blue, go: () => router.push('/scan') },
    { title: 'Word to PDF', sub: '.docx files', icon: 'document-text-outline', color: palette.teal, go: () => router.push({ pathname: '/office', params: { kind: 'word' } }) },
    { title: 'PowerPoint to PDF', sub: '.pptx files', icon: 'easel-outline', color: palette.amber, go: () => router.push({ pathname: '/office', params: { kind: 'ppt' } }) },
    { title: 'Excel to PDF', sub: '.xlsx, .xls, .csv', icon: 'grid-outline', color: palette.violet, go: () => router.push({ pathname: '/office', params: { kind: 'excel' } }) },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }}>
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 140 }}>
        <Text style={[styles.h1, { color: t.text }]}>What do you want{'\n'}to scan today?</Text>
        <View style={styles.grid}>
          {actions.map((a) => (
            <PressableScale key={a.title} style={[styles.card, { backgroundColor: t.card, borderColor: t.line }]} onPress={a.go}>
              <View style={[styles.chip, { backgroundColor: a.color }]}><Ionicons name={a.icon as any} size={22} color={palette.ink} /></View>
              <Text style={[styles.cardTitle, { color: t.text }]}>{a.title}</Text>
              <Text style={[styles.cardSub, { color: t.muted }]}>{a.sub}</Text>
            </PressableScale>
          ))}
        </View>
        <Text style={[styles.h2, { color: t.text }]}>Recent</Text>
        {items.length === 0 ? (
          <View style={[styles.empty, { borderColor: t.line }]}>
            <Ionicons name="document-outline" size={28} color={t.muted} />
            <Text style={{ fontFamily: font.medium, color: t.muted, marginTop: 8 }}>Scan your first document to see it here.</Text>
          </View>
        ) : items.slice(0, 3).map((i) => (
          <PressableScale key={i.id} style={[styles.recent, { backgroundColor: t.card, borderColor: t.line }]} onPress={() => router.push('/(tabs)/library')}>
            <Ionicons name="document-text" size={22} color={palette.teal} />
            <Text style={{ flex: 1, fontFamily: font.bold, color: t.text }} numberOfLines={1}>{i.name}</Text>
            <Text style={{ fontFamily: font.medium, color: t.muted, fontSize: 13 }}>{fmtSize(i.size)}</Text>
          </PressableScale>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  h1: { fontFamily: font.heavy, fontSize: 32, lineHeight: 38, letterSpacing: -0.6 },
  h2: { fontFamily: font.bold, fontSize: 20, marginTop: 32, marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 24 },
  card: { width: '48%', flexGrow: 1, padding: 16, borderRadius: radius.lg, borderWidth: 1 },
  chip: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  cardTitle: { fontFamily: font.bold, fontSize: 16 },
  cardSub: { fontFamily: font.medium, fontSize: 13, marginTop: 2 },
  empty: { borderWidth: 1.5, borderStyle: 'dashed', borderRadius: radius.lg, padding: 28, alignItems: 'center' },
  recent: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: radius.md, borderWidth: 1, marginBottom: 10 },
});
