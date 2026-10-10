import type { Key, ReactNode } from 'react'
import type {
  ColorValue,
  PressableProps as NativePressableProps,
  StyleProp,
  ViewProps,
  ViewStyle,
} from 'react-native'

import type { StyleInfo, StyleResolver } from '../style'

export interface SwipeCellStyleState {
  left: boolean
  right: boolean
}

export interface SwipeCellSemanticStyles {
  root?: StyleProp<ViewStyle>
  content?: StyleProp<ViewStyle>
  actions?: StyleProp<ViewStyle>
}

export type SwipeCellStyles = StyleResolver<
  SwipeCellProps,
  SwipeCellStyleState,
  SwipeCellSemanticStyles
>
export type SwipeCellStyleInfo = StyleInfo<SwipeCellProps, SwipeCellStyleState>

export type SwipeCellSide = 'left' | 'right'

export type SwipeCellActionColor = 'default' | 'primary' | 'success' | 'warning' | 'danger'

export interface SwipeCellActionItem {
  key?: Key
  text?: ReactNode
  /** @deprecated Use `text` instead. */
  label?: ReactNode
  color?: SwipeCellActionColor
  backgroundColor?: ColorValue
  textColor?: ColorValue
  width?: number
  disabled?: boolean
  onPress?: NativePressableProps['onPress']
}

export interface SwipeCellRef {
  open: (side?: SwipeCellSide) => void
  close: () => void
}

export interface SwipeCellActionProps extends Omit<NativePressableProps, 'children' | 'style'> {
  children?: ReactNode
  onPressDebounceWait?: number
  color?: SwipeCellActionColor
  backgroundColor?: ColorValue
  textColor?: ColorValue
  width?: number
  style?: NativePressableProps['style']
}

export interface SwipeCellProps extends Omit<ViewProps, 'children' | 'style'> {
  id?: string
  children?: ReactNode
  actions?: SwipeCellActionItem[]
  leftActions?: SwipeCellActionItem[]
  rightActions?: SwipeCellActionItem[]
  leftAction?: ReactNode
  rightAction?: ReactNode
  onLeftActionPress?: NativePressableProps['onPress']
  onRightActionPress?: NativePressableProps['onPress']
  closeOnActionPress?: boolean
  /** Apply resistance beyond the measured action width. Defaults to false. */
  overshoot?: boolean
  style?: StyleProp<ViewStyle>
  styles?: SwipeCellStyles
  onOpen?: () => void
  onClose?: () => void
}

export interface SwipeCellGroupProps extends Omit<ViewProps, 'children'> {
  children?: ReactNode
}
