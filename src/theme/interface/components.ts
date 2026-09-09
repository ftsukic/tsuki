import type { AliasToken } from './alias'
import type { DimensionValue, TextStyle } from 'react-native'

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
  lineHeightLG: number
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
  fontFamily: string
}

export interface FieldToken {
  labelColor: string
  errorColor: string
  warningColor: string
  padding: number
  height: number
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
  borderWidth: number
  paddingHorizontal: number
  paddingHorizontalSM: number
  fontSize: number
  fontSizeSM: number
  color: string
  textColor: string
  borderColor: string
  successColor: string
  processingColor: string
  defaultColor: string
  errorColor: string
  warningColor: string
}

export interface FloatingPanelToken {
  borderRadius: number
  headerHeight: number
  zIndex: number
  backgroundColor: string
  barWidth: number
  barHeight: number
  barColor: string
  animationDuration: number
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

export interface DialogToken {
  width: number
  smallScreenWidth: DimensionValue
  backgroundColor: string
  overlayColor: string
  borderRadius: number
  titleColor: string
  messageColor: string
  fontSize: number
  titleFontSize: number
  titleLineHeight: number
  messageLineHeight: number
  headerFontWeight: TextStyle['fontWeight']
  headerPaddingTop: number
  headerPaddingHorizontal: number
  headerPaddingBottom: number
  headerIsolatedPaddingVertical: number
  messagePaddingHorizontal: number
  messagePaddingTop: number
  messagePaddingBottom: number
  messageMaxHeightRatio: number
  buttonHeight: number
  roundButtonHeight: number
  confirmButtonColor: string
  cancelButtonColor: string
  dividerColor: string
  buttonGap: number
  footerPaddingHorizontal: number
  footerPaddingVertical: number
  animationDuration: number
  zIndex: number
}

export interface OverlayToken {
  backgroundColor: string
  animationDuration: number
  zIndex: number
}

export interface PopupToken {
  backgroundColor: string
  overlayColor: string
  borderRadius: number
  animationDuration: number
  zIndex: number
}

export interface ToastToken {
  maxWidth: DimensionValue
  fontSize: number
  textColor: string
  loadingIconColor: string
  lineHeight: number
  borderRadius: number
  backgroundColor: string
  iconSize: number
  textMinWidth: number
  textPaddingVertical: number
  textPaddingHorizontal: number
  defaultPadding: number
  defaultWidth: number
  defaultMinHeight: number
  positionTopDistance: DimensionValue
  positionBottomDistance: DimensionValue
  overlayColor: string
  duration: number
  animationDuration: number
  zIndex: number
}

export interface ComponentTokenOverrides {
  Button?: Partial<ButtonToken>
  Cell?: Partial<CellToken>
  Input?: Partial<InputToken>
  Field?: Partial<FieldToken>
  Radio?: Partial<RadioToken>
  Avatar?: Partial<AvatarToken>
  Badge?: Partial<BadgeToken>
  FloatingPanel?: Partial<FloatingPanelToken>
  Dialog?: Partial<DialogToken>
  Overlay?: Partial<OverlayToken>
  Popup?: Partial<PopupToken>
  Toast?: Partial<ToastToken>
}

export interface ComponentTokenMap {
  Button: ButtonToken
  Cell: CellToken
  Input: InputToken
  Field: FieldToken
  Radio: RadioToken
  Avatar: AvatarToken
  Badge: BadgeToken
  FloatingPanel: FloatingPanelToken
  Dialog: DialogToken
  Overlay: OverlayToken
  Popup: PopupToken
  Toast: ToastToken
}

export type ComponentTokenName = keyof ComponentTokenMap

export type ComponentTokenFactory<Name extends ComponentTokenName> = (
  token: AliasToken,
) => ComponentTokenMap[Name]
