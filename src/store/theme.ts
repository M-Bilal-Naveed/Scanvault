import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

export type ThemeMode = 'system' | 'light' | 'dark';

const KEY = 'scanvault:theme';

function isThemeMode(value: string): value is ThemeMode {
  return value === 'system' || value === 'light' || value === 'dark';
}

type ThemeState = {
  mode: ThemeMode;
  load: () => Promise<void>;
  setMode: (mode: ThemeMode) => Promise<void>;
};

export const useThemePreferences = create<ThemeState>((set) => ({
  mode: 'system',
  load: async () => {
    const stored = await AsyncStorage.getItem(KEY);
    if (stored === null) return;
    if (!isThemeMode(stored)) throw new Error('The saved theme preference is invalid.');
    set({ mode: stored });
  },
  setMode: async (mode) => {
    await AsyncStorage.setItem(KEY, mode);
    set({ mode });
  },
}));
