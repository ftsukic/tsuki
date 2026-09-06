import type { MappingAlgorithm, MapToken, PresetColorType, SeedToken } from '../../interface'
import { defaultPresetColors } from '../seed'
import genColorMapToken from '../shared/genColorMapToken'
import genCommonMapToken from '../shared/genCommonMapToken'
import genControlHeight from '../shared/genControlHeight'
import genFontMapToken from '../shared/genFontMapToken'
import genSizeMapToken from '../shared/genSizeMapToken'
import { generateColorPalettes, generateNeutralColorPalettes } from './colors'
import { generate, presetPalettes, presetPrimaryColors } from '@ant-design/colors'

/**
 * Mirrors antd v6 `components/theme/themes/default/index.ts`.
 *
 * The derivation stays numeric and CSS-free for React Native.
 */
export const defaultAlgorithm: MappingAlgorithm = (token: SeedToken): MapToken => {
  // Keep the deprecated `pink` preset aligned with antd's `magenta` preset.
  presetPrimaryColors.pink = presetPrimaryColors.magenta
  presetPalettes.pink = presetPalettes.magenta

  const colorPalettes = Object.keys(defaultPresetColors)
    .map((colorKey) => {
      const colors =
        token[colorKey as keyof PresetColorType] === presetPrimaryColors[colorKey]
          ? presetPalettes[colorKey]
          : generate(token[colorKey as keyof PresetColorType])

      return Array.from({ length: 10 }, () => 1).reduce<Record<string, string>>(
        (previous, _, index) => {
          previous[`${colorKey}-${index + 1}`] = colors[index]
          previous[`${colorKey}${index + 1}`] = colors[index]
          return previous
        },
        {},
      )
    })
    .reduce<MapToken>((previous, current) => ({ ...previous, ...current }), {} as MapToken)

  return {
    ...token,
    ...colorPalettes,
    ...genColorMapToken(token, {
      generateColorPalettes,
      generateNeutralColorPalettes,
    }),
    ...genFontMapToken(token.fontSize),
    ...genSizeMapToken(token),
    ...genControlHeight(token),
    ...genCommonMapToken(token),
  }
}

export default defaultAlgorithm
