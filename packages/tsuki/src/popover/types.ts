import type { ReactNode, RefObject } from 'react'
import type { StyleProp, TextStyle, View, ViewStyle } from 'react-native'
import type { ClassNames } from '../types'
import type {
  FloatingCollisionPadding,
  FloatingPlacementOption,
  FloatingScrollBehavior,
} from '../floating/types'

export type PopoverPlacement = FloatingPlacementOption
export type PopoverScrollBehavior = FloatingScrollBehavior

export type PopoverClassNames = ClassNames<'root' | 'content' | 'text' | 'arrow'>

export interface PopoverStyles {
  root?: StyleProp<ViewStyle>
  content?: StyleProp<ViewStyle>
  text?: StyleProp<TextStyle>
  arrow?: StyleProp<ViewStyle>
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
  arrow?: boolean
  collisionPadding?: FloatingCollisionPadding
  avoidCollisions?: boolean
  repositionKey?: string | number
  scrollBehavior?: PopoverScrollBehavior
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
