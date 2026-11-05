import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';

const KEY = 'scanvault:library';
export type Item = { id: string; name: string; uri: string; size: number; pages: number; createdAt: number };

type S = {
  items: Item[];
  load: () => Promise<void>;
  add: (i: Omit<Item, 'id' | 'createdAt'>) => Promise<void>;
  remove: (id: string) => Promise<void>;
};

const persist = (items: Item[]) => AsyncStorage.setItem(KEY, JSON.stringify(items)).catch(() => {});

export const useLibrary = create<S>((set, get) => ({
  items: [],
  load: async () => {
    try { set({ items: JSON.parse((await AsyncStorage.getItem(KEY)) || '[]') }); } catch {}
  },
  add: async (i) => {
    const items = [{ ...i, id: String(Date.now()), createdAt: Date.now() }, ...get().items];
    set({ items }); await persist(items);
  },
  remove: async (id) => {
    const it = get().items.find((x) => x.id === id);
    if (it) await FileSystem.deleteAsync(it.uri, { idempotent: true }).catch(() => {});
    const items = get().items.filter((x) => x.id !== id);
    set({ items }); await persist(items);
  },
}));
