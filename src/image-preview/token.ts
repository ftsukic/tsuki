import type { AliasToken, ImagePreviewToken } from '../theme'

export function getImagePreviewToken(token: AliasToken): ImagePreviewToken {
  return {
    zIndex: token.zIndexPopupBase + 10,
    overlayColor: '#000000',
    indexColor: '#ffffff',
    indexFontSize: token.fontSize,
    indexLineHeight: token.lineHeight,
    indexTop: token.paddingLG,
    closeIconColor: '#ffffff',
    closeIconSize: 28,
    closeIconTop: token.paddingLG,
    closeIconRight: token.paddingLG,
    animationDuration: Math.max(0, token.motionDurationMid),
  }
}
