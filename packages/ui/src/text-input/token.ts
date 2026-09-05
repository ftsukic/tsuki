import type { AliasToken, InputToken } from '../theme';

export function getInputToken(token: AliasToken): InputToken {
  return {
    heightSM: token.controlHeightSM,
    height: token.controlHeight,
    heightLG: token.controlHeightLG,
    fontSizeSM: token.fontSizeSM,
    fontSize: token.fontSize,
    fontSizeLG: token.fontSizeLG,
    lineHeightSM: token.lineHeightSM,
    lineHeight: token.lineHeight,
    borderRadius: token.borderRadius,
    paddingHorizontal: token.paddingMD,
    paddingVertical: token.paddingXS,
    backgroundColor: token.colorBgContainer,
    borderColor: token.colorBorder,
    activeBorderColor: token.colorPrimary,
    placeholderColor: token.colorTextPlaceholder,
    textColor: token.colorText,
    disabledBackgroundColor: token.colorBgContainerDisabled,
    disabledColor: token.colorTextDisabled,
    selectionColor: token.colorPrimary,
    borderWidth: token.lineWidth,
    clearButtonSize: token.fontSizeLG,
    clearButtonBackgroundColor: token.colorFill,
    clearButtonColor: token.colorTextTertiary,
    prefixColor: token.colorTextSecondary,
    addonColor: token.colorTextSecondary,
    wordLimitColor: token.colorTextTertiary,
    wordLimitFontSize: token.fontSizeSM,
  };
}
