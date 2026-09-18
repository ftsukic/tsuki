import type { TextStyle, ViewStyle } from 'react-native'
import type { AliasToken, NavbarToken } from '../theme'

export interface NavbarResolvedStyles {
  root: ViewStyle
  bar: ViewStyle
  left: ViewStyle
  title: ViewStyle
  titleText: TextStyle
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
      paddingHorizontal: token.paddingHorizontal,
      position: 'absolute',
      top: 0,
    },
    right: {
      alignItems: 'center',
      bottom: 0,
      flexDirection: 'row',
      justifyContent: 'center',
      paddingHorizontal: token.paddingHorizontal,
      position: 'absolute',
      right: 0,
      top: 0,
    },
    title: {
      alignItems: 'center',
      flexShrink: 1,
      justifyContent: 'center',
      marginLeft: 'auto',
      marginRight: 'auto',
      maxWidth: '60%',
      overflow: 'hidden',
    },
    titleText: {
      color: token.titleColor,
      fontSize: token.titleFontSize,
      fontWeight: '600',
      lineHeight: aliasToken.lineHeightLG,
      textAlign: 'center',
    },
    divider: {},
    placeholder: {},
  }
}
