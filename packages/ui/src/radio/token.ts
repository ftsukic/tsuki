import type { AliasToken, RadioToken } from '../theme'

export function getRadioToken(token: AliasToken): RadioToken {
  return {
    indicatorSize: token.controlInteractiveSize,
    dotSize: token.controlInteractiveSize / 2,
    borderWidth: token.lineWidth,
    borderRadius: token.borderRadiusSM,
    borderColor: token.colorBorder,
    checkedColor: token.colorPrimary,
    labelColor: token.colorText,
    disabledColor: token.colorTextDisabled,
    disabledLabelColor: token.colorTextDisabled,
    fontSize: token.fontSize,
    lineHeight: token.lineHeight,
    gap: token.paddingXS,
    activeOpacity: 0.6,
    disabledOpacity: 0.4,
  }
}
