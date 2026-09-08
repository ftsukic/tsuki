import type { AliasToken, CellToken } from '../theme'

export function getCellToken(token: AliasToken): CellToken {
  const lineHeight = token.lineHeight + token.paddingXXS
  const paddingVertical = token.paddingSM - token.paddingXXS / 2
  const largePaddingVertical = token.paddingSM

  return {
    backgroundColor: token.colorBgContainer,
    groupBackgroundColor: token.colorBgContainer,
    activeColor: token.interactionActiveColor,
    borderColor: token.colorBorder,
    groupBorderColor: token.colorBorder,
    groupBorderWidth: token.lineWidthHairline,
    dividerWidth: token.lineWidthHairline,
    paddingHorizontal: token.padding,
    paddingVertical,
    largePaddingVertical,
    minHeight: lineHeight + paddingVertical * 2,
    largeMinHeight: lineHeight + largePaddingVertical * 2,
    titleColor: token.colorText,
    labelColor: token.colorTextSecondary,
    valueColor: token.colorTextSecondary,
    extraColor: token.colorTextTertiary,
    fontSize: token.fontSize,
    labelFontSize: token.fontSizeSM,
    extraFontSize: token.fontSizeSM,
    extraLineHeight: token.lineHeightSM,
    lineHeight,
    lineHeightSM: token.lineHeightSM,
    labelMarginTop: token.paddingXXS,
    largeTitleFontSize: token.fontSizeLG,
    largeLabelFontSize: token.fontSize,
    iconColor: token.colorIcon,
    iconSize: token.fontSizeLG,
    iconGap: token.paddingXXS,
    requiredColor: token.colorError,
    requiredWidth: token.fontSizeSM,
    groupTitleColor: token.colorTextSecondary,
    groupTitleFontSize: token.fontSize,
    groupTitleLineHeight: token.lineHeightSM - token.paddingXXS / 2,
    groupTitlePaddingHorizontal: token.padding,
    groupTitlePaddingVertical: token.padding,
    groupInsetTitlePaddingHorizontal: token.padding,
    groupInsetTitlePaddingVertical: token.padding,
    groupInsetMarginHorizontal: token.padding,
    insetRadius: token.borderRadiusLG,
    fontFamily: token.fontFamily,
  }
}
