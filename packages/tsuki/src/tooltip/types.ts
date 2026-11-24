import type { ReactNode, RefObject } from 'react'
import type { StyleProp, TextStyle, View, ViewStyle } from 'react-native'
import type { ClassNames } from '../types'
import type { FloatingCollisionPadding, FloatingPlacement } from '../floating/types'

export type TooltipPlacement = FloatingPlacement
export type TooltipTrigger = 'long-press' | 'press'

export type TooltipClassNames = ClassNames<'root' | 'content' | 'text'>

export interface TooltipStyles {
  root?: StyleProp<ViewStyle>
  content?: StyleProp<ViewStyle>
  text?: StyleProp<TextStyle>
}

export interface TooltipProps {
  children?: ReactNode
  content: ReactNode
  trigger?: TooltipTrigger
  visible?: boolean
  defaultVisible?: boolean
  onVisibleChange?: (visible: boolean) => void
  afterOpen?: () => void
  afterClose?: () => void
  closeOnBack?: boolean
  closeOnPressOutside?: boolean
  autoCloseDuration?: number
  disabled?: boolean
  asChild?: boolean
  initialFocusRef?: RefObject<View | null>
  returnFocusRef?: RefObject<View | null>
  placement?: TooltipPlacement
  offset?: number
  collisionPadding?: FloatingCollisionPadding
  avoidCollisions?: boolean
  repositionKey?: string | number
  accessibilityLabel?: string
  accessibilityHint?: string
  className?: string
  classNames?: TooltipClassNames
  style?: StyleProp<ViewStyle>
  styles?: TooltipStyles
  testID?: string
}
