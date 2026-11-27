import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PressableScale } from './PressableScale';
import { useTheme, font, radius } from '../theme/tokens';

type Props = {
  title: string;
  onBack: () => void;
};

export function ScreenHeader({ title, onBack }: Props) {
  const t = useTheme();

  return (
    <View style={styles.row}>
      <PressableScale
        accessibilityRole="button"
        accessibilityLabel="Go back"
        style={[styles.back, { backgroundColor: t.card, borderColor: t.line }]}
        onPress={onBack}
      >
        <Ionicons name="arrow-back" size={21} color={t.text} />
      </PressableScale>
      <Text style={[styles.title, { color: t.text }]} numberOfLines={1}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 8 },
  back: { width: 44, height: 44, borderRadius: radius.pill, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, fontFamily: font.heavy, fontSize: 28, letterSpacing: -0.5 },
});
