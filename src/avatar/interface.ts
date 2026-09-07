import type { ReactNode } from 'react'
import type {
  ImageErrorEventData,
  ImageProps,
  ImageSourcePropType,
  ImageStyle,
  PressableProps,
  StyleProp,
  TextStyle,
  ViewProps,
  ViewStyle,
} from 'react-native'
import type { StyleInfo, StyleResolver } from '../style'

export type AvatarShape = 'circle' | 'square'
export type AvatarPresetSize = 'small' | 'medium' | 'large'
export type AvatarSize = AvatarPresetSize | number
export type AvatarSource = ImageSourcePropType | string

export interface AvatarStyleState {
  imageError: boolean
}

export interface AvatarSemanticStyles {
  root?: StyleProp<ViewStyle>
  image?: StyleProp<ImageStyle>
  icon?: StyleProp<ViewStyle>
  text?: StyleProp<TextStyle>
  content?: StyleProp<ViewStyle>
}

export type AvatarStyles = StyleResolver<AvatarProps, AvatarStyleState, AvatarSemanticStyles>

export interface AvatarProps extends Omit<ViewProps, 'children' | 'style'> {
  children?: ReactNode
  src?: AvatarSource
  icon?: ReactNode
  alt?: string
  size?: AvatarSize
  shape?: AvatarShape
  borderRadius?: number
  gap?: number
  onError?: ImageProps['onError']
  style?: StyleProp<ViewStyle>
  styles?: AvatarStyles
}

export interface AvatarGroupStyleState {
  visibleCount: number
  overflowCount: number
}

export interface AvatarGroupSemanticStyles {
  root?: StyleProp<ViewStyle>
  item?: StyleProp<ViewStyle>
  overflow?: StyleProp<ViewStyle>
}

export type AvatarGroupStyles = StyleResolver<
  AvatarGroupProps,
  AvatarGroupStyleState,
  AvatarGroupSemanticStyles
>

export interface AvatarGroupProps extends Omit<ViewProps, 'children' | 'style'> {
  children?: ReactNode
  size?: AvatarSize
  shape?: AvatarShape
  maxCount?: number
  onOverflowPress?: PressableProps['onPress']
  style?: StyleProp<ViewStyle>
  styles?: AvatarGroupStyles
}

export type AvatarImageErrorEvent = ImageErrorEventData
export type AvatarStyleInfo = StyleInfo<AvatarProps, AvatarStyleState>
export type AvatarGroupStyleInfo = StyleInfo<AvatarGroupProps, AvatarGroupStyleState>
