import type {
  AppResolvedColorScheme,
  AppThemeDefinition,
  AppThemeMode,
  FontSizeKey,
  ResolvedAppTheme,
  TypographyRole,
} from './types'

export interface ResolveAppThemeOptions {
  mode: AppThemeMode
  systemColorScheme?: AppResolvedColorScheme | null
  baseFontSize?: number
}

const DEFAULT_BASE_FONT_SIZE = 16
const MAX_RESOLVED_NUMBER = Number.MAX_SAFE_INTEGER

function isPositiveFinite(value: number) {
  return Number.isFinite(value) && value > 0
}

function safeMultiply(value: number, scale: number) {
  const result = value * scale
  return Number.isFinite(result) ? result : Math.sign(result) * MAX_RESOLVED_NUMBER
}

function safeRound(value: number) {
  return Math.round(Math.min(value, MAX_RESOLVED_NUMBER))
}

export function resolveAppTheme(
  definition: AppThemeDefinition,
  { mode, systemColorScheme = null, baseFontSize = DEFAULT_BASE_FONT_SIZE }: ResolveAppThemeOptions,
): ResolvedAppTheme {
  const resolvedMode = mode === 'system' ? (systemColorScheme === 'dark' ? 'dark' : 'light') : mode
  const baseSize = isPositiveFinite(definition.typography.size.md)
    ? definition.typography.size.md
    : DEFAULT_BASE_FONT_SIZE
  const resolvedBaseFontSize = isPositiveFinite(baseFontSize) ? baseFontSize : baseSize
  const rawFontScale = resolvedBaseFontSize / baseSize
  const fontScale = isPositiveFinite(rawFontScale) ? rawFontScale : 1
  const size = Object.fromEntries(
    (Object.keys(definition.typography.size) as FontSizeKey[]).map((key) => {
      const tokenSize = definition.typography.size[key]
      const resolvedSize = safeMultiply(
        isPositiveFinite(tokenSize) ? tokenSize : baseSize,
        fontScale,
      )
      return [key, isPositiveFinite(resolvedSize) ? resolvedSize : DEFAULT_BASE_FONT_SIZE]
    }),
  ) as Record<FontSizeKey, number>
  const letterSpacing = Object.fromEntries(
    Object.entries(definition.typography.letterSpacing).map(([key, value]) => [
      key,
      safeMultiply(Number.isFinite(value) ? value : 0, fontScale),
    ]),
  ) as AppThemeDefinition['typography']['letterSpacing']
  const lineHeight = definition.typography.lineHeight
  const styles = Object.fromEntries(
    (Object.keys(definition.typography.styles) as TypographyRole[]).map((role) => {
      const style = definition.typography.styles[role]
      const fontSize = size[style.size] ?? size.md
      const ratio = lineHeight[style.lineHeight]
      const safeRatio = isPositiveFinite(ratio) ? ratio : 1.5
      const resolvedStyle = {
        fontFamily: definition.typography.family[style.family],
        fontSize,
        lineHeight: safeRound(safeMultiply(fontSize, safeRatio)),
        fontWeight: definition.typography.weight[style.weight],
        letterSpacing: letterSpacing[style.letterSpacing] ?? 0,
      }
      return [role, resolvedStyle]
    }),
  ) as ResolvedAppTheme['typography']['styles']

  return {
    mode: resolvedMode,
    baseFontSize: resolvedBaseFontSize,
    fontScale,
    colors: definition.colors[resolvedMode],
    typography: {
      family: definition.typography.family,
      size,
      weight: definition.typography.weight,
      lineHeight,
      letterSpacing,
      styles,
    },
    spacing: definition.spacing,
    shape: definition.shape,
  }
}
