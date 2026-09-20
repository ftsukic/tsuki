import type { ReactNode } from 'react'
import type { DimensionValue, StyleProp, ViewProps, ViewStyle } from 'react-native'
import type { StyleInfo, StyleResolver } from '../style'

export type SkeletonAvatarShape = 'round' | 'square'

export interface SkeletonStyleState {
  loading: boolean
  title: boolean
  avatar: boolean
  round: boolean
  animate: boolean
}

export interface SkeletonSemanticStyles {
  root?: StyleProp<ViewStyle>
  placeholder?: StyleProp<ViewStyle>
  avatar?: StyleProp<ViewStyle>
  content?: StyleProp<ViewStyle>
  title?: StyleProp<ViewStyle>
  rows?: StyleProp<ViewStyle>
  row?: StyleProp<ViewStyle>
}

export type SkeletonStyles = StyleResolver<
  SkeletonProps,
  SkeletonStyleState,
  SkeletonSemanticStyles
>

export interface SkeletonProps extends Omit<ViewProps, 'children' | 'style'> {
  loading?: boolean
  title?: boolean
  avatar?: boolean
  row?: number
  titleWidth?: DimensionValue
  rowWidth?: DimensionValue | DimensionValue[]
  avatarSize?: number
  avatarShape?: SkeletonAvatarShape
  round?: boolean
  animate?: boolean
  children?: ReactNode
  style?: StyleProp<ViewStyle>
  styles?: SkeletonStyles
}

export type SkeletonStyleInfo = StyleInfo<SkeletonProps, SkeletonStyleState>
