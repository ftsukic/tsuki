import type { TextStyle, ViewStyle } from 'react-native'
import { getButtonToken } from '../button/token'
import type { AliasToken } from '../theme'

export type NoticeBarItemMode = 'measure' | 'scroll' | 'ellipsis' | 'wrap'

export interface NoticeBarResolvedStyles {
  root: ViewStyle
  contentRoot: ViewStyle
  leftIcon: ViewStyle
  wrap: ViewStyle
  rightIcon: ViewStyle
  contentMeasured: ViewStyle
  contentFlow: ViewStyle
  text: TextStyle
}

export function getNoticeBarStyles(
  token: AliasToken,
  wrapable: boolean,
  disabled: boolean,
  pressed = false,
): NoticeBarResolvedStyles {
  const buttonToken = getButtonToken(token)
  const height = token.controlHeightSM + token.paddingXXS * 2
  const lineHeight = token.lineHeightXL
  const disabledOpacity = disabled ? buttonToken.disabledOpacity : 1
  const rootOpacity = disabledOpacity
  const contentOpacity = pressed && !disabled ? buttonToken.activeOpacity : 1
  const contentFlow: ViewStyle = {
    alignItems: 'center',
    flexShrink: 1,
    flexDirection: 'row',
    minHeight: lineHeight,
    minWidth: 0,
    position: 'relative',
    width: '100%',
  }

  return {
    root: {
      alignItems: 'center',
      backgroundColor: token.colorWarningBg,
      flexDirection: 'row',
      minHeight: height,
      opacity: rootOpacity,
      paddingHorizontal: token.padding,
      ...(wrapable ? { paddingVertical: token.paddingXS } : { height }),
      position: 'relative',
    },
    contentRoot: {
      alignItems: 'center',
      flex: 1,
      flexDirection: 'row',
      minWidth: 0,
      opacity: contentOpacity,
      ...(wrapable ? {} : { height }),
    },
    leftIcon: {
      alignItems: 'center',
      flexShrink: 0,
      justifyContent: 'center',
      minWidth: token.controlHeightXS,
      ...(wrapable ? { minHeight: lineHeight } : { height }),
    },
    wrap: {
      alignItems: 'center',
      flex: 1,
      minWidth: 0,
      overflow: 'hidden',
      position: 'relative',
      ...(wrapable ? {} : { height }),
    },
    rightIcon: {
      alignItems: 'center',
      flexShrink: 0,
      justifyContent: 'center',
      minWidth: token.controlHeightXS,
      ...(wrapable ? { minHeight: lineHeight } : { height }),
    },
    contentMeasured: {
      alignItems: 'center',
      bottom: 0,
      flexShrink: 0,
      flexDirection: 'row',
      justifyContent: 'center',
      left: 0,
      minHeight: lineHeight,
      position: 'absolute',
      top: 0,
    },
    contentFlow,
    text: {
      color: token.colorWarning,
      flexShrink: 0,
      fontFamily: token.fontFamily,
      fontSize: token.fontSize,
      lineHeight,
    },
  }
}

export function getNoticeBarItemStyle(
  styles: NoticeBarResolvedStyles,
  mode: NoticeBarItemMode,
): ViewStyle {
  if (mode === 'measure' || mode === 'scroll') return styles.contentMeasured
  return styles.contentFlow
}
