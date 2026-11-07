import type { Theme } from 'expo-router'
import type { ResolvedAppTheme } from '../types'

export function toNavigationTheme(theme: ResolvedAppTheme): Theme {
  const family = theme.typography.family.base
  return {
    dark: theme.mode === 'dark',
    colors: {
      primary: theme.colors.brand.primary,
      background: theme.colors.surface.page,
      card: theme.colors.surface.container,
      text: theme.colors.text.primary,
      border: theme.colors.border.default,
      notification: theme.colors.status.danger.foreground,
    },
    fonts: {
      regular: { fontFamily: family, fontWeight: '400' },
      medium: { fontFamily: family, fontWeight: '500' },
      bold: { fontFamily: family, fontWeight: '600' },
      heavy: { fontFamily: family, fontWeight: '700' },
    },
  }
}
