import type { ReactNode } from 'react'
import type { DimensionValue, StyleProp, TextStyle, ViewStyle } from 'react-native'
import type { CellArrowDirection, CellProps } from '../cell'
import type { InputProps, InputStyles } from '../input'
import type { StyleInfo, StyleResolver } from '../style'

export type FieldStatus = 'default' | 'error' | 'warning'
export type FieldLabelAlign = 'left' | 'center' | 'right'

export interface FieldControlContext<Value> {
  value: Value | undefined
  onChange: (value: Value) => void
  disabled: boolean
  readOnly: boolean
  status: FieldStatus
}

export interface FieldStyleState {
  status: FieldStatus
}

export interface FieldSemanticStyles {
  root?: StyleProp<ViewStyle>
  label?: StyleProp<TextStyle>
  labelExtra?: StyleProp<TextStyle>
  control?: StyleProp<ViewStyle>
  feedback?: StyleProp<ViewStyle>
  description?: StyleProp<TextStyle>
  error?: StyleProp<TextStyle>
}

export type FieldStyles = StyleResolver<FieldProps<unknown>, FieldStyleState, FieldSemanticStyles>

export interface FieldBaseProps<Value> {
  label?: ReactNode
  labelExtra?: ReactNode

  value?: Value
  defaultValue?: Value
  onChange?: (value: Value) => void

  valueExtra?: ReactNode
  extra?: ReactNode

  required?: boolean
  disabled?: boolean
  readOnly?: boolean

  vertical?: boolean

  labelWidth?: DimensionValue
  labelAlign?: FieldLabelAlign
  valueAlign?: CellProps['valueAlign']

  description?: ReactNode
  errorMessage?: ReactNode
  status?: FieldStatus

  icon?: ReactNode

  isLink?: boolean
  clickable?: boolean
  arrowDirection?: CellArrowDirection
  onPress?: CellProps['onPress']

  border?: boolean
  style?: StyleProp<ViewStyle>
  styles?: FieldStyles
}

export interface FieldInputProps extends FieldBaseProps<string> {
  children?: never
  inputProps?: Omit<InputProps, 'value' | 'defaultValue' | 'onChangeText' | 'style' | 'styles'>
  inputStyle?: InputProps['style']
  inputStyles?: InputStyles
}

export interface FieldCustomProps<Value> extends FieldBaseProps<Value> {
  children: ReactNode | ((context: FieldControlContext<Value>) => ReactNode)
  inputProps?: never
  inputStyle?: never
  inputStyles?: never
}

export type FieldProps<Value = string> = FieldInputProps | FieldCustomProps<Value>

export type FieldStyleInfo = StyleInfo<FieldProps<unknown>, FieldStyleState>
