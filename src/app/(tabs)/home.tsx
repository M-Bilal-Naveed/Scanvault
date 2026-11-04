import React from 'react';
import { ScrollView, Text, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { PressableScale } from '../../components/PressableScale';
import { useTheme, font, palette, radius } from '../../theme/tokens';

const ACTIONS = [
  { title: 'Image to text', sub: 'Read text offline', icon: 'text-outline', color: palette.teal },
  { title: 'Images to PDF', sub: 'Full quality', icon: 'images-outline', color: palette.blue },
  { title: 'Office to PDF', sub: 'Word, Excel, PPT', icon: 'document-text-outline', color: palette.amber },
  { title: 'Merge PDFs', sub: 'Combine files', icon: 'git-merge-outline', color: palette.violet },
];

export default function Home() {
  const t = useTheme();
  const router = useRouter();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }}>
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 140 }}>
        <Text style={[styles.h1, { color: t.text }]}>What do you want{'\n'}to scan today?</Text>
        <View style={styles.grid}>
          {ACTIONS.map((a) => (
            <PressableScale key={a.title} style={[styles.card, { backgroundColor: t.card, borderColor: t.line }]} onPress={() => router.push('/scan')}>
              <View style={[styles.chip, { backgroundColor: a.color }]}>
                <Ionicons name={a.icon as any} size={22} color={palette.ink} />
              </View>
              <Text style={[styles.cardTitle, { color: t.text }]}>{a.title}</Text>
              <Text style={[styles.cardSub, { color: t.muted }]}>{a.sub}</Text>
            </PressableScale>
          ))}
        </View>
        <Text style={[styles.h2, { color: t.text }]}>Recent</Text>
        <View style={[styles.empty, { borderColor: t.line }]}>
          <Ionicons name="document-outline" size={28} color={t.muted} />
          <Text style={{ fontFamily: font.medium, color: t.muted, marginTop: 8 }}>Scan your first document to see it here.</Text>
        </View>
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
});
