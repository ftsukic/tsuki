import type { ReactNode } from 'react'
import type {
  ColorValue,
  PressableProps,
  StyleProp,
  TextStyle,
  ViewProps,
  ViewStyle,
} from 'react-native'
import type { StyleInfo, StyleResolver } from '../style'

export type RadioValue = string | number
export type RadioShape = 'round' | 'square' | 'dot'
export type RadioVariant = 'default' | 'button'
export type RadioDirection = 'vertical' | 'horizontal'
export type RadioLabelPosition = 'left' | 'right'

export interface RadioStyleState {
  checked: boolean
  disabled: boolean
  pressed: boolean
}

export interface RadioSemanticStyles {
  root?: StyleProp<ViewStyle>
  indicator?: StyleProp<ViewStyle>
  label?: StyleProp<TextStyle>
}

export type RadioStyles = StyleResolver<RadioProps, RadioStyleState, RadioSemanticStyles>

export interface RadioProps extends Omit<PressableProps, 'children' | 'style' | 'disabled'> {
  children?: ReactNode
  value?: RadioValue
  checked?: boolean
  defaultChecked?: boolean
  disabled?: boolean
  shape?: RadioShape
  variant?: RadioVariant
  labelPosition?: RadioLabelPosition
  checkedColor?: ColorValue
  onChange?: (checked: boolean) => void
  style?: StyleProp<ViewStyle>
  styles?: RadioStyles
}

export type RadioStyleInfo = StyleInfo<RadioProps, RadioStyleState>

export interface RadioOption {
  value: RadioValue
  label: ReactNode
  disabled?: boolean
}

export interface RadioGroupProps extends ViewProps {
  children?: ReactNode
  options?: readonly RadioOption[]
  value?: RadioValue
  defaultValue?: RadioValue
  disabled?: boolean
  variant?: RadioVariant
  direction?: RadioDirection
  gap?: number
  buttonLayout?: 'intrinsic' | 'equal'
  buttonColumns?: number
  onChange?: (value: RadioValue) => void
}
