import { TextStyle, Platform } from 'react-native';

const fontFamily = Platform.select({
  ios: 'System',
  android: 'Roboto',
  default: 'System',
});

export const Typography: Record<string, TextStyle> = {
  h1: { fontFamily, fontSize: 28, fontWeight: '800', lineHeight: 34 },
  h2: { fontFamily, fontSize: 24, fontWeight: '800', lineHeight: 30 },
  h3: { fontFamily, fontSize: 20, fontWeight: '700', lineHeight: 26 },
  h4: { fontFamily, fontSize: 18, fontWeight: '700', lineHeight: 24 },
  body: { fontFamily, fontSize: 14, fontWeight: '400', lineHeight: 20 },
  bodyMedium: { fontFamily, fontSize: 14, fontWeight: '500', lineHeight: 20 },
  bodySemibold: { fontFamily, fontSize: 14, fontWeight: '600', lineHeight: 20 },
  bodyBold: { fontFamily, fontSize: 14, fontWeight: '700', lineHeight: 20 },
  small: { fontFamily, fontSize: 12, fontWeight: '400', lineHeight: 16 },
  smallSemibold: { fontFamily, fontSize: 12, fontWeight: '600', lineHeight: 16 },
  caption: { fontFamily, fontSize: 10, fontWeight: '500', lineHeight: 14 },
  button: { fontFamily, fontSize: 14, fontWeight: '700', lineHeight: 20 },
  buttonLarge: { fontFamily, fontSize: 16, fontWeight: '700', lineHeight: 22 },
  label: { fontFamily, fontSize: 11, fontWeight: '600', lineHeight: 14, letterSpacing: 0.8, textTransform: 'uppercase' },
  mono: { fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 28, fontWeight: '700', lineHeight: 34 },
};
