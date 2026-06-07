import { Platform } from 'react-native';

const serifFont = Platform.select({ ios: 'STSongti-TC-Regular', android: 'serif', default: 'serif' });
const serifBold = Platform.select({ ios: 'STSongti-TC-Bold', android: 'serif', default: 'serif' });
const sansFont = Platform.select({ ios: 'PingFangTC-Regular', android: 'sans-serif', default: 'sans-serif' });

export const Fonts = { serif: serifFont, serifBold, sans: sansFont };

export const Colors = {
  // Backgrounds
  background: '#F9F5FF',
  backgroundAlt: '#F3ECFD',
  surfaceCard: '#FFFFFF',
  surfaceGlow: '#FAF5FF',

  // Primary Purple
  primary: '#7C5CBF',
  primaryLight: '#B8A0D8',
  primaryDark: '#4A2E7A',
  primaryPale: '#EDE4F7',
  primaryDeep: '#2E1A4E',

  // Accent
  accentRose: '#D4A0C8',
  accentGold: '#C9A96E',
  accentJade: '#6BAF92',
  accentWarm: '#E8D5B0',

  // Text
  textPrimary: '#3D2A6E',
  textSecondary: '#7B6B9A',
  textMuted: '#A898C8',
  textLight: '#C8B8E0',

  // Card
  cardBorder: '#D4C4E8',
  cardBorderLight: '#E8DCF4',
  cardShadow: 'rgba(120, 80, 180, 0.10)',
  cardShadowMd: 'rgba(100, 50, 160, 0.15)',

  // Elements
  elementWood: '#7CB342',
  elementFire: '#EF5350',
  elementEarth: '#FF9800',
  elementMetal: '#FFC107',
  elementWater: '#42A5F5',

  // Star Category
  majorStar: '#6A1B9A',
  auxiliaryStar: '#5E7B4A',
  miscStar: '#8D6E63',

  // Dividers
  divider: '#DDD0EE',
  dividerLight: '#EAE0F5',

  // Draw Screen
  drawBgDark: '#2D1A4E',
  drawBgMid: '#4A2E7A',
  drawBgLight: '#5E3A9E',
  drawAccent: '#CEA8E0',
  drawTextLight: '#EDE0F5',

  // Buttons
  btnPrimary: '#7C5CBF',
  btnPrimaryDark: '#5E3A9E',
  btnSecondary: '#5E8C6A',
  btnOutline: '#7C5CBF',
  btnTextWhite: '#FFFFFF',
  btnDanger: '#E57373',
  btnDisabled: '#D0C0E0',

  // Glass Effect
  glassBg: 'rgba(255,255,255,0.6)',
  glassBorder: 'rgba(200,170,220,0.3)',
};

export const Shadows = {
  sm: {
    shadowColor: '#6A4A9E',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#5A3A8E',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#4A2A7E',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  glow: {
    shadowColor: '#8B6FC7',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
  },
};

export const Typography = {
  headingLarge: { fontFamily: serifBold, fontSize: 32, lineHeight: 44, fontWeight: '700' as const, letterSpacing: 3 },
  headingMedium: { fontFamily: serifBold, fontSize: 24, lineHeight: 33, fontWeight: '700' as const, letterSpacing: 2 },
  headingSmall: { fontFamily: serifBold, fontSize: 18, lineHeight: 25, fontWeight: '700' as const },
  body: { fontFamily: serifFont, fontSize: 16, lineHeight: 24 },
  bodySmall: { fontFamily: sansFont, fontSize: 14, lineHeight: 20 },
  caption: { fontFamily: sansFont, fontSize: 12, lineHeight: 16 },
  starName: { fontFamily: serifBold, fontSize: 22, lineHeight: 30, fontWeight: '700' as const, letterSpacing: 2 },
  accent: { fontFamily: serifBold, fontSize: 14, lineHeight: 20, fontWeight: '600' as const, letterSpacing: 1 },
};

export const Spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 };

export const BorderRadius = { sm: 8, md: 14, lg: 20, xl: 28, full: 999 };
