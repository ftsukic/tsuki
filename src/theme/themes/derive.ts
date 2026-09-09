import { generate } from '@ant-design/colors'
import { StyleSheet } from 'react-native'
import type { ColorPalettes, MapToken, PresetColorKey, SeedToken } from '../interface'
import { presetColors } from '../interface'
import { alphaColor, solidColor } from '../util/colors'
import { genFontMapToken } from './shared/font'
import { genControlHeight, genRadius, genSizeMapToken } from './shared/size'

type Palette = [string, string, string, string, string, string, string, string, string, string]

function getPalette(color: string, dark: boolean): Palette {
  const values = generate(color, dark ? { theme: 'dark' } : undefined)
  const fallback = color

  return [
    values[0] ?? fallback,
    values[1] ?? fallback,
    values[2] ?? fallback,
    values[3] ?? fallback,
    values[4] ?? fallback,
    values[5] ?? fallback,
    values[6] ?? fallback,
    values[7] ?? fallback,
    values[8] ?? fallback,
    values[9] ?? fallback,
  ]
}

function getPresetPalettes(seed: SeedToken, dark: boolean): ColorPalettes {
  const palettes = presetColors.reduce<Partial<ColorPalettes>>(
    (result, colorKey: PresetColorKey) => {
      const palette = getPalette(seed[colorKey], dark)

      palette.forEach((value, index) => {
        result[`${colorKey}-${index + 1}` as keyof ColorPalettes] = value
      })

      return result
    },
    {},
  )

  return palettes as ColorPalettes
}

function getNeutralColors(seed: SeedToken, dark: boolean) {
  const background = seed.colorBgBase
  const text = seed.colorTextBase

  if (dark) {
    return {
      colorWhite: '#FFFFFF',
      colorBlack: '#000000',
      colorShadow: 'rgba(0, 0, 0, 0.45)',
      colorTextBase: '#FFFFFF',
      colorBgBase: '#141414',
      colorText: alphaColor('#FFFFFF', 0.85),
      colorTextSecondary: alphaColor('#FFFFFF', 0.65),
      colorTextTertiary: alphaColor('#FFFFFF', 0.45),
      colorTextQuaternary: alphaColor('#FFFFFF', 0.25),
      colorBorder: alphaColor('#FFFFFF', 0.2),
      colorBorderSecondary: alphaColor('#FFFFFF', 0.12),
      colorFill: alphaColor('#FFFFFF', 0.18),
      colorFillSecondary: alphaColor('#FFFFFF', 0.12),
      colorFillTertiary: alphaColor('#FFFFFF', 0.08),
      colorBgLayout: '#141414',
      colorBgContainer: '#1F1F1F',
      colorBgElevated: '#262626',
      colorBgMask: alphaColor('#000000', 0.65),
    }
  }

  return {
    colorWhite: '#FFFFFF',
    colorBlack: '#000000',
    colorShadow: '#000000',
    colorTextBase: text,
    colorBgBase: background,
    colorText: alphaColor(text, 0.88),
    colorTextSecondary: alphaColor(text, 0.65),
    colorTextTertiary: alphaColor(text, 0.45),
    colorTextQuaternary: alphaColor(text, 0.25),
    colorBorder: solidColor(background, 15),
    colorBorderSecondary: solidColor(background, 6),
    colorFill: alphaColor(text, 0.15),
    colorFillSecondary: alphaColor(text, 0.06),
    colorFillTertiary: alphaColor(text, 0.04),
    colorBgLayout: solidColor(background, 4),
    colorBgContainer: solidColor(background, 0),
    colorBgElevated: solidColor(background, 0),
    colorBgMask: alphaColor('#000000', 0.45),
  }
}

export function deriveMapToken(seed: SeedToken, dark = false): MapToken {
  const primary = getPalette(seed.colorPrimary, dark)
  const success = getPalette(seed.colorSuccess, dark)
  const warning = getPalette(seed.colorWarning, dark)
  const error = getPalette(seed.colorError, dark)
  const info = getPalette(seed.colorInfo, dark)
  const neutral = getNeutralColors(seed, dark)

  const map: MapToken = {
    ...seed,
    ...getPresetPalettes(seed, dark),
    ...neutral,
    colorPrimaryBg: primary[1],
    colorPrimaryBorder: primary[3],
    colorPrimaryActive: primary[7],
    colorSuccessBg: success[1],
    colorSuccessBorder: success[3],
    colorSuccessActive: success[7],
    colorWarningBg: warning[1],
    colorWarningBorder: warning[3],
    colorWarningActive: warning[7],
    colorErrorBg: error[1],
    colorErrorBorder: error[3],
    colorErrorActive: error[7],
    colorInfoBg: info[1],
    colorInfoBorder: info[3],
    colorInfoActive: info[7],
    ...genFontMapToken(seed.fontSize),
    ...genSizeMapToken(seed),
    ...genControlHeight(seed),
    ...genRadius(seed.borderRadius),
    lineWidthBold: seed.lineWidth + 1,
    lineWidthHairline: StyleSheet.hairlineWidth,
    motionDurationFast: 100,
    motionDurationMid: 200,
    motionDurationSlow: 300,
  }

  return map
}
