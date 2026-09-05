import type { AliasToken } from './alias'

export interface ButtonToken {
  heightXS: number
  heightSM: number
  height: number
  heightLG: number
  borderRadiusXS: number
  borderRadiusSM: number
  borderRadius: number
  borderRadiusLG: number
  paddingHorizontalXS: number
  paddingHorizontalSM: number
  paddingHorizontal: number
  paddingHorizontalLG: number
  contentFontSizeXS: number
  contentFontSizeSM: number
  contentFontSize: number
  contentFontSizeLG: number
  primaryColor: string
  primaryBackgroundColor: string
  primaryBorderColor: string
  primaryPlainBackgroundColor: string
  primaryFilledBackgroundColor: string
  defaultColor: string
  defaultBackgroundColor: string
  defaultBorderColor: string
  defaultFilledBackgroundColor: string
  successColor: string
  successBackgroundColor: string
  successBorderColor: string
  successFilledBackgroundColor: string
  warningColor: string
  warningBackgroundColor: string
  warningBorderColor: string
  warningFilledBackgroundColor: string
  dangerColor: string
  dangerBackgroundColor: string
  dangerBorderColor: string
  dangerFilledBackgroundColor: string
  borderWidth: number
  activeOpacity: number
  disabledOpacity: number
  iconGap: number
}

export interface CellToken {
  backgroundColor: string
  activeColor: string
  borderColor: string
  paddingHorizontal: number
  paddingMD: number
  paddingVertical: number
  minHeight: number
  largeMinHeight: number
  titleColor: string
  labelColor: string
  valueColor: string
  extraColor: string
  fontSize: number
  labelFontSize: number
  extraFontSize: number
  extraLineHeight: number
  valueMinWidth: number
  lineHeight: number
  lineHeightSM: number
  iconColor: string
  iconSize: number
  iconGap: number
  requiredColor: string
  requiredWidth: number
  groupTitleColor: string
  groupTitleFontSize: number
  insetRadius: number
}

export interface InputToken {
  heightSM: number
  height: number
  heightLG: number
  fontSizeSM: number
  fontSize: number
  fontSizeLG: number
  lineHeightSM: number
  lineHeight: number
  borderRadius: number
  paddingHorizontal: number
  paddingVertical: number
  backgroundColor: string
  borderColor: string
  activeBorderColor: string
  placeholderColor: string
  textColor: string
  disabledBackgroundColor: string
  disabledColor: string
  selectionColor: string
  borderWidth: number
  clearButtonSize: number
  clearButtonBackgroundColor: string
  clearButtonColor: string
  prefixColor: string
  addonColor: string
  wordLimitColor: string
  wordLimitFontSize: number
}

export interface AvatarToken {
  containerSizeSM: number
  containerSize: number
  containerSizeLG: number
  borderRadius: number
  backgroundColor: string
  textColor: string
  textFontSizeSM: number
  textFontSize: number
  textFontSizeLG: number
  iconFontSizeSM: number
  iconFontSize: number
  iconFontSizeLG: number
  groupBorderColor: string
  groupBorderWidth: number
  groupOverlapping: number
  groupSpace: number
}

export interface BadgeToken {
  height: number
  heightSM: number
  minWidth: number
  minWidthSM: number
  dotSize: number
  borderRadius: number
  paddingHorizontal: number
  paddingHorizontalSM: number
  fontSize: number
  fontSizeSM: number
  color: string
  textColor: string
  successColor: string
  processingColor: string
  defaultColor: string
  errorColor: string
  warningColor: string
}

export interface RadioToken {
  indicatorSize: number
  dotSize: number
  borderWidth: number
  borderRadius: number
  borderColor: string
  checkedColor: string
  labelColor: string
  disabledColor: string
  disabledLabelColor: string
  fontSize: number
  lineHeight: number
  gap: number
  activeOpacity: number
  disabledOpacity: number
}

export interface ComponentTokenOverrides {
  Button?: Partial<ButtonToken>
  Cell?: Partial<CellToken>
  Input?: Partial<InputToken>
  Radio?: Partial<RadioToken>
  Avatar?: Partial<AvatarToken>
  Badge?: Partial<BadgeToken>
}

export interface ComponentTokenMap {
  Button: ButtonToken
  Cell: CellToken
  Input: InputToken
  Radio: RadioToken
  Avatar: AvatarToken
  Badge: BadgeToken
}

export type ComponentTokenName = keyof ComponentTokenMap

export type ComponentTokenFactory<Name extends ComponentTokenName> = (
  token: AliasToken,
) => ComponentTokenMap[Name]
