import type { AliasToken, CellToken } from '../theme';

export function getCellToken(token: AliasToken): CellToken {
  return {
    backgroundColor: token.colorBgContainer,
    activeColor: token.colorFillTertiary,
    borderColor: token.colorBorderSecondary,
    paddingHorizontal: token.paddingMD,
    paddingMD: token.paddingMD,
    paddingVertical: token.paddingSM,
    minHeight: token.controlHeight,
    largeMinHeight: token.controlHeightLG,
    titleColor: token.colorText,
    labelColor: token.colorTextSecondary,
    valueColor: token.colorTextSecondary,
    extraColor: token.colorTextTertiary,
    fontSize: token.fontSize,
    labelFontSize: token.fontSizeSM,
    extraFontSize: token.fontSizeSM,
    extraLineHeight: token.lineHeightSM,
    valueMinWidth: token.sizeXXL,
    lineHeight: token.lineHeight,
    lineHeightSM: token.lineHeightSM,
    iconColor: token.colorIcon,
    iconSize: token.fontSizeLG,
    iconGap: token.paddingXS,
    requiredColor: token.colorError,
    requiredWidth: token.fontSizeSM,
    groupTitleColor: token.colorTextSecondary,
    groupTitleFontSize: token.fontSizeSM,
    insetRadius: token.borderRadius,
  };
}
