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
  colorBorderDisabled: string
  colorFill: string
  colorFillSecondary: string
  colorFillTertiary: string
  colorFillQuaternary: string
  colorBgLayout: string
  colorBgContainer: string
  colorBgElevated: string
  colorBgSpotlight: string
  colorBgMask: string
  colorBgBlur: string
  colorBgSolid: string
  colorBgSolidHover: string
  colorBgSolidActive: string
  colorPrimaryBg: string
  colorPrimaryBgHover: string
  colorPrimaryBorder: string
  colorPrimaryBorderHover: string
  colorPrimaryHover: string
  colorPrimary: string
  colorPrimaryActive: string
  colorPrimaryText: string
  colorPrimaryTextHover: string
  colorPrimaryTextActive: string
  colorSuccessBg: string
  colorSuccessBgHover: string
  colorSuccessBorder: string
  colorSuccessBorderHover: string
  colorSuccessHover: string
  colorSuccess: string
  colorSuccessActive: string
  colorSuccessText: string
  colorSuccessTextHover: string
  colorSuccessTextActive: string
  colorWarningBg: string
  colorWarningBgHover: string
  colorWarningBorder: string
  colorWarningBorderHover: string
  colorWarningHover: string
  colorWarning: string
  colorWarningActive: string
  colorWarningText: string
  colorWarningTextHover: string
  colorWarningTextActive: string
  colorErrorBg: string
  colorErrorBgHover: string
  colorErrorBorder: string
  colorErrorBorderHover: string
  colorErrorBgActive: string
  colorErrorBgFilledHover: string
  colorErrorHover: string
  colorError: string
  colorErrorActive: string
  colorErrorText: string
  colorErrorTextHover: string
  colorErrorTextActive: string
  colorInfoBg: string
  colorInfoBgHover: string
  colorInfoBorder: string
  colorInfoBorderHover: string
  colorInfoHover: string
  colorInfo: string
  colorInfoActive: string
  colorInfoText: string
  colorInfoTextHover: string
  colorInfoTextActive: string
  colorLink: string
  colorLinkHover: string
  colorLinkActive: string
}

export interface FontMapToken {
  fontSizeXS: number
  fontSizeSM: number
  fontSize: number
  fontSizeLG: number
  fontSizeXL: number
  fontSizeHeading1: number
  fontSizeHeading2: number
  fontSizeHeading3: number
  fontSizeHeading4: number
  fontSizeHeading5: number
  lineHeightXS: number
  lineHeightSM: number
  lineHeight: number
  lineHeightLG: number
  lineHeightHeading1: number
  lineHeightHeading2: number
  lineHeightHeading3: number
  lineHeightHeading4: number
  lineHeightHeading5: number
  fontHeightXS: number
  fontHeightSM: number
  fontHeight: number
  fontHeightLG: number
}

export interface SizeMapToken {
  sizeXXL: number
  sizeXL: number
  sizeLG: number
  sizeMD: number
  sizeMS: number
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
  motionDurationFast: number
  motionDurationMid: number
  motionDurationSlow: number
  borderRadiusXS: number
  borderRadiusSM: number
  borderRadiusLG: number
  borderRadiusOuter: number
}
