import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'scanvault:onboarded';

type State = {
  loaded: boolean;
  onboarded: boolean;
  load: () => Promise<void>;
  finishOnboarding: () => Promise<void>;
};

export const useApp = create<State>((set) => ({
  loaded: false,
  onboarded: false,
  load: async () => {
    try {
      const v = await AsyncStorage.getItem(KEY);
      set({ onboarded: v === '1', loaded: true });
    } catch {
      set({ loaded: true });
    }
  },
  finishOnboarding: async () => {
    set({ onboarded: true });
    try { await AsyncStorage.setItem(KEY, '1'); } catch {}
  },
}));
