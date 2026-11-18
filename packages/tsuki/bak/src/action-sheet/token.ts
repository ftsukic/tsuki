import type { ActionSheetToken, AliasToken } from '../theme'

export function getActionSheetToken(token: AliasToken): ActionSheetToken {
  return {
    backgroundColor: token.colorBgContainer,
    actionPressedBackgroundColor: token.pressedBackgroundColor,
    cancelPressedBackgroundColor: token.pressedBackgroundColor,
    titleColor: token.colorTextSecondary,
    actionColor: token.colorText,
    descriptionColor: token.colorTextSecondary,
    disabledColor: token.colorTextDisabled,
    loadingColor: token.colorIcon,
    dividerColor: token.colorBorderSecondary,
    borderRadius: token.borderRadiusLG,
    titleFontSize: token.fontSizeSM,
    titleLineHeight: token.lineHeightSM,
    actionFontSize: token.fontSizeLG,
    actionLineHeight: token.lineHeightLG,
    descriptionFontSize: token.fontSizeSM,
    descriptionLineHeight: token.lineHeightSM,
    titleHeight: 48,
    titlePaddingHorizontal: token.padding,
    titlePaddingVertical: token.paddingSM,
    actionPaddingHorizontal: token.padding,
    actionPaddingVertical: 14,
    descriptionMarginTop: token.paddingXXS,
    cancelGap: token.paddingSM,
    cancelGapColor: token.colorBgLayout,
    cancelPaddingVertical: 14,
    animationDuration: Math.max(0, token.motionDurationMid),
    zIndex: token.zIndexPopupBase,
    fontFamily: token.fontFamily,
  }
}
