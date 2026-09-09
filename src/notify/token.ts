import type { AliasToken, NotifyToken } from '../theme'

export function getNotifyToken(token: AliasToken): NotifyToken {
  return {
    primaryBackgroundColor: token.colorPrimary,
    successBackgroundColor: token.colorSuccess,
    errorBackgroundColor: token.colorError,
    warningBackgroundColor: token.colorWarning,
    textColor: token.colorTextLightSolid,
    fontFamily: token.fontFamily,
    fontSize: token.fontSize,
    lineHeight: token.lineHeight,
    paddingHorizontal: token.padding,
    paddingVertical: token.paddingSM,
  }
}
