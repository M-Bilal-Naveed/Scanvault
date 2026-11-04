import { useColorScheme } from 'react-native';

export const palette = {
  ink: '#0E1630',
  inkSoft: '#1B2650',
  teal: '#14C8B4',
  tealDeep: '#0B8F82',
  blue: '#4C6FFF',
  amber: '#FFB547',
  violet: '#8A63FF',
};

export const light = {
  bg: '#F6F7FB', card: '#FFFFFF', text: '#0E1630', muted: '#6B7390',
  line: '#E4E7F0', accent: palette.teal, onAccent: '#06241F', dark: false,
};
export const dark = {
  bg: '#0A1024', card: '#141C3A', text: '#F2F4FB', muted: '#9AA3C4',
  line: '#232C52', accent: palette.teal, onAccent: '#06241F', dark: true,
};

export const radius = { sm: 12, md: 18, lg: 24, pill: 999 };
export const space = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 };
export const font = {
  medium: 'PlusJakartaSans_500Medium',
  bold: 'PlusJakartaSans_700Bold',
  heavy: 'PlusJakartaSans_800ExtraBold',
};

export function useTheme() {
  return useColorScheme() === 'dark' ? dark : light;
}
