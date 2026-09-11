import type { ReactNode } from 'react'
import type { PressableProps, StyleProp, TextStyle, ViewProps, ViewStyle } from 'react-native'
import type { StyleInfo, StyleResolver } from '../style'

export type CheckboxValue = string | number
export type CheckboxShape = 'round' | 'square'
export type CheckboxLabelPosition = 'left' | 'right'
export type CheckboxVariant = 'default' | 'button'
export type CheckboxDirection = 'vertical' | 'horizontal'

export interface CheckboxStyleState {
  checked: boolean
  disabled: boolean
  pressed: boolean
}

export interface CheckboxSemanticStyles {
  root?: StyleProp<ViewStyle>
  indicator?: StyleProp<ViewStyle>
  label?: StyleProp<TextStyle>
}

export type CheckboxStyles = StyleResolver<
  CheckboxProps,
  CheckboxStyleState,
  CheckboxSemanticStyles
>

export interface CheckboxProps extends Omit<
  PressableProps,
  'children' | 'style' | 'disabled' | 'onPress'
> {
  children?: ReactNode
  name?: CheckboxValue
  checked?: boolean
  defaultChecked?: boolean
  disabled?: boolean
  iconSize?: number
  shape?: CheckboxShape
  labelPosition?: CheckboxLabelPosition
  variant?: CheckboxVariant
  onPress?: PressableProps['onPress']
  onChange?: (checked: boolean) => void
  style?: StyleProp<ViewStyle>
  styles?: CheckboxStyles
  onPressDebounceWait?: number
}

export type CheckboxStyleInfo = StyleInfo<CheckboxProps, CheckboxStyleState>

export interface CheckboxGroupProps extends Omit<ViewProps, 'children' | 'style'> {
  children?: ReactNode
  value?: readonly CheckboxValue[]
  defaultValue?: readonly CheckboxValue[]
  disabled?: boolean
  variant?: CheckboxVariant
  direction?: CheckboxDirection
  gap?: number
  buttonLayout?: 'intrinsic' | 'equal'
  buttonColumns?: number
  onChange?: (value: CheckboxValue[]) => void
  style?: StyleProp<ViewStyle>
}
