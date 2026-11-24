import type { ReactNode, RefObject } from 'react'
import type { StyleProp, TextStyle, View, ViewStyle } from 'react-native'
import type { ClassNames } from '../types'
import type { FloatingCollisionPadding, FloatingPlacement } from '../floating/types'

export type PopoverPlacement = FloatingPlacement

export type PopoverClassNames = ClassNames<'root' | 'content' | 'text'>

export interface PopoverStyles {
  root?: StyleProp<ViewStyle>
  content?: StyleProp<ViewStyle>
  text?: StyleProp<TextStyle>
}

export interface PopoverProps {
  children?: ReactNode
  content: ReactNode
  visible?: boolean
  defaultVisible?: boolean
  onVisibleChange?: (visible: boolean) => void
  afterOpen?: () => void
  afterClose?: () => void
  closeOnBack?: boolean
  initialFocusRef?: RefObject<View | null>
  returnFocusRef?: RefObject<View | null>
  placement?: PopoverPlacement
  offset?: number
  collisionPadding?: FloatingCollisionPadding
  avoidCollisions?: boolean
  repositionKey?: string | number
  asChild?: boolean
  closeOnPressOutside?: boolean
  disabled?: boolean
  accessibilityLabel?: string
  accessibilityHint?: string
  className?: string
  classNames?: PopoverClassNames
  style?: StyleProp<ViewStyle>
  styles?: PopoverStyles
  testID?: string
}
