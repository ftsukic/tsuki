import type { AliasToken, ToastToken } from '../theme'

export function getToastToken(_token: AliasToken): ToastToken {
  void _token

  return {
    maxWidth: '70%',
    fontSize: 14,
    textColor: '#ffffff',
    loadingIconColor: '#ffffff',
    lineHeight: 20,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    iconSize: 36,
    textMinWidth: 96,
    textPaddingVertical: 8,
    textPaddingHorizontal: 12,
    defaultPadding: 16,
    defaultWidth: 88,
    defaultMinHeight: 88,
    positionTopDistance: '20%',
    positionBottomDistance: '20%',
    overlayColor: 'rgba(0, 0, 0, 0.7)',
    duration: 2000,
    animationDuration: 200,
    zIndex: 2000,
  }
}
