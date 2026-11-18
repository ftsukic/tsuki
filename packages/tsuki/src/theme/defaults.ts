import { StyleSheet } from 'react-native'
import type { ResolvedTheme, ThemeScheme } from './types'

const surface = { borderRadius: 12, padding: 16, borderWidth: StyleSheet.hairlineWidth }

const THEMES: Record<ThemeScheme, ResolvedTheme> = {
  light: {
    scheme: 'light',
    semantic: {
      colorPrimary: '#055FFD',
      colorPrimaryForeground: '#ffffff',
      colorSuccess: '#15803d',
      colorWarning: '#b45309',
      colorDanger: '#dc2626',
      colorForeground: '#111827',
      colorMuted: '#6b7280',
      colorBackground: '#ffffff',
      colorSurface: '#f9fafb',
      colorBorder: '#e5e7eb',
    },
    components: {
      Button: { borderRadius: 8, height: 44 },
      Divider: { thickness: StyleSheet.hairlineWidth },
      Input: { borderRadius: 8, height: 44 },
      Surface: surface,
    },
  },
  dark: {
    scheme: 'dark',
    semantic: {
      colorPrimary: '#4D8DFF',
      colorPrimaryForeground: '#111827',
      colorSuccess: '#4ade80',
      colorWarning: '#fbbf24',
      colorDanger: '#f87171',
      colorForeground: '#f9fafb',
      colorMuted: '#9ca3af',
      colorBackground: '#111827',
      colorSurface: '#1f2937',
      colorBorder: '#374151',
    },
    components: {
      Button: { borderRadius: 8, height: 44 },
      Divider: { thickness: StyleSheet.hairlineWidth },
      Input: { borderRadius: 8, height: 44 },
      Surface: surface,
    },
  },
}

export function getDefaultTheme(scheme: ThemeScheme): ResolvedTheme {
  const theme = THEMES[scheme]
  return {
    scheme,
    semantic: { ...theme.semantic },
    components: {
      Button: { ...theme.components.Button },
      Divider: { ...theme.components.Divider },
      Input: { ...theme.components.Input },
      Surface: { ...theme.components.Surface },
    },
  }
}
