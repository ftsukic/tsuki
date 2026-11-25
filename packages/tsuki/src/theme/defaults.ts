import { StyleSheet } from 'react-native'
import type { ResolvedMotionConfig, ResolvedTheme, ThemeScheme } from './types'

export const DEFAULT_MOTION_CONFIG: ResolvedMotionConfig = {
  enabled: true,
  reducedMotion: 'system',
  durationScale: 1,
}

const surface = { borderRadius: 12, padding: 16, borderWidth: StyleSheet.hairlineWidth }
const cell = {
  paddingHorizontal: 16,
  paddingVertical: 10,
  largePaddingVertical: 14,
  minHeight: 44,
  largeMinHeight: 56,
  fontSize: 14,
  largeFontSize: 16,
  descriptionFontSize: 12,
  lineHeight: 22,
  descriptionLineHeight: 18,
  iconSize: 16,
  gap: 8,
  verticalGap: 6,
  titleExtraGap: 4,
  valueExtraGap: 4,
  dividerWidth: StyleSheet.hairlineWidth,
  groupTitlePaddingHorizontal: 16,
  groupTitlePaddingVertical: 10,
  groupInsetMarginHorizontal: 16,
  groupRadius: 12,
  disabledOpacity: 0.4,
}
const card = {
  borderRadius: 12,
  padding: 16,
  headerPadding: 16,
  bodyPadding: 16,
  footerPadding: 16,
  gap: 0,
}
const dialog = {
  width: 320,
  borderRadius: 12,
  titleFontSize: 16,
  messageFontSize: 14,
  contentPadding: 20,
  buttonHeight: 48,
  overlayColor: 'rgba(0, 0, 0, 0.45)',
  animationDuration: 200,
}
const popup = {
  overlayColor: 'rgba(0, 0, 0, 0.45)',
  borderRadius: 16,
  animationDuration: 240,
}

const THEMES: Record<ThemeScheme, ResolvedTheme> = {
  light: {
    scheme: 'light',
    motion: { ...DEFAULT_MOTION_CONFIG },
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
      colorSurfaceElevated: '#ffffff',
      colorBorder: '#e5e7eb',
      colorOverlay: 'rgba(0, 0, 0, 0.45)',
    },
    components: {
      Button: { borderRadius: 8, height: 44, disabledOpacity: 0.4 },
      Card: card,
      Cell: cell,
      Divider: { thickness: StyleSheet.hairlineWidth },
      Dialog: { ...dialog, backgroundColor: '#ffffff' },
      Popup: { ...popup, backgroundColor: '#ffffff' },
      Input: { borderRadius: 8, height: 44, disabledOpacity: 0.4 },
      Surface: surface,
    },
  },
  dark: {
    scheme: 'dark',
    motion: { ...DEFAULT_MOTION_CONFIG },
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
      colorSurfaceElevated: '#1f2937',
      colorBorder: '#374151',
      colorOverlay: 'rgba(0, 0, 0, 0.45)',
    },
    components: {
      Button: { borderRadius: 8, height: 44, disabledOpacity: 0.4 },
      Card: card,
      Cell: cell,
      Divider: { thickness: StyleSheet.hairlineWidth },
      Dialog: { ...dialog, backgroundColor: '#1f2937' },
      Popup: { ...popup, backgroundColor: '#1f2937' },
      Input: { borderRadius: 8, height: 44, disabledOpacity: 0.4 },
      Surface: surface,
    },
  },
}

export function getDefaultTheme(scheme: ThemeScheme): ResolvedTheme {
  const theme = THEMES[scheme]
  return {
    scheme,
    motion: { ...theme.motion },
    semantic: { ...theme.semantic },
    components: {
      Button: { ...theme.components.Button },
      Card: { ...theme.components.Card },
      Cell: { ...theme.components.Cell },
      Divider: { ...theme.components.Divider },
      Dialog: { ...theme.components.Dialog },
      Popup: { ...theme.components.Popup },
      Input: { ...theme.components.Input },
      Surface: { ...theme.components.Surface },
    },
  }
}
