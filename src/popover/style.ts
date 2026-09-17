import type { TextStyle, ViewStyle } from 'react-native'
import type { PopoverActionsDirection, PopoverTheme } from './types'
import type { PopoverToken } from '../theme'

export interface PopoverResolvedStyles {
  popover: ViewStyle
  content: ViewStyle
  actions: ViewStyle
  action: ViewStyle
  actionIcon: ViewStyle
  actionText: TextStyle
  divider: ViewStyle
}

export interface PopoverThemeColors {
  backgroundColor: string
  textColor: string
  disabledColor: string
  dividerColor: string
}

export function getPopoverThemeColors(
  token: PopoverToken,
  theme: PopoverTheme,
): PopoverThemeColors {
  if (theme === 'dark') {
    return {
      backgroundColor: token.darkBackgroundColor,
      textColor: token.darkTextColor,
      disabledColor: token.darkDisabledColor,
      dividerColor: token.darkDividerColor,
    }
  }

  return {
    backgroundColor: token.lightBackgroundColor,
    textColor: token.lightTextColor,
    disabledColor: token.lightDisabledColor,
    dividerColor: token.lightDividerColor,
  }
}

export function getPopoverStyles(
  token: PopoverToken,
  theme: PopoverTheme,
  actionsDirection: PopoverActionsDirection,
): PopoverResolvedStyles {
  const { backgroundColor, dividerColor, textColor } = getPopoverThemeColors(token, theme)

  return {
    popover: {
      backgroundColor,
      borderRadius: token.borderRadius,
      overflow: 'hidden',
    },
    content: {
      backgroundColor,
      borderRadius: token.borderRadius,
      overflow: 'hidden',
    },
    actions: {
      backgroundColor,
      flexDirection: actionsDirection === 'horizontal' ? 'row' : 'column',
      width: actionsDirection === 'vertical' ? token.actionWidth : undefined,
    },
    action: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      minHeight: token.actionHeight,
      paddingHorizontal: token.actionIconGap,
      width: token.actionWidth,
    },
    actionIcon: {
      alignItems: 'center',
      height: token.actionIconSize,
      justifyContent: 'center',
      marginRight: token.actionIconGap,
      width: token.actionIconSize,
    },
    actionText: {
      color: textColor,
      flexShrink: 1,
      fontFamily: token.fontFamily,
      fontSize: token.actionFontSize,
      lineHeight: token.actionLineHeight,
      textAlign: 'center',
    },
    divider:
      actionsDirection === 'horizontal'
        ? {
            backgroundColor: dividerColor,
            alignSelf: 'stretch',
            width: 1,
          }
        : {
            backgroundColor: dividerColor,
            height: 1,
            width: '100%',
          },
  }
}
