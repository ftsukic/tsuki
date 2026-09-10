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
  optionDivider: ViewStyle
}

export function getDropdownMenuStyles(token: DropdownToken): DropdownMenuResolvedStyles {
  return {
    root: {
      height: token.menuHeight,
      backgroundColor: token.menuBackgroundColor,
      flexDirection: 'row',
      elevation: token.elevation,
      shadowColor: token.shadowColor,
      shadowOffset: { height: token.shadowOffset, width: 0 },
      shadowOpacity: token.shadowOpacity,
      shadowRadius: token.shadowRadius,
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
      marginLeft: token.caretGap,
    },
  }
}

export function getDropdownItemStyles(
  token: DropdownToken,
  active: boolean,
  disabled: boolean,
  activeColor = token.activeColor,
  scrollable = false,
  scrollableItemWidth: `${number}%` = '25%',
): DropdownItemResolvedStyles {
  return {
    item: {
      ...(scrollable
        ? { flexGrow: 0, flexShrink: 0, width: scrollableItemWidth }
        : { flex: 1, minWidth: 0 }),
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      opacity: 1,
    },
    title: {
      color: disabled ? token.disabledColor : active ? activeColor : token.titleColor,
      fontFamily: token.titleFontFamily,
      fontSize: token.titleFontSize,
      lineHeight: token.titleLineHeight,
    },
    arrow: {
      marginLeft: token.caretGap,
    },
    content: {
      backgroundColor: token.contentBackgroundColor,
    },
    option: {
      alignItems: 'center',
      flexDirection: 'row',
      minHeight: token.optionHeight,
      paddingHorizontal: token.optionPaddingHorizontal,
      position: 'relative',
    },
    optionText: {
      color: token.optionTextColor,
      fontFamily: token.titleFontFamily,
      fontSize: token.optionFontSize,
      lineHeight: token.optionLineHeight,
      flexShrink: 1,
    },
    optionIcon: {
      alignItems: 'center',
      height: token.optionLineHeight,
      justifyContent: 'center',
      width: token.optionIconSize,
    },
    optionDivider: {
      backgroundColor: token.dividerColor,
      bottom: 0,
      height: token.dividerWidth,
      left: token.optionPaddingHorizontal,
      position: 'absolute',
      right: token.optionPaddingHorizontal,
    },
  }
}
