import type { ColorPalettes } from './preset-colors'
import type { SeedToken } from './seed'

export interface ColorMapToken extends ColorPalettes {
  colorWhite: string
  colorBlack: string
  colorShadow: string
  colorText: string
  colorTextSecondary: string
  colorTextTertiary: string
  colorTextQuaternary: string
  colorBorder: string
  colorBorderSecondary: string
  colorFill: string
  colorFillSecondary: string
  colorFillTertiary: string
  colorBgLayout: string
  colorBgContainer: string
  colorBgContainerPressed: string
  colorBgElevated: string
  colorBgMask: string
  colorPrimaryBg: string
  colorPrimaryBorder: string
  colorPrimaryActive: string
  colorSuccessBg: string
  colorSuccessBorder: string
  colorSuccessActive: string
  colorWarningBg: string
  colorWarningBorder: string
  colorWarningActive: string
  colorErrorBg: string
  colorErrorBorder: string
  colorErrorActive: string
  colorInfoBg: string
  colorInfoBorder: string
  colorInfoActive: string
}

export interface FontMapToken {
  fontSizeXS: number
  fontSizeSM: number
  fontSize: number
  fontSizeLG: number
  fontSizeXL: number
  lineHeightXS: number
  lineHeightSM: number
  lineHeight: number
  lineHeightLG: number
  lineHeightXL: number
}

export interface SizeMapToken {
  sizeXL: number
  sizeLG: number
  size: number
  sizeSM: number
  sizeXS: number
  sizeXXS: number
}

export interface HeightMapToken {
  controlHeightXS: number
  controlHeightSM: number
  controlHeightLG: number
}

export interface MapToken
  extends SeedToken, ColorMapToken, FontMapToken, SizeMapToken, HeightMapToken {
  lineWidthBold: number
  lineWidthHairline: number
  motionDurationFast: number
  motionDurationMid: number
  motionDurationSlow: number
  borderRadiusXS: number
  borderRadiusSM: number
  borderRadiusLG: number
}
