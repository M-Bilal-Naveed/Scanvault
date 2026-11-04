import React from 'react';
import { Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = PressableProps & { style?: StyleProp<ViewStyle>; haptic?: boolean };

export function PressableScale({ style, haptic = true, onPressIn, onPressOut, onPress, ...rest }: Props) {
  const s = useSharedValue(1);
  const a = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
  return (
    <AnimatedPressable
      {...rest}
      style={[style, a]}
      onPressIn={(e) => { s.value = withSpring(0.95, { damping: 15 }); onPressIn?.(e); }}
      onPressOut={(e) => { s.value = withSpring(1, { damping: 12 }); onPressOut?.(e); }}
      onPress={(e) => { if (haptic) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onPress?.(e); }}
    />
  );
}
