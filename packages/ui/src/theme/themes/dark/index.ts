import type { MappingAlgorithm, MapToken, PresetColorType, SeedToken } from '../../interface'
import { PresetColors } from '../../interface/presetColors'
import defaultAlgorithm from '../default'
import { defaultPresetColors } from '../seed'
import genColorMapToken from '../shared/genColorMapToken'
import { generateColorPalettes, generateNeutralColorPalettes } from './colors'
import { generate } from '@ant-design/colors'

/**
 * Mirrors antd v6 `components/theme/themes/dark/index.ts` at the RN map-token
 * boundary. CSS variables and DOM styles are intentionally not generated.
 */
export const darkAlgorithm: MappingAlgorithm = (seed: SeedToken, previous?: MapToken): MapToken => {
  // Mirrors antd v6 `themes/dark/index.ts`: keep the incoming map when this
  // algorithm is composed after compact or another map algorithm.
  const mergedMapToken = previous ?? defaultAlgorithm(seed)
  const colorPalettes = Object.keys(defaultPresetColors)
    .map((colorKey) => {
      const colors = generate(seed[colorKey as keyof PresetColorType], { theme: 'dark' })
      return Array.from({ length: 10 }, (_, index) => ({
        [`${colorKey}-${index + 1}`]: colors[index],
        [`${colorKey}${index + 1}`]: colors[index],
      })).reduce<Record<string, string>>((previousColors, current) => {
        return { ...previousColors, ...current }
      }, {})
    })
    .reduce<Record<string, string>>(
      (previousColors, current) => ({
        ...previousColors,
        ...current,
      }),
      {},
    ) as unknown as MapToken
  const colorMapToken = genColorMapToken(seed, {
    generateColorPalettes,
    generateNeutralColorPalettes,
  })
  const presetColorHoverActiveTokens: Record<string, string> = {}

  for (const colorKey of PresetColors) {
    const colorBase = seed[colorKey]
    if (colorBase) {
      const colorPalette = generateColorPalettes(colorBase)
      presetColorHoverActiveTokens[`${colorKey}Hover`] = colorPalette[7]
      presetColorHoverActiveTokens[`${colorKey}Active`] = colorPalette[5]
    }
  }

  return {
    ...mergedMapToken,
    ...colorPalettes,
    ...colorMapToken,
    ...presetColorHoverActiveTokens,
    colorPrimaryBg: colorMapToken.colorPrimaryBorder,
    colorPrimaryBgHover: colorMapToken.colorPrimaryBorderHover,
  }
}

export default darkAlgorithm
