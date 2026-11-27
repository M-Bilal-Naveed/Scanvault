import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useThemePreferences } from '../store/theme';
import { useTheme } from '../theme/tokens';

export default function RootLayout() {
  const loadTheme = useThemePreferences((state) => state.load);
  const theme = useTheme();

  useEffect(() => {
    void loadTheme().catch((error: unknown) => {
      console.error('Could not restore the saved theme preference.', error);
    });
  }, [loadTheme]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style={theme.dark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="scan" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="ocr" options={{ presentation: 'modal' }} />
        <Stack.Screen name="office" />
      </Stack>
    </GestureHandlerRootView>
  );
}
