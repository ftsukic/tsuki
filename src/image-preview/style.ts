import { StyleSheet } from 'react-native'
import type { ImagePreviewToken } from '../theme'

export function getImagePreviewStyles(token: ImagePreviewToken) {
  return StyleSheet.create({
    root: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: token.overlayColor,
      zIndex: token.zIndex,
    },
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: token.overlayColor,
    },
    pager: {
      ...StyleSheet.absoluteFillObject,
    },
    controls: {
      ...StyleSheet.absoluteFillObject,
      pointerEvents: 'box-none',
      zIndex: 2,
    },
    bottomControls: {
      bottom: 0,
      left: 0,
      position: 'absolute',
      right: 0,
    },
    index: {
      color: token.indexColor,
      fontSize: token.indexFontSize,
      lineHeight: token.indexLineHeight,
      position: 'absolute',
      textAlign: 'center',
      width: '100%',
    },
    closeButton: {
      alignItems: 'center',
      height: Math.max(44, token.closeIconSize + 16),
      justifyContent: 'center',
      position: 'absolute',
      right: Math.max(0, token.closeIconRight - 8),
      width: Math.max(44, token.closeIconSize + 16),
    },
    closeLabel: {
      color: token.closeIconColor,
      fontSize: token.closeIconSize,
      fontWeight: '300',
      lineHeight: token.closeIconSize,
    },
    toolbar: {
      width: '100%',
    },
    indicators: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: 6,
      justifyContent: 'center',
      width: '100%',
    },
    indicator: {
      backgroundColor: 'rgba(255,255,255,0.45)',
      borderRadius: 3,
      height: 6,
      width: 6,
    },
    activeIndicator: {
      backgroundColor: '#ffffff',
    },
  })
}
