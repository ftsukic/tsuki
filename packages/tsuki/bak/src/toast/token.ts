import type { AliasToken, ToastToken } from '../theme'

export function getToastToken(token: AliasToken): ToastToken {
  return {
    maxWidth: '70%',
    fontFamily: token.fontFamily,
    fontSize: 14,
    textColor: token.colorTextLightSolid,
    loadingIconColor: token.colorTextLightSolid,
    lineHeight: 20,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    iconSize: 36,
    textMinWidth: 96,
    textPaddingVertical: 8,
    textPaddingHorizontal: 12,
    defaultPaddingHorizontal: 16,
    defaultPaddingVertical: 16,
    defaultWidth: 120,
    defaultMinHeight: 120,
    iconTextGap: 8,
    positionTopDistance: '20%',
    positionBottomDistance: '20%',
    overlayColor: token.colorBgMask,
    duration: 2000,
    animationDuration: token.motionDurationMid,
    zIndex: token.zIndexPopupBase + 1000,
  }
}
