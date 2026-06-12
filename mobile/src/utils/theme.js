export const colors = {
  primary: '#4f46e5',
  primaryDark: '#3730a3',
  primaryLight: '#818cf8',
  secondary: '#0ea5e9',
  accent: '#f59e0b',
  success: '#22c55e',
  error: '#ef4444',
  warning: '#f59e0b',
  bg: '#f8fafc',
  surface: '#ffffff',
  surface2: '#f1f5f9',
  border: '#e2e8f0',
  text: '#0f172a',
  textMuted: '#64748b',
  textLight: '#94a3b8',
  white: '#ffffff',
}

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
}

export const radius = {
  sm: 6,
  md: 10,
  lg: 16,
  xl: 24,
  full: 9999,
}

export const typography = {
  h1: { fontSize: 28, fontWeight: '800', color: colors.text },
  h2: { fontSize: 22, fontWeight: '700', color: colors.text },
  h3: { fontSize: 18, fontWeight: '600', color: colors.text },
  body: { fontSize: 15, color: colors.text },
  bodyMuted: { fontSize: 15, color: colors.textMuted },
  small: { fontSize: 13, color: colors.textMuted },
  caption: { fontSize: 11, color: colors.textLight },
}

export const shadow = {
  sm: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 2, elevation: 1 },
  md: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 3 },
  lg: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.12, shadowRadius: 16, elevation: 6 },
}
