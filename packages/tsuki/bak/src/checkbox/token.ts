import type { AliasToken, CheckboxToken } from '../theme'
import { getButtonToken } from '../button/token'

export function getCheckboxToken(token: AliasToken): CheckboxToken {
  const buttonToken = getButtonToken(token)

  return {
    size: token.controlInteractiveSize,
    borderRadius: token.borderRadiusXS,
    borderWidth: token.lineWidth,
    borderColor: token.colorBorder,
    checkedBackground: token.colorPrimary,
    checkedIconColor: token.colorTextLightSolid,
    disabledColor: token.colorTextDisabled,
    disabledBackground: token.colorBgContainerDisabled,
    labelColor: token.colorText,
    gap: token.paddingXS,
    groupGap: token.paddingXS,
    pressedOpacity: token.pressedOpacity,
    disabledOpacity: buttonToken.disabledOpacity,
    fontSize: buttonToken.contentFontSize,
    lineHeight: token.lineHeight,
    fontFamily: buttonToken.fontFamily,
    buttonHeight: 32,
    buttonMinWidth: 62,
    buttonPaddingHorizontal: token.paddingXS,
    buttonBorderRadius: buttonToken.borderRadius,
    buttonBackground: token.colorBgContainer,
    buttonFilledBackground: token.colorFillTertiary,
    buttonDisabledBackground: token.colorBgContainerDisabled,
    buttonCheckedFilledBackground: token.colorPrimaryBg,
  }
}
