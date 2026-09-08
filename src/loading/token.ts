import type { AliasToken, LoadingToken } from '../theme'

export function getLoadingToken(token: AliasToken): LoadingToken {
  return {
    defaultSize: Math.max(1, token.controlHeightSM - token.lineWidth * 2),
    defaultColor: token.colorIcon,
    textColor: token.colorTextSecondary,
    textFontSize: token.fontSizeSM,
    textGap: token.marginXS,
    animationDuration: 1000,
  }
}
