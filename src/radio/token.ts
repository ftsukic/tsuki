import type { AliasToken, RadioToken } from '../theme'
import { getButtonToken } from '../button/token'

export function getRadioToken(token: AliasToken): RadioToken {
  const buttonToken = getButtonToken(token)

  return {
    indicatorSize: token.controlInteractiveSize,
    dotSize: token.controlInteractiveSize / 2,
    borderWidth: token.lineWidth,
    borderRadius: token.borderRadiusSM,
    borderColor: token.colorBorder,
    checkedColor: token.colorPrimary,
    labelColor: token.colorText,
    disabledBorderColor: token.colorTextDisabled,
    disabledBackgroundColor: token.colorBgContainerDisabled,
    disabledCheckedBackgroundColor: token.controlItemBgActiveDisabled,
    disabledMarkColor: token.colorTextDisabled,
    disabledLabelColor: token.colorTextDisabled,
    fontSize: buttonToken.contentFontSize,
    lineHeight: token.lineHeight,
    gap: token.paddingXS,
    activeOpacity: buttonToken.activeOpacity,
    disabledOpacity: buttonToken.disabledOpacity,
    fontFamily: buttonToken.fontFamily,
    buttonHeight: 32,
    buttonMinWidth: 62,
    buttonPaddingHorizontal: token.paddingXS,
    buttonBorderRadius: buttonToken.borderRadius,
    buttonBackground: token.colorBgContainer,
    buttonFilledBackground: token.colorFillTertiary,
    buttonDisabledBackground: token.colorBgContainerDisabled,
    buttonCheckedFilledBackground: token.colorPrimaryBg,
    buttonCheckedLabelColor: token.colorTextLightSolid,
  }
}
