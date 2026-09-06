/**
 * Mirrors antd v6 `components/theme/interface/presetColors.ts`.
 *
 * The two palette-key forms are both kept because antd exposes both
 * `blue-1` and the legacy `blue1` names on MapToken.
 */
export const PresetColors = [
  'blue',
  'purple',
  'cyan',
  'green',
  'magenta',
  'pink',
  'red',
  'orange',
  'yellow',
  'volcano',
  'geekblue',
  'lime',
  'gold',
] as const

export type PresetColorKey = (typeof PresetColors)[number]
export type PresetColorType = Record<PresetColorKey, string>

type ColorPaletteKeyIndex = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10

export type LegacyColorPalettes = {
  [key in `${PresetColorKey}-${ColorPaletteKeyIndex}`]: string
}

export type ColorPalettes = {
  [key in `${PresetColorKey}${ColorPaletteKeyIndex}`]: string
}
