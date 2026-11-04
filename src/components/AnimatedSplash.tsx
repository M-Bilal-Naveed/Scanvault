import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing, runOnJS, useAnimatedStyle, useSharedValue, withDelay, withTiming,
} from 'react-native-reanimated';
import { palette, font } from '../theme/tokens';

const W = 132, H = 168;
const LINES = [0.9, 0.7, 0.85, 0.55, 0.8, 0.6];

// One orchestrated moment: a page is scanned top to bottom, its text appears
// under the scan line, then the wordmark settles and the overlay fades out.
export function AnimatedSplash({ onDone }: { onDone: () => void }) {
  const sheet = useSharedValue(0.8);
  const sheetO = useSharedValue(0);
  const scan = useSharedValue(0);
  const word = useSharedValue(0);
  const overlay = useSharedValue(1);

  useEffect(() => {
    sheetO.value = withTiming(1, { duration: 300 });
    sheet.value = withTiming(1, { duration: 450, easing: Easing.out(Easing.cubic) });
    scan.value = withDelay(350, withTiming(1, { duration: 1100, easing: Easing.inOut(Easing.quad) }));
    word.value = withDelay(1350, withTiming(1, { duration: 450 }));
    overlay.value = withDelay(2300, withTiming(0, { duration: 350 }, (done) => {
      if (done) runOnJS(onDone)();
    }));
  }, []);

  const root = useAnimatedStyle(() => ({ opacity: overlay.value }));
  const sheetStyle = useAnimatedStyle(() => ({ opacity: sheetO.value, transform: [{ scale: sheet.value }] }));
  const reveal = useAnimatedStyle(() => ({ height: scan.value * H }));
  const line = useAnimatedStyle(() => ({ transform: [{ translateY: scan.value * (H - 3) }] }));
  const wordStyle = useAnimatedStyle(() => ({
    opacity: word.value, transform: [{ translateY: (1 - word.value) * 12 }],
  }));

  return (
    <Animated.View style={[styles.root, root]} pointerEvents="none">
      <Animated.View style={[styles.sheet, sheetStyle]}>
        <Animated.View style={[styles.reveal, reveal]}>
          <View style={styles.lines}>
            {LINES.map((w, i) => (
              <View key={i} style={[styles.textLine, { width: `${w * 100}%` }]} />
            ))}
          </View>
        </Animated.View>
        <Animated.View style={[styles.scanLine, line]} />
      </Animated.View>
      <Animated.View style={[styles.wordWrap, wordStyle]}>
        <Text style={styles.word}>ScanVault</Text>
        <Text style={styles.tag}>Scan. Convert. Offline.</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { ...StyleSheet.absoluteFillObject, backgroundColor: palette.ink, alignItems: 'center', justifyContent: 'center', zIndex: 99 },
  sheet: { width: W, height: H, borderRadius: 16, backgroundColor: '#FFFFFF10', borderWidth: 1.5, borderColor: '#FFFFFF30', overflow: 'hidden' },
  reveal: { overflow: 'hidden' },
  lines: { padding: 16, gap: 11 },
  textLine: { height: 7, borderRadius: 4, backgroundColor: '#FFFFFFCC' },
  scanLine: { position: 'absolute', left: 0, right: 0, height: 3, backgroundColor: palette.teal, shadowColor: palette.teal, shadowOpacity: 1, shadowRadius: 10, shadowOffset: { width: 0, height: 0 } },
  wordWrap: { marginTop: 36, alignItems: 'center' },
  word: { fontFamily: font.heavy, fontSize: 34, color: '#FFFFFF', letterSpacing: -0.5 },
  tag: { fontFamily: font.medium, fontSize: 15, color: '#9AA3C4', marginTop: 6 },
});
