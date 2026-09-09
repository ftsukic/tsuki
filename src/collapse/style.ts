import type { TextStyle, ViewStyle } from 'react-native'
import type { CollapseToken } from '../theme'

export interface CollapseItemStyleState {
  active: boolean
  disabled: boolean
  pressed: boolean
}

export interface CollapseResolvedStyles {
  header: ViewStyle
  title: TextStyle
  icon: ViewStyle
  arrow: ViewStyle
  contentWrapper: ViewStyle
  content: ViewStyle
  contentText: TextStyle
}

export function getCollapseRootStyle(token: CollapseToken, border: boolean): ViewStyle {
  return {
    alignSelf: 'stretch',
    borderBottomColor: token.borderColor,
    borderBottomWidth: border ? token.borderWidth : 0,
    borderTopColor: token.borderColor,
    borderTopWidth: border ? token.borderWidth : 0,
  }
}

export function getCollapseStyles(
  token: CollapseToken,
  state: CollapseItemStyleState,
): CollapseResolvedStyles {
  return {
    header: {
      alignItems: 'center',
      backgroundColor: state.pressed ? token.activeColor : token.contentBackgroundColor,
      flexDirection: 'row',
      height: token.headerHeight,
      opacity: state.disabled ? token.disabledOpacity : 1,
      paddingHorizontal: token.paddingHorizontal,
    },
    title: {
      color: state.disabled ? token.disabledColor : token.titleColor,
      flex: 1,
      fontFamily: token.fontFamily,
      fontSize: token.titleFontSize,
      lineHeight: token.titleLineHeight,
    },
    icon: {
      alignItems: 'center',
      height: token.titleLineHeight,
      justifyContent: 'center',
      marginRight: token.iconGap,
      width: token.iconSize,
    },
    arrow: {
      alignItems: 'center',
      height: token.titleLineHeight,
      justifyContent: 'center',
      marginLeft: token.iconGap,
      width: token.iconSize,
    },
    contentWrapper: {
      overflow: 'hidden',
    },
    content: {
      backgroundColor: token.contentBackgroundColor,
      paddingHorizontal: token.contentPaddingHorizontal,
      paddingVertical: token.contentPaddingVertical,
    },
    contentText: {
      color: token.contentTextColor,
      fontFamily: token.fontFamily,
      fontSize: token.contentFontSize,
      lineHeight: token.contentLineHeight,
    },
  }
}
