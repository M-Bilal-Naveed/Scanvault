import React, { useRef, useState } from 'react';
import { Dimensions, Text, View, StyleSheet } from 'react-native';
import Animated, {
  interpolate, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue, SharedValue,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PressableScale } from '../components/PressableScale';
import { useApp } from '../store/useApp';
import { palette, font, radius } from '../theme/tokens';

const { width: W } = Dimensions.get('window');

const SLIDES = [
  { icon: 'scan-outline', color: palette.teal, title: 'Read text from any photo', body: 'Recognition runs on your phone, so it works with no signal at all.' },
  { icon: 'images-outline', color: palette.blue, title: 'Turn pictures into PDFs', body: 'Scan pages, reorder them and export at full original quality.' },
  { icon: 'document-text-outline', color: palette.amber, title: 'Convert Office files', body: 'Change Word, Excel and PowerPoint files to PDF without uploading anything.' },
] as const;

function Slide({ item, i, x }: { item: (typeof SLIDES)[number]; i: number; x: SharedValue<number> }) {
  const art = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(x.value, [(i - 1) * W, i * W, (i + 1) * W], [W * 0.4, 0, -W * 0.4]) },
      { scale: interpolate(x.value, [(i - 1) * W, i * W, (i + 1) * W], [0.7, 1, 0.7]) },
    ],
  }));
  const copy = useAnimatedStyle(() => ({
    opacity: interpolate(x.value, [(i - 0.6) * W, i * W, (i + 0.6) * W], [0, 1, 0]),
  }));
  return (
    <View style={{ width: W, paddingHorizontal: 32, justifyContent: 'center' }}>
      <Animated.View style={[styles.art, { backgroundColor: item.color + '26' }, art]}>
        <View style={[styles.artInner, { backgroundColor: item.color }]}>
          <Ionicons name={item.icon as any} size={72} color={palette.ink} />
        </View>
      </Animated.View>
      <Animated.View style={copy}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.body}>{item.body}</Text>
      </Animated.View>
    </View>
  );
}

function Dot({ i, x }: { i: number; x: SharedValue<number> }) {
  const s = useAnimatedStyle(() => ({
    width: interpolate(x.value, [(i - 1) * W, i * W, (i + 1) * W], [8, 28, 8], 'clamp'),
    opacity: interpolate(x.value, [(i - 1) * W, i * W, (i + 1) * W], [0.35, 1, 0.35], 'clamp'),
  }));
  return <Animated.View style={[styles.dot, s]} />;
}

export default function Onboarding() {
  const router = useRouter();
  const finish = useApp((s) => s.finishOnboarding);
  const x = useSharedValue(0);
  const ref = useRef<Animated.FlatList<any>>(null);
  const [index, setIndex] = useState(0);
  const last = index === SLIDES.length - 1;

  const onScroll = useAnimatedScrollHandler((e) => { x.value = e.contentOffset.x; });
  const done = async () => { await finish(); router.replace('/(tabs)/home'); };
  const next = () => (last ? done() : ref.current?.scrollToIndex({ index: index + 1 }));

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.top}>
        {!last && (
          <PressableScale onPress={done} hitSlop={12}>
            <Text style={styles.skip}>Skip</Text>
          </PressableScale>
        )}
      </View>
      <Animated.FlatList
        ref={ref}
        data={SLIDES as any}
        keyExtractor={(s: any) => s.title}
        horizontal pagingEnabled showsHorizontalScrollIndicator={false}
        onScroll={onScroll} scrollEventThrottle={16}
        onMomentumScrollEnd={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / W))}
        renderItem={({ item, index: i }: any) => <Slide item={item} i={i} x={x} />}
      />
      <View style={styles.bottom}>
        <View style={styles.dots}>{SLIDES.map((_, i) => <Dot key={i} i={i} x={x} />)}</View>
        <PressableScale style={styles.cta} onPress={next}>
          <Text style={styles.ctaText}>{last ? 'Get started' : 'Next'}</Text>
        </PressableScale>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.ink },
  top: { height: 44, alignItems: 'flex-end', justifyContent: 'center', paddingHorizontal: 24 },
  skip: { fontFamily: font.bold, fontSize: 15, color: '#9AA3C4' },
  art: { width: 220, height: 220, borderRadius: 110, alignSelf: 'center', alignItems: 'center', justifyContent: 'center', marginBottom: 48 },
  artInner: { width: 140, height: 140, borderRadius: 40, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-6deg' }] },
  title: { fontFamily: font.heavy, fontSize: 30, lineHeight: 36, color: '#fff', letterSpacing: -0.5, textAlign: 'center' },
  body: { fontFamily: font.medium, fontSize: 16, lineHeight: 24, color: '#9AA3C4', textAlign: 'center', marginTop: 12 },
  bottom: { paddingHorizontal: 24, paddingBottom: 16, gap: 24 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6 },
  dot: { height: 8, borderRadius: 4, backgroundColor: palette.teal },
  cta: { height: 56, borderRadius: radius.pill, backgroundColor: palette.teal, alignItems: 'center', justifyContent: 'center' },
  ctaText: { fontFamily: font.bold, fontSize: 17, color: '#06241F' },
});
