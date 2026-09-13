import type { ColorValue, TextStyle, ViewStyle } from 'react-native'
import type { TabsToken } from '../theme'
import type { TabsType } from './types'

export interface TabsResolvedStyles {
  root: ViewStyle
  nav: ViewStyle
  navContent: ViewStyle
  tab: ViewStyle
  label: TextStyle
  indicator: ViewStyle
  content: ViewStyle
}

export interface TabStyleState {
  active: boolean
  disabled: boolean
  pressed: boolean
}

function getTabColor(
  token: TabsToken,
  type: TabsType,
  active: boolean,
  disabled: boolean,
): ColorValue {
  if (disabled) return token.disabledColor
  if (type === 'card' && active) return token.cardActiveTextColor
  return active ? token.activeTextColor : token.inactiveTextColor
}

export function getTabsStyles(
  token: TabsToken,
  type: TabsType,
  scrollable: boolean,
  shrink = false,
): TabsResolvedStyles {
  const isCard = type === 'card'

  return {
    root: {
      alignSelf: 'stretch',
    },
    nav: {
      alignItems: 'stretch',
      backgroundColor: isCard ? token.cardBorderColor : 'transparent',
      borderColor: isCard ? token.cardBorderColor : token.borderColor,
      borderRadius: isCard ? token.cardRadius : 0,
      borderWidth: isCard ? token.borderWidth : 0,
      borderBottomWidth: isCard ? token.borderWidth : 0,
      flexDirection: 'row',
      height: token.height,
      overflow: 'hidden',
    },
    tab: {
      alignItems: 'center',
      backgroundColor: isCard ? token.cardBackgroundColor : 'transparent',
      flex: scrollable || shrink ? undefined : 1,
      height: token.height,
      justifyContent: 'center',
      paddingHorizontal: shrink ? token.paddingXS : token.paddingHorizontal,
    },
    label: {
      color: token.inactiveTextColor,
      flexShrink: 1,
      fontFamily: token.fontFamily,
      fontSize: token.fontSize,
      lineHeight: token.lineHeight,
      textAlign: 'center',
    },
    navContent: {
      flexGrow: 1,
      paddingHorizontal: shrink ? token.paddingXS : 0,
      position: 'relative',
    },
    indicator: {
      backgroundColor: token.indicatorColor,
      bottom: 0,
      height: token.indicatorHeight,
      left: 0,
      position: 'absolute',
      width: token.indicatorWidth,
    },
    content: {
      alignSelf: 'stretch',
    },
  }
}

export function getTabStyles(
  token: TabsToken,
  type: TabsType,
  state: TabStyleState,
  base: ViewStyle,
): { root: ViewStyle; label: TextStyle } {
  const isCard = type === 'card'
  const backgroundColor = isCard
    ? state.active
      ? token.cardActiveBackgroundColor
      : token.cardBackgroundColor
    : 'transparent'

  return {
    root: {
      ...base,
      backgroundColor,
      opacity: state.disabled
        ? token.disabledOpacity
        : state.active || !state.pressed
          ? 1
          : token.activeOpacity,
    },
    label: {
      color: getTabColor(token, type, state.active, state.disabled),
      flexShrink: 1,
      fontFamily: token.fontFamily,
      fontSize: token.fontSize,
      lineHeight: token.lineHeight,
      textAlign: 'center',
      fontWeight: type === 'line' && state.active ? '600' : '400',
    },
  }
}
