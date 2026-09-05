import type { AliasToken, BadgeToken } from '../theme'

export function getBadgeToken(token: AliasToken): BadgeToken {
  return {
    height: 20,
    heightSM: 16,
    minWidth: 20,
    minWidthSM: 16,
    dotSize: 8,
    borderRadius: 999,
    paddingHorizontal: 6,
    paddingHorizontalSM: 4,
    fontSize: token.fontSizeSM,
    fontSizeSM: 10,
    color: token.colorError,
    textColor: token.colorTextLightSolid,
    successColor: token.colorSuccess,
    processingColor: token.colorPrimary,
    defaultColor: token.colorTextTertiary,
    errorColor: token.colorError,
    warningColor: token.colorWarning,
  }
}
