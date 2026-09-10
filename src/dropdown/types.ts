import type { ReactNode } from 'react'
import type { StyleProp, TextStyle, ViewProps, ViewStyle } from 'react-native'
import type { StyleResolver } from '../style'

export type DropdownValue = string | number
export type DropdownDirection = 'down' | 'up'

export interface DropdownOption {
  text: ReactNode
  value: DropdownValue
  disabled?: boolean
  icon?: ReactNode
}

export interface DropdownMenuStyleState {
  active: boolean
  disabled: boolean
  index: number
}

export type DropdownItemStyleState = DropdownMenuStyleState

export interface DropdownMenuSemanticStyles {
  root?: StyleProp<ViewStyle>
  item?: StyleProp<ViewStyle>
  title?: StyleProp<TextStyle>
  arrow?: StyleProp<ViewStyle>
}

export interface DropdownItemSemanticStyles {
  content?: StyleProp<ViewStyle>
  option?: StyleProp<ViewStyle>
  optionText?: StyleProp<TextStyle>
  optionIcon?: StyleProp<ViewStyle>
  overlay?: StyleProp<ViewStyle>
}

export type DropdownMenuStyles = StyleResolver<
  DropdownMenuProps,
  DropdownMenuStyleState,
  DropdownMenuSemanticStyles
>
export type DropdownItemStyles = StyleResolver<
  DropdownItemProps,
  DropdownItemStyleState,
  DropdownItemSemanticStyles
>

export interface DropdownMenuRef {
  open(index: number): void
  close(): void
  toggle(index: number): void
}

export interface DropdownItemRef {
  open(): void
  close(): void
  toggle(): void
}

export interface DropdownMenuProps extends Omit<ViewProps, 'children' | 'style'> {
  children?: ReactNode
  activeColor?: string
  overlay?: boolean
  closeOnPressOverlay?: boolean
  duration?: number
  zIndex?: number
  direction?: DropdownDirection
  swipeThreshold?: number
  style?: StyleProp<ViewStyle>
  styles?: DropdownMenuStyles
  onChange?: (index: number | null) => void
}

export interface DropdownItemProps extends Omit<ViewProps, 'children' | 'style'> {
  title?: ReactNode
  value?: DropdownValue
  defaultValue?: DropdownValue
  options?: DropdownOption[]
  disabled?: boolean
  children?: ReactNode
  onChange?: (value: DropdownValue) => void
  onOpen?: () => void
  onOpened?: () => void
  onClose?: () => void
  onClosed?: () => void
  closeOnSelect?: boolean
  style?: StyleProp<ViewStyle>
  contentStyle?: StyleProp<ViewStyle>
  styles?: DropdownItemStyles
  testID?: string
}
