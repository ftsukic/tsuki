import type { PopupToken } from '../theme'
import type { PopupPosition } from './interface'
import { StyleSheet } from 'react-native'

export function createPopupStyles(token: PopupToken) {
  return StyleSheet.create({
    root: {
      alignItems: 'center',
      flex: 1,
      justifyContent: 'center',
    },
    overlay: {
      ...StyleSheet.absoluteFillObject,
    },
    panel: {
      backgroundColor: token.backgroundColor,
      overflow: 'hidden',
    },
    panelTop: {
      left: 0,
      position: 'absolute',
      right: 0,
      top: 0,
    },
    panelBottom: {
      bottom: 0,
      left: 0,
      position: 'absolute',
      right: 0,
    },
    panelLeft: {
      bottom: 0,
      left: 0,
      position: 'absolute',
      top: 0,
    },
    panelRight: {
      bottom: 0,
      position: 'absolute',
      right: 0,
      top: 0,
    },
    panelCenter: {
      flex: 1,
      backgroundColor: 'transparent',
      alignItems: 'center',
      justifyContent: 'center',
    },
    header: {
      alignItems: 'center',
      flexDirection: 'row',
      height: token.headerHeight,
      justifyContent: 'space-between',
      paddingHorizontal: token.headerPaddingHorizontal,
    },
    headerTitle: {
      color: token.headerTitleColor,
      flex: 1,
      fontSize: token.headerTitleFontSize,
      fontWeight: '600',
    },
    close: {
      marginLeft: token.headerPaddingHorizontal,
    },
  })
}

export function getPositionStyle(position: PopupPosition) {
  switch (position) {
    case 'top':
      return 'panelTop' as const
    case 'bottom':
      return 'panelBottom' as const
    case 'left':
      return 'panelLeft' as const
    case 'right':
      return 'panelRight' as const
    case 'center':
    default:
      return 'panelCenter' as const
  }
}
