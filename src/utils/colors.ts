export const COLORS = {
  backgroundColor: '#F5EBE2',
  brand: '#2A7C76',
  brandStrong: '#176B65',
  brandLight: '#EAF6F3',
  brandLighter: '#F6FAF9',
  surface: '#FFFFFF',
  surfaceMuted: '#F6F8F8',
  surfaceSoft: '#F5F7F7',
  textPrimary: '#182524',
  textSecondary: '#62716F',
  textMuted: '#74808B',
  border: '#D7E1DF',
  success: '#14915A',
  danger: '#E45D54',
  info: '#438883',
  shadow: '#21433F',
  ink: '#000000',
  overlay: 'rgba(11, 30, 29, 0.38)',
  purple: '#534AB7',
  accent: '#FFB078',
  chip: '#ECF9F8',
} as const;

export const SPACING = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
} as const;

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 18,
  xl: 24,
  pill: 999,
} as const;

export const SHADOWS = {
  card: {
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  soft: {
    shadowColor: COLORS.ink,
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 1, height: 5 },
    elevation: 2,
  },
} as const;
