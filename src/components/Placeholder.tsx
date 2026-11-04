import React from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, font } from '../theme/tokens';

export function Placeholder({ title, note }: { title: string; note: string }) {
  const t = useTheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg, padding: 24 }}>
      <Text style={{ fontFamily: font.heavy, fontSize: 32, color: t.text, letterSpacing: -0.5 }}>{title}</Text>
      <View style={{ height: 8 }} />
      <Text style={{ fontFamily: font.medium, fontSize: 16, color: t.muted }}>{note}</Text>
    </SafeAreaView>
  );
}
