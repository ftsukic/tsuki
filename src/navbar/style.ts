import type { TextStyle, ViewStyle } from 'react-native'
import type { AliasToken, NavbarToken } from '../theme'

export interface NavbarResolvedStyles {
  root: ViewStyle
  bar: ViewStyle
  barCentered: ViewStyle
  barSplit: ViewStyle
  left: ViewStyle
  leftCentered: ViewStyle
  leftSplit: ViewStyle
  right: ViewStyle
  rightCentered: ViewStyle
  rightSplit: ViewStyle
  center: ViewStyle
  title: TextStyle
  divider: ViewStyle
}

export function getNavbarStyles(token: NavbarToken, aliasToken: AliasToken): NavbarResolvedStyles {
  return {
    root: {
      backgroundColor: aliasToken.colorBgContainer,
    },
    bar: {
      alignItems: 'center',
      flexDirection: 'row',
      height: token.height,
      position: 'relative',
    },
    barCentered: {
      justifyContent: 'center',
    },
    barSplit: {
      justifyContent: 'space-between',
    },
    left: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
    },
    leftCentered: {
      bottom: 0,
      left: 0,
      position: 'absolute',
      top: 0,
    },
    leftSplit: {
      flexShrink: 1,
    },
    right: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
    },
    rightCentered: {
      bottom: 0,
      position: 'absolute',
      right: 0,
      top: 0,
    },
    rightSplit: {
      flexShrink: 1,
    },
    center: {
      alignItems: 'center',
      bottom: 0,
      justifyContent: 'center',
      left: 0,
      position: 'absolute',
      right: 0,
      top: 0,
    },
    title: {
      color: token.titleColor,
      flexShrink: 1,
      fontSize: token.titleFontSize,
      fontWeight: '500',
      lineHeight: aliasToken.lineHeight,
      textAlign: 'center',
    },
    divider: {},
  }
}
