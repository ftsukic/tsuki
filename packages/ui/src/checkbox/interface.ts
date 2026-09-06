import type { ReactNode } from 'react'
import type {
  ColorValue,
  StyleProp,
  TextStyle,
  ViewProps,
  ViewStyle,
  TouchableOpacityProps,
} from 'react-native'

export type CheckboxShape = 'circle' | 'square'

export interface CheckboxIconProps extends TouchableOpacityProps {
  active?: boolean
  activeColor?: ColorValue
  inactiveColor?: ColorValue
  size?: number
  shape?: CheckboxShape
  disabled?: boolean
}

export interface CheckboxProps<ActiveValue = boolean, InactiveValue = boolean> extends ViewProps {
  labelTextStyle?: StyleProp<TextStyle>
  iconStyle?: StyleProp<ViewStyle>
  defaultValue?: ActiveValue | InactiveValue
  value?: ActiveValue | InactiveValue
  onChange?: (value: ActiveValue | InactiveValue) => void
  activeValue?: ActiveValue
  inactiveValue?: InactiveValue
  label?: ReactNode
  renderLabel?: () => ReactNode
  children?: ReactNode
  labelDisabled?: boolean
  labelPosition?: 'left' | 'right'
  iconSize?: number
  shape?: CheckboxShape
  disabled?: boolean
  activeColor?: ColorValue
  inactiveColor?: ColorValue
  gap?: number
  renderIcon?: (props: CheckboxIconProps) => ReactNode
}

export interface CheckboxOption<Value = unknown> {
  value: Value
  label: string
  disabled?: boolean
  gap?: number
  labelTextStyle?: StyleProp<TextStyle>
  iconSize?: number
  shape?: CheckboxShape
  activeColor?: ColorValue
  inactiveColor?: ColorValue
  renderIcon?: CheckboxProps<Value, null>['renderIcon']
}

export interface CheckboxGroupProps<Value = unknown> extends ViewProps {
  options: CheckboxOption<Value>[]
  value?: Value | Value[]
  defaultValue?: Value | Value[]
  onChange?: (value: Value | Value[] | undefined, options: CheckboxOption<Value>[]) => void
  multiple?: boolean
  editable?: boolean
  deselect?: boolean
  scrollable?: boolean
  direction?: 'row' | 'column'
  wrap?: boolean
  gap?: number
  activeColor?: ColorValue
  inactiveColor?: ColorValue
  iconSize?: number
  shape?: CheckboxShape
  checkboxLabelTextStyle?: StyleProp<TextStyle>
  checkboxIconLabelGap?: number
  renderIcon?: CheckboxProps<Value, null>['renderIcon']
}
