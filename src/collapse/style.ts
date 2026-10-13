import type { TextStyle, ViewStyle } from 'react-native'
import type { CollapseToken } from '../theme'
import type { CollapseItemStyleState } from './types'

export interface CollapseResolvedStyles {
  root: ViewStyle
  header: ViewStyle
  title: TextStyle
  titleContainer: ViewStyle
  leading: ViewStyle
  icon: ViewStyle
  contentWrapper: ViewStyle
  contentMeasure: ViewStyle
  body: ViewStyle
  bodyText: TextStyle
}

export function getCollapseDividerStyle(token: CollapseToken): ViewStyle {
  return {
    backgroundColor: token.borderColor,
    height: token.borderWidth,
    left: token.paddingHorizontal,
    position: 'absolute',
    right: token.paddingHorizontal,
    top: 0,
  }
}

export function getCollapseHeaderDividerStyle(token: CollapseToken): ViewStyle {
  return {
    backgroundColor: token.borderColor,
    bottom: 0,
    height: token.borderWidth,
    left: token.paddingHorizontal,
    position: 'absolute',
    right: token.paddingHorizontal,
  }
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
    root: {},
    header: {
      alignItems: 'center',
      backgroundColor: token.contentBackgroundColor,
      columnGap: token.iconGap,
      flexDirection: 'row',
      minHeight: token.headerHeight,
      opacity: state.disabled ? token.disabledOpacity : 1,
      overflow: 'hidden',
      paddingHorizontal: token.paddingHorizontal,
      position: 'relative',
    },
    title: {
      color: state.disabled ? token.disabledColor : token.titleColor,
      fontFamily: token.fontFamily,
      fontSize: token.titleFontSize,
      lineHeight: token.titleLineHeight,
    },
    titleContainer: {
      flex: 1,
      flexShrink: 1,
      minWidth: 0,
    },
    leading: {
      alignItems: 'center',
      height: token.titleLineHeight,
      justifyContent: 'center',
    },
    icon: {
      alignItems: 'center',
      height: token.titleLineHeight,
      justifyContent: 'center',
      width: token.iconSize,
    },
    contentWrapper: {
      backgroundColor: token.contentBackgroundColor,
      overflow: 'hidden',
    },
    contentMeasure: {
      left: 0,
      position: 'absolute',
      right: 0,
      top: 0,
    },
    body: {
      paddingHorizontal: token.contentPaddingHorizontal,
      paddingVertical: token.contentPaddingVertical,
    },
    bodyText: {
      color: token.contentTextColor,
      fontFamily: token.fontFamily,
      fontSize: token.contentFontSize,
      lineHeight: token.contentLineHeight,
    },
  }
}
