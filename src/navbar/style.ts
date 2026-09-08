import type { TextStyle, ViewStyle } from 'react-native'
import type { AliasToken, NavbarToken } from '../theme'

export interface NavbarResolvedStyles {
  root: ViewStyle
  bar: ViewStyle
  left: ViewStyle
  right: ViewStyle
  titleContainer: ViewStyle
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
      justifyContent: 'center',
      position: 'relative',
    },
    left: {
      alignItems: 'center',
      bottom: 0,
      flexDirection: 'row',
      flexShrink: 1,
      justifyContent: 'center',
      left: 0,
      maxWidth: '20%',
      position: 'absolute',
      paddingHorizontal: token.paddingHorizontal,
      top: 0,
    },
    right: {
      alignItems: 'center',
      bottom: 0,
      flexDirection: 'row',
      flexShrink: 1,
      justifyContent: 'center',
      maxWidth: '20%',
      paddingHorizontal: token.paddingHorizontal,
      position: 'absolute',
      right: 0,
      top: 0,
    },
    titleContainer: {
      flexShrink: 1,
      marginHorizontal: 'auto',
      maxWidth: '60%',
      overflow: 'hidden',
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
