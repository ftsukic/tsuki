import type { TextStyle, ViewStyle } from 'react-native'
import type { AliasToken, NavbarToken } from '../theme'

export interface NavbarResolvedStyles {
  root: ViewStyle
  bar: ViewStyle
  left: ViewStyle
  center: ViewStyle
  title: TextStyle
  right: ViewStyle
  divider: ViewStyle
  placeholder: ViewStyle
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
    left: {
      alignItems: 'center',
      bottom: 0,
      flexDirection: 'row',
      justifyContent: 'center',
      left: 0,
      maxWidth: '20%',
      position: 'absolute',
      top: 0,
    },
    right: {
      alignItems: 'center',
      bottom: 0,
      flexDirection: 'row',
      justifyContent: 'center',
      maxWidth: '20%',
      position: 'absolute',
      right: 0,
      top: 0,
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
      fontWeight: '600',
      lineHeight: aliasToken.lineHeight,
      maxWidth: '60%',
      textAlign: 'center',
    },
    divider: {},
    placeholder: {},
  }
}
