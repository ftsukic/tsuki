import type { ReactElement, ReactNode } from 'react'
import type { ColorValue, StyleProp, TextStyle, ViewStyle } from 'react-native'
import type { StyleInfo, StyleResolver } from '../style'

export type PopoverPlacement = 'auto' | 'top' | 'bottom' | 'left' | 'right' | 'floating'

export type PopoverTheme = 'light' | 'dark'

export type PopoverTrigger = 'press' | 'longPress' | 'manual'

export type PopoverActionsDirection = 'vertical' | 'horizontal'

export interface PopoverAction {
  text: ReactNode
  icon?: ReactNode
  color?: ColorValue
  disabled?: boolean
}

export interface PopoverStyleState {
  visible: boolean
  placement: PopoverPlacement
  theme: PopoverTheme
  actionsDirection: PopoverActionsDirection
}

export interface PopoverSemanticStyles {
  reference?: StyleProp<ViewStyle>
  content?: StyleProp<ViewStyle>
  actions?: StyleProp<ViewStyle>
  action?: StyleProp<ViewStyle>
  actionIcon?: StyleProp<ViewStyle>
  actionText?: StyleProp<TextStyle>
  divider?: StyleProp<ViewStyle>
}

export type PopoverStyles = StyleResolver<PopoverProps, PopoverStyleState, PopoverSemanticStyles>

export type PopoverStyleInfo = StyleInfo<PopoverProps, PopoverStyleState>

export interface PopoverProps {
  children: ReactElement
  actions?: readonly PopoverAction[]
  content?: ReactNode
  visible?: boolean
  defaultVisible?: boolean
  trigger?: PopoverTrigger
  placement?: PopoverPlacement
  theme?: PopoverTheme
  actionsDirection?: PopoverActionsDirection
  disabled?: boolean
  offset?: number
  showArrow?: boolean
  overlay?: boolean
  closeOnAction?: boolean
  closeOnPressOutside?: boolean
  duration?: number
  style?: StyleProp<ViewStyle>
  styles?: PopoverStyles
  onSelect?: (action: PopoverAction, index: number) => void
  onVisibleChange?: (visible: boolean) => void
  onOpen?: () => void
  onOpened?: () => void
  onClose?: () => void
  onClosed?: () => void
}
