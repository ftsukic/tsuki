import type { AliasToken } from './alias';

export interface ButtonToken {
  heightXS: number;
  heightSM: number;
  height: number;
  heightLG: number;
  borderRadiusXS: number;
  borderRadiusSM: number;
  borderRadius: number;
  borderRadiusLG: number;
  paddingHorizontalXS: number;
  paddingHorizontalSM: number;
  paddingHorizontal: number;
  paddingHorizontalLG: number;
  contentFontSizeXS: number;
  contentFontSizeSM: number;
  contentFontSize: number;
  contentFontSizeLG: number;
  primaryColor: string;
  primaryBackgroundColor: string;
  primaryBorderColor: string;
  primaryPlainBackgroundColor: string;
  defaultColor: string;
  defaultBackgroundColor: string;
  defaultBorderColor: string;
  successColor: string;
  successBackgroundColor: string;
  successBorderColor: string;
  warningColor: string;
  warningBackgroundColor: string;
  warningBorderColor: string;
  dangerColor: string;
  dangerBackgroundColor: string;
  dangerBorderColor: string;
  borderWidth: number;
  activeOpacity: number;
  disabledOpacity: number;
  iconGap: number;
}

export interface CellToken {
  backgroundColor: string;
  activeColor: string;
  borderColor: string;
  paddingHorizontal: number;
  paddingMD: number;
  paddingVertical: number;
  minHeight: number;
  largeMinHeight: number;
  titleColor: string;
  labelColor: string;
  valueColor: string;
  extraColor: string;
  fontSize: number;
  labelFontSize: number;
  extraFontSize: number;
  extraLineHeight: number;
  valueMinWidth: number;
  lineHeight: number;
  lineHeightSM: number;
  iconColor: string;
  iconSize: number;
  iconGap: number;
  requiredColor: string;
  requiredWidth: number;
  groupTitleColor: string;
  groupTitleFontSize: number;
  insetRadius: number;
}

export interface InputToken {
  heightSM: number;
  height: number;
  heightLG: number;
  fontSizeSM: number;
  fontSize: number;
  fontSizeLG: number;
  lineHeightSM: number;
  lineHeight: number;
  borderRadius: number;
  paddingHorizontal: number;
  paddingVertical: number;
  backgroundColor: string;
  borderColor: string;
  activeBorderColor: string;
  placeholderColor: string;
  textColor: string;
  disabledBackgroundColor: string;
  disabledColor: string;
  selectionColor: string;
  borderWidth: number;
  clearButtonSize: number;
  clearButtonBackgroundColor: string;
  clearButtonColor: string;
  prefixColor: string;
  addonColor: string;
  wordLimitColor: string;
  wordLimitFontSize: number;
}

export interface ComponentTokenOverrides {
  Button?: Partial<ButtonToken>;
  Cell?: Partial<CellToken>;
  Input?: Partial<InputToken>;
}

export interface ComponentTokenMap {
  Button: ButtonToken;
  Cell: CellToken;
  Input: InputToken;
}

export type ComponentTokenName = keyof ComponentTokenMap;

export type ComponentTokenFactory<Name extends ComponentTokenName> = (
  token: AliasToken,
) => ComponentTokenMap[Name];
