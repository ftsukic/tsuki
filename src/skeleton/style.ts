import type { ViewStyle } from 'react-native'
import type { SkeletonProps, SkeletonStyleState } from './interface'
import type { SkeletonToken } from '../theme'

export interface SkeletonResolvedStyles {
  root: ViewStyle
  placeholder: ViewStyle
  avatar: ViewStyle
  content: ViewStyle
  title: ViewStyle
  rows: ViewStyle
  row: ViewStyle
}

export function getSkeletonStyles(
  token: SkeletonToken,
  props: SkeletonProps,
  state: SkeletonStyleState,
): SkeletonResolvedStyles {
  const avatarSize = props.avatarSize ?? token.avatarSize
  const borderRadius = state.round ? token.roundBorderRadius : token.borderRadius

  return {
    root: {
      width: '100%',
    },
    placeholder: {},
    avatar: {
      backgroundColor: token.backgroundColor,
      borderRadius: props.avatarShape === 'square' ? token.borderRadius : avatarSize / 2,
      flexShrink: 0,
      height: avatarSize,
      marginRight: token.avatarGap,
      width: avatarSize,
    },
    content: {
      flex: 1,
      minWidth: 0,
    },
    title: {
      backgroundColor: token.backgroundColor,
      borderRadius,
      height: token.titleHeight,
      width: props.titleWidth ?? token.titleWidth,
    },
    rows: {
      width: '100%',
    },
    row: {
      backgroundColor: token.backgroundColor,
      borderRadius,
      height: token.rowHeight,
      width: token.rowWidth,
    },
  }
}
