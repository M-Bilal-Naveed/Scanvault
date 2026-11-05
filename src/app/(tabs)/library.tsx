import React, { useEffect } from 'react';
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing';
import { PressableScale } from '../../components/PressableScale';
import { useLibrary } from '../../store/library';
import { fmtSize } from '../../services/pdf';
import { useTheme, font, palette, radius } from '../../theme/tokens';

export default function Library() {
  const t = useTheme();
  const { items, load, remove } = useLibrary();
  useEffect(() => { load(); }, []);
  const open = async (uri: string) => {
    if (await Sharing.isAvailableAsync()) Sharing.shareAsync(uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf' });
    else Alert.alert('Sharing is not available on this device');
  };
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }}>
      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ padding: 24, paddingBottom: 140, gap: 12 }}
        ListHeaderComponent={<Text style={[styles.h, { color: t.text }]}>Library</Text>}
        ListEmptyComponent={
          <View style={[styles.empty, { borderColor: t.line }]}>
            <Ionicons name="folder-open-outline" size={30} color={t.muted} />
            <Text style={{ fontFamily: font.medium, color: t.muted, marginTop: 8, textAlign: 'center' }}>No files yet. Tap the teal scan button to make your first PDF.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <PressableScale style={[styles.row, { backgroundColor: t.card, borderColor: t.line }]} onPress={() => open(item.uri)}>
            <View style={styles.icon}><Ionicons name="document-text" size={22} color={palette.ink} /></View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.name, { color: t.text }]} numberOfLines={1}>{item.name}</Text>
              <Text style={{ fontFamily: font.medium, fontSize: 13, color: t.muted }}>{item.pages} page{item.pages > 1 ? 's' : ''} · {fmtSize(item.size)}</Text>
            </View>
            <PressableScale hitSlop={10} onPress={() => Alert.alert('Delete this PDF?', item.name, [
              { text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: () => remove(item.id) }])}>
              <Ionicons name="trash-outline" size={20} color={t.muted} />
            </PressableScale>
          </PressableScale>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  h: { fontFamily: font.heavy, fontSize: 32, letterSpacing: -0.5, marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, borderRadius: radius.lg, borderWidth: 1 },
  icon: { width: 44, height: 44, borderRadius: 14, backgroundColor: palette.teal, alignItems: 'center', justifyContent: 'center' },
  name: { fontFamily: font.bold, fontSize: 16 },
  empty: { borderWidth: 1.5, borderStyle: 'dashed', borderRadius: radius.lg, padding: 32, alignItems: 'center' },
});
