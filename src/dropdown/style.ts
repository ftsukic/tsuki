import type { TextStyle, ViewStyle } from 'react-native'
import type { DropdownToken } from '../theme'

export interface DropdownMenuResolvedStyles {
  root: ViewStyle
  item: ViewStyle
  title: TextStyle
  arrow: ViewStyle
}

export interface DropdownItemResolvedStyles {
  item: ViewStyle
  title: TextStyle
  arrow: ViewStyle
  content: ViewStyle
  option: ViewStyle
  optionText: TextStyle
  optionIcon: ViewStyle
}

export function getDropdownMenuStyles(token: DropdownToken): DropdownMenuResolvedStyles {
  return {
    root: {
      height: token.menuHeight,
      backgroundColor: token.menuBackgroundColor,
      flexDirection: 'row',
    },
    item: {
      flex: 1,
      minWidth: 0,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      color: token.titleColor,
      fontFamily: token.titleFontFamily,
      fontSize: token.titleFontSize,
      lineHeight: token.titleLineHeight,
    },
    arrow: {
      marginLeft: token.arrowGap,
    },
  }
}

export function getDropdownItemStyles(
  token: DropdownToken,
  active: boolean,
  disabled: boolean,
): DropdownItemResolvedStyles {
  return {
    item: {
      flex: 1,
      minWidth: 0,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      opacity: disabled ? 0.6 : 1,
    },
    title: {
      color: disabled ? token.disabledColor : active ? token.activeColor : token.titleColor,
      fontFamily: token.titleFontFamily,
      fontSize: token.titleFontSize,
      lineHeight: token.titleLineHeight,
    },
    arrow: {
      marginLeft: token.arrowGap,
    },
    content: {
      backgroundColor: token.contentBackgroundColor,
    },
    option: {
      alignItems: 'center',
      borderBottomColor: token.dividerColor,
      borderBottomWidth: 1,
      flexDirection: 'row',
      minHeight: token.optionHeight,
      paddingHorizontal: token.optionPaddingHorizontal,
    },
    optionText: {
      color: active ? token.activeColor : token.titleColor,
      fontFamily: token.titleFontFamily,
      fontSize: token.optionFontSize,
      lineHeight: token.optionLineHeight,
    },
    optionIcon: {
      marginLeft: token.arrowGap,
    },
  }
}
