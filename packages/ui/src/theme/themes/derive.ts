import { generate } from '@ant-design/colors'
import { FastColor } from '@ant-design/fast-color'
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
        result[`${colorKey}${index + 1}` as keyof ColorPalettes] = value
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
      colorShadow: 'rgba(255, 255, 255, 0.2)',
      colorText: alphaColor('#FFFFFF', 0.85),
      colorTextSecondary: alphaColor('#FFFFFF', 0.65),
      colorTextTertiary: alphaColor('#FFFFFF', 0.45),
      colorTextQuaternary: alphaColor('#FFFFFF', 0.25),
      colorBorder: alphaColor('#FFFFFF', 0.2),
      colorBorderSecondary: alphaColor('#FFFFFF', 0.12),
      colorBorderDisabled: alphaColor('#FFFFFF', 0.2),
      colorFill: alphaColor('#FFFFFF', 0.18),
      colorFillSecondary: alphaColor('#FFFFFF', 0.12),
      colorFillTertiary: alphaColor('#FFFFFF', 0.08),
      colorFillQuaternary: alphaColor('#FFFFFF', 0.04),
      colorBgLayout: '#141414',
      colorBgContainer: '#1F1F1F',
      colorBgElevated: '#262626',
      colorBgSpotlight: '#424242',
      colorBgMask: alphaColor('#000000', 0.65),
      colorBgBlur: alphaColor('#FFFFFF', 0.04),
      colorBgSolid: '#1F1F1F',
      colorBgSolidHover: '#262626',
      colorBgSolidActive: '#141414',
    }
  }

  return {
    colorWhite: '#FFFFFF',
    colorBlack: '#000000',
    colorShadow: '#000000',
    colorText: alphaColor(text, 0.88),
    colorTextSecondary: alphaColor(text, 0.65),
    colorTextTertiary: alphaColor(text, 0.45),
    colorTextQuaternary: alphaColor(text, 0.25),
    colorBorder: solidColor(background, 15),
    colorBorderSecondary: solidColor(background, 6),
    colorBorderDisabled: solidColor(background, 15),
    colorFill: alphaColor(text, 0.15),
    colorFillSecondary: alphaColor(text, 0.06),
    colorFillTertiary: alphaColor(text, 0.04),
    colorFillQuaternary: alphaColor(text, 0.02),
    colorBgLayout: solidColor(background, 4),
    colorBgContainer: solidColor(background, 0),
    colorBgElevated: solidColor(background, 0),
    colorBgSpotlight: alphaColor(text, 0.85),
    colorBgMask: alphaColor('#000000', 0.45),
    colorBgBlur: 'transparent',
    colorBgSolid: alphaColor(text, 1),
    colorBgSolidHover: alphaColor(text, 0.75),
    colorBgSolidActive: alphaColor(text, 0.95),
  }
}

export function deriveMapToken(seed: SeedToken, dark = false): MapToken {
  const primary = getPalette(seed.colorPrimary, dark)
  const success = getPalette(seed.colorSuccess, dark)
  const warning = getPalette(seed.colorWarning, dark)
  const error = getPalette(seed.colorError, dark)
  const info = getPalette(seed.colorInfo, dark)
  const link = getPalette(seed.colorLink || seed.colorInfo, dark)
  const neutral = getNeutralColors(seed, dark)
  const colorErrorBgFilledHover = new FastColor(error[1])
    .mix(new FastColor(error[3]), 50)
    .toHexString()

  const map: MapToken = {
    ...seed,
    ...getPresetPalettes(seed, dark),
    ...neutral,
    colorPrimaryBg: primary[1],
    colorPrimaryBgHover: primary[2],
    colorPrimaryBorder: primary[3],
    colorPrimaryBorderHover: primary[4],
    colorPrimaryHover: primary[6],
    colorPrimary: seed.colorPrimary,
    colorPrimaryActive: primary[7],
    colorPrimaryText: primary[8],
    colorPrimaryTextHover: primary[9],
    colorPrimaryTextActive: primary[9],
    colorSuccessBg: success[1],
    colorSuccessBgHover: success[2],
    colorSuccessBorder: success[3],
    colorSuccessBorderHover: success[4],
    colorSuccessHover: success[6],
    colorSuccess: seed.colorSuccess,
    colorSuccessActive: success[7],
    colorSuccessText: success[8],
    colorSuccessTextHover: success[9],
    colorSuccessTextActive: success[9],
    colorWarningBg: warning[1],
    colorWarningBgHover: warning[2],
    colorWarningBorder: warning[3],
    colorWarningBorderHover: warning[4],
    colorWarningHover: warning[6],
    colorWarning: seed.colorWarning,
    colorWarningActive: warning[7],
    colorWarningText: warning[8],
    colorWarningTextHover: warning[9],
    colorWarningTextActive: warning[9],
    colorErrorBg: error[1],
    colorErrorBgHover: error[2],
    colorErrorBorder: error[3],
    colorErrorBorderHover: error[4],
    colorErrorBgActive: error[3],
    colorErrorBgFilledHover,
    colorErrorHover: error[6],
    colorError: seed.colorError,
    colorErrorActive: error[7],
    colorErrorText: error[8],
    colorErrorTextHover: error[9],
    colorErrorTextActive: error[9],
    colorInfoBg: info[1],
    colorInfoBgHover: info[2],
    colorInfoBorder: info[3],
    colorInfoBorderHover: info[4],
    colorInfoHover: info[6],
    colorInfo: seed.colorInfo,
    colorInfoActive: info[7],
    colorInfoText: info[8],
    colorInfoTextHover: info[9],
    colorInfoTextActive: info[9],
    colorLink: seed.colorLink,
    colorLinkHover: link[6],
    colorLinkActive: link[7],
    ...genFontMapToken(seed.fontSize),
    ...genSizeMapToken(seed),
    ...genControlHeight(seed),
    ...genRadius(seed.borderRadius),
    lineWidthBold: seed.lineWidth + 1,
    motionDurationFast: seed.motionBase + seed.motionUnit,
    motionDurationMid: seed.motionBase + seed.motionUnit * 2,
    motionDurationSlow: seed.motionBase + seed.motionUnit * 3,
  }

  return map
}
